-- ============================================
-- USER PROFILE ENHANCEMENT
-- Add profile fields to users table
-- ============================================

-- Add basic text columns
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS name TEXT;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS avatar_url TEXT;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS organization TEXT;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS phone TEXT;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS last_login TIMESTAMPTZ;

-- Add preferences column with default JSON
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS preferences JSONB DEFAULT '{"notifications": {"job_ads": true, "talent_sorting": true, "jd_tracker": true, "email_notifications": true}, "appearance": {"theme": "system", "density": "comfortable"}}'::jsonb;

-- Update RLS policy to allow users to update their own profile (using existing JWT claim approach)
DROP POLICY IF EXISTS "Users can update own profile" ON public.users;
CREATE POLICY "Users can update own profile" ON public.users FOR UPDATE TO authenticated USING (id::text = current_setting('request.jwt.claim.sub', true));

-- Create indexes for faster lookups
CREATE INDEX IF NOT EXISTS idx_users_email ON public.users(email);
CREATE INDEX IF NOT EXISTS idx_users_last_login ON public.users(last_login DESC);

-- Update existing users with default preferences if NULL
UPDATE public.users SET preferences = '{"notifications": {"job_ads": true, "talent_sorting": true, "jd_tracker": true, "email_notifications": true}, "appearance": {"theme": "system", "density": "comfortable"}}'::jsonb WHERE preferences IS NULL;
