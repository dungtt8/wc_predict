# WC Predict

Web app dự đoán tỷ số World Cup 2026 theo room, xây bằng React + Vite, dùng Supabase cho dữ liệu/realtime và hướng tới deploy trên Cloudflare Pages.

## Tính năng MVP

- Tạo room / join room bằng nickname + mã room
- Dự đoán tỷ số từng trận trước giờ kickoff
- Chấm điểm:
  - Đúng tỷ số: `3 điểm`
  - Đúng thắng / hòa / thua: `1 điểm`
  - Sai hoàn toàn: `0 điểm`
- Bảng xếp hạng theo room
- Đồng bộ lịch đấu / kết quả từ API-Football qua Supabase Edge Functions

## Tech stack

- React 18
- Vite
- TypeScript
- Supabase (`Postgres`, `Realtime`, `Edge Functions`)
- Cloudflare Pages

## Chạy local

```bash
npm install
npm run dev
```

App dev mặc định chạy qua Vite.

## Environment variables

Tạo file `.env` từ `.env.example`:

```bash
cp .env.example .env
```

Biến môi trường cần có:

- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`
- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`
- `API_FOOTBALL_KEY`

## Build

```bash
npm run build
```

## Cấu trúc chính

```text
src/
  components/
  lib/
  pages/
supabase/
  config.toml
  migrations/
  functions/
docs/
  deployment/
```

## Supabase

Các file đã có sẵn:

- `supabase/migrations/` - schema, RLS, functions
- `supabase/functions/sync-fixtures/` - đồng bộ lịch/kết quả
- `supabase/functions/recompute-room-rankings/` - cập nhật leaderboard
- `supabase/seed.sql` - dữ liệu seed tối thiểu

## Deploy

Xem thêm:

- `docs/deployment/cloudflare-pages.md`

## CI/CD

- `frontend-check.yml`: build-check frontend khi mở PR hoặc push vào `main`
- `supabase-deploy.yml`: deploy Supabase production khi `supabase/**` thay đổi trên `main`
- Cloudflare Pages vẫn tự build frontend từ repo, không deploy frontend bằng GitHub Actions

## Trạng thái hiện tại

Project hiện đang ở mức **MVP skeleton**:

- UI room entry + dashboard cơ bản đã có
- Supabase schema / migration / edge functions đã được dựng khung
- Một số dữ liệu trên dashboard vẫn đang dùng demo data để nối dần với backend thực
# wc_predict
