-- Quick check to see if the job_trackers table has the sample data
-- Run this to verify the migration was executed

SELECT COUNT(*) as total_trackers FROM public.job_trackers;

-- If count is 0, the migration wasn't run
-- If count is 1 or more, check the data:
SELECT * FROM public.job_trackers;
