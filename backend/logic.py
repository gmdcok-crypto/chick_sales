"""매출·매입 공통 계산 로직 (sister designer_main_ui 기준)."""

from __future__ import annotations

from decimal import Decimal, InvalidOperation, ROUND_HALF_UP
from typing import Any, Optional


def parse_qty(qty_text: Any) -> Decimal:
    if qty_text is None:
        return Decimal("0")
    s = str(qty_text).replace(",", "").strip()
    if not s:
        return Decimal("0")
    try:
        d = Decimal(s)
    except InvalidOperation:
        raise ValueError("invalid quantity")
    return d.quantize(Decimal("0.1"), rounding=ROUND_HALF_UP)


def round_supply_10won(x: Any) -> int:
    try:
        v = int(x) if x is not None else 0
    except (TypeError, ValueError):
        try:
            v = int(Decimal(str(x)))
        except Exception:
            return 0
    return int((Decimal(v) / 10).quantize(Decimal("1"), rounding=ROUND_HALF_UP) * 10)


def gross_amount(unit_price: int, qty_text: Any) -> int:
    q = parse_qty(qty_text)
    if q <= 0:
        return 0
    gross = (Decimal(int(unit_price)) * q).quantize(Decimal("1"), rounding=ROUND_HALF_UP)
    return int(gross)


def split_supply_tax(gross_vat_inclusive: int, tax_type: str) -> tuple[int, int]:
    gross = int(gross_vat_inclusive or 0)
    tt = (tax_type or "").strip() or "면세"
    if tt == "과세" and gross > 0:
        supply = int(
            (Decimal(gross) / Decimal("1.1")).quantize(Decimal("1"), rounding=ROUND_HALF_UP)
        )
        supply = round_supply_10won(supply)
        tax = gross - supply
        return supply, tax
    return round_supply_10won(gross), 0


def calc_balance(prev_balance: int, total_amount: int, payment: int) -> int:
    return int(prev_balance or 0) + int(total_amount or 0) - int(payment or 0)


def format_won(n: int | float) -> str:
    return f"{int(n):,}"


def format_qty(qv: Any) -> str:
    if qv is None or qv == "":
        return ""
    try:
        d = Decimal(str(qv)).quantize(Decimal("0.1"), rounding=ROUND_HALF_UP)
    except Exception:
        return ""
    if d == 0:
        return ""
    if d == d.to_integral():
        return f"{int(d):,}"
    ip = int(d)
    frac = abs((d - Decimal(ip)) * 10)
    return f"{ip:,}.{int(frac)}"


def summarize_lines(items: list[dict], products_tax: dict[str, str]) -> tuple[int, int]:
    """테이블 합계: (거래합계, 입금/지급). 입금 행은 product_name=='입금'."""
    total_amount = 0
    payment = 0
    found_deposit = False
    sum_any = 0

    for it in items:
        name = (it.get("product_name") or "").strip()
        if name in ("", "입금"):
            if name == "입금":
                amt = int(it.get("amount") or 0)
                found_deposit = True
                sum_any += amt
                payment += amt
            continue

        unit_price = int(it.get("unit_price") or 0)
        qty = it.get("qty") or 0
        gross = gross_amount(unit_price, qty)
        tax_type = products_tax.get(name, "면세")
        supply, tax = split_supply_tax(gross, tax_type)
        line_total = supply + tax
        total_amount += line_total
        sum_any += line_total

    if not found_deposit and sum_any and total_amount == 0:
        payment = sum_any

    return int(total_amount), int(payment)


def build_line_items(
    raw_items: list[dict],
    products_tax: dict[str, str],
    trace_no: str = "",
) -> list[dict]:
    out: list[dict] = []
    for i, it in enumerate(raw_items):
        name = (it.get("product_name") or "").strip()
        if not name:
            continue
        spec = (it.get("spec") or "").strip()
        unit_price = int(it.get("unit_price") or 0)
        qty = parse_qty(it.get("qty"))

        if name == "입금":
            amount = int(it.get("amount") or unit_price or 0)
            out.append(
                {
                    "product_id": it.get("product_id"),
                    "product_name": "입금",
                    "spec": "",
                    "unit_price": 0,
                    "qty": 0.0,
                    "amount": amount,
                    "tax_amount": 0,
                    "trace_no": trace_no,
                    "sort_order": i,
                }
            )
            continue

        gross = gross_amount(unit_price, qty)
        tax_type = products_tax.get(name, (it.get("tax_type") or "면세"))
        supply, tax = split_supply_tax(gross, tax_type)
        out.append(
            {
                "product_id": it.get("product_id"),
                "product_name": name,
                "spec": spec,
                "unit_price": unit_price,
                "qty": float(qty),
                "amount": supply,
                "tax_amount": tax,
                "trace_no": trace_no or (it.get("trace_no") or ""),
                "sort_order": i,
            }
        )
    return out
