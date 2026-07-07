"""MySQL — 매출·매입 CRUD."""

from __future__ import annotations

from contextlib import contextmanager
from typing import Any, Optional

import pymysql
import pymysql.cursors

import config
import logic

PARTNER_SALES = "sales"
PARTNER_PURCHASE = "purchase"


def get_connection():
    return pymysql.connect(
        host=config.DB_HOST,
        port=config.DB_PORT,
        user=config.DB_USER,
        password=config.DB_PASSWORD,
        database=config.DB_DATABASE,
        charset="utf8mb4",
        cursorclass=pymysql.cursors.Cursor,
    )


@contextmanager
def get_db():
    conn = get_connection()
    try:
        yield conn
        conn.commit()
    except Exception:
        conn.rollback()
        raise
    finally:
        conn.close()


def row_to_dict(row, columns):
    if row is None:
        return None
    return {col: row[i] for i, col in enumerate(columns)}


def _cols(cur):
    return [d[0] for d in cur.description]


# ---------------------------------------------------------------------------
# 거래처 · 품목
# ---------------------------------------------------------------------------


def list_companies(q: str = "", limit: int = 500):
    with get_db() as conn:
        cur = conn.cursor()
        sql = """
            SELECT id, company_code, company_name, phone, manager_name,
                   base_balance, tax_invoice_yn, status
            FROM company WHERE status != 'deleted'
        """
        params: list[Any] = []
        if q.strip():
            sql += " AND company_name LIKE %s"
            params.append(f"%{q.strip()}%")
        sql += " ORDER BY company_name ASC LIMIT %s"
        params.append(limit)
        cur.execute(sql, tuple(params))
        rows = [row_to_dict(r, _cols(cur)) for r in cur.fetchall()]
        cur.close()
    return rows


def get_company(company_id: int):
    with get_db() as conn:
        cur = conn.cursor()
        cur.execute(
            """
            SELECT id, company_code, company_name, biz_no, ceo_name, phone,
                   manager_name, manager_mobile, address, base_balance, tax_invoice_yn, status
            FROM company WHERE id=%s AND status!='deleted'
            """,
            (company_id,),
        )
        row = cur.fetchone()
        cols = _cols(cur)
        cur.close()
    return row_to_dict(row, cols) if row else None


def _next_company_code(conn) -> str:
    cur = conn.cursor()
    cur.execute("SELECT COALESCE(MAX(id), 0) + 1 FROM company")
    (next_id,) = cur.fetchone()
    cur.close()
    return f"C{int(next_id):06d}"


def create_company(data: dict) -> int:
    name = (data.get("company_name") or "").strip()
    if not name:
        raise ValueError("거래처명은 필수입니다.")
    with get_db() as conn:
        cur = conn.cursor()
        cur.execute(
            "SELECT id FROM company WHERE company_name=%s AND status!='deleted' LIMIT 1",
            (name,),
        )
        if cur.fetchone():
            cur.close()
            raise ValueError("이미 등록된 거래처명입니다.")
        code = _next_company_code(conn)
        cur.execute(
            """
            INSERT INTO company (
                company_code, company_name, biz_no, ceo_name, business_type, business_item,
                address, phone, manager_name, manager_mobile, base_balance,
                tax_invoice_yn, status
            ) VALUES (%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,'active')
            """,
            (
                code,
                name,
                (data.get("biz_no") or "").strip() or None,
                (data.get("ceo_name") or "").strip() or None,
                (data.get("business_type") or "").strip() or None,
                (data.get("business_item") or "").strip() or None,
                (data.get("address") or "").strip() or None,
                (data.get("phone") or "").strip() or None,
                (data.get("manager_name") or "").strip() or None,
                (data.get("manager_mobile") or "").strip() or None,
                int(data.get("base_balance") or 0),
                (data.get("tax_invoice_yn") or "Y").strip() or "Y",
            ),
        )
        new_id = cur.lastrowid
        cur.close()
    return int(new_id)


def list_products(q: str = "", limit: int = 500):
    with get_db() as conn:
        cur = conn.cursor()
        sql = """
            SELECT id, product_code, product_name, spec, origin, tax_type, status
            FROM product WHERE status != 'deleted'
        """
        params: list[Any] = []
        if q.strip():
            sql += " AND product_name LIKE %s"
            params.append(f"%{q.strip()}%")
        sql += " ORDER BY product_name ASC LIMIT %s"
        params.append(limit)
        cur.execute(sql, tuple(params))
        rows = [row_to_dict(r, _cols(cur)) for r in cur.fetchall()]
        cur.close()
    return rows


def product_tax_map() -> dict[str, str]:
    with get_db() as conn:
        cur = conn.cursor()
        cur.execute(
            "SELECT product_name, tax_type FROM product WHERE status != 'deleted'"
        )
        rows = cur.fetchall()
        cur.close()
    return {(r[0] or "").strip(): (r[1] or "면세").strip() for r in rows}


def list_traces():
    with get_db() as conn:
        cur = conn.cursor()
        cur.execute(
            "SELECT trace_code FROM trace WHERE status='active' ORDER BY id ASC"
        )
        rows = [r[0] for r in cur.fetchall()]
        cur.close()
    return rows


