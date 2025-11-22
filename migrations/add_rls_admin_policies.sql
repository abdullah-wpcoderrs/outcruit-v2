-- Enable RLS on core tables and add admin-aware policies
-- NOTE: Some Postgres versions (incl. Neon clusters) do not support
--       `CREATE POLICY IF NOT EXISTS`. To keep this migration idempotent
--       and portable, we use `DROP POLICY IF EXISTS` then `CREATE POLICY`.

-- Users table
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- Select: allow admin and the same user
-- Users: SELECT (admin or self)
DROP POLICY IF EXISTS users_select_policy ON public.users;
CREATE POLICY users_select_policy ON public.users
  FOR SELECT
  USING (
    current_setting('request.jwt.claim.role', true) = 'admin' OR
    id::text = current_setting('request.jwt.claim.sub', true)
  );

-- Insert: admin only
-- Users: INSERT (admin only)
DROP POLICY IF EXISTS users_insert_policy ON public.users;
CREATE POLICY users_insert_policy ON public.users
  FOR INSERT
  WITH CHECK (current_setting('request.jwt.claim.role', true) = 'admin');

-- Update: admin or self
-- Users: UPDATE (admin or self)
DROP POLICY IF EXISTS users_update_policy ON public.users;
CREATE POLICY users_update_policy ON public.users
  FOR UPDATE
  USING (
    current_setting('request.jwt.claim.role', true) = 'admin' OR
    id::text = current_setting('request.jwt.claim.sub', true)
  )
  WITH CHECK (
    current_setting('request.jwt.claim.role', true) = 'admin' OR
    id::text = current_setting('request.jwt.claim.sub', true)
  );

-- Delete: admin only
-- Users: DELETE (admin only)
DROP POLICY IF EXISTS users_delete_policy ON public.users;
CREATE POLICY users_delete_policy ON public.users
  FOR DELETE
  USING (current_setting('request.jwt.claim.role', true) = 'admin');

-- Notifications
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS notifications_select_policy ON public.notifications;
CREATE POLICY notifications_select_policy ON public.notifications
  FOR SELECT
  USING (
    current_setting('request.jwt.claim.role', true) = 'admin' OR
    user_id::text = current_setting('request.jwt.claim.sub', true)
  );
DROP POLICY IF EXISTS notifications_insert_policy ON public.notifications;
CREATE POLICY notifications_insert_policy ON public.notifications
  FOR INSERT
  WITH CHECK (
    current_setting('request.jwt.claim.role', true) = 'admin' OR
    user_id::text = current_setting('request.jwt.claim.sub', true)
  );
DROP POLICY IF EXISTS notifications_update_policy ON public.notifications;
CREATE POLICY notifications_update_policy ON public.notifications
  FOR UPDATE
  USING (
    current_setting('request.jwt.claim.role', true) = 'admin' OR
    user_id::text = current_setting('request.jwt.claim.sub', true)
  )
  WITH CHECK (
    current_setting('request.jwt.claim.role', true) = 'admin' OR
    user_id::text = current_setting('request.jwt.claim.sub', true)
  );
DROP POLICY IF EXISTS notifications_delete_policy ON public.notifications;
CREATE POLICY notifications_delete_policy ON public.notifications
  FOR DELETE
  USING (current_setting('request.jwt.claim.role', true) = 'admin');

-- Job Ads
ALTER TABLE public.job_ads ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS job_ads_select_policy ON public.job_ads;
CREATE POLICY job_ads_select_policy ON public.job_ads
  FOR SELECT
  USING (
    current_setting('request.jwt.claim.role', true) = 'admin' OR
    user_id::text = current_setting('request.jwt.claim.sub', true)
  );
DROP POLICY IF EXISTS job_ads_insert_policy ON public.job_ads;
CREATE POLICY job_ads_insert_policy ON public.job_ads
  FOR INSERT
  WITH CHECK (
    current_setting('request.jwt.claim.role', true) = 'admin' OR
    user_id::text = current_setting('request.jwt.claim.sub', true)
  );
