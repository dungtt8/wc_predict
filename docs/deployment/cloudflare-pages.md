# Hướng dẫn deploy lên Cloudflare Pages + Supabase

Tài liệu này mô tả cách đưa project `wc_predict` lên môi trường chạy thật với:

- **Frontend:** Cloudflare Pages
- **Database / Realtime / Edge Functions:** Supabase
- **Nguồn lịch thi đấu / kết quả:** API-Football

> Hiện project đang ở mức **MVP skeleton**, nên tài liệu này tập trung vào luồng deploy đúng nền tảng và các cấu hình cần có để tiếp tục hoàn thiện.

## 1. Kiến trúc deploy

### 1.1 Thành phần chính

1. **Cloudflare Pages**
   - Host ứng dụng React + Vite
   - Build từ source code của repo
   - Đọc biến môi trường frontend qua `VITE_*`

2. **Supabase**
   - Lưu dữ liệu room, user trong room, fixtures, predictions, rankings
   - Cấp Realtime subscription cho leaderboard
   - Chạy Edge Functions để:
     - đồng bộ fixtures / results từ API-Football
     - tính / cập nhật bảng xếp hạng room

3. **API-Football**
   - Chỉ được gọi ở phía server / Edge Function
   - Không gọi trực tiếp từ trình duyệt

### 1.2 Kiến trúc GitHub Actions

GitHub Actions hỗ trợ deployment với 2 workflow chính:

#### a) **frontend-check.yml**
   - **Mục đích:** Kiểm tra build frontend trước khi merge vào `main`
   - **Trigger:** Pull Request vào branch `main`
   - **Công việc:** 
     - Cài dependencies
     - Chạy build Vite
     - Kiểm tra lỗi TypeScript / linting

#### b) **supabase-deploy.yml**
   - **Mục đích:** Deploy Supabase migrations và Edge Functions lên production
   - **Trigger:** Push vào `main` khi thư mục `supabase/**` có thay đổi
   - **Công việc:**
     - Xác thực với Supabase qua `SUPABASE_ACCESS_TOKEN`
     - Apply migrations từ `supabase/migrations/`
     - Deploy Edge Functions

#### c) **Cloudflare Pages Auto-Build**
   - Khi commit được merge vào branch `main`, Cloudflare Pages **tự động** phát hiện và rebuild frontend
   - Không cần trigger thêm workflow riêng

## 2. Điều kiện cần trước khi deploy

Bạn cần chuẩn bị:

- 1 tài khoản **Cloudflare**
- 1 project **Supabase**
- 1 API key từ **API-Football**
- Repo source code đã push lên GitHub / Git provider mà Cloudflare Pages hỗ trợ

## 3. Biến môi trường sử dụng trong project

Theo `.env.example`, project đang dùng các biến sau:

### 3.1 Biến cho frontend

Các biến này được dùng trong app React và phải cấu hình trên Cloudflare Pages:

- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`

### 3.2 Biến cho backend / Edge Functions

Các biến này dùng cho Supabase Edge Functions:

- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`
- `API_FOOTBALL_KEY`

### 3.3 GitHub Secrets (cho GitHub Actions)

Để GitHub Actions có thể chạy frontend-check và deploy Supabase, bạn cần thiết lập các secret sau trong GitHub repository:

| Secret | Mục đích |
|--------|---------|
| `VITE_SUPABASE_URL` | URL Supabase (dùng trong frontend build) |
| `VITE_SUPABASE_ANON_KEY` | Public key Supabase (dùng trong frontend build) |
| `SUPABASE_ACCESS_TOKEN` | Token để xác thực với Supabase CLI (cho deployment) |
| `SUPABASE_PROJECT_REF` | Project reference ID của Supabase |
| `SUPABASE_DB_PASSWORD` | Mật khẩu database Supabase (cho migrations) |
| `SUPABASE_URL` | URL Supabase (dùng trong Edge Functions / deployment) |
| `SUPABASE_SERVICE_ROLE_KEY` | Service role key Supabase (dùng trong Edge Functions) |
| `API_FOOTBALL_KEY` | API key từ API-Football |

Để cấu hình, truy cập **Repository Settings > Secrets and variables > Actions > New repository secret** và thêm từng secret.

## 4. Chuẩn bị Supabase

### 4.1 Tạo project

Tạo một project mới trên Supabase và lấy các thông tin:

- **Project URL**
- **anon public key**
- **service role key**

### 4.2 Apply database migrations

