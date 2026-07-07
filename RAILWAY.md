# Railway 배포 가이드 — Chick Sales

PWA(프론트) + FastAPI(백엔드)를 **한 Railway 서비스**로 배포합니다.

## 1. Railway 프로젝트 생성

1. https://railway.com 로그인
2. **New Project** → **Deploy from GitHub repo**
3. `gmdcok-crypto/chick_sales` 선택

## 2. 서비스 설정

| 항목 | 값 |
|------|-----|
| Root Directory | *(비움 — 저장소 루트)* |
| Builder | Dockerfile (`railway.toml` 자동 적용) |

Railpack 대신 **Dockerfile**을 사용합니다. 루트에 `railway.toml`이 있습니다.

## 3. 환경 변수 (Variables)

Railway 서비스 → **Variables** 탭:

```
MARIADB_HOST=your-db-host
MARIADB_PORT=3306
MARIADB_USER=root
MARIADB_PASSWORD=your-password
MARIADB_DATABASE=sister
```

### DB 선택

- **기존 sister DB** (사무실/서버 MariaDB): 외부에서 접속 가능한 IP·포트 필요
- **Railway MySQL** 플러그인: 프로젝트에 MySQL 추가 후 `MYSQL*` 변수를 `MARIADB_*`에 매핑

같은 도메인에서 PWA+API를 쓰므로 `VITE_API_BASE`는 설정하지 않아도 됩니다.

## 4. 배포 확인

배포 후 Railway가 부여한 URL 접속:

- `https://xxxx.up.railway.app/` → PWA 화면
- `https://xxxx.up.railway.app/api/health` → `{"status":"ok",...}`

## 5. PWA 설치

HTTPS URL에서 Chrome/Edge → **앱 설치**

## 6. 로컬 vs Railway

| | 로컬 | Railway |
|--|------|---------|
| 프론트 | `npm run dev` (:5173) | Docker 빌드 → static |
| API | `uvicorn` (:8000) | 같은 컨테이너 :PORT |
| DB | localhost MariaDB | Variables로 지정 |

## 문제 해결

| 오류 | 조치 |
|------|------|
| Railpack / start.sh | Root Directory 비우고 Dockerfile 사용 |
| pip mariadb 실패 | Dockerfile에 gcc, libmariadb-dev 포함됨 (최신 커밋) |
| API 연결 실패 | Variables의 MARIADB_* 확인, DB 방화벽에서 Railway IP 허용 |
| 빈 화면 | `/api/health` 먼저 확인 |

## (선택) API / 프론트 분리 배포

한 서비스 대신 나누려면:

- API: Root Directory = `backend` (`backend/railpack.json`)
- 프론트: Root Directory = `frontend`, `VITE_API_BASE=https://api-url`

대부분은 **단일 Docker 서비스**가 관리가 쉽습니다.
