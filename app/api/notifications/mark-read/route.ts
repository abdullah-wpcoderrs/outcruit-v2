import { NextResponse } from 'next/server';
import { withClient } from '@/lib/db';
import { verifyToken } from '@/lib/auth';
import { cookies } from 'next/headers';

export async function POST(request: Request) {
    try {
        const { id } = await request.json();
        const cookieStore = await cookies();
        const token = cookieStore.get('auth_token')?.value;

        if (!token) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const payload = await verifyToken(token);
        if (!payload) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const result = await withClient(payload.userId as string, payload.role as string, async (client) => {
            return client.query(
                'UPDATE notifications SET read_at = NOW() WHERE id = $1 AND user_id = $2',
                [id, payload.userId]
            )
        })

        return NextResponse.json({ success: true });
    } catch (error) {
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
