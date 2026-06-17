# GitHub Actions Deployment Design

## 1. Objective
Thiết kế quy trình deploy production cho project `wc_predict` bằng GitHub Actions theo hướng tách riêng frontend và Supabase, trong đó Cloudflare Pages vẫn tự build từ repo còn GitHub Actions chịu trách nhiệm deploy hạ tầng Supabase.

## 2. Scope
- Dùng `main` làm branch production duy nhất.
- Tạo 2 workflow GitHub Actions riêng:
  - `supabase-deploy.yml`
  - `frontend-check.yml`
- `supabase-deploy.yml` deploy migrations + Edge Functions lên Supabase production.
- `frontend-check.yml` chỉ build-check frontend, không deploy frontend trực tiếp.
- Cloudflare Pages tiếp tục kết nối repo và tự build khi `main` có thay đổi.
- Cập nhật tài liệu deploy để phản ánh luồng CI/CD mới.

## 3. Out of Scope
- Multi-environment deployment (staging, preview, dev).
- Deploy frontend bằng Wrangler CLI hoặc Cloudflare API từ GitHub Actions.
- Tự động rollback production.
- Secret rotation automation.

## 4. Architecture
### 4.1 Frontend
- Cloudflare Pages là hệ thống deploy frontend chính thức.
- GitHub Actions không publish artifact frontend lên Cloudflare.
- Cloudflare Pages theo dõi branch `main` và tự chạy build `npm run build`.

### 4.2 Backend / Data
- Supabase là production backend cho database, realtime, và Edge Functions.
- GitHub Actions deploy Supabase khi có thay đổi liên quan thư mục `supabase/**`.

### 4.3 CI/CD Responsibility Split
- **Cloudflare Pages:** build + deploy frontend production.
- **GitHub Actions:** validate frontend build và deploy tài nguyên Supabase.
- **GitHub Secrets / Supabase Secrets / Cloudflare env vars:** lưu toàn bộ credential nhạy cảm.

## 5. Workflow Design
### 5.1 `frontend-check.yml`
Mục đích:
- Kiểm tra frontend còn build được sau mỗi thay đổi liên quan UI/app config.

Trigger:
- `push` vào `main`
- `pull_request` nhắm vào `main`

Paths:
- `src/**`
- `package.json`
- `package-lock.json`
- `vite.config.ts`
- `index.html`

Các bước chính:
1. Checkout source
2. Setup Node.js
3. `npm ci`
4. `npm run build`

Kết quả mong muốn:
- Nếu build fail thì chặn merge/nhận diện lỗi sớm.
- Nếu build pass thì Cloudflare Pages có thể tự build production an toàn hơn sau merge.

### 5.2 `supabase-deploy.yml`
Mục đích:
- Deploy production schema và Edge Functions cho Supabase.

Trigger:
- `push` vào `main`

Paths:
- `supabase/**`

Các bước chính:
1. Checkout source
2. Setup Supabase CLI
3. Authenticate bằng `SUPABASE_ACCESS_TOKEN`
4. Link tới production project bằng `SUPABASE_PROJECT_REF`
5. Apply migrations bằng `supabase db push`
6. Deploy Edge Functions:
   - `sync-fixtures`
   - `recompute-room-rankings`
7. Set secrets cần cho functions:
   - `SUPABASE_URL`
   - `SUPABASE_SERVICE_ROLE_KEY`
   - `API_FOOTBALL_KEY`

Kết quả mong muốn:
- Production Supabase luôn đồng bộ với code trong `main`.

## 6. Secret and Configuration Model
### 6.1 GitHub Secrets
Workflow Supabase cần:
- `SUPABASE_ACCESS_TOKEN`
- `SUPABASE_PROJECT_REF`
- `SUPABASE_DB_PASSWORD` (nếu CLI flow yêu cầu)
- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`
- `API_FOOTBALL_KEY`

### 6.2 Cloudflare Pages Environment Variables
Frontend production cần:
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`

### 6.3 Rules
- Không commit bất kỳ `.env` thật nào vào repo.
- Không đưa `SUPABASE_SERVICE_ROLE_KEY` sang môi trường frontend.
- Không để API-Football key xuất hiện ở browser bundle.

## 7. Operational Safety
- Dùng `paths` filter để tránh deploy thừa.
- Workflow frontend chỉ build-check, không đụng production infra.
- Workflow Supabase chỉ chạy khi thay đổi backend infra.
- Nếu migration fail thì workflow fail ngay, không tiếp tục deploy functions.
- Nếu deploy function fail thì giữ nguyên frontend deploy flow độc lập.

## 8. Repo Changes Required
- Tạo `.github/workflows/frontend-check.yml`
- Tạo `.github/workflows/supabase-deploy.yml`
- Cập nhật `docs/deployment/cloudflare-pages.md`
- Cập nhật `README.md` để chỉ tới tài liệu deploy mới

## 9. Success Criteria
- Merge vào `main` sẽ:
  - tự kích hoạt frontend build-check trong GitHub Actions
  - khiến Cloudflare Pages tự build/deploy frontend production
  - tự deploy Supabase migrations và Edge Functions nếu có thay đổi trong `supabase/**`
- Tất cả credential production được quản lý qua GitHub Secrets, Supabase Secrets, và Cloudflare env vars.
