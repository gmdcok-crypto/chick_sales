import os
from pathlib import Path

from dotenv import load_dotenv

load_dotenv(Path(__file__).resolve().parent / ".env")

MARIADB_HOST = os.environ.get("MARIADB_HOST", "127.0.0.1")
MARIADB_PORT = int(os.environ.get("MARIADB_PORT", "3306"))
MARIADB_USER = os.environ.get("MARIADB_USER", "root")
MARIADB_PASSWORD = os.environ.get("MARIADB_PASSWORD", "")
MARIADB_DATABASE = os.environ.get("MARIADB_DATABASE", "sister")

_cors = os.environ.get("CORS_ORIGINS", "http://localhost:5173")
CORS_ORIGINS = [o.strip() for o in _cors.split(",") if o.strip()]

# Railway 공개 URL 자동 허용 (프론트엔드 별도 서비스일 때)
_railway_domain = os.environ.get("RAILWAY_PUBLIC_DOMAIN", "").strip()
if _railway_domain:
    CORS_ORIGINS.append(f"https://{_railway_domain}")

_frontend_url = os.environ.get("FRONTEND_URL", "").strip()
if _frontend_url:
    CORS_ORIGINS.append(_frontend_url)
