from __future__ import annotations

from contextlib import asynccontextmanager
from typing import Optional

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
from pathlib import Path

import config
import db
import schema
from models import CompanyCreate, CompanyUpdate, ProductCreate, ProductUpdate, PurchaseCreate, SaleCreate

STATIC_DIR = Path(__file__).resolve().parent / "static"


@asynccontextmanager
async def lifespan(_app: FastAPI):
    schema.ensure_schema()
    yield


app = FastAPI(
    title="Chick Sales",
    description="매출·매입 PWA",
    version="1.0.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=config.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/api/health")
def health():
    return {
        "status": "ok",
        "database": config.DB_DATABASE,
        "host": config.DB_HOST,
        "railway": bool(config.IS_RAILWAY),
    }


@app.get("/api/dashboard")
def api_dashboard():
    return db.dashboard_stats()


@app.get("/api/companies")
def api_companies(q: str = ""):
    return db.list_companies(q=q)


@app.get("/api/companies/{company_id}")
def api_get_company(company_id: int):
    row = db.get_company(company_id)
    if not row:
        raise HTTPException(404, "not found")
    return row


@app.post("/api/companies", status_code=201)
def api_create_company(body: CompanyCreate):
    try:
        cid = db.create_company(body.model_dump())
    except ValueError as e:
        raise HTTPException(400, str(e)) from e
    return db.get_company(cid)


@app.put("/api/companies/{company_id}")
def api_update_company(company_id: int, body: CompanyUpdate):
    try:
        ok = db.update_company(company_id, body.model_dump())
    except ValueError as e:
        raise HTTPException(400, str(e)) from e
    if not ok:
        raise HTTPException(404, "not found")
    return db.get_company(company_id)


@app.get("/api/products")
def api_products(q: str = ""):
    return db.list_products(q=q)


@app.get("/api/products/{product_id}")
def api_get_product(product_id: int):
    row = db.get_product(product_id)
    if not row:
        raise HTTPException(404, "not found")
    return row


@app.post("/api/products", status_code=201)
def api_create_product(body: ProductCreate):
    try:
        pid = db.create_product(body.model_dump())
    except ValueError as e:
        raise HTTPException(400, str(e)) from e
    return db.get_product(pid)


@app.put("/api/products/{product_id}")
def api_update_product(product_id: int, body: ProductUpdate):
    try:
        ok = db.update_product(product_id, body.model_dump())
    except ValueError as e:
        raise HTTPException(400, str(e)) from e
    if not ok:
        raise HTTPException(404, "not found")
    return db.get_product(product_id)


@app.get("/api/receivables")
def api_receivables(
    as_of_date: str = "",
    q: str = "",
    company_id: Optional[int] = None,
):
    return db.list_outstanding_balances(
        kind=db.PARTNER_SALES,
        to_date=as_of_date,
        company_id=company_id,
        q=q,
        only_positive=True,
    )


@app.get("/api/payables")
def api_payables(
    as_of_date: str = "",
    q: str = "",
    company_id: Optional[int] = None,
):
    return db.list_outstanding_balances(
        kind=db.PARTNER_PURCHASE,
        to_date=as_of_date,
        company_id=company_id,
        q=q,
        only_positive=True,
    )


@app.get("/api/traces")
def api_traces():
    return db.list_traces()


@app.get("/api/balance/sales")
def api_sales_balance(company_id: int, as_of_date: str):
    return {"prev_balance": db.get_prev_balance(company_id, as_of_date, db.PARTNER_SALES)}


@app.get("/api/balance/purchase")
def api_purchase_balance(company_id: int, as_of_date: str):
    return {"prev_balance": db.get_prev_balance(company_id, as_of_date, db.PARTNER_PURCHASE)}


@app.get("/api/sales")
def api_list_sales(
    company_id: Optional[int] = None,
    from_date: Optional[str] = None,
    to_date: Optional[str] = None,
):
    return db.list_sales(company_id=company_id, from_date=from_date, to_date=to_date)


@app.get("/api/sales/{sale_id}")
def api_get_sale(sale_id: int):
    sale = db.get_sale_with_items(sale_id)
    if not sale:
        raise HTTPException(404, "not found")
    return sale


@app.post("/api/sales", status_code=201)
def api_create_sale(body: SaleCreate):
    try:
        sale_id = db.create_sale(body.model_dump())
    except Exception as e:
        raise HTTPException(400, str(e)) from e
    return db.get_sale_with_items(sale_id)


@app.delete("/api/sales/{sale_id}")
def api_delete_sale(sale_id: int):
    if not db.delete_sale(sale_id):
        raise HTTPException(404, "not found")
    return {"ok": True}


@app.get("/api/purchases")
def api_list_purchases(
    company_id: Optional[int] = None,
    from_date: Optional[str] = None,
    to_date: Optional[str] = None,
):
    return db.list_purchases(company_id=company_id, from_date=from_date, to_date=to_date)


@app.get("/api/purchases/{purchase_id}")
def api_get_purchase(purchase_id: int):
    row = db.get_purchase_with_items(purchase_id)
    if not row:
        raise HTTPException(404, "not found")
    return row


@app.post("/api/purchases", status_code=201)
def api_create_purchase(body: PurchaseCreate):
    try:
        pid = db.create_purchase(body.model_dump())
    except Exception as e:
        raise HTTPException(400, str(e)) from e
    return db.get_purchase_with_items(pid)


@app.delete("/api/purchases/{purchase_id}")
def api_delete_purchase(purchase_id: int):
    if not db.delete_purchase(purchase_id):
        raise HTTPException(404, "not found")
    return {"ok": True}


if STATIC_DIR.is_dir():

    @app.get("/{full_path:path}")
    async def serve_pwa(full_path: str):
        if full_path.startswith("api/"):
            raise HTTPException(404, "not found")
        if not full_path or full_path == "/":
            return FileResponse(STATIC_DIR / "index.html")
        candidate = STATIC_DIR / full_path
        if candidate.is_file():
            return FileResponse(candidate)
        return FileResponse(STATIC_DIR / "index.html")
