CREATE TABLE IF NOT EXISTS public.user_google_tokens (
  user_id TEXT PRIMARY KEY,
  user_email TEXT UNIQUE,
  provider TEXT DEFAULT 'google',
  access_token TEXT,
  refresh_token TEXT,
  scope TEXT,
  expiry_date TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);