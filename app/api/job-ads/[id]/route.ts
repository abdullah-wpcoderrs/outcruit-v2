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
                'DELETE FROM public.job_ads WHERE id = $1 AND user_id = $2 RETURNING *',
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
        console.error('Error deleting job ad:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}