-- ============================================
-- OUTCRUIT NEON DB - DROP ALL SCHEMA
-- Safely drops all tables, functions, and triggers
-- ============================================

-- Drop all policies first (they depend on tables)
DROP POLICY IF EXISTS "Users can view own profile" ON public.users;
DROP POLICY IF EXISTS "Users can update own profile" ON public.users;
DROP POLICY IF EXISTS "Users can view own notifications" ON public.notifications;
DROP POLICY IF EXISTS "Users can update own notifications" ON public.notifications;
DROP POLICY IF EXISTS "Users can delete own notifications" ON public.notifications;
DROP POLICY IF EXISTS "Admins can view all users" ON public.users;
DROP POLICY IF EXISTS "Authenticated users can view files" ON public.files;
DROP POLICY IF EXISTS "Authenticated users can upload files" ON public.files;
DROP POLICY IF EXISTS "Authenticated users can view job ads" ON public.job_ads;
DROP POLICY IF EXISTS "Authenticated users can create job ads" ON public.job_ads;
DROP POLICY IF EXISTS "Authenticated users can view talent lists" ON public.talent_lists;
DROP POLICY IF EXISTS "Authenticated users can create talent lists" ON public.talent_lists;
DROP POLICY IF EXISTS "Authenticated users can view trackers" ON public.job_trackers;
DROP POLICY IF EXISTS "Authenticated users can create trackers" ON public.job_trackers;

-- Drop all tables (CASCADE will handle foreign keys and indexes)
DROP TABLE IF EXISTS public.job_trackers CASCADE;
DROP TABLE IF EXISTS public.talent_lists CASCADE;
DROP TABLE IF EXISTS public.job_ads CASCADE;
DROP TABLE IF EXISTS public.files CASCADE;
DROP TABLE IF EXISTS public.notifications CASCADE;
DROP TABLE IF EXISTS public.users CASCADE;

-- Drop all functions
DROP FUNCTION IF EXISTS cleanup_old_notifications() CASCADE;

-- Drop all triggers (if any exist)
DROP TRIGGER IF EXISTS update_users_updated_at ON public.users CASCADE;

-- Drop all custom types (if any)
-- DROP TYPE IF EXISTS custom_type_name CASCADE;

-- ============================================
-- VERIFICATION
-- ============================================
-- Run this query to verify all tables are dropped:
-- SELECT table_name FROM information_schema.tables WHERE table_schema = 'public';
-- Should return no results if successful.
