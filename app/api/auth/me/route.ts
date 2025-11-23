import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { verifyToken } from '@/lib/auth';
import { withClient } from '@/lib/db';

export async function GET() {
    const cookieStore = await cookies();
    const token = cookieStore.get('auth_token')?.value;

    if (!token) {
        return NextResponse.json({ user: null }, { status: 401 });
    }

    const payload = await verifyToken(token);
    if (!payload) {
        return NextResponse.json({ user: null }, { status: 401 });
    }

    try {
        // Use RLS-aware client so policies can identify the current user
        const result = await withClient(payload.userId as string, payload.role as string, async (client) => {
            // Select the current user by id; RLS policy permits self-access
            return client.query('SELECT id, email, name, role, created_at FROM users WHERE id = $1', [payload.userId]);
        });

        if (result.rows.length === 0) {
            // If RLS blocks or user not found, treat as unauthorized
            return NextResponse.json({ user: null }, { status: 401 });
        }

        const user = result.rows[0];
        return NextResponse.json({ user });
    } catch (error) {
        return NextResponse.json({ user: null }, { status: 500 });
    }
}
