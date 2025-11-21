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
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_tlc_talent_list_id ON public.talent_list_candidates (talent_list_id);
CREATE INDEX IF NOT EXISTS idx_tlc_user_id ON public.talent_list_candidates (user_id);
CREATE INDEX IF NOT EXISTS idx_tlc_email ON public.talent_list_candidates (email);
CREATE INDEX IF NOT EXISTS idx_tlc_role ON public.talent_list_candidates (role_applying_for);
CREATE INDEX IF NOT EXISTS idx_tlc_status ON public.talent_list_candidates (status);

ALTER TABLE public.talent_lists
  ADD COLUMN IF NOT EXISTS sheet_url TEXT,
  ADD COLUMN IF NOT EXISTS application_sheet_id TEXT;