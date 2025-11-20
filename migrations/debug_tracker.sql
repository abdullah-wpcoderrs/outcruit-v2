-- Debug query to check JD tracker data
-- Run this in your database to see what data exists

-- 1. Check if the job_trackers table exists and has data
SELECT COUNT(*) as total_trackers FROM public.job_trackers;

-- 2. Check all tracker records (to see if any exist)
SELECT * FROM public.job_trackers ORDER BY created_at DESC;

-- 3. Check your user ID (replace 'your@email.com' with your actual email)
SELECT id, email, full_name FROM public.users WHERE email = 'abdul@mail.com';

-- 4. Check if there's tracker data for your specific user (update the email)
SELECT jt.* 
FROM public.job_trackers jt
JOIN public.users u ON jt.user_id = u.id
WHERE u.email = 'abdul@mail.com';

-- 5. Verify the user_id matches (check if it's the UUID from the migration)
SELECT 
    'b8c91386-6e97-415f-9c04-cfc242d3cb66'::UUID as expected_user_id,
    id as actual_user_id,
    email
FROM public.users 
WHERE email = 'abdul@mail.com';
