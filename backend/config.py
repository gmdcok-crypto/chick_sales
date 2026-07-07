import os
from pathlib import Path
from typing import Optional
from urllib.parse import unquote, urlparse

from dotenv import load_dotenv

load_dotenv(Path(__file__).resolve().parent / ".env")


def _first_env(*keys: str, default: str = "") -> str:
    for key in keys:
        value = os.environ.get(key)
        if value is not None and str(value).strip() != "":
            return str(value).strip()
    return default


def _parse_mysql_url(url: str) -> Optional[dict]:
    if not url or not url.startswith("mysql://"):
        return None
    parsed = urlparse(url)
    if not parsed.hostname:
        return None
    return {
        "host": parsed.hostname,
        "port": parsed.port or 3306,
        "user": unquote(parsed.username or ""),
        "password": unquote(parsed.password or ""),
        "database": (parsed.path or "/").lstrip("/") or "railway",
    }


def _load_db_settings() -> dict:
    # Railway MySQL 플러그인 (MYSQLHOST 등) 또는 MYSQL_URL / DATABASE_URL
    from_url = _parse_mysql_url(
        _first_env("DATABASE_URL", "MYSQL_URL", "MYSQL_PUBLIC_URL")
    )
    if from_url:
        return from_url

    return {
        "host": _first_env("MYSQLHOST", "MYSQL_HOST", "MARIADB_HOST", default="127.0.0.1"),
        "port": int(_first_env("MYSQLPORT", "MYSQL_PORT", "MARIADB_PORT", default="3306")),
        "user": _first_env("MYSQLUSER", "MYSQL_USER", "MARIADB_USER", default="root"),
        "password": _first_env("MYSQLPASSWORD", "MYSQL_PASSWORD", "MARIADB_PASSWORD"),
        "database": _first_env("MYSQLDATABASE", "MYSQL_DATABASE", "MARIADB_DATABASE", default="railway"),
    }


_db = _load_db_settings()

DB_HOST = _db["host"]
DB_PORT = int(_db["port"])
DB_USER = _db["user"]
DB_PASSWORD = _db["password"]
DB_DATABASE = _db["database"]

# 로컬/기존 설정 호환
MARIADB_HOST = DB_HOST
MARIADB_PORT = DB_PORT
MARIADB_USER = DB_USER
MARIADB_PASSWORD = DB_PASSWORD
MARIADB_DATABASE = DB_DATABASE

_cors = os.environ.get("CORS_ORIGINS", "http://localhost:5173")
CORS_ORIGINS = [o.strip() for o in _cors.split(",") if o.strip()]

_railway_domain = os.environ.get("RAILWAY_PUBLIC_DOMAIN", "").strip()
if _railway_domain:
    CORS_ORIGINS.append(f"https://{_railway_domain}")

_frontend_url = os.environ.get("FRONTEND_URL", "").strip()
if _frontend_url:
    CORS_ORIGINS.append(_frontend_url)
