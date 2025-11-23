import { NextRequest, NextResponse } from 'next/server';
import { withClient, pool } from '@/lib/db';
import { sendEmail } from '@/lib/email-service';
import { emailTemplates, EmailTemplateData } from '@/lib/email-templates';

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const {
            talentListId,
            jobTrackerId,
            emailType,
            jobName
        }: {
            talentListId?: string;
            jobTrackerId?: string;
            emailType: 'interview_schedule' | 'congratulatory' | 'rejection';
            jobName: string;
        } = body;

        if ((!talentListId && !jobTrackerId) || !emailType || !jobName) {
            return NextResponse.json(
                { error: 'Missing required fields' },
                { status: 400 }
            );
        }

        // Determine target status based on email type
        let targetStatus = '';
        let nextStatus = '';

        switch (emailType) {
            case 'interview_schedule':
                targetStatus = 'Scheduled';
                nextStatus = 'Scheduled'; // Status doesn't change, just notified
                break;
            case 'congratulatory':
                targetStatus = 'Shortlisted';
                nextStatus = 'PROCEEDING';
                break;
            case 'rejection':
                targetStatus = 'Dropped';
                nextStatus = 'Notified-Rejected - CLOSED';
                break;
            default:
                return NextResponse.json({ error: 'Invalid email type' }, { status: 400 });
        }

        // 1. Fetch candidates
        const fetchResult = await withClient(undefined, 'admin', async (client) => {
            return talentListId
                ? client.query(
                    'SELECT * FROM talent_list_candidates WHERE talent_list_id = $1 AND status = $2',
                    [talentListId, targetStatus]
                )
                : client.query(
                    'SELECT * FROM candidates WHERE job_tracker_id = $1 AND status = $2',
                    [jobTrackerId, targetStatus]
                );
        })
        const candidates = fetchResult.rows;

        if (!candidates || candidates.length === 0) {
            return NextResponse.json(
                { message: `No candidates found with status: ${targetStatus}` },
                { status: 200 }
            );
        }

        // 2. Send emails
        const results = await Promise.allSettled(candidates.map(async (candidate: any) => {
            const templateData: EmailTemplateData = {
                candidateName: candidate.name,
                roleApplyingFor: candidate.role_applying_for,
                jobName: jobName,
                recruiterName: candidate.recruiter_name || 'Recruiter',
                recruiterEmail: candidate.recruiter_email || 'recruitment@example.com',
                interviewDate: candidate.interview_date,
                interviewTimeSlot: candidate.interview_time_slot,
                meetingVenueUrl: candidate.meeting_venue_url
            };

            const emailContent = emailTemplates[emailType](templateData);

            await sendEmail({
                to: candidate.email,
                subject: emailContent.subject,
                html: emailContent.html,
                replyTo: candidate.recruiter_email
            });

            // Log communication and update status
            const sendAndLog = await withClient(undefined, 'admin', async (client) => {
                await client.query('BEGIN');

                // Log email
                await client.query(`
          INSERT INTO email_communications (
            candidate_id, email_type, recipient_email, subject, body, status
          ) VALUES ($1, $2, $3, $4, $5, 'sent')
        `, [candidate.id, emailType, candidate.email, emailContent.subject, emailContent.html]);

                // Update candidate status if needed
                if (nextStatus !== targetStatus) {
                    if (talentListId) {
                        await client.query('UPDATE talent_list_candidates SET status = $1 WHERE id = $2', [nextStatus, candidate.id]);
                    } else {
                        await client.query('UPDATE candidates SET status = $1 WHERE id = $2', [nextStatus, candidate.id]);
                    }
                }

                await client.query('COMMIT');
                return true
            })

            return candidate.id;
        }));

        const successCount = results.filter(r => r.status === 'fulfilled').length;
        const failCount = results.filter(r => r.status === 'rejected').length;

        return NextResponse.json({
            message: 'Email processing complete',
            successCount,
            failCount
        });

    } catch (error) {
        console.error('Error in communicate route:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
