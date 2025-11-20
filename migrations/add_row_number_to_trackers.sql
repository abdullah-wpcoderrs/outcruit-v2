-- Add row_no column to job_trackers table
-- This represents the row number in Google Sheets for n8n updates

-- Add the row_no column
ALTER TABLE public.job_trackers 
ADD COLUMN IF NOT EXISTS row_no INTEGER;

-- Update existing record with row number for abdul@mail.com
-- Assuming this is row 2 in your Google Sheet (row 1 is usually headers)
UPDATE public.job_trackers 
SET row_no = 2
WHERE id = 'e0ab4fe8-9c3c-4d4d-8417-8a40f8ce1074'
  AND user_id = 'b8c91386-6e97-415f-9c04-cfc242d3cb66'::UUID;

-- Verification query
SELECT id, brief_name, status, row_no, recruiter_email 
FROM public.job_trackers 
WHERE user_id = 'b8c91386-6e97-415f-9c04-cfc242d3cb66'::UUID;
