# Mini-LMS — Product Specification v1.0

## 1. 프로젝트 개요

| 항목            | 내용                                                                                                                                            |
| --------------- | ----------------------------------------------------------------------------------------------------------------------------------------------- |
| **프로젝트명**  | Mini-LMS (가칭)                                                                                                                                 |
| **철학**        | Zero Infras · Zero Egress Fee · Local-First Management                                                                                          |
| **목표**        | 한국 수강생 대상 경량 강의 플랫폼. 로컬 미니 PC(N100)에서 콘텐츠를 관리하고, Cloudflare Edge에서 서비스를 구동하여 운영 비용과 수수료를 최소화. |
| **타겟 사용자** | 1인 강사 / 소규모 교육 사업자                                                                                                                   |
| **언어**        | UI는 한국어 우선, 코드/주석은 영어                                                                                                              |

### 핵심 기능

1. **Local (Admin):** 미니 PC의 특정 폴더에 강의 자료(PDF, MP4)를 넣고 스크립트를 실행하면 R2/Stream으로 자동 업로드 및 D1 DB 업데이트.
2. **Cloud (User):** 수강생은 Cloudflare Workers에 접속. Workers는 D1에서 강의 목록을 읽어와 R2/Stream의 서명된 URL(Signed URL)을 통해 콘텐츠를 안전하게 제공.
3. **Payment:** 국내 결제 대행사(Toss 등) API를 Workers 내에서 처리.

다음 기능은 CourseLit에 존재하지만 본 프로젝트에서는 **의도적으로 제외**합니다.

- ❌ Blog / Newsletter
- ❌ Email Marketing (대량 메일 발송)
- ❌ Community (게시판/포럼)
- ❌ Rich Text Editor (웹 기반 WYSIWYG)
- ❌ Page Builder / Theme System
- ❌ Multi-school / Multi-tenant
- ❌ SCORM Support

---

## 2. 핵심 기술 스택

| 레이어                 | 기술                                               | 비고                                                            |
| ---------------------- | -------------------------------------------------- | --------------------------------------------------------------- |
| **Framework**          | Hono                                               | Cloudflare Workers 최적화 초경량 웹 프레임워크                  |
| **Runtime**            | Cloudflare Workers                                 | Serverless Edge Computing                                       |
| **Database**           | Cloudflare D1 (SQLite)                             | 강의 메타데이터, 유저, 결제 정보                                |
| **Object Storage**     | Cloudflare R2                                      | PDF, 이미지, 소스코드 등 디지털 자산 (Egress 0원)               |
| **Video Streaming**    | Cloudflare Stream                                  | 트랜스코딩, DRM, 서명된 URL 자동화                              |
| **Authentication**     | Google Identity (OAuth 2.0)                        | Cloudflare Access 또는 자체 JWT 발급                            |
| **Payment**            | Toss Payments                                      | 국내 결제 대행 (카드/계좌이체/가상계좌)                         |
| **Content Format**     | Markdown (.md)                                     | 로컬에서 작성, 그대로 렌더링                                    |
| **Markdown Rendering** | KaTeX (CDN) + highlight.js + Copy Button + Mermaid | LaTeX 수식, 코드 하이라이팅, 코드 복사 버튼, 다이어그램         |
| **Local Sync**         | Python or Node.js CLI                              | Local PC → Cloudflare API R2/Stream 업로드 + D1 메타데이터 등록 |

---

## 3. 핵심 아키텍처

