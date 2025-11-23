-- ============================================
-- Outcruit Neon DB Consolidated Schema
-- One source of truth for all tables, policies, and indexes
-- ============================================

-- Extensions required
-- Provides gen_random_uuid() and crypt() for bcrypt
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- ============================================
-- Users
-- Core account table with profile fields and preferences
-- ============================================
CREATE TABLE IF NOT EXISTS public.users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  name TEXT,
  avatar_url TEXT,
  organization TEXT,
  phone TEXT,
  role TEXT NOT NULL DEFAULT 'user' CHECK (role IN ('user','admin')),
  preferences JSONB DEFAULT '{"notifications": {"job_ads": true, "talent_sorting": true, "jd_tracker": true, "email_notifications": true}, "appearance": {"theme": "system", "density": "comfortable"}}'::jsonb,
  last_login TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Keep updated_at fresh on any change
CREATE OR REPLACE FUNCTION public.touch_users_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at := NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trig_users_updated_at ON public.users;
CREATE TRIGGER trig_users_updated_at
BEFORE UPDATE ON public.users
FOR EACH ROW
EXECUTE FUNCTION public.touch_users_updated_at();

-- Helpful indexes
CREATE INDEX IF NOT EXISTS idx_users_email ON public.users(email);
CREATE INDEX IF NOT EXISTS idx_users_last_login ON public.users(last_login DESC);

-- ============================================
-- Notifications
-- In-app notifications per user
-- ============================================
CREATE TABLE IF NOT EXISTS public.notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  type TEXT,
  message TEXT NOT NULL,
  read BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON public.notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_read ON public.notifications(read);