Trong repo hiện có các migration tại:

```text
supabase/migrations/
```

Các migration hiện tại gồm:

- `2026061701_init_schema.sql` - tạo schema chính
- `2026061702_rls.sql` - bật Row Level Security
- `2026061703_functions.sql` - function chấm điểm, khóa dự đoán, cập nhật ranking

Bạn cần apply các migration này lên project Supabase.

Nếu dùng Supabase CLI, luồng cơ bản sẽ là:

```bash
supabase login
supabase link --project-ref <your-project-ref>
supabase db push
```

> Nếu chưa dùng Supabase CLI trong máy local, cần cài trước theo hướng dẫn chính thức của Supabase.

### 4.3 Seed dữ liệu mẫu (tuỳ chọn)

Repo có file:

```text
supabase/seed.sql
```

File này hữu ích khi bạn muốn có dữ liệu demo ban đầu để kiểm tra nhanh UI / dashboard.

### 4.4 Deploy Edge Functions

Các function hiện có:

```text
supabase/functions/sync-fixtures/
supabase/functions/recompute-room-rankings/
```

Triển khai bằng Supabase CLI:

```bash
supabase functions deploy sync-fixtures
supabase functions deploy recompute-room-rankings
```

### 4.5 Cấu hình secrets cho Edge Functions

Thiết lập các secret sau trong Supabase:

```bash
supabase secrets set SUPABASE_URL=<your-supabase-url>
supabase secrets set SUPABASE_SERVICE_ROLE_KEY=<your-service-role-key>
supabase secrets set API_FOOTBALL_KEY=<your-api-football-key>
```

## 5. Deploy frontend lên Cloudflare Pages

### 5.1 Tạo project Pages

Trong Cloudflare Pages:

1. Chọn **Create application**
2. Chọn **Pages**
3. Kết nối repo git chứa project này
4. Chọn branch cần deploy

### 5.2 Build settings

Dùng cấu hình:

- **Framework preset:** `Vite`
- **Build command:** `npm run build`
- **Build output directory:** `dist`

### 5.3 Thiết lập environment variables trên Cloudflare Pages

Thiết lập ít nhất:

- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`

Ví dụ:

```text
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

> Không đưa `SUPABASE_SERVICE_ROLE_KEY` hay `API_FOOTBALL_KEY` lên Cloudflare Pages frontend environment vì đây là secret phía server.

## 6. Lịch chạy jobs / đồng bộ dữ liệu

Để app hoạt động đúng với World Cup 2026, bạn cần có lịch chạy định kỳ cho các function sau:

### 6.1 `sync-fixtures`

Mục đích:

- lấy lịch thi đấu
- cập nhật trạng thái trận
- cập nhật kết quả trận

Gợi ý lịch chạy:

- ngoài thời gian thi đấu: mỗi 30-60 phút
- trong ngày có trận: mỗi 5-10 phút

### 6.2 `recompute-room-rankings`

Mục đích:

- tính lại điểm
- cập nhật leaderboard room

Gợi ý lịch chạy:

- sau mỗi lần `sync-fixtures` hoàn tất
- hoặc chạy định kỳ mỗi 5-10 phút trong ngày thi đấu

> Nếu về sau bạn bổ sung trigger/realtime pipeline chặt hơn, tần suất job có thể giảm xuống.

## 7. Checklist deploy đề xuất

### Bước 1 - Chuẩn bị local

```bash
npm install
npm run build
```

### Bước 2 - Tạo / cấu hình Supabase

1. Tạo project Supabase
2. Apply migrations
3. Seed dữ liệu nếu cần
4. Deploy Edge Functions
5. Set secrets cho Edge Functions

### Bước 3 - Tạo Cloudflare Pages project

1. Kết nối repo
2. Chọn Vite preset
3. Cấu hình build command / output
4. Set `VITE_SUPABASE_URL` và `VITE_SUPABASE_ANON_KEY`

### Bước 4 - Deploy lần đầu

1. Trigger build trên Cloudflare Pages
2. Mở URL preview / production
3. Kiểm tra UI room entry
4. Kiểm tra dashboard

### Bước 5 - Cấu hình GitHub Secrets

1. Truy cập **Repository Settings > Secrets and variables > Actions**
2. Thêm tất cả các secret theo bảng ở mục 3.3
3. Kiểm tra GitHub Actions workflow files (`.github/workflows/`) đã có sẵn