```
┌──────────────────────────────────────────────────────────────┐
│  LOCAL MINI PC (Admin)                                       │
│                                                              │
│  content/                                                    │
│  ├── courses/                                                │
│  │   ├── python-101/                                         │
│  │   │   ├── index.md     ← 강의 소개 + frontmatter (제목,가격,etc)      │
│  │   │   ├── thumbnail.jpg                                   │
│  │   │   ├── 01-intro/                                       │
│  │   │   │   ├── content.md     ← 본문 + Frontmatter (제목,순서) │
│  │   │   │   └── video.mp4      ← 강의 영상                    │
│  │   │   └── 02-variables/                                   │
│  │   │       ├── content.md                                  │
│  │   │       └── slides.pdf                                  │
│  │   └── ...                                                 │
│  └── downloads/                                              │
│      ├── mini-code-gif/                                      │
│      │   ├── index.md          ← 제품 소개 + Frontmatter (제목, etc) │
│      │   └── make_gif.zip       ← 디지털 제품 본체               │
│      └── ...                                                 │
│                                                              │
│  $ python sync.py  ─────────────────────────────────────┐    │
└─────────────────────────────────────────────────────────┼────┘
                                                          │
              ┌───────────────────────────────────────────┘
              ▼
┌──────────────────────────────────────────────────────────────┐
│  CLOUDFLARE EDGE (Production)                                │
│                                                              │
│  ┌─────────────┐   ┌──────────┐   ┌──────────────────────┐  │
│  │ Workers     │──▶│ D1 (SQL) │   │ R2 (Object Storage)  │  │
│  │ (Hono App)  │   └──────────┘   │ - thumbnails/        │  │
│  │             │──▶                │ - pdfs/              │  │
│  │ Routes:     │   ┌──────────┐   │ - images/            │  │
│  │ /api/*      │──▶│ Stream   │   └──────────────────────┘  │
│  │ /courses/*  │   │ (Video)  │                              │
│  │ /downloads/* │   └──────────┘                              │
│  │ /auth/*     │                                             │
│  │ /payment/*  │                                             │
│  └─────────────┘                                             │
└──────────────────────────────────────────────────────────────┘
              ▲
              │ HTTPS
┌─────────────┴────────────────────────────────────────────────┐
│  BROWSER (수강생)                                             │
│  - 강의 목록 조회 / 강의 시청 / 디지털 상품 다운로드          │
│  - Google 로그인 → JWT → 결제 → 콘텐츠 접근                  │
└──────────────────────────────────────────────────────────────┘
```

---

## 4. 데이터 모델 (D1 Schema)

### 4.1. `users`

| Column       | Type                   | 설명                    |
| ------------ | ---------------------- | ----------------------- |
| `id`         | TEXT (UUID) PK         |                         |
| `email`      | TEXT UNIQUE NOT NULL   | Google OAuth에서 가져옴 |
| `name`       | TEXT                   |                         |
| `avatar_url` | TEXT                   | Google 프로필 사진      |
| `role`       | TEXT DEFAULT 'student' | `admin` \| `student`    |
| `created_at` | TEXT (ISO 8601)        |                         |
| `updated_at` | TEXT (ISO 8601)        |                         |

### 4.2. `courses`

| Column          | Type                  | 설명                                                                 |
| --------------- | --------------------- | -------------------------------------------------------------------- |
| `id`            | TEXT (UUID) PK        |                                                                      |
| `slug`          | TEXT UNIQUE NOT NULL  | URL용 고유 식별자                                                    |
| `title`         | TEXT NOT NULL         | 강의 제목                                                            |
| `description`   | TEXT                  | 강의 소개 (markdown)                                                 |
| `thumbnail_key` | TEXT                  | R2 Object Key                                                        |
| `price`         | INTEGER DEFAULT 0     | 원 단위 (0 = 무료)                                                   |
| `currency`      | TEXT DEFAULT 'KRW'    |                                                                      |
| `status`        | TEXT DEFAULT 'draft'  | `draft` \| `published` \| `archived`                                 |
| `type`          | TEXT DEFAULT 'course' | `course` \| `download`                                               |
| `access_days`   | INTEGER DEFAULT 365   | 수강 유효 기간 (일). `course`에만 적용. 0 = 무제한, 기본값 365 (1년) |
| `created_at`    | TEXT (ISO 8601)       |                                                                      |
| `updated_at`    | TEXT (ISO 8601)       |                                                                      |

### 4.3. `sessions` (강의 내 개별 수업)

| Column        | Type                 | 설명                          |
| ------------- | -------------------- | ----------------------------- |
| `id`          | TEXT (UUID) PK       |                               |
| `course_id`   | TEXT FK → courses.id |                               |
| `slug`        | TEXT NOT NULL        |                               |
| `title`       | TEXT NOT NULL        |                               |
| `content_md`  | TEXT                 | Markdown 본문                 |
| `video_uid`   | TEXT                 | Cloudflare Stream Video UID   |
| `attachments` | TEXT (JSON)          | R2 키 배열 `["pdfs/xxx.pdf"]` |
| `sort_order`  | INTEGER DEFAULT 0    | 정렬 순서                     |
| `is_preview`  | INTEGER DEFAULT 0    | 1이면 미리보기 가능           |
| `created_at`  | TEXT (ISO 8601)      |                               |
| `updated_at`  | TEXT (ISO 8601)      |                               |

**UNIQUE** constraint: `(course_id, slug)`

