import { NextRequest, NextResponse } from 'next/server';
import { pool } from '@/lib/db';
import { scheduleInterviews, ScheduleConfig } from '@/lib/smart-scheduler';

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { talentListId, jobTrackerId, config }: { talentListId?: string; jobTrackerId?: string; config: ScheduleConfig } = body;

        if ((!talentListId && !jobTrackerId) || !config) {
            return NextResponse.json(
                { error: 'Missing required fields' },
                { status: 400 }
            );
        }

        // 1. Fetch Unscheduled candidates for this source
        const fetchResult = talentListId
            ? await pool.query(
                "SELECT * FROM talent_list_candidates WHERE talent_list_id = $1 AND status != 'Scheduled'",
                [talentListId]
            )
            : await pool.query(
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
                if (talentListId) {
                    const updateQuery = `
                        UPDATE talent_list_candidates 
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
                } else {
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
            }

            // 4. Save batch configuration
            // Assuming user_id is optional or we skip it for now as we don't have auth context easily
            if (jobTrackerId) {
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
            }

            await client.query('COMMIT');
        } catch (e) {
            await client.query('ROLLBACK');
            throw e;
        } finally {
            client.release();
        }

        // Optional: update Google Sheet via n8n webhook if configured
        try {
            if (talentListId && process.env.SHEET_UPDATE_N8N_WEBHOOK_URL) {
                const payload = {
                    talentListId,
                    updates: scheduledCandidates.map(c => ({
                        id: c.id,
                        row_no: c.row_no,
                        application_sheet_id: c.application_sheet_id,
                        status: 'Scheduled',
                        interview_date: c.interview_date,
                        interview_time_slot: c.interview_time_slot,
                        meeting_venue_url: c.meeting_venue_url,
                        name: c.name,
                        email: c.email
                    }))
                };
                await fetch(process.env.SHEET_UPDATE_N8N_WEBHOOK_URL, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(payload)
                });
            }
        } catch (webhookError) {
            console.error('[Schedule API] Sheet update webhook error:', webhookError);
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