# ---------------------------------------------------------------------------
# 잔액 (sister: get_latest_balance_by_company_as_of)
# ---------------------------------------------------------------------------


def _balance_table(kind: str) -> tuple[str, str, str]:
    if kind == PARTNER_PURCHASE:
        return "purchase", "purchase_date", "company_id"
    return "sales", "sales_date", "company_id"


def get_prev_balance(company_id: int, txn_date: str, kind: str = PARTNER_SALES) -> int:
    table, date_col, _ = _balance_table(kind)
    if not company_id:
        return 0
    with get_db() as conn:
        cur = conn.cursor()
        cur.execute(
            f"""
            SELECT balance FROM {table}
            WHERE status != 'deleted' AND company_id = %s AND {date_col} <= %s
            ORDER BY {date_col} DESC, id DESC LIMIT 1
            """,
            (company_id, txn_date),
        )
        row = cur.fetchone()
        if row and row[0] is not None:
            cur.close()
            return int(row[0])
        cur.execute(
            "SELECT base_balance FROM company WHERE id=%s AND status!='deleted'",
            (company_id,),
        )
        row2 = cur.fetchone()
        cur.close()
    return int(row2[0]) if row2 and row2[0] is not None else 0


# ---------------------------------------------------------------------------
# 매출
# ---------------------------------------------------------------------------


def list_sales(company_id=None, from_date=None, to_date=None, limit: int = 200):
    with get_db() as conn:
        cur = conn.cursor()
        sql = """
            SELECT s.id, s.company_id, c.company_name, s.sales_date, s.trace_no,
                   s.txn_type, s.prev_balance, s.total_amount, s.payment, s.balance
            FROM sales s JOIN company c ON c.id = s.company_id
            WHERE s.status != 'deleted'
        """
        params: list[Any] = []
        if company_id:
            sql += " AND s.company_id = %s"
            params.append(company_id)
        if from_date:
            sql += " AND s.sales_date >= %s"
            params.append(from_date)
        if to_date:
            sql += " AND s.sales_date <= %s"
            params.append(to_date)
        sql += " ORDER BY s.sales_date DESC, s.id DESC LIMIT %s"
        params.append(limit)
        cur.execute(sql, tuple(params))
        rows = [row_to_dict(r, _cols(cur)) for r in cur.fetchall()]
        cur.close()
    return rows


def get_sale_with_items(sale_id: int):
    return _get_txn_with_items("sales", "sales_item", "sales_id", sale_id)


def create_sale(data: dict) -> int:
    tax_map = product_tax_map()
    items = logic.build_line_items(data.get("items") or [], tax_map, data.get("trace_no") or "")
    total, payment = logic.summarize_lines(data.get("items") or [], tax_map)
    if payment == 0 and data.get("payment"):
        payment = int(data["payment"])
    company_id = int(data["company_id"])
    txn_date = str(data["sales_date"])[:10]
    prev = get_prev_balance(company_id, txn_date, PARTNER_SALES)
    balance = logic.calc_balance(prev, total, payment)

    with get_db() as conn:
        cur = conn.cursor()
        cur.execute(
            """
            INSERT INTO sales (company_id, sales_date, trace_no, txn_type,
                prev_balance, total_amount, payment, balance, status)
            VALUES (%s,%s,%s,%s,%s,%s,%s,%s,'active')
            """,
            (
                company_id,
                txn_date,
                data.get("trace_no") or "",
                data.get("txn_type") or "sale",
                prev,
                total,
                payment,
                balance,
            ),
        )
        sale_id = cur.lastrowid
        for it in items:
            cur.execute(
                """
                INSERT INTO sales_item
                (sales_id, product_id, product_name, spec, unit_price, qty,
                 amount, tax_amount, trace_no, sort_order)
                VALUES (%s,%s,%s,%s,%s,%s,%s,%s,%s,%s)
                """,
                (
                    sale_id,
                    it.get("product_id"),
                    it["product_name"],
                    it["spec"],
                    it["unit_price"],
                    it["qty"],
                    it["amount"],
                    it["tax_amount"],
                    it["trace_no"],
                    it["sort_order"],
                ),
            )
        cur.close()
    return int(sale_id)


def delete_sale(sale_id: int) -> bool:
    with get_db() as conn:
        cur = conn.cursor()
        cur.execute(
            "UPDATE sales SET status='deleted' WHERE id=%s AND status!='deleted'",
            (sale_id,),
        )
        n = cur.rowcount
        cur.close()
    return n > 0


# ---------------------------------------------------------------------------
# 매입 (매출과 동일 잔액 로직)
# ---------------------------------------------------------------------------