### 4.4. `payments`

| Column          | Type                   | 설명                                                                |
| --------------- | ---------------------- | ------------------------------------------------------------------- |
| `id`            | TEXT (UUID) PK         |                                                                     |
| `user_id`       | TEXT FK → users.id     |                                                                     |
| `course_id`     | TEXT FK → courses.id   |                                                                     |
| `order_id`      | TEXT UNIQUE NOT NULL   | 자체 생성 주문번호 (Toss orderId)                                   |
| `amount`        | INTEGER NOT NULL       | 결제 금액 (원)                                                      |
| `pg_provider`   | TEXT DEFAULT 'toss'    | `toss`                                                              |
| `payment_key`   | TEXT                   | Toss Payments 결제 고유키 (`paymentKey`)                            |
| `status`        | TEXT DEFAULT 'pending' | `pending` \| `paid` \| `failed` \| `refunded` \| `partial_refunded` |
| `paid_at`       | TEXT (ISO 8601)        |                                                                     |
| `refund_amount` | INTEGER DEFAULT 0      | 환불된 총 금액 (부분 환불 포함)                                     |
| `refund_reason` | TEXT                   | 환불 사유                                                           |
| `refunded_at`   | TEXT (ISO 8601)        | 환불 처리 시각                                                      |
| `created_at`    | TEXT (ISO 8601)        |                                                                     |

### 4.5. `enrollments` (수강 관계)

| Column        | Type                  | 설명                                                                      |
| ------------- | --------------------- | ------------------------------------------------------------------------- |
| `id`          | TEXT (UUID) PK        |                                                                           |
| `user_id`     | TEXT FK → users.id    |                                                                           |
| `course_id`   | TEXT FK → courses.id  |                                                                           |
| `payment_id`  | TEXT FK → payments.id | 결제 레코드 참조 (무료 강의는 NULL)                                       |
| `enrolled_at` | TEXT (ISO 8601)       | 수강 시작일                                                               |
| `expires_at`  | TEXT (ISO 8601)       | 수강 만료일. `course`: enrolled_at + access_days, `download`: NULL (영구) |
| `status`      | TEXT DEFAULT 'active' | `active` \| `expired` \| `revoked`                                        |

**UNIQUE** constraint: `(user_id, course_id)`

> **구독 정책:**
> - **강의 (course):** 결제일로부터 `courses.access_days`일간 수강 가능 (기본 365일 = 1년). 만료 후 재구매 필요.
> - **디지털 상품 (download):** 결제 완료 시 영구 다운로드 권한. `expires_at = NULL`.
> - **무료 강의:** 등록 시 동일하게 access_days 적용.

### 4.6. `progress` (학습 진행률)

| Column         | Type                  | 설명            |
| -------------- | --------------------- | --------------- |
| `id`           | TEXT (UUID) PK        |                 |
| `user_id`      | TEXT FK → users.id    |                 |
| `session_id`   | TEXT FK → sessions.id |                 |
| `completed`    | INTEGER DEFAULT 0     | 1이면 수강 완료 |
| `completed_at` | TEXT (ISO 8601)       |                 |

**UNIQUE** constraint: `(user_id, session_id)`

---

## 5. API 설계 (Hono Routes)

### 5.1. Public (인증 불필요)

| Method | Path               | 설명                           |
| ------ | ------------------ | ------------------------------ |
| GET    | `/`                | 랜딩 페이지 (강의 목록)        |
| GET    | `/courses`         | 강의 목록 (published만)        |
| GET    | `/courses/:slug`   | 강의 상세 (미리보기 세션 포함) |
| GET    | `/downloads`       | 디지털 상품 목록               |
| GET    | `/downloads/:slug` | 상품 상세                      |

### 5.2. Auth

| Method | Path                    | 설명                         |
| ------ | ----------------------- | ---------------------------- |
| GET    | `/auth/google`          | Google OAuth 시작            |
| GET    | `/auth/google/callback` | Google OAuth 콜백 → JWT 발급 |
| POST   | `/auth/logout`          | 세션 종료                    |
| GET    | `/auth/me`              | 현재 유저 정보               |

### 5.3. Student (로그인 필요)

