# 🚀 Mini-LMS: Zero Infras. High Edge Efficiency.

**Mini-LMS**는 로컬 PC(N100 등)에서 콘텐츠를 관리하고, Cloudflare Edge(Workers)에서 서비스를 구동하여 운영 비용과 트래픽 비용을 극소화한 1인 강사용 경량 학습 플랫폼입니다.

---

## ✨ Key Features

-   **Local-First Sync**: 로컬 마크다운(MD) 파일과 정적 에셋을 간단하게 동기화하여 콘텐츠 관리.
-   **Zero Infrastructure**: 전용 서버 없이 Cloudflare Workers, D1, R2만으로 구동.
-   **Advanced Video Experience**: Cloudflare Stream을 통한 쾌적하고 보안이 강화된 비디오 호스팅.
-   **Toss Payments Integrated**: 한국 수강생을 위한 토스페이먼츠 연동 및 수강권 자동 부여.
-   **SEO Optimized**: 동적 메타 태그, Open Graph 지원 및 파비콘 자동 연동.
-   **Learning Progress Tracking**: 수강생별 학습 진행률(Progress) 자동 추적 및 DB 연동.
-   **Rich Content Experience**: KaTeX 수식 렌더링, 코드 복사, 반응형/다크모드 완벽 대응.

---

## 🛠 Tech Stack

-   **Frontend & Backend**: [Hono](https://hono.dev/) (RPC-like architecture with JSX/TSX)
-   **Storage**: [Cloudflare D1](https://developers.cloudflare.com/d1/) (Database) & [R2](https://developers.cloudflare.com/r2/) (Assets Storage)
-   **Video Hosting**: [Cloudflare Stream](https://www.cloudflare.com/products/cloudflare-stream/) (Secure Video Delivery)
-   **Authentication**: Google OAuth 2.0 & JWT Cookies
-   **Styling**: Vanilla CSS (Custom Design System with Design Tokens)
-   **Sync Utility**: Python (YAML Frontmatter parsing & R2 Asset uploading)

---

## 🚀 Getting Started

### 1. Prerequisites
- [Wrangler CLI](https://developers.cloudflare.com/workers/wrangler/install-upgrading/) 설치
- Cloudflare 계정 및 D1/R2 버킷 생성

### 2. Environment Setup
루트 디렉토리에 다음 두 파일을 생성하고 본인의 환경에 맞춰 설정합니다.

#### `.env.app` (Workers 백엔드 설정)
- `GOOGLE_CLIENT_ID`: Google Cloud Console에서 발급받은 OAuth 클라이언트 ID
- `GOOGLE_CLIENT_SECRET`: Google OAuth 클라이언트 보안 비밀번호
- `JWT_SECRET`: 세션 암호화에 사용할 랜덤 문자열
- `TOSS_SECRET_KEY`: 토스페이먼츠 내 상점 관리에서 발급받은 시크릿 키 (테스트용 가능)
- `STREAM_JWK_KEY`: Cloudflare Stream의 Signed URL 생성을 위한 JWK 키 (비공개 영상 보안용)

#### `.env.sync` (로컬 동기화 스크립트 설정)
- `WORKERS_API_BASE`: Workers가 실행 중인 주소 (로컬 개발 시 `http://localhost:8787`)
- `CONTENT_DIR`: 마크다운 콘텐츠가 위치한 경로 (기본값: `../content`)
- `ADMIN_JWT_TOKEN`: 관리자 권한이 포함된 유효한 JWT 토큰 (Sync API 인증용)
- `D1_DATABASE_ID`: Cloudflare D1 데이터베이스 ID (Wrangler 설정용)
- `R2_BUCKET_NAME`: 서빙에 사용할 R2 버킷 이름

### 3. Running Locally
```bash
cd app
npm install
npm run dev
```

### 4. Syncing Content
로컬의 `content/` 폴더 내 마크다운 파일을 서버로 업로드합니다.
```bash
cd sync
./.venv/bin/python3 sync.py
```

---

## 📂 Project Structure

-   `/app`: Cloudflare Workers 서비스 소스 코드 (Hono 기반)
-   `/content`: 강좌 및 디지털 상품 마크다운/에셋 저장소
-   `/schema`: 데이터베이스 스키마 및 마이그레이션 SQL
-   `/sync`: 로컬 콘텐츠와 클라우드를 연결하는 동기화 스크립트

---

## ⚖️ License
MIT License. Created by [gitsam].