-- ============================================
-- Files
-- Binary files stored for previews and downloads
-- ============================================
CREATE TABLE IF NOT EXISTS public.files (
  id TEXT PRIMARY KEY,
  data BYTEA NOT NULL,
  mime_type TEXT,
  filename TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- Job Ads
-- Saved job ad records per user
-- ============================================
CREATE TABLE IF NOT EXISTS public.job_ads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  title TEXT,
  file_id TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_job_ads_user_id ON public.job_ads(user_id);

-- ============================================
-- Talent Lists
-- Candidate list artifacts per job/ad
-- ============================================
CREATE TABLE IF NOT EXISTS public.talent_lists (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  job_title TEXT,
  candidate_count INTEGER DEFAULT 0,
  sheet_url TEXT,
  application_sheet_id TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_talent_lists_user_id ON public.talent_lists(user_id);

-- ============================================
-- Job Trackers
-- Track JD brief, role and sheet mapping per user
-- ============================================
CREATE TABLE IF NOT EXISTS public.job_trackers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  brief_name TEXT NOT NULL,
  status TEXT DEFAULT 'Active' CHECK (status IN ('Active','Not Active')),
  recruiter_email TEXT NOT NULL,
  role_name TEXT NOT NULL,
  application_sheet_id TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Optional columns used by flows
ALTER TABLE public.job_trackers ADD COLUMN IF NOT EXISTS row_no INTEGER;
ALTER TABLE public.job_trackers ADD COLUMN IF NOT EXISTS grade TEXT;
ALTER TABLE public.job_trackers ADD COLUMN IF NOT EXISTS min_years_exp INTEGER;
ALTER TABLE public.job_trackers ADD COLUMN IF NOT EXISTS industry_exp_req TEXT;

-- Indexes and updated_at trigger
CREATE INDEX IF NOT EXISTS idx_job_trackers_user_id ON public.job_trackers(user_id);
CREATE INDEX IF NOT EXISTS idx_job_trackers_status ON public.job_trackers(status);

CREATE OR REPLACE FUNCTION update_job_trackers_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at := NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_job_trackers_updated_at ON public.job_trackers;
CREATE TRIGGER trigger_job_trackers_updated_at
BEFORE UPDATE ON public.job_trackers
FOR EACH ROW
EXECUTE FUNCTION update_job_trackers_updated_at();

-- ============================================
-- Candidates
-- Canonical candidate store with status and scheduling
-- ============================================
CREATE TABLE IF NOT EXISTS public.candidates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  job_tracker_id UUID REFERENCES public.job_trackers(id) ON DELETE CASCADE,
  name TEXT,
  email TEXT,
  phone_number TEXT,
  age INTEGER,
  gender TEXT,
  marital_status TEXT,
  location TEXT,
  residential_address TEXT,
  role_applying_for TEXT,
  academic_qualification TEXT,
  grade TEXT,
  cv_url TEXT,
  status TEXT DEFAULT 'Unscheduled' CHECK (status IN ('Unscheduled','Scheduled','Selected','Rejected','Shortlisted','Dropped','PROCEEDING','Notified-Rejected - CLOSED')),
  ai_rationale TEXT,
  batch_number INTEGER,
  interview_date DATE,
  interview_time_slot TEXT,
  meeting_venue_url TEXT,
  recruiter_name TEXT,
  recruiter_email TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  google_sheet_timestamp TEXT,
  google_sheet_row_number INTEGER
);

CREATE INDEX IF NOT EXISTS idx_candidates_user_id ON public.candidates(user_id);
CREATE INDEX IF NOT EXISTS idx_candidates_job_tracker_id ON public.candidates(job_tracker_id);
CREATE INDEX IF NOT EXISTS idx_candidates_status ON public.candidates(status);
CREATE INDEX IF NOT EXISTS idx_candidates_interview_date ON public.candidates(interview_date);

-- ============================================
-- Interview Batches
-- Configuration for automated scheduling
-- ============================================
CREATE TABLE IF NOT EXISTS public.interview_batches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  job_tracker_id UUID REFERENCES public.job_trackers(id) ON DELETE CASCADE,
  start_date DATE NOT NULL,
  start_time TIME NOT NULL,
  time_interval_minutes INTEGER NOT NULL,
  candidates_per_batch INTEGER NOT NULL,
  meeting_venue_url TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_interview_batches_user_id ON public.interview_batches(user_id);

-- ============================================
-- Email Communications
-- Log of emails sent to candidates
-- ============================================
CREATE TABLE IF NOT EXISTS public.email_communications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  candidate_id UUID REFERENCES public.candidates(id) ON DELETE CASCADE,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  email_type TEXT NOT NULL CHECK (email_type IN ('interview_schedule','congratulatory','rejection')),
  recipient_email TEXT NOT NULL,
  subject TEXT NOT NULL,
  body TEXT NOT NULL,
  sent_at TIMESTAMPTZ DEFAULT NOW(),
  status TEXT DEFAULT 'sent' CHECK (status IN ('pending','sent','failed')),
  error_message TEXT
);

CREATE INDEX IF NOT EXISTS idx_email_communications_candidate_id ON public.email_communications(candidate_id);

-- ============================================
-- Talent List Candidates
-- Imported candidate rows tied to a talent list
-- ============================================
CREATE TABLE IF NOT EXISTS public.talent_list_candidates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  talent_list_id UUID NOT NULL REFERENCES public.talent_lists(id) ON DELETE CASCADE,
  row_no INTEGER,
  name TEXT,
  email TEXT,
  phone_number TEXT,
  academic_qualification TEXT,
  grade TEXT,
  age INTEGER,
  residential_address TEXT,
  location TEXT,
  marital_status TEXT,
  gender TEXT,
  role_applying_for TEXT,
  cv_url TEXT,
  status TEXT,
  ai_rationale TEXT,
  candidate_tracker TEXT,
  application_sheet_id TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  batch_number INTEGER,
  interview_date TEXT,
  interview_time_slot TEXT,
  meeting_venue_url TEXT,
  recruiter_name TEXT,
  recruiter_email TEXT
);