| Method | Path                                               | 설명                              |
| ------ | -------------------------------------------------- | --------------------------------- |
| GET    | `/my/courses`                                      | 내 수강 목록                      |
| GET    | `/my/courses/:slug/sessions/:sessionSlug`          | 수업 상세 (영상+MD+첨부)          |
| POST   | `/my/courses/:slug/sessions/:sessionSlug/complete` | 수강 완료 표시                    |
| GET    | `/my/downloads/:slug/download`                     | 디지털 상품 다운로드 (Signed URL) |

### 5.4. Payment

| Method | Path               | 설명                                                    |
| ------ | ------------------ | ------------------------------------------------------- |
| POST   | `/payment/prepare` | 주문 생성 (orderId 발급, DB에 pending 레코드 생성)      |
| GET    | `/payment/success` | 결제 성공 리다이렉트 (paymentKey, orderId, amount 수신) |
| GET    | `/payment/fail`    | 결제 실패 리다이렉트                                    |
| POST   | `/payment/confirm` | 결제 승인 API 호출 (Toss `/v1/payments/confirm`)        |
| POST   | `/payment/webhook` | Toss 웹훅 수신 (결제 상태 변경 알림)                    |

### 5.5. Refund (환불)

| Method | Path                        | 설명                                            |
| ------ | --------------------------- | ----------------------------------------------- |
| POST   | `/my/refund`                | 수강생 환불 요청 (진도율 기반 자동 환불액 산정) |
| POST   | `/admin/refund/:payment_id` | 관리자 수동 환불 처리                           |

### 5.6. Admin (role=admin 전용)

| Method | Path                  | 설명                                 |
| ------ | --------------------- | ------------------------------------ |
| GET    | `/admin/dashboard`    | 관리자 대시보드 (매출, 수강생 수 등) |
| GET    | `/admin/students`     | 수강생 목록                          |
| GET    | `/admin/students/:id` | 수강생 상세 (수강 이력, 결제 이력)   |
| GET    | `/admin/payments`     | 결제 내역                            |
| GET    | `/admin/refunds`      | 환불 내역                            |

> **Note:** 강의/상품의 CRUD는 로컬 Sync 스크립트가 담당하므로 Admin API에 별도 CRUD 없음.

---

## 6. 콘텐츠 관리 (Local-First)

### 6.1. 로컬 폴더 구조 (Convention over Configuration)

```
content/
├── courses/
│   └── {course-slug}/
│       ├── meta.yaml
│       ├── thumbnail.jpg (or .png, .webp)
│       └── {session-slug}/
│           ├── content.md     (Frontmatter + Markdown)
│           ├── video.mp4       (선택)
│           └── attachments/    (선택, 첨부파일)
└── downloads/
    └── {download-slug}/
        ├── meta.yaml
        ├── description.md     (Frontmatter + Markdown)
        └── {filename}.zip     (디지털 제품 본체)
```

### 6.2. `meta.yaml` 예시

**강의 (`courses/{slug}/meta.yaml`):**

```yaml
title: "파이썬 입문 101"
description: "프로그래밍을 처음 시작하는 분을 위한 파이썬 기초 과정"
price: 49000          # 원 단위, 0이면 무료
currency: KRW
status: published     # draft | published | archived
access_days: 365      # 수강 유효 기간 (일). 0이면 무제한. 생략 시 기본 365일
```

**세션 (`courses/{slug}/{session-slug}/content.md` Frontmatter):**

```yaml
---
title: "변수와 자료형"
sort_order: 2
is_preview: false     # true면 비로그인/비결제 유저도 열람 가능
---
# 본문 시작...
```

**디지털 제품 (`downloads/{slug}/description.md` Frontmatter):**

```yaml
---
title: "Mini Code GIF Maker"
---
# 제품 설명...
```

### 6.3. Markdown 콘텐츠 렌더링

`content.md` 파일은 표준 Markdown + 확장 문법을 지원합니다.

| 기능             | 문법                                | 렌더링 엔진                       |
| ---------------- | ----------------------------------- | --------------------------------- |
| **수식 (LaTeX)** | `$...$` (인라인) / `$$...$$` (블록) | KaTeX (CDN)                       |
| **코드 블록**    | ` ```python ... ``` `               | highlight.js (CDN)                |
| **다이어그램**   | ` ```mermaid ... ``` `              | Mermaid.js (CDN)                  |
| **코드 복사**    | 코드 블록 우상단 'Copy' 버튼        | 커스텀 JS (Clipboard API)         |
| **목차 (TOC)**   | `[TOC]` 또는 자동 생성              | 커스텀 (heading 파싱)             |
| **이미지**       | `![alt](./image.png)`               | R2 URL로 자동 변환 (sync 시)      |
| **경고/팁 박스** | `> [!NOTE]`, `> [!TIP]` 등          | GitHub-style Alerts 커스텀 렌더러 |

