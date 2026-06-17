# Cloudflare Pages Deployment

## 1. Prerequisites
- Cloudflare account
- Supabase project
- API-Football key

## 2. Build settings
- Framework preset: `Vite`
- Build command: `npm run build`
- Build output directory: `dist`

## 3. Environment variables (Cloudflare Pages)
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`

## 4. Supabase secrets (Edge Functions)
- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`
- `API_FOOTBALL_KEY`

## 5. Database rollout
1. Apply migration files in `supabase/migrations/`.
2. Seed local/demo data using `supabase/seed.sql` when needed.
3. Configure schedule for `sync-fixtures` and `recompute-room-rankings`.

## 6. Post-deploy checks
- Room create/join page loads.
- Predictions are blocked after kickoff.
- Leaderboard updates when ranking snapshot rows change.
