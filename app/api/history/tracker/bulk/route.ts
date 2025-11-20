import { NextRequest, NextResponse } from 'next/server';
import { pool } from '@/lib/db';
import { jwtVerify } from 'jose';

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET);

export async function POST(request: NextRequest) {
    try {
        const token = request.cookies.get('auth_token')?.value;
        if (!token) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { payload } = await jwtVerify(token, JWT_SECRET);
        const userId = (payload.userId || payload.sub) as string;

        const body = await request.json();
        const { action, tracker_ids, data } = body;

        if (!action || !tracker_ids || !Array.isArray(tracker_ids)) {
            return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
        }

        if (tracker_ids.length === 0) {
            return NextResponse.json({ error: 'No tracker IDs provided' }, { status: 400 });
        }

        const client = await pool.connect();
        try {
            await client.query('BEGIN');

            let result;
            const results: any[] = [];

            switch (action) {
                case 'delete':
                    // Delete all selected trackers
                    for (const trackerId of tracker_ids) {
                        const deleteResult = await client.query(
                            'DELETE FROM public.job_trackers WHERE id = $1 AND user_id = $2 RETURNING id',
                            [trackerId, userId]
                        );
                        results.push({
                            id: trackerId,
                            success: deleteResult.rows.length > 0,
                            error: deleteResult.rows.length === 0 ? 'Not found or unauthorized' : null
                        });
                    }
                    break;

                case 'update_status':
                    // Validate status
                    if (!data?.status || !['Active', 'Not Active'].includes(data.status)) {
                        await client.query('ROLLBACK');
                        return NextResponse.json({ error: 'Invalid status value' }, { status: 400 });
                    }

                    // Update status for all selected trackers
                    const bulkUpdates: any[] = [];
                    for (const trackerId of tracker_ids) {
                        const updateResult = await client.query(
                            'UPDATE public.job_trackers SET status = $1 WHERE id = $2 AND user_id = $3 RETURNING *',
                            [data.status, trackerId, userId]
                        );

                        if (updateResult.rows.length > 0) {
                            results.push({
                                id: trackerId,
                                success: true,
                                data: updateResult.rows[0]
                            });

                            // Collect data for bulk webhook
                            bulkUpdates.push({
                                tracker_id: trackerId,
                                status: data.status,
                                row_no: updateResult.rows[0].row_no,
                                application_sheet_id: updateResult.rows[0].application_sheet_id,
                                brief_name: updateResult.rows[0].brief_name,
                                role_name: updateResult.rows[0].role_name,
                                recruiter_email: updateResult.rows[0].recruiter_email
                            });
                        } else {
                            results.push({
                                id: trackerId,
                                success: false,
                                error: 'Not found or unauthorized'
                            });
                        }
                    }

                    // Send single webhook with all updates
                    if (bulkUpdates.length > 0 && process.env.STATUS_TRACKER_N8N_WEBHOOK_URL) {
                        try {
                            const webhookPayload = {
                                type: 'bulk-edit',
                                updates: bulkUpdates,
                                count: bulkUpdates.length
                            };

                            await fetch(process.env.STATUS_TRACKER_N8N_WEBHOOK_URL, {
                                method: 'POST',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify(webhookPayload)
                            });
                        } catch (webhookError) {
                            console.error('[Bulk API] Webhook error:', webhookError);
                        }
                    }
                    break;

                case 'update_fields':
                    // Validate data
                    if (!data) {
                        await client.query('ROLLBACK');
                        return NextResponse.json({ error: 'No data provided for update' }, { status: 400 });
                    }

                    // Validate status if provided
                    if (data.status && !['Active', 'Not Active'].includes(data.status)) {
                        await client.query('ROLLBACK');
                        return NextResponse.json({ error: 'Invalid status value' }, { status: 400 });
                    }

                    // Build dynamic update query
                    const updates: string[] = [];
                    const updateFields: any[] = [];
                    let paramCount = 1;

                    if (data.brief_name !== undefined) {
                        updates.push(`brief_name = $${paramCount++}`);
                        updateFields.push(data.brief_name);
                    }
                    if (data.status !== undefined) {
                        updates.push(`status = $${paramCount++}`);
                        updateFields.push(data.status);
                    }
                    if (data.recruiter_email !== undefined) {
                        updates.push(`recruiter_email = $${paramCount++}`);
                        updateFields.push(data.recruiter_email);
                    }
                    if (data.role_name !== undefined) {
                        updates.push(`role_name = $${paramCount++}`);
                        updateFields.push(data.role_name);
                    }
                    if (data.application_sheet_id !== undefined) {
                        updates.push(`application_sheet_id = $${paramCount++}`);
                        updateFields.push(data.application_sheet_id);
                    }

                    if (updates.length === 0) {
                        await client.query('ROLLBACK');
                        return NextResponse.json({ error: 'No fields to update' }, { status: 400 });
                    }

                    // Update each tracker
                    for (const trackerId of tracker_ids) {
                        const values = [...updateFields, trackerId, userId];
                        const updateResult = await client.query(
                            `UPDATE public.job_trackers 
                             SET ${updates.join(', ')} 
                             WHERE id = $${paramCount} AND user_id = $${paramCount + 1}
                             RETURNING *`,
                            values
                        );

                        results.push({
                            id: trackerId,
                            success: updateResult.rows.length > 0,
                            data: updateResult.rows[0] || null,
                            error: updateResult.rows.length === 0 ? 'Not found or unauthorized' : null
                        });
                    }
                    break;

                default:
                    await client.query('ROLLBACK');
                    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
            }

            await client.query('COMMIT');

            return NextResponse.json({
                success: true,
                results,
                summary: {
                    total: tracker_ids.length,
                    succeeded: results.filter(r => r.success).length,
                    failed: results.filter(r => !r.success).length
                }
            });

        } catch (error) {
            await client.query('ROLLBACK');
            throw error;
        } finally {
            client.release();
        }
    } catch (error) {
        console.error('Error in bulk operation:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