**렌더링 방식:** Workers에서 markdown-it (또는 유사 라이브러리)로 HTML 변환 후, 클라이언트에서 KaTeX/Mermaid/highlight.js를 CDN으로 로드하여 후처리.

---

## 7. Sync Script (Local → Cloud)

### 7.1. 동작 흐름

```
$ python sync.py [--dry-run]

1. content/ 폴더를 스캔
2. 각 courses/downloads 폴더의 meta.yaml을 파싱
3. 변경된 파일 감지 (파일 해시 비교, .sync-state.json 참조)
4. 변경분만 처리:
   a. 이미지/PDF/기타 → Cloudflare R2 업로드
   b. content.md 내 로컬 이미지 경로 → R2 URL로 치환
   c. mp4 확장자 video → Cloudflare Stream 업로드 (TUS 프로토콜)
   d. 메타데이터 + content.md → Workers API 호출 → D1 Upsert
5. 결과 리포트 출력
```

### 7.2. 상태 파일 (`.sync-state.json`)

```json
{
  "courses/python-101/01-intro/content.md": {
    "hash": "sha256:abc123...",
    "synced_at": "2026-03-11T10:00:00Z",
    "r2_key": "courses/python-101/01-intro/content.md"
  },
  "courses/python-101/01-intro/video.mp4": {
    "hash": "sha256:def456...",
    "synced_at": "2026-03-11T10:01:00Z",
    "stream_uid": "abcdef1234567890"
  }
}
```

### 7.3. 필요 환경 변수 (루트 레벨)

**싱크 스크립트 전용 (`.env.sync`):**

```env
CLOUDFLARE_ACCOUNT_ID=your-account-id
CLOUDFLARE_API_TOKEN=your-api-token
R2_BUCKET_NAME=lms-assets
D1_DATABASE_ID=your-d1-id
WORKERS_API_BASE=https://lms.your-domain.com
CONTENT_DIR=./content
ADMIN_JWT_TOKEN=your-jwt-token
```

**앱 실행 전용 (`.env.app`):**

```env
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
JWT_SECRET=your-jwt-secret
TOSS_SECRET_KEY=your-toss-key
```

---

## 8. 인증 & 보안

### 8.1. 인증 흐름

```
수강생 브라우저
    │
    ├─ GET /auth/google ──────────▶ Google OAuth 2.0 Consent Screen
    │                                    │
    │◀── GET /auth/google/callback ◀─────┘
    │     (Google에서 code 반환)
    │
    │     Workers에서:
    │     1. code → Google Token API → id_token 검증
    │     2. email 추출 → D1에서 user 조회/생성
    │     3. JWT 발급 (subject=user_id, HS256, 7일 만료)
    │     4. Set-Cookie: token=<JWT>; HttpOnly; Secure; SameSite=Lax
    │
    ▼
    이후 모든 요청에 Cookie 자동 포함 → Hono 미들웨어에서 JWT 검증
```

### 8.2. 콘텐츠 접근 제어

| 콘텐츠 타입          | 접근 조건             | 구현 방식                                                              |
| -------------------- | --------------------- | ---------------------------------------------------------------------- |
| 강의 목록/상세       | 누구나                | Public route                                                           |
| 미리보기 세션        | 누구나                | `sessions.is_preview = 1`                                              |
| 유료 세션 영상       | 결제 완료 + 수강 유효 | `enrollments` 확인 + `expires_at` 만료 검증 → Stream Signed URL 발급   |
| 유료 세션 첨부파일   | 결제 완료 + 수강 유효 | `enrollments` 확인 + `expires_at` 만료 검증 → R2 Presigned URL 발급    |
| 디지털 상품 다운로드 | 결제 완료자           | `payments.status = 'paid'` 확인 → R2 Presigned URL (`expires_at` 없음) |
| Admin                | role=admin            | Hono 미들웨어에서 role 확인                                            |

> **수강 만료 처리:** `enrollments.expires_at < NOW()` 인 경우 콘텐츠 접근을 차단하고, 재구매 안내 페이지로 리다이렉트합니다. Cron 또는 요청 시 `enrollments.status`를 `expired`로 업데이트합니다.

### 8.3. Signed URL 정책

