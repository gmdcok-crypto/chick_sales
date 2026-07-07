# Railway 배포 가이드 — Chick Sales + MySQL

PWA + API를 **한 Railway 서비스**로, DB는 **Railway MySQL**을 사용합니다.

## 1. 프로젝트 생성

1. Railway → **New Project**
2. **Deploy from GitHub** → `gmdcok-crypto/chick_sales`
3. 앱 서비스: **Root Directory 비움** (Dockerfile 사용)

## 2. MySQL 추가

1. 프로젝트에서 **+ New** → **Database** → **MySQL**
2. MySQL 서비스가 생성되면 Variables에 자동으로:
   - `MYSQLHOST`, `MYSQLPORT`, `MYSQLUSER`, `MYSQLPASSWORD`, `MYSQLDATABASE`
   - `MYSQL_URL` (내부 연결용)

## 3. 앱에 MySQL 변수 연결

앱 서비스 → **Variables** → **Add Variable** → **Reference**

MySQL 서비스의 변수를 앱에 연결합니다 (Railway UI에서 MySQL 서비스 선택 후 참조).

또는 MySQL 서비스 Variables 탭에서 **Connect** / **Add to Service** 로 앱에 연결.

> 수동으로 넣을 필요 없이 **Reference**로 연결하는 것이 가장 안전합니다.

## 4. 스키마 (최초 1회)

Railway MySQL은 빈 DB입니다. sister 테이블을 만들어야 합니다.

**방법 A** — sister DB 덤프 후 Railway MySQL에 import  
**방법 B** — Railway MySQL 콘솔/Data 탭에서 `company`, `product`, `sales` 테이블 생성

(sister `db.py`의 CREATE TABLE 문과 호환)

## 5. 배포 확인

- `https://xxxx.up.railway.app/` → PWA
- `https://xxxx.up.railway.app/api/health` → DB 이름·호스트 확인

정상 예시:
```json
{"status":"ok","database":"railway","host":"mysql.railway.internal"}
```

## 6. 로컬 개발

로컬 MySQL/MariaDB 사용 시 `backend/.env`:

```
MARIADB_HOST=127.0.0.1
MARIADB_DATABASE=sister
...
```

## 변경 사항 (MySQL 전환)

- DB 드라이버: `mariadb` → `PyMySQL` (Railway MySQL 최적화, Docker 빌드 단순화)
- Railway `MYSQL*` / `MYSQL_URL` 자동 인식
- 로컬은 기존 `MARIADB_*` 변수 그대로 사용 가능
