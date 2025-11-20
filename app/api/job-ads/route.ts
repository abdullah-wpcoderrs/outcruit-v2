import { NextRequest, NextResponse } from 'next/server';
import { pool } from '@/lib/db';
import { jwtVerify } from 'jose';

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET);

export async function GET(request: NextRequest) {
    try {
        const token = request.cookies.get('auth_token')?.value;
        if (!token) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { payload } = await jwtVerify(token, JWT_SECRET);
        const userId = payload.sub as string;

        const client = await pool.connect();
        try {
            const result = await client.query(
                'SELECT * FROM public.job_ads WHERE user_id = $1 ORDER BY created_at DESC',
                [userId]
            );

            return NextResponse.json(result.rows);
        } finally {
            client.release();
        }
    } catch (error) {
        console.error('Error fetching job ads:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