- **R2 Presigned URL:** 유효기간 15분, 1회 다운로드 허용
- **Stream Signed Token:** 유효기간 6시간, IP 바인딩 없음 (모바일 IP 변동 고려)

---

## 9. 결제 흐름 (Toss Payments)

### 9.1. 결제 승인 흐름

```
수강생 브라우저                      Workers (Hono)                   Toss Payments
    │                                    │                               │
    ├─ POST /payment/prepare ───────────▶│                               │
    │  { course_id }                     │  1. orderId 생성 (UUID)       │
    │                                    │  2. payments 레코드 생성      │
    │                                    │     (status: pending)         │
    │◀── { orderId, amount,              │                               │
    │      clientKey } ─────────────────│                               │
    │                                    │                               │
    │  Toss Payments SDK v2 결제창 호출   │                               │
    │  tossPayments.requestPayment({     │                               │
    │    orderId, amount,                │                               │
    │    successUrl, failUrl             │                               │
    │  }) ──────────────────────────────────────────────────────────────▶│
    │                                    │                               │
    │◀── 결제 인증 성공                  │                               │
    │    successUrl?paymentKey=...       │                               │
    │    &orderId=...&amount=...         │                               │
    │                                    │                               │
    ├─ GET /payment/success ────────────▶│                               │
    │  ?paymentKey&orderId&amount        │                               │
    │                                    │── POST /v1/payments/confirm ──▶│
    │                                    │   { paymentKey, orderId,      │
    │                                    │     amount }                  │
    │                                    │   Authorization: Basic        │
    │                                    │   (secretKey base64)          │
    │                                    │◀── Payment 객체 반환 ─────────│
    │                                    │                               │
    │                                    │  승인 성공 시:                 │
    │                                    │  1. payments.status → 'paid'  │
    │                                    │  2. payments.payment_key 저장 │
    │                                    │  3. enrollments 레코드 생성   │
    │                                    │     (expires_at 계산)         │
    │                                    │                               │
    │◀── 수강 시작 페이지로 리다이렉트 ──│                               │
```

> **Important:** Toss Payments SDK v2에서는 `paymentKey`, `orderId`, `amount` 3가지 값을 successUrl 쿼리 파라미터로 전달합니다.
> 서버에서는 이 값으로 `/v1/payments/confirm` API를 **10분 이내에** 호출해야 결제가 최종 승인됩니다.

### 9.2. 환불 흐름 (Toss Payments 취소 API)

```
수강생 브라우저                      Workers (Hono)                   Toss Payments
    │                                    │                               │
    ├─ POST /my/refund ─────────────────▶│                               │
    │  { payment_id, reason }            │                               │
    │                                    │  1. 환불 자격 검증             │
    │                                    │     - 결제일로부터 7일 이내?   │
    │                                    │     - 수강 진도율 확인         │
    │                                    │  2. 환불 금액 산정             │
    │                                    │     (아래 환불 정책 참조)      │
    │                                    │                               │
    │                                    │── POST /v1/payments/{paymentKey}/cancel
    │                                    │   { cancelReason,             │
    │                                    │     cancelAmount (부분환불) } │
    │                                    │◀── 취소 결과 반환 ────────────│
    │                                    │                               │
    │                                    │  취소 성공 시:                 │
    │                                    │  1. payments.status 업데이트   │
    │                                    │  2. payments.refund_amount 갱신│
    │                                    │  3. enrollments.status →       │
    │                                    │     'revoked' (전액환불 시)    │
    │                                    │                               │
    │◀── { success, refund_amount } ─────│                               │
```

### 9.3. 환불 정책 (한국 이러닝 소비자보호 기준)

온라인 강의의 환불은 **전자상거래법** 및 **소비자분쟁해결기준**에 따라 다음과 같이 처리합니다.

#### 강의 (course) 환불

| 조건                            | 환불 금액               | 비고                                 |
| ------------------------------- | ----------------------- | ------------------------------------ |
| 결제 후 7일 이내 + 미수강       | **전액 환불**           | 전자상거래법 청약 철회 (무조건 보장) |
| 결제 후 7일 이내 + 진도율 ≤ 10% | **전액 환불**           | 실질적 미이용으로 간주               |
| 진도율 ≤ 25%                    | **결제금액 × 75%** 환불 |                                      |
| 진도율 ≤ 50%                    | **결제금액 × 50%** 환불 |                                      |
| 진도율 > 50%                    | **환불 불가**           | 과반 이상 이용으로 환불 제외         |
| 수강 기간 만료 후               | **환불 불가**           |                                      |

