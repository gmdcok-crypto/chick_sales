"""MySQL access — sister 스키마(company, product, sales) 호환."""

from __future__ import annotations

from contextlib import contextmanager

import pymysql
import pymysql.cursors

import config


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


def list_companies(limit: int = 500):
    with get_db() as conn:
        cur = conn.cursor()
        cur.execute(
            """
            SELECT id, company_code, company_name, phone, manager_name,
                   base_balance, tax_invoice_yn, status
            FROM company
            WHERE status != 'deleted'
            ORDER BY company_name ASC
            LIMIT %s
            """,
            (limit,),
        )
        cols = [d[0] for d in cur.description]
        rows = [row_to_dict(r, cols) for r in cur.fetchall()]
        cur.close()
    return rows


def list_products(limit: int = 500):
    with get_db() as conn:
        cur = conn.cursor()
        cur.execute(
            """
            SELECT id, product_code, product_name, spec, origin,
                   tax_type, status
            FROM product
            WHERE status != 'deleted'
            ORDER BY product_name ASC
            LIMIT %s
            """,
            (limit,),
        )
        cols = [d[0] for d in cur.description]
        rows = [row_to_dict(r, cols) for r in cur.fetchall()]
        cur.close()
    return rows


def list_sales(company_id: int | None = None, from_date=None, to_date=None, limit: int = 200):
    with get_db() as conn:
        cur = conn.cursor()
        sql = """
            SELECT s.id, s.company_id, c.company_name, s.sales_date, s.trace_no,
                   s.txn_type, s.prev_balance, s.total_amount, s.payment, s.balance
            FROM sales s
            JOIN company c ON c.id = s.company_id
            WHERE s.status != 'deleted'
        """
        params: list = []
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
        cols = [d[0] for d in cur.description]
        rows = [row_to_dict(r, cols) for r in cur.fetchall()]
        cur.close()
    return rows


def get_sale_with_items(sale_id: int):
    with get_db() as conn:
        cur = conn.cursor()
        cur.execute(
            """
            SELECT s.id, s.company_id, c.company_name, s.sales_date, s.trace_no,
                   s.txn_type, s.prev_balance, s.total_amount, s.payment, s.balance
            FROM sales s
            JOIN company c ON c.id = s.company_id
            WHERE s.id = %s AND s.status != 'deleted'
            """,
            (sale_id,),
        )
        sale_row = cur.fetchone()
        if not sale_row:
            cur.close()
            return None
        sale_cols = [d[0] for d in cur.description]
        sale = row_to_dict(sale_row, sale_cols)

        cur.execute(
            """
            SELECT id, product_name, spec, unit_price, qty, amount, tax_amount, trace_no
            FROM sales_item
            WHERE sales_id = %s
            ORDER BY sort_order ASC, id ASC
            """,
            (sale_id,),
        )
        item_cols = [d[0] for d in cur.description]
        items = [row_to_dict(r, item_cols) for r in cur.fetchall()]
        cur.close()
    sale["items"] = items
    return sale