## 7.1 Luồng Deploy vào Production (Merge-to-Deploy)

Khi muốn deploy code mới lên production, hãy làm theo luồng sau:

**Bước 1: Tạo Pull Request vào `main`**
   - Push branch feature vào GitHub
   - Tạo PR từ feature branch vào `main`
   - Thêm mô tả PR (ghi rõ những thay đổi, đặc biệt nếu có changes trong `supabase/**`)

**Bước 2: GitHub Actions chạy kiểm tra Frontend**
   - Workflow `frontend-check.yml` trigger tự động
   - Kiểm tra build Vite thành công
   - Kiểm tra TypeScript / linting
   - Nếu fail, sửa code và push lại

**Bước 3: Code Review & Approval**
   - Team member review PR
   - Approve khi code tốt

**Bước 4: Merge vào `main`**
   - Squash or merge PR vào `main`
   - Commit được push lên remote

**Bước 5: Supabase Deployment (nếu có thay đổi)**
   - Workflow `supabase-deploy.yml` trigger nếu thư mục `supabase/**` có thay đổi
   - Tự động apply migrations
   - Tự động deploy Edge Functions
   - Cập nhật secrets trên Supabase

**Bước 6: Cloudflare Pages Auto-Build**
   - Cloudflare Pages phát hiện commit mới trên branch `main`
   - Tự động trigger build frontend
   - Build frontend phiên bản mới được deploy lên production URL

**Bước 7: Xác nhận Deploy**
   - Kiểm tra URL Cloudflare Pages, verify frontend mới
   - Kiểm tra console browser, xác nhận không có lỗi kết nối
   - Nếu Supabase có thay đổi, kiểm tra data / Edge Functions

### Sơ đồ luồng:

```
Feature Branch
     ↓
   [Push to GitHub]
     ↓
  [Create PR to main]
     ↓
  frontend-check.yml [GitHub Actions]
     ↓ (if pass)
  [Approve & Merge to main]
     ↓
  supabase-deploy.yml (if supabase/** changed) [GitHub Actions]
     ↓ (parallel/after)
  Cloudflare Pages Auto-Build [Cloudflare]
     ↓
  ✅ Production Deployed
```

## 8. Hậu kiểm sau deploy

Sau khi deploy xong, nên kiểm tra theo thứ tự:

### 8.1 Frontend

- Trang chủ mở được
- Form tạo room / join room hiển thị đúng
- Dashboard render được

### 8.2 Kết nối Supabase

- Frontend không lỗi thiếu `VITE_SUPABASE_URL`
- Frontend không lỗi thiếu `VITE_SUPABASE_ANON_KEY`
- Subscription Realtime cho leaderboard kết nối được

### 8.3 Dữ liệu trận đấu

- `sync-fixtures` gọi được API-Football
- Dữ liệu teams / fixtures được insert hoặc update
- Nếu trận đã có kết quả, `fixture_results` được cập nhật

### 8.4 Nghiệp vụ dự đoán

- Có thể lưu dự đoán cho trận chưa kickoff
- Dự đoán bị chặn sau kickoff theo thời gian DB
- `recompute-room-rankings` cập nhật được `room_rankings_snapshot`

## 9. Lưu ý bảo mật

- Không commit file `.env` thật vào repo
- Không để lộ `SUPABASE_SERVICE_ROLE_KEY` ở frontend
- Không gọi API-Football trực tiếp từ client
- Chỉ dùng `service role key` trong trusted backend / Edge Functions

## 10. Các giới hạn hiện tại của project

Ở trạng thái hiện tại, project vẫn còn một số điểm cần hoàn thiện thêm trước khi production-ready:

1. Dashboard đang còn dùng một phần **demo data** để render fixtures / rankings ban đầu
2. Luồng tạo room / join room hiện mới là skeleton UI, chưa nối đầy đủ vào Supabase tables
3. Chưa có tài liệu vận hành cron/scheduler cụ thể theo hạ tầng bạn chọn
4. Chưa có quy trình rollback / monitoring / alerting

## 11. Gợi ý bước tiếp theo

Nếu tiếp tục hoàn thiện deployment, nên làm theo thứ tự:

1. Nối thật luồng create room / join room với Supabase
2. Nối dashboard đọc fixtures / rankings từ DB thật
3. Hoàn thiện pipeline chấm điểm khi có kết quả trận
4. Bổ sung cron/scheduler cụ thể cho Edge Functions
5. Thêm monitoring cơ bản cho sync jobs