> **진도율 계산:** `(수강 완료한 세션 수 / 전체 세션 수) × 100`
>
> **처리 기한:** 환불 신청일로부터 **3영업일 이내** 처리

#### 디지털 상품 (download) 환불

| 조건                          | 환불 금액     | 비고                             |
| ----------------------------- | ------------- | -------------------------------- |
| 결제 후 7일 이내 + 미다운로드 | **전액 환불** | 전자상거래법 청약 철회           |
| 다운로드 완료 후              | **환불 불가** | 콘텐츠 특성상 복제 가능하여 제외 |

> **관리자 수동 환불:** Admin은 위 기준과 무관하게 `/admin/refund/:payment_id` API로 임의 금액 환불 가능.

---

## 10. 프론트엔드 (Minimal SSR)

Hono의 JSX/HTML 렌더링을 활용한 **서버 사이드 렌더링(SSR)** 방식으로, 별도의 프론트엔드 프레임워크(React 등) 없이 구현합니다.

### 10.1. 페이지 구성

| 페이지         | 경로                                      | 설명                        |
| -------------- | ----------------------------------------- | --------------------------- |
| 홈/랜딩        | `/`                                       | 강의 목록 카드, 히어로 배너 |
| 강의 상세      | `/courses/:slug`                          | 커리큘럼, 가격, 구매 버튼   |
| 수업 뷰어      | `/my/courses/:slug/sessions/:sessionSlug` | 영상 + Markdown 본문 + 첨부 |
| 상품 목록      | `/downloads`                              | 디지털 상품 카드 목록       |
| 상품 상세      | `/downloads/:slug`                        | 설명, 구매/다운로드 버튼    |
| 내 학습        | `/my/courses`                             | 수강 중인 강의 + 진행률     |
| Admin 대시보드 | `/admin/dashboard`                        | 매출 요약, 최근 가입자      |
| Admin 수강생   | `/admin/students`                         | 수강생 목록 + 검색          |
| Admin 결제     | `/admin/payments`                         | 결제 내역 테이블            |

### 10.2. 스타일링

- **CSS:** Vanilla CSS (또는 가벼운 classless CSS 프레임워크: Pico.css)
- **반응형:** Mobile-first
- **다크모드:** `prefers-color-scheme` 미디어쿼리 자동 대응

### 10.3. 클라이언트 JS (최소한)

별도의 번들러 없이, CDN 스크립트만 사용합니다.

```html
<!-- Markdown 렌더링 후처리 -->
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/katex@0.16/dist/katex.min.css">
<script defer src="https://cdn.jsdelivr.net/npm/katex@0.16/dist/katex.min.js"></script>
<script defer src="https://cdn.jsdelivr.net/npm/katex@0.16/dist/contrib/auto-render.min.js"></script>

<script src="https://cdn.jsdelivr.net/npm/mermaid@10/dist/mermaid.min.js"></script>

<link rel="stylesheet" href="https://cdn.jsdelivr.net/gh/highlightjs/cdn-release@11/build/styles/github-dark.min.css">
<script src="https://cdn.jsdelivr.net/gh/highlightjs/cdn-release@11/build/highlight.min.js"></script>

<script>
  // 페이지 로드 후 자동 렌더링
  document.addEventListener('DOMContentLoaded', () => {
    renderMathInElement(document.body);
    mermaid.initialize({ startOnLoad: true, theme: 'dark' });
    hljs.highlightAll();
  });
</script>
```

---

## 11. 디렉토리 구조 (프로젝트)

