# Outcruit Web Application

This repository powers the Outcruit recruitment workflow app. It runs on Next.js (App Router) and stores data in Neon (Postgres).

## Neon DB Schema (Single Source of Truth)

- Consolidated schema lives in `migrations/neon_schema.sql`.
- It contains table definitions, indexes, triggers, and Row Level Security (RLS) policies.
- Older SQL files in `migrations/` are deprecated; use only `neon_schema.sql`.

### Apply Schema

- Make sure `DATABASE_URL` is set for Neon in your environment
- Apply the schema using any Postgres client. For example with `psql`:

```bash
psql "$DATABASE_URL" -f migrations/neon_schema.sql
```

### RLS and Session Claims

- The app sets session claims so RLS policies can identify the current user:
  - `request.jwt.claim.sub` → authenticated user id
  - `request.jwt.claim.role` → user role (`user` or `admin`)
- This is done per-connection in code and enforced by policies in the schema.

## Migration from Supabase to Neon

- Storage moved from Supabase to Neon (managed Postgres).
- RLS policies are implemented using `current_setting('request.jwt.claim.*', true)` and app-level session claim setting.
- No Supabase-specific functions are required; the schema is portable Postgres.
- SSL is enabled in the app’s DB client for Neon.

## Environment Variables

- Database: `DATABASE_URL`
- Auth/JWT: `JWT_SECRET`
- Gmail (Service Account fallback):
  - `GMAIL_SERVICE_ACCOUNT_KEY` → path to JSON key file
  - `GMAIL_SENDER_EMAIL` → organization sender address
- Gmail (User OAuth):
  - `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `GOOGLE_REDIRECT_URI`
- Webhooks (examples used in forms):
  - `NEXT_PUBLIC_CREATE_JOB_ADS_WEBHOOK`
  - `NEXT_PUBLIC_JD_TRACKER_WEBHOOK`

## Gmail Sending Options

- Organization sender (Service Account): already implemented
- Individual user Gmail via OAuth: implemented as a fallback when the organization domain is down

### How It Works

- Settings/Profile → Connect Gmail button starts Google OAuth
- Tokens are stored in `public.user_google_tokens`
- Email sending prefers a connected user token; falls back to the organization service account

## Build and Run

```bash
npm install
npm run build
npm start
```

- If you need to lint locally, install eslint and run `npm run lint`.

## Key Files

- Schema: `migrations/neon_schema.sql`
- DB client: `lib/db.ts`
- Email sender + fallback: `lib/email-service.ts`
- Google OAuth helpers: `lib/google-oauth.ts`
- OAuth routes: `app/api/auth/google/url/route.ts`, `app/api/auth/google/callback/route.ts`
- Candidates communications API: `app/api/candidates/communicate/route.ts`
- History page bulk actions and previews: `app/history/page.tsx`

## Notes

- Older migration SQL files are left in the repo for reference but are deprecated. Always use `migrations/neon_schema.sql` as the single source of truth for your Neon database.
- Do not run sample insert statements unless you’re setting up a local test; the consolidated schema avoids destructive operations by default.