# Chick Sales — Railway 배포 체크리스트

PWA + API **한 서비스**, DB는 **Railway MySQL**.

## 1단계: GitHub 연결

1. https://railway.com → **New Project**
2. **Deploy from GitHub repo** → `gmdcok-crypto/chick_sales`
3. 앱 서비스 설정:
   - **Root Directory**: *(비움)*
   - Builder: **Dockerfile** (`railway.toml` 자동 적용)

## 2단계: MySQL 추가

1. 같은 프로젝트에서 **+ New** → **Database** → **MySQL**
2. MySQL 서비스 생성 완료 대기

## 3단계: 앱 ↔ MySQL 연결 (중요)

1. **MySQL 서비스** 클릭 → **Connect** 또는 **Variables**
2. **chick_sales 앱 서비스**에 MySQL 변수 연결 (Reference)

앱 Variables에 아래가 보이면 성공:

```
MYSQLHOST
MYSQLPORT
MYSQLUSER
MYSQLPASSWORD
MYSQLDATABASE
MYSQL_URL
```

수동 입력 불필요. Reference로 연결하세요.

## 4단계: 배포

1. 앱 서비스 **Deploy** (또는 Git push 시 자동)
2. **Settings → Networking → Generate Domain** (공개 URL 생성)

## 5단계: 확인

| URL | 기대 결과 |
|-----|-----------|
| `https://xxxx.up.railway.app/` | PWA 화면 |
| `https://xxxx.up.railway.app/api/health` | `{"status":"ok","railway":true,...}` |

앱 시작 시 **테이블 자동 생성** (`company`, `product`, `sales` 등).

## 로컬 개발 (선택)

Railway MySQL을 로컬에서 쓰려면 앱 Variables의 `MYSQL_URL`을 `backend/.env`에 복사.

로컬 sister DB를 쓰려면:

```
MARIADB_HOST=127.0.0.1
MARIADB_PASSWORD=...
MARIADB_DATABASE=sister
```

## 문제 해결

| 증상 | 해결 |
|------|------|
| Railpack / start.sh 오류 | Root Directory 비우기, Dockerfile 사용 |
| DB 연결 실패 | MySQL Reference 변수 연결 확인 |
| 빈 목록 | 정상 — Railway DB는 새 DB, 데이터는 import 필요 |
| sister 데이터 이전 | sister DB 덤프 → Railway MySQL import |

## 아키텍처

```
[브라우저/PWA]
      ↓
[Railway 앱 1개 — Docker]
  ├─ React 정적 파일 (/)
  └─ FastAPI (/api/*)
      ↓
[Railway MySQL]
```
