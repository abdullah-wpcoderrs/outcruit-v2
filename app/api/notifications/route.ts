import { NextRequest, NextResponse } from 'next/server';
import { withClient } from '@/lib/db';
import { verifyToken } from '@/lib/auth';

export async function GET(request: NextRequest) {
    try {
        const token = request.cookies.get('auth_token')?.value;
        if (!token) {
            return NextResponse.json({ notifications: [] }, { status: 200 });
        }

        const payload = await verifyToken(token);
        if (!payload) {
            return NextResponse.json({ notifications: [] }, { status: 200 });
        }
        const userId = (payload.userId || payload.sub) as string;

        const result = await withClient(userId, payload.role as string, async (client) => {
            return client.query(
                'SELECT id, type, message, job_name, recruiter_name, recruiter_email, created_at, read_at FROM notifications WHERE user_id = $1 ORDER BY created_at DESC LIMIT 100',
                [userId]
            );
        });
        return NextResponse.json({ notifications: result.rows });
    } catch (error) {
        return NextResponse.json({ notifications: [] }, { status: 500 });
    }
}