CREATE INDEX IF NOT EXISTS idx_tlc_talent_list_id ON public.talent_list_candidates(talent_list_id);
CREATE INDEX IF NOT EXISTS idx_tlc_user_id ON public.talent_list_candidates(user_id);
CREATE INDEX IF NOT EXISTS idx_tlc_email ON public.talent_list_candidates(email);
CREATE INDEX IF NOT EXISTS idx_tlc_role ON public.talent_list_candidates(role_applying_for);
CREATE INDEX IF NOT EXISTS idx_tlc_status ON public.talent_list_candidates(status);

-- Ensure talent_lists carries sheet linkage fields
ALTER TABLE public.talent_lists
  ADD COLUMN IF NOT EXISTS sheet_url TEXT,
  ADD COLUMN IF NOT EXISTS application_sheet_id TEXT;

-- ============================================
-- User Google Tokens (OAuth)
-- Allows sending mail from a user’s own Gmail via refresh tokens
-- ============================================
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

-- ============================================
-- Row Level Security (RLS)
-- Enable RLS and add policies for admin and per-user access
-- Policies use session settings set by the app (request.jwt.claim.sub/role)
-- ============================================

ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS users_select_policy ON public.users;
CREATE POLICY users_select_policy ON public.users FOR SELECT USING (
  current_setting('request.jwt.claim.role', true) = 'admin' OR id::text = current_setting('request.jwt.claim.sub', true)
);
DROP POLICY IF EXISTS users_insert_policy ON public.users;
CREATE POLICY users_insert_policy ON public.users FOR INSERT WITH CHECK (
  current_setting('request.jwt.claim.role', true) = 'admin'
);
DROP POLICY IF EXISTS users_update_policy ON public.users;
CREATE POLICY users_update_policy ON public.users FOR UPDATE USING (
  current_setting('request.jwt.claim.role', true) = 'admin' OR id::text = current_setting('request.jwt.claim.sub', true)
) WITH CHECK (
  current_setting('request.jwt.claim.role', true) = 'admin' OR id::text = current_setting('request.jwt.claim.sub', true)
);
DROP POLICY IF EXISTS users_delete_policy ON public.users;
CREATE POLICY users_delete_policy ON public.users FOR DELETE USING (
  current_setting('request.jwt.claim.role', true) = 'admin'
);

ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS notifications_select_policy ON public.notifications;
CREATE POLICY notifications_select_policy ON public.notifications FOR SELECT USING (
  current_setting('request.jwt.claim.role', true) = 'admin' OR user_id::text = current_setting('request.jwt.claim.sub', true)
);
DROP POLICY IF EXISTS notifications_insert_policy ON public.notifications;
CREATE POLICY notifications_insert_policy ON public.notifications FOR INSERT WITH CHECK (
  current_setting('request.jwt.claim.role', true) = 'admin' OR user_id::text = current_setting('request.jwt.claim.sub', true)
);
DROP POLICY IF EXISTS notifications_update_policy ON public.notifications;
CREATE POLICY notifications_update_policy ON public.notifications FOR UPDATE USING (
  current_setting('request.jwt.claim.role', true) = 'admin' OR user_id::text = current_setting('request.jwt.claim.sub', true)
) WITH CHECK (
  current_setting('request.jwt.claim.role', true) = 'admin' OR user_id::text = current_setting('request.jwt.claim.sub', true)
);
DROP POLICY IF EXISTS notifications_delete_policy ON public.notifications;
CREATE POLICY notifications_delete_policy ON public.notifications FOR DELETE USING (
  current_setting('request.jwt.claim.role', true) = 'admin'
);

