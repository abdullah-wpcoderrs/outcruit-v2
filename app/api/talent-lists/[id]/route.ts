import { NextRequest, NextResponse } from 'next/server';
import { pool } from '@/lib/db';
import { verifyToken } from '@/lib/auth';

export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const token = request.cookies.get('auth_token')?.value;
        if (!token) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const payload = await verifyToken(token);
        if (!payload) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }
        const userId = (payload.userId || payload.sub) as string;
        const { id } = await params;

        const client = await pool.connect();
        try {
            const result = await client.query(
                'DELETE FROM public.talent_lists WHERE id = $1 AND user_id = $2 RETURNING *',
                [id, userId]
            );

            if (result.rows.length === 0) {
                return NextResponse.json({ error: 'Not found' }, { status: 404 });
            }

            return NextResponse.json({ success: true });
        } finally {
            client.release();
        }
    } catch (error) {
        console.error('Error deleting talent list:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

export async function PATCH(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const token = request.cookies.get('auth_token')?.value;
        if (!token) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const payload = await verifyToken(token);
        if (!payload) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }
        const userId = (payload.userId || payload.sub) as string;
        const { id } = await params;

        const body = await request.json();
        const jobTitle = typeof body.jobTitle === 'string' ? body.jobTitle.trim() : '';
        if (!jobTitle) {
            return NextResponse.json({ error: 'jobTitle is required' }, { status: 400 });
        }

        const client = await pool.connect();
        try {
            const current = await client.query('SELECT id FROM public.talent_lists WHERE id = $1 AND user_id = $2', [id, userId]);
            if (current.rows.length === 0) {
                return NextResponse.json({ error: 'Not found' }, { status: 404 });
            }
            await client.query('UPDATE public.talent_lists SET job_title = $1 WHERE id = $2', [jobTitle, id]);
            return NextResponse.json({ success: true, jobTitle });
        } finally {
            client.release();
        }
    } catch (error) {
        console.error('Error updating talent list:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}