def list_purchases(company_id=None, from_date=None, to_date=None, limit: int = 200):
    with get_db() as conn:
        cur = conn.cursor()
        sql = """
            SELECT p.id, p.company_id, c.company_name, p.purchase_date, p.trace_no,
                   p.txn_type, p.prev_balance, p.total_amount, p.payment, p.balance
            FROM purchase p JOIN company c ON c.id = p.company_id
            WHERE p.status != 'deleted'
        """
        params: list[Any] = []
        if company_id:
            sql += " AND p.company_id = %s"
            params.append(company_id)
        if from_date:
            sql += " AND p.purchase_date >= %s"
            params.append(from_date)
        if to_date:
            sql += " AND p.purchase_date <= %s"
            params.append(to_date)
        sql += " ORDER BY p.purchase_date DESC, p.id DESC LIMIT %s"
        params.append(limit)
        cur.execute(sql, tuple(params))
        rows = [row_to_dict(r, _cols(cur)) for r in cur.fetchall()]
        cur.close()
    return rows


def get_purchase_with_items(purchase_id: int):
    return _get_txn_with_items("purchase", "purchase_item", "purchase_id", purchase_id)


def create_purchase(data: dict) -> int:
    tax_map = product_tax_map()
    items = logic.build_line_items(data.get("items") or [], tax_map, data.get("trace_no") or "")
    total, payment = logic.summarize_lines(data.get("items") or [], tax_map)
    if payment == 0 and data.get("payment"):
        payment = int(data["payment"])
    company_id = int(data["company_id"])
    txn_date = str(data["purchase_date"])[:10]
    prev = get_prev_balance(company_id, txn_date, PARTNER_PURCHASE)
    balance = logic.calc_balance(prev, total, payment)

    with get_db() as conn:
        cur = conn.cursor()
        cur.execute(
            """
            INSERT INTO purchase (company_id, purchase_date, trace_no, txn_type,
                prev_balance, total_amount, payment, balance, status)
            VALUES (%s,%s,%s,%s,%s,%s,%s,%s,'active')
            """,
            (
                company_id,
                txn_date,
                data.get("trace_no") or "",
                data.get("txn_type") or "purchase",
                prev,
                total,
                payment,
                balance,
            ),
        )
        purchase_id = cur.lastrowid
        for it in items:
            cur.execute(
                """
                INSERT INTO purchase_item
                (purchase_id, product_id, product_name, spec, unit_price, qty,
                 amount, tax_amount, trace_no, sort_order)
                VALUES (%s,%s,%s,%s,%s,%s,%s,%s,%s,%s)
                """,
                (
                    purchase_id,
                    it.get("product_id"),
                    it["product_name"],
                    it["spec"],
                    it["unit_price"],
                    it["qty"],
                    it["amount"],
                    it["tax_amount"],
                    it["trace_no"],
                    it["sort_order"],
                ),
            )
        cur.close()
    return int(purchase_id)


def delete_purchase(purchase_id: int) -> bool:
    with get_db() as conn:
        cur = conn.cursor()
        cur.execute(
            "UPDATE purchase SET status='deleted' WHERE id=%s AND status!='deleted'",
            (purchase_id,),
        )
        n = cur.rowcount
        cur.close()
    return n > 0


def _get_txn_with_items(master: str, item_table: str, fk: str, txn_id: int):
    date_col = "sales_date" if master == "sales" else "purchase_date"
    with get_db() as conn:
        cur = conn.cursor()
        cur.execute(
            f"""
            SELECT t.id, t.company_id, c.company_name, t.{date_col} AS txn_date,
                   t.trace_no, t.txn_type, t.prev_balance, t.total_amount,
                   t.payment, t.balance
            FROM {master} t JOIN company c ON c.id = t.company_id
            WHERE t.id = %s AND t.status != 'deleted'
            """,
            (txn_id,),
        )
        sale_row = cur.fetchone()
        if not sale_row:
            cur.close()
            return None
        sale = row_to_dict(sale_row, _cols(cur))

        cur.execute(
            f"""
            SELECT id, product_id, product_name, spec, unit_price, qty,
                   amount, tax_amount, trace_no, sort_order
            FROM {item_table} WHERE {fk} = %s
            ORDER BY sort_order ASC, id ASC
            """,
            (txn_id,),
        )
        items = [row_to_dict(r, _cols(cur)) for r in cur.fetchall()]
        cur.close()
    sale["items"] = items
    return sale


def dashboard_stats():
    with get_db() as conn:
        cur = conn.cursor()
        cur.execute(
            """
            SELECT COALESCE(SUM(total_amount),0), COALESCE(SUM(payment),0), COUNT(*)
            FROM sales WHERE status!='deleted' AND sales_date >= DATE_FORMAT(CURDATE(),'%%Y-%%m-01')
            """
        )
        s = cur.fetchone()
        cur.execute(
            """
            SELECT COALESCE(SUM(total_amount),0), COALESCE(SUM(payment),0), COUNT(*)
            FROM purchase WHERE status!='deleted' AND purchase_date >= DATE_FORMAT(CURDATE(),'%%Y-%%m-01')
            """
        )
        p = cur.fetchone()
        cur.close()
    return {
        "sales_month_total": int(s[0] or 0),
        "sales_month_payment": int(s[1] or 0),
        "sales_month_count": int(s[2] or 0),
        "purchase_month_total": int(p[0] or 0),
        "purchase_month_payment": int(p[1] or 0),
        "purchase_month_count": int(p[2] or 0),
    }
