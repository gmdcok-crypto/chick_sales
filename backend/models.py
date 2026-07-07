from __future__ import annotations

from typing import Any, List, Optional

from pydantic import BaseModel, Field


class LineItemIn(BaseModel):
    product_id: Optional[int] = None
    product_name: str = ""
    spec: str = ""
    unit_price: int = 0
    qty: Any = 0
    amount: Optional[int] = None
    tax_type: Optional[str] = None


class SaleCreate(BaseModel):
    company_id: int
    sales_date: str
    trace_no: str = ""
    items: List[LineItemIn] = Field(default_factory=list)
    payment: int = 0


class PurchaseCreate(BaseModel):
    company_id: int
    purchase_date: str
    trace_no: str = ""
    items: List[LineItemIn] = Field(default_factory=list)
    payment: int = 0