DROP POLICY IF EXISTS job_ads_update_policy ON public.job_ads;
CREATE POLICY job_ads_update_policy ON public.job_ads
  FOR UPDATE
  USING (
    current_setting('request.jwt.claim.role', true) = 'admin' OR
    user_id::text = current_setting('request.jwt.claim.sub', true)
  )
  WITH CHECK (
    current_setting('request.jwt.claim.role', true) = 'admin' OR
    user_id::text = current_setting('request.jwt.claim.sub', true)
  );
DROP POLICY IF EXISTS job_ads_delete_policy ON public.job_ads;
CREATE POLICY job_ads_delete_policy ON public.job_ads
  FOR DELETE
  USING (current_setting('request.jwt.claim.role', true) = 'admin');

-- Talent Lists
ALTER TABLE public.talent_lists ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS talent_lists_select_policy ON public.talent_lists;
CREATE POLICY talent_lists_select_policy ON public.talent_lists
  FOR SELECT
  USING (
    current_setting('request.jwt.claim.role', true) = 'admin' OR
    user_id::text = current_setting('request.jwt.claim.sub', true)
  );
DROP POLICY IF EXISTS talent_lists_insert_policy ON public.talent_lists;
CREATE POLICY talent_lists_insert_policy ON public.talent_lists
  FOR INSERT
  WITH CHECK (
    current_setting('request.jwt.claim.role', true) = 'admin' OR
    user_id::text = current_setting('request.jwt.claim.sub', true)
  );
DROP POLICY IF EXISTS talent_lists_update_policy ON public.talent_lists;
CREATE POLICY talent_lists_update_policy ON public.talent_lists
  FOR UPDATE
  USING (
    current_setting('request.jwt.claim.role', true) = 'admin' OR
    user_id::text = current_setting('request.jwt.claim.sub', true)
  )
  WITH CHECK (
    current_setting('request.jwt.claim.role', true) = 'admin' OR
    user_id::text = current_setting('request.jwt.claim.sub', true)
  );
DROP POLICY IF EXISTS talent_lists_delete_policy ON public.talent_lists;
CREATE POLICY talent_lists_delete_policy ON public.talent_lists
  FOR DELETE
  USING (current_setting('request.jwt.claim.role', true) = 'admin');

-- Job Trackers
ALTER TABLE public.job_trackers ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS job_trackers_select_policy ON public.job_trackers;
CREATE POLICY job_trackers_select_policy ON public.job_trackers
  FOR SELECT
  USING (
    current_setting('request.jwt.claim.role', true) = 'admin' OR
    user_id::text = current_setting('request.jwt.claim.sub', true)
  );
DROP POLICY IF EXISTS job_trackers_insert_policy ON public.job_trackers;
CREATE POLICY job_trackers_insert_policy ON public.job_trackers
  FOR INSERT
  WITH CHECK (
    current_setting('request.jwt.claim.role', true) = 'admin' OR
    user_id::text = current_setting('request.jwt.claim.sub', true)
  );
DROP POLICY IF EXISTS job_trackers_update_policy ON public.job_trackers;
CREATE POLICY job_trackers_update_policy ON public.job_trackers
  FOR UPDATE
  USING (
    current_setting('request.jwt.claim.role', true) = 'admin' OR
    user_id::text = current_setting('request.jwt.claim.sub', true)
  )
  WITH CHECK (
    current_setting('request.jwt.claim.role', true) = 'admin' OR
    user_id::text = current_setting('request.jwt.claim.sub', true)
  );
DROP POLICY IF EXISTS job_trackers_delete_policy ON public.job_trackers;
CREATE POLICY job_trackers_delete_policy ON public.job_trackers
  FOR DELETE
  USING (current_setting('request.jwt.claim.role', true) = 'admin');

-- Candidates
ALTER TABLE public.candidates ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS candidates_select_policy ON public.candidates;
CREATE POLICY candidates_select_policy ON public.candidates
  FOR SELECT
  USING (
    current_setting('request.jwt.claim.role', true) = 'admin' OR
    user_id::text = current_setting('request.jwt.claim.sub', true)
  );
