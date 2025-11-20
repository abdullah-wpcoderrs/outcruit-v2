-- ============================================
-- OUTCRUIT NEON DB SCHEMA
-- Standard PostgreSQL Configuration
-- ============================================

-- Enable pgcrypto for UUID generation
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================
-- USERS TABLE
-- ============================================

CREATE TABLE IF NOT EXISTS public.users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- NOTIFICATIONS TABLE
-- ============================================

CREATE TABLE IF NOT EXISTS public.notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('jd-tracker', 'talent-sorting', 'job-ads', 'system')),
  message TEXT NOT NULL,
  job_name TEXT,
  recruiter_name TEXT,
  recruiter_email TEXT,
  status TEXT DEFAULT 'success' CHECK (status IN ('success', 'error', 'processing')),
  metadata JSONB DEFAULT '{}'::jsonb,
  read_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON notifications(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_notifications_read_at ON notifications(read_at) WHERE read_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_notifications_type ON notifications(type);

-- ============================================
-- UTILITY FUNCTIONS
-- ============================================

-- Function to clean up old notifications (older than 90 days)
CREATE OR REPLACE FUNCTION cleanup_old_notifications()
RETURNS INTEGER AS $$
DECLARE
  deleted_count INTEGER;
BEGIN
  DELETE FROM notifications
  WHERE created_at < NOW() - INTERVAL '90 days'
  RETURNING COUNT(*) INTO deleted_count;
  
  RETURN deleted_count;
END;
$$ LANGUAGE plpgsql;
-- ============================================
-- RLS CONFIGURATION
-- ============================================

-- Create roles if they don't exist
DO $$
BEGIN
  IF NOT EXISTS (SELECT FROM pg_catalog.pg_roles WHERE rolname = 'authenticated') THEN
    CREATE ROLE authenticated NOLOGIN;
  END IF;
  IF NOT EXISTS (SELECT FROM pg_catalog.pg_roles WHERE rolname = 'anonymous') THEN
    CREATE ROLE anonymous NOLOGIN;
  END IF;
END
$$;

-- Grant permissions
GRANT USAGE ON SCHEMA public TO authenticated, anonymous;
GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO authenticated;

-- Enable RLS
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- Policies for Users table
CREATE POLICY "Users can view own profile" ON public.users
  FOR SELECT TO authenticated
  USING (id::text = current_setting('request.jwt.claim.sub', true));

CREATE POLICY "Users can update own profile" ON public.users
  FOR UPDATE TO authenticated
  USING (id::text = current_setting('request.jwt.claim.sub', true));

-- Policies for Notifications table
CREATE POLICY "Users can view own notifications" ON public.notifications
  FOR SELECT TO authenticated
  USING (user_id::text = current_setting('request.jwt.claim.sub', true));

CREATE POLICY "Users can update own notifications" ON public.notifications
  FOR UPDATE TO authenticated
  USING (user_id::text = current_setting('request.jwt.claim.sub', true));

CREATE POLICY "Users can delete own notifications" ON public.notifications
  FOR DELETE TO authenticated
  USING (user_id::text = current_setting('request.jwt.claim.sub', true));

-- Admin Policy (Example: if role claim is 'admin')
CREATE POLICY "Admins can view all users" ON public.users
  FOR SELECT TO authenticated
  USING (current_setting('request.jwt.claim.role', true) = 'admin');
-- ============================================
-- DASHBOARD & TRACKER TABLES
-- ============================================

-- Files Table (Stores binary file data)
CREATE TABLE IF NOT EXISTS public.files (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  data BYTEA NOT NULL,
  mime_type TEXT NOT NULL,
  filename TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Job Ads Table
CREATE TABLE IF NOT EXISTS public.job_ads (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE, -- Optional, if linked to a specific user
  job_title TEXT NOT NULL,
  file_id UUID REFERENCES public.files(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Talent Lists Table
CREATE TABLE IF NOT EXISTS public.talent_lists (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE, -- Optional
  job_title TEXT NOT NULL,
  file_id UUID REFERENCES public.files(id) ON DELETE SET NULL,
  candidate_count INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Job Trackers Table
CREATE TABLE IF NOT EXISTS public.job_trackers (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE, -- Optional
  brief_name TEXT,
  status TEXT,
  recruiter_email TEXT,
  additional_requirements TEXT,
  role_name TEXT,
  required_skills TEXT,
  education_level TEXT,
  location_reqs TEXT,
  ai_brief_text TEXT,
  application_sheet_id TEXT,
  recruitment_type TEXT,
  grade TEXT,
  age TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.files ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.job_ads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.talent_lists ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.job_trackers ENABLE ROW LEVEL SECURITY;

-- RLS Policies

-- Files: Authenticated users can view files (simplification, ideally linked to ownership)
CREATE POLICY "Authenticated users can view files" ON public.files
  FOR SELECT TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can upload files" ON public.files
  FOR INSERT TO authenticated
  WITH CHECK (true);

-- Job Ads: Authenticated users can view/create
CREATE POLICY "Authenticated users can view job ads" ON public.job_ads
  FOR SELECT TO authenticated
  USING (true); -- Or restrict by user_id if needed

CREATE POLICY "Authenticated users can create job ads" ON public.job_ads
  FOR INSERT TO authenticated
  WITH CHECK (true);

-- Talent Lists: Authenticated users can view/create
CREATE POLICY "Authenticated users can view talent lists" ON public.talent_lists
  FOR SELECT TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can create talent lists" ON public.talent_lists
  FOR INSERT TO authenticated
  WITH CHECK (true);

-- Job Trackers: Authenticated users can view/create
CREATE POLICY "Authenticated users can view trackers" ON public.job_trackers
  FOR SELECT TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can create trackers" ON public.job_trackers
  FOR INSERT TO authenticated
  WITH CHECK (true);
