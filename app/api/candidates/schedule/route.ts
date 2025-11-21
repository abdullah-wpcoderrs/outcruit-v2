import { NextRequest, NextResponse } from 'next/server';
import { pool } from '@/lib/db';
import { scheduleInterviews, ScheduleConfig } from '@/lib/smart-scheduler';

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const {
            jobTrackerId,
            config
        }: {
            jobTrackerId: string;
            config: ScheduleConfig
        } = body;

        if (!jobTrackerId || !config) {
            return NextResponse.json(
                { error: 'Missing required fields' },
                { status: 400 }
            );
        }

        // 1. Fetch Unscheduled candidates for this job
        const fetchResult = await pool.query(
            "SELECT * FROM candidates WHERE job_tracker_id = $1 AND status = 'Unscheduled'",
            [jobTrackerId]
        );
        const candidates = fetchResult.rows;

        if (!candidates || candidates.length === 0) {
            return NextResponse.json(
                { message: 'No unscheduled candidates found' },
                { status: 200 }
            );
        }

        // 2. Run Smart Scheduler
        const scheduledCandidates = scheduleInterviews(candidates, config);

        // 3. Update candidates in database
        // Using a transaction for safety
        const client = await pool.connect();
        try {
            await client.query('BEGIN');

            for (const candidate of scheduledCandidates) {
                const updateQuery = `
          UPDATE candidates 
          SET 
            status = 'Scheduled',
            batch_number = $1,
            interview_date = $2,
            interview_time_slot = $3,
            meeting_venue_url = $4,
            recruiter_name = $5,
            recruiter_email = $6
          WHERE id = $7
        `;
                const values = [
                    candidate.batch_number,
                    candidate.interview_date,
                    candidate.interview_time_slot,
                    candidate.meeting_venue_url,
                    candidate.recruiter_name,
                    candidate.recruiter_email,
                    candidate.id
                ];
                await client.query(updateQuery, values);
            }

            // 4. Save batch configuration
            // Assuming user_id is optional or we skip it for now as we don't have auth context easily
            const batchQuery = `
        INSERT INTO interview_batches (
          job_tracker_id, start_date, start_time, time_interval_minutes,
          candidates_per_batch, meeting_venue_url
        ) VALUES ($1, $2, $3, $4, $5, $6)
      `;
            const batchValues = [
                jobTrackerId,
                config.startDate,
                config.startTime,
                config.timeIntervalMinutes,
                config.candidatesPerBatch,
                config.meetingVenueUrl
            ];
            await client.query(batchQuery, batchValues);

            await client.query('COMMIT');
        } catch (e) {
            await client.query('ROLLBACK');
            throw e;
        } finally {
            client.release();
        }

        return NextResponse.json({
            message: 'Scheduling complete',
            count: scheduledCandidates.length,
            candidates: scheduledCandidates
        });

    } catch (error: any) {
        console.error("Error scheduling interviews:", error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
