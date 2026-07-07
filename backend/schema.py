"""Railway MySQL 초기 스키마 — sister 핵심 테이블."""

from __future__ import annotations

import db

_TABLES = [
    """
    CREATE TABLE IF NOT EXISTS company (
        id INT AUTO_INCREMENT PRIMARY KEY,
        company_code VARCHAR(32) NOT NULL UNIQUE,
        company_name VARCHAR(200) NOT NULL DEFAULT '',
        biz_no VARCHAR(50) NULL,
        ceo_name VARCHAR(100) NULL,
        business_type VARCHAR(100) NULL,
        business_item VARCHAR(100) NULL,
        zip_code VARCHAR(20) NULL,
        address VARCHAR(255) NULL,
        address_detail VARCHAR(255) NULL,
        email VARCHAR(255) NULL,
        tax_email VARCHAR(255) NULL,
        phone VARCHAR(50) NULL,
        fax VARCHAR(50) NULL,
        manager_name VARCHAR(100) NULL,
        manager_title VARCHAR(100) NULL,
        manager_mobile VARCHAR(50) NULL,
        base_balance BIGINT NOT NULL DEFAULT 0,
        label_title VARCHAR(200) NOT NULL DEFAULT '',
        bank_account_id INT NULL,
        status VARCHAR(20) NOT NULL DEFAULT 'active',
        tax_invoice_yn VARCHAR(1) NOT NULL DEFAULT 'Y',
        billing_company_name VARCHAR(200) NULL,
        billing_biz_no VARCHAR(50) NULL,
        billing_ceo_name VARCHAR(100) NULL,
        billing_business_type VARCHAR(100) NULL,
        billing_business_item VARCHAR(100) NULL,
        billing_address VARCHAR(255) NULL,
        billing_tax_email VARCHAR(255) NULL,
        created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    """,
    """
    CREATE TABLE IF NOT EXISTS product (
        id INT AUTO_INCREMENT PRIMARY KEY,
        product_code VARCHAR(32) NOT NULL UNIQUE,
        product_name VARCHAR(200) NOT NULL DEFAULT '',
        product_report_no VARCHAR(100) NOT NULL DEFAULT '',
        spec VARCHAR(100) NOT NULL DEFAULT '',
        origin VARCHAR(20) NOT NULL DEFAULT '',
        pouch_content VARCHAR(100) NOT NULL DEFAULT '',
        cold_type VARCHAR(10) NOT NULL DEFAULT '',
        tax_type VARCHAR(10) NOT NULL DEFAULT '면세',
        status VARCHAR(20) NOT NULL DEFAULT 'active',
        created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    """,
    """
    CREATE TABLE IF NOT EXISTS trace (
        id INT AUTO_INCREMENT PRIMARY KEY,
        trace_code VARCHAR(64) NOT NULL UNIQUE,
        status VARCHAR(20) NOT NULL DEFAULT 'active',
        created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    """,
    """
    CREATE TABLE IF NOT EXISTS sales (
        id INT AUTO_INCREMENT PRIMARY KEY,
        company_id INT NOT NULL,
        sales_date DATE NOT NULL,
        trace_no VARCHAR(64) NOT NULL DEFAULT '',
        txn_type VARCHAR(20) NOT NULL DEFAULT 'sale',
        prev_balance BIGINT NOT NULL DEFAULT 0,
        total_amount BIGINT NOT NULL DEFAULT 0,
        payment BIGINT NOT NULL DEFAULT 0,
        balance BIGINT NOT NULL DEFAULT 0,
        status VARCHAR(20) NOT NULL DEFAULT 'active',
        statement_printed_at DATETIME NULL,
        created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    """,
    """
    CREATE TABLE IF NOT EXISTS sales_item (
        id INT AUTO_INCREMENT PRIMARY KEY,
        sales_id INT NOT NULL,
        product_id INT NULL,
        product_name VARCHAR(200) NOT NULL DEFAULT '',
        spec VARCHAR(200) NOT NULL DEFAULT '',
        unit_price INT NOT NULL DEFAULT 0,
        qty DECIMAL(12,1) NOT NULL DEFAULT 0,
        amount BIGINT NOT NULL DEFAULT 0,
        tax_amount BIGINT NOT NULL DEFAULT 0,
        trace_no VARCHAR(64) NOT NULL DEFAULT '',
        sort_order INT NOT NULL DEFAULT 0,
        created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    """,
    """
    CREATE TABLE IF NOT EXISTS purchase (
        id INT AUTO_INCREMENT PRIMARY KEY,
        company_id INT NOT NULL,
        purchase_date DATE NOT NULL,
        trace_no VARCHAR(64) NOT NULL DEFAULT '',
        txn_type VARCHAR(20) NOT NULL DEFAULT 'purchase',
        prev_balance BIGINT NOT NULL DEFAULT 0,
        total_amount BIGINT NOT NULL DEFAULT 0,
        payment BIGINT NOT NULL DEFAULT 0,
        balance BIGINT NOT NULL DEFAULT 0,
        status VARCHAR(20) NOT NULL DEFAULT 'active',
        created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    """,
    """
    CREATE TABLE IF NOT EXISTS purchase_item (
        id INT AUTO_INCREMENT PRIMARY KEY,
        purchase_id INT NOT NULL,
        product_id INT NULL,
        product_name VARCHAR(200) NOT NULL DEFAULT '',
        spec VARCHAR(200) NOT NULL DEFAULT '',
        unit_price INT NOT NULL DEFAULT 0,
        qty DECIMAL(12,1) NOT NULL DEFAULT 0,
        amount BIGINT NOT NULL DEFAULT 0,
        tax_amount BIGINT NOT NULL DEFAULT 0,
        trace_no VARCHAR(64) NOT NULL DEFAULT '',
        sort_order INT NOT NULL DEFAULT 0,
        created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    """,
    """
    CREATE TABLE IF NOT EXISTS app_user (
        id INT AUTO_INCREMENT PRIMARY KEY,
        username VARCHAR(64) NOT NULL,
        password_salt VARCHAR(64) NULL,
        password_hash VARCHAR(128) NULL,
        role VARCHAR(32) NOT NULL DEFAULT 'staff',
        allowed_tabs VARCHAR(128) NULL,
        status VARCHAR(20) NOT NULL DEFAULT 'active',
        created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        UNIQUE KEY uq_app_user_username (username)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    """,
]

_DEFAULT_TRACES = ("230314-CH-001", "230314-CH-002", "230313-CH-015")


def ensure_schema() -> None:
    with db.get_db() as conn:
        cur = conn.cursor()
        for sql in _TABLES:
            cur.execute(sql)
        cur.execute("SELECT COUNT(*) FROM trace")
        if cur.fetchone()[0] == 0:
            for code in _DEFAULT_TRACES:
                cur.execute(
                    "INSERT INTO trace (trace_code, status) VALUES (%s, 'active')",
                    (code,),
                )
        cur.close()
