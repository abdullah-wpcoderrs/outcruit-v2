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
        // Get user profile data
        const userResult = await pool.query(
            'SELECT id, email, name, avatar_url, organization, phone, created_at, last_login FROM users WHERE id = $1',
            [payload.userId]
        );

        if (userResult.rows.length === 0) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        const user = userResult.rows[0];

        // Get statistics
        const [jobAdsResult, talentListsResult, trackersResult, notificationsResult] = await Promise.all([
            pool.query('SELECT COUNT(*) as count FROM job_ads WHERE user_id = $1', [payload.userId]),
            pool.query('SELECT COUNT(*) as count FROM talent_lists WHERE user_id = $1', [payload.userId]),
            pool.query('SELECT COUNT(*) as count FROM job_trackers WHERE user_id = $1', [payload.userId]),
            pool.query('SELECT COUNT(*) as count FROM notifications WHERE user_id = $1', [payload.userId])
        ]);

        const stats = {
            job_ads: parseInt(jobAdsResult.rows[0].count),
            talent_lists: parseInt(talentListsResult.rows[0].count),
            trackers: parseInt(trackersResult.rows[0].count),
            notifications: parseInt(notificationsResult.rows[0].count)
        };

        return NextResponse.json({ user, stats });
    } catch (error) {
        console.error('Error fetching profile:', error);
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
        const { name, organization, phone } = body;

        const result = await pool.query(
            'UPDATE users SET name = $1, organization = $2, phone = $3, updated_at = NOW() WHERE id = $4 RETURNING id, email, name, avatar_url, organization, phone, created_at',
            [name, organization, phone, payload.userId]
        );

        if (result.rows.length === 0) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        return NextResponse.json({ user: result.rows[0] });
    } catch (error) {
        console.error('Error updating profile:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
