import { NextRequest, NextResponse } from 'next/server';
import { pool } from '@/lib/db';
import { jwtVerify } from 'jose';

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET);

// GET - Fetch single tracker
export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const token = request.cookies.get('auth_token')?.value;
        if (!token) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { payload } = await jwtVerify(token, JWT_SECRET);
        const userId = (payload.userId || payload.sub) as string;
        const { id: trackerId } = await params;

        const client = await pool.connect();
        try {
            const result = await client.query(
                'SELECT * FROM public.job_trackers WHERE id = $1 AND user_id = $2',
                [trackerId, userId]
            );

            if (result.rows.length === 0) {
                return NextResponse.json({ error: 'Tracker not found' }, { status: 404 });
            }

            return NextResponse.json(result.rows[0]);
        } finally {
            client.release();
        }
    } catch (error) {
        console.error('Error fetching tracker:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

// PATCH - Update tracker
export async function PATCH(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const token = request.cookies.get('auth_token')?.value;
        if (!token) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { payload } = await jwtVerify(token, JWT_SECRET);
        const userId = (payload.userId || payload.sub) as string;
        const { id: trackerId } = await params;

        const body = await request.json();
        const { brief_name, status, recruiter_email, role_name, application_sheet_id } = body;

        // Validate status if provided
        if (status && !['Active', 'Not Active'].includes(status)) {
            return NextResponse.json({ error: 'Invalid status value' }, { status: 400 });
        }

        const client = await pool.connect();
        try {
            // Build dynamic update query
            const updates: string[] = [];
            const values: any[] = [];
            let paramCount = 1;

            if (brief_name !== undefined) {
                updates.push(`brief_name = $${paramCount++}`);
                values.push(brief_name);
            }
            if (status !== undefined) {
                updates.push(`status = $${paramCount++}`);
                values.push(status);
            }
            if (recruiter_email !== undefined) {
                updates.push(`recruiter_email = $${paramCount++}`);
                values.push(recruiter_email);
            }
            if (role_name !== undefined) {
                updates.push(`role_name = $${paramCount++}`);
                values.push(role_name);
            }
            if (application_sheet_id !== undefined) {
                updates.push(`application_sheet_id = $${paramCount++}`);
                values.push(application_sheet_id);
            }

            if (updates.length === 0) {
                return NextResponse.json({ error: 'No fields to update' }, { status: 400 });
            }

            values.push(trackerId, userId);

            const result = await client.query(
                `UPDATE public.job_trackers 
                 SET ${updates.join(', ')} 
                 WHERE id = $${paramCount} AND user_id = $${paramCount + 1}
                 RETURNING *`,
                values
            );

            if (result.rows.length === 0) {
                return NextResponse.json({ error: 'Tracker not found' }, { status: 404 });
            }

            // If status was changed, trigger webhook to n8n (if configured)
            if (status && process.env.STATUS_TRACKER_N8N_WEBHOOK_URL) {
                try {
                    const webhookPayload: any = {
                        tracker_id: trackerId,
                        status: status,
                        row_no: result.rows[0].row_no,
                        application_sheet_id: result.rows[0].application_sheet_id,
                        brief_name: result.rows[0].brief_name,
                        role_name: result.rows[0].role_name,
                        recruiter_email: result.rows[0].recruiter_email
                    };

                    await fetch(process.env.STATUS_TRACKER_N8N_WEBHOOK_URL, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(webhookPayload)
                    });
                } catch (webhookError) {
                    console.error('[Tracker API] Webhook error:', webhookError);
                    // Don't fail the request if webhook fails
                }
            }

            return NextResponse.json(result.rows[0]);
        } finally {
            client.release();
        }
    } catch (error) {
        console.error('Error updating tracker:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

// DELETE - Delete single tracker
export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const token = request.cookies.get('auth_token')?.value;
        if (!token) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { payload } = await jwtVerify(token, JWT_SECRET);
        const userId = (payload.userId || payload.sub) as string;
        const { id: trackerId } = await params;

        const client = await pool.connect();
        try {
            const result = await client.query(
                'DELETE FROM public.job_trackers WHERE id = $1 AND user_id = $2 RETURNING *',
                [trackerId, userId]
            );

            if (result.rows.length === 0) {
                return NextResponse.json({ error: 'Tracker not found' }, { status: 404 });
            }

            return NextResponse.json({ success: true, deleted: result.rows[0] });
        } finally {
            client.release();
        }
    } catch (error) {
        console.error('Error deleting tracker:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
