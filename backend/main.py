from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

import config
import db

app = FastAPI(
    title="Chick Sales API",
    description="sister SCM 웹/PWA용 REST API",
    version="0.1.0",
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
    return {"status": "ok", "database": config.MARIADB_DATABASE}


@app.get("/api/companies")
def api_list_companies():
    return db.list_companies()


@app.get("/api/products")
def api_list_products():
    return db.list_products()


@app.get("/api/sales")
def api_list_sales(company_id: int | None = None, from_date: str | None = None, to_date: str | None = None):
    return db.list_sales(company_id=company_id, from_date=from_date, to_date=to_date)


@app.get("/api/sales/{sale_id}")
def api_get_sale(sale_id: int):
    sale = db.get_sale_with_items(sale_id)
    if not sale:
        from fastapi import HTTPException

        raise HTTPException(status_code=404, detail="sale not found")
    return sale
