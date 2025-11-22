import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { verifyToken } from '@/lib/auth';
import { pool } from '@/lib/db';

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
        // Include user's name so forms can auto-populate recruiter information from profile
        const result = await pool.query('SELECT id, email, name, created_at FROM users WHERE id = $1', [payload.userId]);
        const user = result.rows[0];
        return NextResponse.json({ user });
    } catch (error) {
        return NextResponse.json({ user: null }, { status: 500 });
    }
}
