import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { verifyToken } from '@/lib/auth';
import { pool } from '@/lib/db';

export async function GET() {
    const cookieStore = await cookies();
    const token = cookieStore.get('auth_token')?.value;

    if (!token) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const payload = await verifyToken(token);
    if (!payload) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const result = await pool.query(
            'SELECT preferences FROM users WHERE id = $1',
            [payload.userId]
        );

        if (result.rows.length === 0) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        const preferences = result.rows[0].preferences || {
            notifications: {
                job_ads: true,
                talent_sorting: true,
                jd_tracker: true,
                email_notifications: true
            },
            appearance: {
                theme: 'system',
                density: 'comfortable'
            }
        };

        return NextResponse.json({ preferences });
    } catch (error) {
        console.error('Error fetching settings:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

export async function PUT(request: Request) {
    const cookieStore = await cookies();
    const token = cookieStore.get('auth_token')?.value;

    if (!token) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const payload = await verifyToken(token);
    if (!payload) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const body = await request.json();
        const { preferences } = body;

        const result = await pool.query(
            'UPDATE users SET preferences = $1, updated_at = NOW() WHERE id = $2 RETURNING preferences',
            [JSON.stringify(preferences), payload.userId]
        );

        if (result.rows.length === 0) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        return NextResponse.json({ preferences: result.rows[0].preferences });
    } catch (error) {
        console.error('Error updating settings:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