ALTER TABLE public.job_ads ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS job_ads_select_policy ON public.job_ads;
CREATE POLICY job_ads_select_policy ON public.job_ads FOR SELECT USING (
  current_setting('request.jwt.claim.role', true) = 'admin' OR user_id::text = current_setting('request.jwt.claim.sub', true)
);
DROP POLICY IF EXISTS job_ads_insert_policy ON public.job_ads;
CREATE POLICY job_ads_insert_policy ON public.job_ads FOR INSERT WITH CHECK (
  current_setting('request.jwt.claim.role', true) = 'admin' OR user_id::text = current_setting('request.jwt.claim.sub', true)
);
DROP POLICY IF EXISTS job_ads_update_policy ON public.job_ads;
CREATE POLICY job_ads_update_policy ON public.job_ads FOR UPDATE USING (
  current_setting('request.jwt.claim.role', true) = 'admin' OR user_id::text = current_setting('request.jwt.claim.sub', true)
) WITH CHECK (
  current_setting('request.jwt.claim.role', true) = 'admin' OR user_id::text = current_setting('request.jwt.claim.sub', true)
);
DROP POLICY IF EXISTS job_ads_delete_policy ON public.job_ads;
CREATE POLICY job_ads_delete_policy ON public.job_ads FOR DELETE USING (
  current_setting('request.jwt.claim.role', true) = 'admin'
);

ALTER TABLE public.talent_lists ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS talent_lists_select_policy ON public.talent_lists;
CREATE POLICY talent_lists_select_policy ON public.talent_lists FOR SELECT USING (
  current_setting('request.jwt.claim.role', true) = 'admin' OR user_id::text = current_setting('request.jwt.claim.sub', true)
);
DROP POLICY IF EXISTS talent_lists_insert_policy ON public.talent_lists;
CREATE POLICY talent_lists_insert_policy ON public.talent_lists FOR INSERT WITH CHECK (
  current_setting('request.jwt.claim.role', true) = 'admin' OR user_id::text = current_setting('request.jwt.claim.sub', true)
);
DROP POLICY IF EXISTS talent_lists_update_policy ON public.talent_lists;
CREATE POLICY talent_lists_update_policy ON public.talent_lists FOR UPDATE USING (
  current_setting('request.jwt.claim.role', true) = 'admin' OR user_id::text = current_setting('request.jwt.claim.sub', true)
) WITH CHECK (
  current_setting('request.jwt.claim.role', true) = 'admin' OR user_id::text = current_setting('request.jwt.claim.sub', true)
);
DROP POLICY IF EXISTS talent_lists_delete_policy ON public.talent_lists;
CREATE POLICY talent_lists_delete_policy ON public.talent_lists FOR DELETE USING (
  current_setting('request.jwt.claim.role', true) = 'admin'
);

ALTER TABLE public.job_trackers ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS job_trackers_select_policy ON public.job_trackers;
CREATE POLICY job_trackers_select_policy ON public.job_trackers FOR SELECT USING (
  current_setting('request.jwt.claim.role', true) = 'admin' OR user_id::text = current_setting('request.jwt.claim.sub', true)
);
DROP POLICY IF EXISTS job_trackers_insert_policy ON public.job_trackers;
CREATE POLICY job_trackers_insert_policy ON public.job_trackers FOR INSERT WITH CHECK (
  current_setting('request.jwt.claim.role', true) = 'admin' OR user_id::text = current_setting('request.jwt.claim.sub', true)
);
DROP POLICY IF EXISTS job_trackers_update_policy ON public.job_trackers;
CREATE POLICY job_trackers_update_policy ON public.job_trackers FOR UPDATE USING (
  current_setting('request.jwt.claim.role', true) = 'admin' OR user_id::text = current_setting('request.jwt.claim.sub', true)
) WITH CHECK (
  current_setting('request.jwt.claim.role', true) = 'admin' OR user_id::text = current_setting('request.jwt.claim.sub', true)
);
DROP POLICY IF EXISTS job_trackers_delete_policy ON public.job_trackers;
CREATE POLICY job_trackers_delete_policy ON public.job_trackers FOR DELETE USING (
  current_setting('request.jwt.claim.role', true) = 'admin'
);

