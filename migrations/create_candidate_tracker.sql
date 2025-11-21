-- Candidates Table: Store all candidate information
CREATE TABLE IF NOT EXISTS public.candidates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  job_tracker_id UUID REFERENCES public.job_trackers(id) ON DELETE CASCADE,
  
  -- Personal Information
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone_number TEXT,
  age INTEGER,
  gender TEXT,
  marital_status TEXT,
  location TEXT,
  residential_address TEXT,
  
  -- Professional Information
  role_applying_for TEXT,
  academic_qualification TEXT,
  grade TEXT,
  cv_url TEXT,
  
  -- Tracking Information
  status TEXT DEFAULT 'Unscheduled' CHECK (status IN (
    'Unscheduled', 'Scheduled', 'Selected', 'Rejected', 
    'Shortlisted', 'Dropped', 'PROCEEDING', 'Notified-Rejected - CLOSED'
  )),
  ai_rationale TEXT,
  
  -- Interview Scheduling
  batch_number INTEGER,
  interview_date DATE,
  interview_time_slot TEXT,
  meeting_venue_url TEXT,
  recruiter_name TEXT,
  recruiter_email TEXT,
  
  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Google Sheets compatibility (optional, for migration)
  google_sheet_timestamp TEXT,
  google_sheet_row_number INTEGER
);

-- Interview Batches Table: Track batch scheduling configuration
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

-- Email Communications Log: Track all emails sent
CREATE TABLE IF NOT EXISTS public.email_communications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  candidate_id UUID REFERENCES public.candidates(id) ON DELETE CASCADE,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  
  email_type TEXT NOT NULL CHECK (email_type IN (
    'interview_schedule', 'congratulatory', 'rejection'
  )),
  recipient_email TEXT NOT NULL,
  subject TEXT NOT NULL,
  body TEXT NOT NULL,
  sent_at TIMESTAMPTZ DEFAULT NOW(),
  status TEXT DEFAULT 'sent' CHECK (status IN ('pending', 'sent', 'failed')),
  error_message TEXT
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_candidates_user_id ON public.candidates(user_id);
CREATE INDEX IF NOT EXISTS idx_candidates_job_tracker_id ON public.candidates(job_tracker_id);
CREATE INDEX IF NOT EXISTS idx_candidates_status ON public.candidates(status);
CREATE INDEX IF NOT EXISTS idx_candidates_interview_date ON public.candidates(interview_date);
CREATE INDEX IF NOT EXISTS idx_interview_batches_user_id ON public.interview_batches(user_id);
CREATE INDEX IF NOT EXISTS idx_email_communications_candidate_id ON public.email_communications(candidate_id);

-- RLS Policies
ALTER TABLE public.candidates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.interview_batches ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.email_communications ENABLE ROW LEVEL SECURITY;

-- Candidates policies
CREATE POLICY "Users can view own candidates" ON public.candidates
  FOR SELECT TO authenticated
  USING (user_id::text = current_setting('request.jwt.claim.sub', true));

CREATE POLICY "Users can create candidates" ON public.candidates
  FOR INSERT TO authenticated
  WITH CHECK (user_id::text = current_setting('request.jwt.claim.sub', true));

CREATE POLICY "Users can update own candidates" ON public.candidates
  FOR UPDATE TO authenticated
  USING (user_id::text = current_setting('request.jwt.claim.sub', true));

CREATE POLICY "Users can delete own candidates" ON public.candidates
  FOR DELETE TO authenticated
  USING (user_id::text = current_setting('request.jwt.claim.sub', true));

-- Interview Batches policies
CREATE POLICY "Users can view own batches" ON public.interview_batches
  FOR SELECT TO authenticated
  USING (user_id::text = current_setting('request.jwt.claim.sub', true));

CREATE POLICY "Users can create batches" ON public.interview_batches
  FOR INSERT TO authenticated
  WITH CHECK (user_id::text = current_setting('request.jwt.claim.sub', true));

-- Email Communications policies
CREATE POLICY "Users can view own emails" ON public.email_communications
  FOR SELECT TO authenticated
  USING (user_id::text = current_setting('request.jwt.claim.sub', true));

CREATE POLICY "Users can create emails" ON public.email_communications
  FOR INSERT TO authenticated
  WITH CHECK (user_id::text = current_setting('request.jwt.claim.sub', true));
