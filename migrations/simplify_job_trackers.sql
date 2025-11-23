-- ============================================
-- SIMPLIFY JOB TRACKERS TABLE
-- Drop old table and create new simplified schema
-- ============================================

-- Drop existing table (this will delete all data)
DROP TABLE IF EXISTS public.job_trackers CASCADE;

-- Create new simplified table with only essential fields
CREATE TABLE public.job_trackers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    brief_name TEXT NOT NULL,
    status TEXT DEFAULT 'Active' CHECK (status IN ('Active', 'Not Active')),
    recruiter_email TEXT NOT NULL,
    role_name TEXT NOT NULL,
    application_sheet_id TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create index on user_id for faster queries
CREATE INDEX idx_job_trackers_user_id ON public.job_trackers(user_id);

-- Create index on status for filtering
CREATE INDEX idx_job_trackers_status ON public.job_trackers(status);

-- Create function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_job_trackers_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to call the function
CREATE TRIGGER trigger_job_trackers_updated_at
    BEFORE UPDATE ON public.job_trackers
    FOR EACH ROW
    EXECUTE FUNCTION update_job_trackers_updated_at();

-- Enable RLS
ALTER TABLE public.job_trackers ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view own trackers" ON public.job_trackers
    FOR SELECT TO authenticated
    USING (user_id::text = current_setting('request.jwt.claim.sub', true));

CREATE POLICY "Users can create own trackers" ON public.job_trackers
    FOR INSERT TO authenticated
    WITH CHECK (user_id::text = current_setting('request.jwt.claim.sub', true));

CREATE POLICY "Users can update own trackers" ON public.job_trackers
    FOR UPDATE TO authenticated
    USING (user_id::text = current_setting('request.jwt.claim.sub', true));

CREATE POLICY "Users can delete own trackers" ON public.job_trackers
    FOR DELETE TO authenticated
    USING (user_id::text = current_setting('request.jwt.claim.sub', true));

-- Insert sample data for testing
-- Using user_id: b8c91386-6e97-415f-9c04-cfc242d3cb66 (abdul@mail.com)

INSERT INTO public.job_trackers (
    user_id,
    brief_name,
    status,
    recruiter_email,
    role_name,
    application_sheet_id
) VALUES (
    'b8c91386-6e97-415f-9c04-cfc242d3cb66'::UUID,
    'Service Ass. Inc. Automation',
    'Active',
    'abdullahajibowu0@gmail.com',
    'Service Associate',
    '1cFkJqjkxjJ8vPkbwCocs4veg3sKhhOd93rCSpR99dSI'
);

-- Verification
SELECT * FROM public.job_trackers;

-- Add optional columns used by application flows
ALTER TABLE public.job_trackers ADD COLUMN IF NOT EXISTS row_no INTEGER;
ALTER TABLE public.job_trackers ADD COLUMN IF NOT EXISTS grade TEXT;
