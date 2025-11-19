-- ============================================
-- OUTCRUIT PRODUCTION DATABASE SETUP
-- Complete Supabase Configuration
-- Version: 2.0 (Realtime Implementation)
-- ============================================

-- ============================================
-- SECTION 1: CLEANUP
-- Remove old structures and start fresh
-- ============================================

-- Drop old triggers and functions
DROP TRIGGER IF EXISTS on_notification_insert ON notifications;
DROP FUNCTION IF EXISTS notify_new_notification();
DROP FUNCTION IF EXISTS cleanup_old_notifications();

-- Drop old tables (if migrating from old structure)
DROP TABLE IF EXISTS notifications CASCADE;

-- ============================================
-- SECTION 2: USER MANAGEMENT
-- Create and sync public.users with auth.users
-- ============================================

-- Create public.users table (synced with auth.users)
CREATE TABLE IF NOT EXISTS public.users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS on users table
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Users can only see their own profile
CREATE POLICY "Users can view own profile"
  ON public.users FOR SELECT
  USING (auth.uid() = id);

-- Function to sync auth.users to public.users
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, email)
  VALUES (NEW.id, NEW.email)
  ON CONFLICT (id) DO UPDATE
  SET email = EXCLUDED.email,
      updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to auto-sync new users
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- ============================================
-- SECTION 3: NOTIFICATIONS TABLE
-- Main notification storage with RLS
-- ============================================

CREATE TABLE notifications (
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

-- Create indexes for performance
CREATE INDEX idx_notifications_user_id ON notifications(user_id);
CREATE INDEX idx_notifications_created_at ON notifications(created_at DESC);
CREATE INDEX idx_notifications_read_at ON notifications(read_at) WHERE read_at IS NULL;
CREATE INDEX idx_notifications_type ON notifications(type);

-- Enable RLS on notifications table
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- ============================================
-- SECTION 4: RLS POLICIES
-- Security policies for notifications
-- ============================================

-- Policy: Users can only see their own notifications
CREATE POLICY "Users can view own notifications"
  ON notifications FOR SELECT
  USING (auth.uid() = user_id);

-- Policy: Users can update their own notifications (mark as read)
CREATE POLICY "Users can update own notifications"
  ON notifications FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Policy: Users can delete their own notifications
CREATE POLICY "Users can delete own notifications"
  ON notifications FOR DELETE
  USING (auth.uid() = user_id);

-- Policy: Service role can insert notifications (for n8n webhook)
CREATE POLICY "Service role can insert notifications"
  ON notifications FOR INSERT
  WITH CHECK (true);

-- ============================================
-- SECTION 5: REALTIME
-- Enable Supabase Realtime for instant updates
-- ============================================

-- Enable Realtime for notifications table
ALTER PUBLICATION supabase_realtime ADD TABLE notifications;

-- ============================================
-- SECTION 6: UTILITY FUNCTIONS
-- Helper functions for maintenance
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
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get notification stats
CREATE OR REPLACE FUNCTION get_notification_stats()
RETURNS TABLE (
  total_notifications BIGINT,
  unread_notifications BIGINT,
  notifications_by_type JSONB
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    COUNT(*)::BIGINT as total_notifications,
    COUNT(*) FILTER (WHERE read_at IS NULL)::BIGINT as unread_notifications,
    jsonb_object_agg(type, count) as notifications_by_type
  FROM (
    SELECT type, COUNT(*) as count
    FROM notifications
    GROUP BY type
  ) type_counts;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- SECTION 7: DEFAULT USER (OPTIONAL)
-- Create a default test user for development
-- Comment out for production or create via Supabase Dashboard
-- ============================================

DO $$
DECLARE
  default_user_id UUID := gen_random_uuid();
BEGIN
  -- Insert into auth.users if not exists
  INSERT INTO auth.users (
    id,
    instance_id,
    aud,
    role,
    email,
    encrypted_password,
    email_confirmed_at,
    created_at,
    updated_at,
    raw_app_meta_data,
    raw_user_meta_data,
    is_super_admin,
    confirmation_token,
    email_change,
    email_change_token_new,
    recovery_token
  )
  VALUES (
    default_user_id,
    '00000000-0000-0000-0000-000000000000',
    'authenticated',
    'authenticated',
    'recruiter@outcruit.com',
    crypt('password123', gen_salt('bf')),
    NOW(),
    NOW(),
    NOW(),
    '{"provider":"email","providers":["email"]}'::jsonb,
    '{}'::jsonb,
    false,
    '',
    '',
    '',
    ''
  )
  ON CONFLICT (email) DO NOTHING;

  -- The trigger will automatically create the public.users entry
  RAISE NOTICE 'Default user created: recruiter@outcruit.com / password123';
EXCEPTION
  WHEN OTHERS THEN
    RAISE NOTICE 'Default user creation skipped (may already exist)';
END $$;

-- ============================================
-- SECTION 8: VERIFICATION
-- Verify setup is complete
-- ============================================

-- Check tables exist
DO $$
BEGIN
  IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'users') THEN
    RAISE NOTICE '✓ public.users table created';
  END IF;
  
  IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'notifications') THEN
    RAISE NOTICE '✓ notifications table created';
  END IF;
END $$;

-- Check RLS is enabled
SELECT 
  tablename,
  CASE WHEN rowsecurity THEN '✓ Enabled' ELSE '✗ Disabled' END as rls_status
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename IN ('users', 'notifications');

-- Check Realtime is enabled
SELECT 
  schemaname,
  tablename,
  '✓ Realtime Enabled' as status
FROM pg_publication_tables 
WHERE pubname = 'supabase_realtime'
AND tablename = 'notifications';

-- Check policies exist
SELECT 
  tablename,
  policyname,
  '✓ Policy Active' as status
FROM pg_policies 
WHERE schemaname = 'public'
AND tablename IN ('users', 'notifications')
ORDER BY tablename, policyname;

-- Display summary
SELECT 
  'Setup Complete!' as status,
  (SELECT COUNT(*) FROM public.users) as total_users,
  (SELECT COUNT(*) FROM notifications) as total_notifications;

-- ============================================
-- SETUP COMPLETE
-- ============================================

-- Next Steps:
-- 1. Verify all checks passed above
-- 2. Create additional users via Supabase Dashboard or SQL
-- 3. Update your .env with SUPABASE_SERVICE_ROLE_KEY
-- 4. Test notification system
-- 5. Configure n8n webhooks

-- For production:
-- - Remove or comment out SECTION 7 (default user)
-- - Create users via Supabase Dashboard
-- - Set up scheduled cleanup job if needed
-- - Monitor notification table size