ALTER TABLE public.candidates ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS candidates_select_policy ON public.candidates;
CREATE POLICY candidates_select_policy ON public.candidates FOR SELECT USING (
  current_setting('request.jwt.claim.role', true) = 'admin' OR user_id::text = current_setting('request.jwt.claim.sub', true)
);
DROP POLICY IF EXISTS candidates_insert_policy ON public.candidates;
CREATE POLICY candidates_insert_policy ON public.candidates FOR INSERT WITH CHECK (
  current_setting('request.jwt.claim.role', true) = 'admin' OR user_id::text = current_setting('request.jwt.claim.sub', true)
);
DROP POLICY IF EXISTS candidates_update_policy ON public.candidates;
CREATE POLICY candidates_update_policy ON public.candidates FOR UPDATE USING (
  current_setting('request.jwt.claim.role', true) = 'admin' OR user_id::text = current_setting('request.jwt.claim.sub', true)
) WITH CHECK (
  current_setting('request.jwt.claim.role', true) = 'admin' OR user_id::text = current_setting('request.jwt.claim.sub', true)
);
DROP POLICY IF EXISTS candidates_delete_policy ON public.candidates;
CREATE POLICY candidates_delete_policy ON public.candidates FOR DELETE USING (
  current_setting('request.jwt.claim.role', true) = 'admin'
);

ALTER TABLE public.email_communications ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS email_comm_select_policy ON public.email_communications;
CREATE POLICY email_comm_select_policy ON public.email_communications FOR SELECT USING (
  current_setting('request.jwt.claim.role', true) = 'admin' OR user_id::text = current_setting('request.jwt.claim.sub', true)
);
DROP POLICY IF EXISTS email_comm_insert_policy ON public.email_communications;
CREATE POLICY email_comm_insert_policy ON public.email_communications FOR INSERT WITH CHECK (
  current_setting('request.jwt.claim.role', true) = 'admin' OR user_id::text = current_setting('request.jwt.claim.sub', true)
);
DROP POLICY IF EXISTS email_comm_update_policy ON public.email_communications;
CREATE POLICY email_comm_update_policy ON public.email_communications FOR UPDATE USING (
  current_setting('request.jwt.claim.role', true) = 'admin' OR user_id::text = current_setting('request.jwt.claim.sub', true)
) WITH CHECK (
  current_setting('request.jwt.claim.role', true) = 'admin' OR user_id::text = current_setting('request.jwt.claim.sub', true)
);
DROP POLICY IF EXISTS email_comm_delete_policy ON public.email_communications;
CREATE POLICY email_comm_delete_policy ON public.email_communications FOR DELETE USING (
  current_setting('request.jwt.claim.role', true) = 'admin'
);

ALTER TABLE public.talent_list_candidates ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS tlc_select_policy ON public.talent_list_candidates;
CREATE POLICY tlc_select_policy ON public.talent_list_candidates FOR SELECT USING (
  current_setting('request.jwt.claim.role', true) = 'admin' OR user_id::text = current_setting('request.jwt.claim.sub', true)
);
DROP POLICY IF EXISTS tlc_insert_policy ON public.talent_list_candidates;
CREATE POLICY tlc_insert_policy ON public.talent_list_candidates FOR INSERT WITH CHECK (
  current_setting('request.jwt.claim.role', true) = 'admin' OR user_id::text = current_setting('request.jwt.claim.sub', true)
);

-- ============================================
-- Admin bootstrap (optional)
-- Insert an admin user for first-time setup
-- Commented out; adjust email and password then uncomment to use
-- ============================================
-- SELECT set_config('request.jwt.claim.role', 'admin', true);
-- INSERT INTO public.users (email, password_hash, name, role)
-- VALUES ('admin@example.com', crypt('change-this-password', gen_salt('bf')), 'Admin', 'admin');