DROP POLICY IF EXISTS candidates_insert_policy ON public.candidates;
CREATE POLICY candidates_insert_policy ON public.candidates
  FOR INSERT
  WITH CHECK (
    current_setting('request.jwt.claim.role', true) = 'admin' OR
    user_id::text = current_setting('request.jwt.claim.sub', true)
  );
DROP POLICY IF EXISTS candidates_update_policy ON public.candidates;
CREATE POLICY candidates_update_policy ON public.candidates
  FOR UPDATE
  USING (
    current_setting('request.jwt.claim.role', true) = 'admin' OR
    user_id::text = current_setting('request.jwt.claim.sub', true)
  )
  WITH CHECK (
    current_setting('request.jwt.claim.role', true) = 'admin' OR
    user_id::text = current_setting('request.jwt.claim.sub', true)
  );
DROP POLICY IF EXISTS candidates_delete_policy ON public.candidates;
CREATE POLICY candidates_delete_policy ON public.candidates
  FOR DELETE
  USING (current_setting('request.jwt.claim.role', true) = 'admin');

-- Email Communications
ALTER TABLE public.email_communications ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS email_comm_select_policy ON public.email_communications;
CREATE POLICY email_comm_select_policy ON public.email_communications
  FOR SELECT
  USING (
    current_setting('request.jwt.claim.role', true) = 'admin' OR
    user_id::text = current_setting('request.jwt.claim.sub', true)
  );
DROP POLICY IF EXISTS email_comm_insert_policy ON public.email_communications;
CREATE POLICY email_comm_insert_policy ON public.email_communications
  FOR INSERT
  WITH CHECK (
    current_setting('request.jwt.claim.role', true) = 'admin' OR
    user_id::text = current_setting('request.jwt.claim.sub', true)
  );
DROP POLICY IF EXISTS email_comm_update_policy ON public.email_communications;
CREATE POLICY email_comm_update_policy ON public.email_communications
  FOR UPDATE
  USING (
    current_setting('request.jwt.claim.role', true) = 'admin' OR
    user_id::text = current_setting('request.jwt.claim.sub', true)
  )
  WITH CHECK (
    current_setting('request.jwt.claim.role', true) = 'admin' OR
    user_id::text = current_setting('request.jwt.claim.sub', true)
  );
DROP POLICY IF EXISTS email_comm_delete_policy ON public.email_communications;
CREATE POLICY email_comm_delete_policy ON public.email_communications
  FOR DELETE
  USING (current_setting('request.jwt.claim.role', true) = 'admin');

-- Interview Batches
ALTER TABLE public.interview_batches ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS interview_batches_select_policy ON public.interview_batches;
CREATE POLICY interview_batches_select_policy ON public.interview_batches
  FOR SELECT
  USING (
    current_setting('request.jwt.claim.role', true) = 'admin' OR
    user_id::text = current_setting('request.jwt.claim.sub', true)
  );
DROP POLICY IF EXISTS interview_batches_insert_policy ON public.interview_batches;
CREATE POLICY interview_batches_insert_policy ON public.interview_batches
  FOR INSERT
  WITH CHECK (
    current_setting('request.jwt.claim.role', true) = 'admin' OR
    user_id::text = current_setting('request.jwt.claim.sub', true)
  );
DROP POLICY IF EXISTS interview_batches_update_policy ON public.interview_batches;
CREATE POLICY interview_batches_update_policy ON public.interview_batches
  FOR UPDATE
  USING (
    current_setting('request.jwt.claim.role', true) = 'admin' OR
    user_id::text = current_setting('request.jwt.claim.sub', true)
  )
  WITH CHECK (
    current_setting('request.jwt.claim.role', true) = 'admin' OR
    user_id::text = current_setting('request.jwt.claim.sub', true)
  );
DROP POLICY IF EXISTS interview_batches_delete_policy ON public.interview_batches;
CREATE POLICY interview_batches_delete_policy ON public.interview_batches
  FOR DELETE
  USING (current_setting('request.jwt.claim.role', true) = 'admin');