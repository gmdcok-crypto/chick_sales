# Chick Sales ERP — Pencil 디자인

UI를 [Pencil](https://pencil.dev)에서 시각적으로 수정하고 코드에 반영할 수 있습니다.

## 1. 초기 설정

1. Cursor에서 **Pencil** 확장 설치
2. `design` 폴더에서 우클릭 → **New Pencil Design** (또는 `design/chick-sales-erp.pen` 생성)
3. `.pen` 파일을 **에디터 탭에서 열기** (MCP는 열린 파일만 접근 가능)

## 2. 디자인 파일 구조

`design/chick-sales-erp.pen` 에 다음 프레임을 만듭니다:

| 레이어 ID | 설명 | React 매핑 |
|-----------|------|------------|
| `shell` | 전체 1440×900 셸 | `ErpApp` |
| `sidebar` | 왼쪽 200px 트리 메뉴 | `SideMenu` |
| `main` | 탭 + 작업영역 | `ErpApp` |
| `tab-strip` | 상단 탭 | `TabStrip` |
| `workspace` | 패널 영역 | `TabPanel` |
| `toolbar` | 툴바 | 각 Panel |
| `data-grid` | 데이터 그리드 | `DataGrid` |

레퍼런스 HTML: `design/reference/erp-shell.html` (Pencil 캔버스에 붙여넣기 가능)

## 3. 디자인 토큰

| 파일 | 역할 |
|------|------|
| `frontend/src/design/tokens.css` | CSS 변수 (앱이 사용) |
| `design/tokens.manifest.json` | Pencil 변수 ↔ CSS 매핑 |

Pencil에서 변수 이름은 manifest의 키와 맞추면 동기화가 쉽습니다  
예: `color/brand` → `--erp-color-brand`

## 4. Pencil에서 UI 수정 후 코드 반영

### 방법 A — AI에게 요청 (권장)

`.pen` 파일을 연 상태에서 채팅:

```
design/chick-sales-erp.pen 변수를 읽어서 tokens.css에 반영해줘
```

또는:

```
Pencil 디자인에 맞게 erp.css / SideMenu 레이아웃 업데이트해줘
```

### 방법 B — 수동 동기화

```bash
# Pencil get_variables 결과를 design/tokens.export.json 에 저장 후
node scripts/sync-pencil-tokens.mjs
```

## 5. 첫 디자인 생성 프롬프트

`.pen` 파일을 연 뒤 AI에게:

```
design/chick-sales-erp.pen 에 Chick Sales ERP PC 화면을 만들어줘.
- 1440x900
- 왼쪽 사이드바 200px: 브랜드 + 트리 메뉴 (홈, 거래처, 품목, 매출, 매입)
- 오른쪽: 탭바, 툴바, 데이터 그리드, 하단 푸터
- WinForms/Excel 스타일, design/tokens.manifest.json 변수 사용
- design/reference/erp-shell.html 참고
```

## 6. 컴포넌트 레이어 ID

React 컴포넌트에 `data-pencil-layer` 속성이 있어 Pencil 레이어와 1:1 대응됩니다.

디자인 수정 시 해당 레이어 이름으로 찾으면 됩니다.
