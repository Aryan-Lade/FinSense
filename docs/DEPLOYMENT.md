# FinSense Deployment Guide (DEPLOYMENT.md)

## 1. Architecture Overview
- **Frontend:** Vercel / Netlify / Static CDN (React 19 + Vite 8)
- **Backend:** Render / Railway / Fly.io / AWS EC2 (Python 3.11+ FastAPI)
- **Database & Storage:** Supabase Cloud (PostgreSQL + S3-compatible private buckets)

## 2. Frontend Deployment (Vercel)
1. Link GitHub repository to Vercel.
2. Root Directory: `frontend`
3. Build Command: `npm run build`
4. Output Directory: `dist`
5. Environment Variables:
   - `VITE_API_URL`: Backend URL (e.g. `https://api.finsense.example.com/api` or leave blank for browser-native mode)
   - `VITE_SUPABASE_URL`: Supabase project URL
   - `VITE_SUPABASE_ANON_KEY`: Supabase anon key
   - `VITE_SUPABASE_BUCKET`: `invoices`

## 3. Backend Deployment (Render / Docker)
1. Create a Web Service from the `backend/` directory.
2. Runtime: Python 3.11 or Docker.
3. Start Command: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
4. Environment Variables:
   - `DATABASE_URL`: Supabase Postgres connection string (`sslmode=require`)
   - `STORAGE_BACKEND`: `supabase`
   - `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `SUPABASE_BUCKET`
   - `DEMO_MODE`: `false` in production, `true` for judging demo
   - `TIMEZONE`: `Asia/Kolkata`
   - `CRON_SECRET`: Secret token for reminder execution
   - `OWNER_ACCESS_KEY`: Single-owner gate protection key

## 4. Scheduled Reminders on Free Tiers
Free server tiers sleep after inactivity. To guarantee continuous payment reminders:
- Set up a free external cron job (e.g., cron-job.org or GitHub Actions) triggering:
  `POST https://your-backend.com/api/internal/reminders/run` with header `X-Cron-Secret: <CRON_SECRET>` every 10 minutes.