```
lms/
├── app/                          ← Hono Workers 앱
│   ├── src/
│   │   ├── index.ts              ← Hono 앱 진입점
│   │   ├── types.ts              ← 전역 타입 정의
│   │   ├── middleware/           ← 관심사별 미들웨어
│   │   │   ├── auth.ts           ← JWT 검증
│   │   │   └── admin.ts          ← 관리자 권한 확인
│   │   ├── lib/                  ← 공통 라이브러리 및 외부 연동
│   │   │   ├── d1.ts             ← D1 쿼리 헬퍼
│   │   │   ├── r2.ts             ← R2 presigned URL 생성
│   │   │   ├── stream.ts         ← Stream signed token 생성
│   │   │   ├── toss.ts           ← Toss API 클라이언트
│   │   │   └── markdown.ts       ← MD → HTML 변환 (markdown-it)
│   │   ├── routes/               ← 서비스별 비즈니스 로직(Controller)
│   │   │   ├── public.ts         ← 강의/상품 목록, 상세
│   │   │   ├── auth.ts           ← Google OAuth
│   │   │   ├── student.ts        ← 내 강의, 수강, 다운로드
│   │   │   ├── payment.ts        ← 결제 준비/확인/웹훅
│   │   │   └── admin.ts          ← 관리자 대시보드 API
│   │   └── views/                ← JSX 기반 SSR 최상위 디렉토리
│   │       ├── layout.tsx        ← 공통 HTML 레이아웃
│   │       ├── components/       ← 재사용 가능한 UI 조각 (Navbar, Footer 등)
│   │       ├── pages/            ← 개별 서비스 메인 페이지
│   │       │   ├── Home.tsx
│   │       │   ├── CourseDetail.tsx
│   │       │   ├── SessionViewer.tsx
│   │       │   ├── DownloadDetail.tsx
│   │       │   └── MyCourses.tsx
│   │       └── admin/            ← 관리자 전용 뷰/대시보드
│   │           ├── Dashboard.tsx
│   │           ├── Students.tsx
│   │           └── Payments.tsx
│   ├── wrangler.toml             ← D1, R2, Stream 바인딩
│   ├── package.json
│   └── tsconfig.json
│
├── schema/
│   └── 0000_init.sql             ← D1 초기 마이그레이션
│
├── sync/                         ← 로컬 싱크 스크립트
│   ├── sync.py                   ← 메인 동기화 로직
│   └── requirements.txt
│
└── temp/                       ← 나를 위한 개발용 문서
```

---

## 12. 개발 로드맵

### Phase 1: Foundation (완료 ✅)

- **Hono 프로젝트 스캐폴딩 + Wrangler 설정** (완료)
- **D1 스키마 작성 + 초기 데이터베이스 구축** (완료)
- **핵심 Public API 및 SSR 뷰 레이아웃** (완료 - 홈, 강의 목록, 상세)
- **Google OAuth 인증 구현 (JWT 발급)** (완료)

### Phase 2: Core Infrastructure (완료 ✅)

- **Toss Payments 결제 연동** (완료 ✅ - 테스트 모드/confirm API 연동)
- **수강 등록 및 권한 부여** (완료 ✅ - enrollments DB 연동)
- **학습 진행률 추적 및 DB 연동** (완료 ✅ - setProgress API 연동)
- **아키텍처 선진화** (완료 ✅ - 미들웨어 분리, 뷰-라우트 관심사 분리 완료)
- **라이브러리 모듈화** (완료 ✅ - d1, r2, stream, markdown 공통 lib 분리 완료)

### Phase 3: Content & Integration (완료 ✅)

- **고도화된 로컬 Sync 스크립트** (완료 ✅ - Frontmatter 파싱, keywords 싱크, 에셋(favicon 포함) 자동 업로드)
- **수업 뷰어 고도화** (완료 ✅ - Markdown 복사 버튼, KaTeX 수식 렌더링, 테트리스 입력 간섭 해결)
- **모바일 반응형 + 다크모드 대응** (완료 ✅ - 전역 layout.tsx 및 개별 뷰 최적화)
- **SEO 최적화** (완료 ✅ - 메타 태그, OG, Keywords DB 연동 완료)
- **Cloudflare Stream/R2 통합 및 Signed URL 접근 제어** (완료 ✅ - lib 구성 및 assets 라우트 연동 완료)
- **디지털 상품(Downloads) R2 다운로드 연동** (완료 ✅ - Detail 뷰 및 결제 연동 완료)

### Phase 4: Polish & Security (진행 중 🚧)

- **Admin 대시보드 UI 고도화** (완료 ✅ - 통합 지표 및 콘텐츠 관리 대시보드 구현)
- **OAuth 로그인 경로 유지** (완료 ✅ - 로그인 후 이전 페이지 자동 복귀 로직 구현)
- **파일 정적 서빙 최적화** (완료 ✅ - /assets 전용 라우트 및 R2 스트리밍 연동)
- **환불 API 및 관리자 취소 기능** (미구현)
- **성능 최적화 및 캐싱 전략** (미구현 - Cloudflare KV/Cache API)
- **불법 다운로드 방지용 프론트엔드 보호 스크립트** (미구현 - 우클릭/F12 차단)

---

*최종 업데이트: 2026-03-23*
