-- ============================================
-- ALTER TABLE: Add missing columns to job_trackers
-- ============================================

ALTER TABLE public.job_trackers 
ADD COLUMN IF NOT EXISTS min_years_exp INTEGER,
ADD COLUMN IF NOT EXISTS industry_exp_req TEXT;

-- Convert the existing 'age' column from TEXT to INTEGER
-- First, update any existing data to ensure it's numeric or NULL
UPDATE public.job_trackers SET age = NULL WHERE age !~ '^[0-9]+$';

-- Then alter the column type
ALTER TABLE public.job_trackers 
ALTER COLUMN age TYPE INTEGER USING age::INTEGER;

-- ============================================
-- INSERT SAMPLE DATA for abdul@mail.com
-- ============================================

-- Using the user_id for abdul@mail.com: b8c91386-6e97-415f-9c04-cfc242d3cb66

INSERT INTO public.job_trackers (
    user_id,
    brief_name,
    status,
    recruiter_email,
    role_name,
    min_years_exp,
    required_skills,
    education_level,
    location_reqs,
    industry_exp_req,
    recruitment_type,
    age,
    grade,
    ai_brief_text,
    application_sheet_id,
    additional_requirements
) VALUES (
    'b8c91386-6e97-415f-9c04-cfc242d3cb66'::UUID,
    'Servoice Ass. Inc. Automation',
    'Active',
    'abdullahajibowu0@gmail.com',
    'Service Associate',
    3,
    'Microsoft Office (Word, Excel, PowerPoint), Excellent verbal communication skills, outspoken, vocal, confident, strong interpersonal and relationship-building skills, positive attitude, strong customer-service orientation',
    'BSC/HND',
    'Lagos',
    'Yes',
    'Outsourcing',
    27,
    'Minimum of Second Class Lower (2:2) for BSC or Lower Credit for HND',
    'This role is a dynamic combination of a Bank Teller and a Customer Service Officer. As a Service Associate under Alt Banking, you will be the first point of contact for customers, responsible for handling their financial transactions and ensuring they receive excellent service. Duties include processing financial transactions, managing client inquiries, building strong client relationships, assisting with client onboarding and account maintenance, collaborating with internal teams to resolve client issues, conducting client satisfaction check-ins, and keeping accurate records.',
    '1cFkJqjkxjJ8vPkbwCocs4veg3sKhhOd93rCSpR99dSI',
    ''
);

-- ============================================
-- VERIFICATION QUERY
-- ============================================
-- Run this to verify the insert was successful:
-- SELECT * FROM public.job_trackers WHERE recruiter_email = 'abdullahajibowu0@gmail.com';
