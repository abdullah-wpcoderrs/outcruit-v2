import { NextRequest, NextResponse } from 'next/server';
import { pool } from '@/lib/db';
import { verifyToken } from '@/lib/auth';

export async function GET(request: NextRequest) {
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

        const client = await pool.connect();
        try {
            const result = await client.query(
                'SELECT * FROM public.talent_lists WHERE user_id = $1 ORDER BY created_at DESC',
                [userId]
            );

            return NextResponse.json(result.rows);
        } finally {
            client.release();
        }
    } catch (error) {
        console.error('Error fetching talent lists:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
