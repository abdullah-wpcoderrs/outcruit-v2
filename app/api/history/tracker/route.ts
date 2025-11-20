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
        const userId = (payload.userId || payload.sub) as string;

        const client = await pool.connect();
        try {
            const result = await client.query(
                `SELECT id, brief_name, status, recruiter_email, role_name, application_sheet_id, row_no, created_at, updated_at 
                 FROM public.job_trackers 
                 WHERE user_id = $1 
                 ORDER BY created_at DESC`,
                [userId]
            );
            return NextResponse.json(result.rows);
        } finally {
            client.release();
        }
    } catch (error) {
        console.error('Error fetching tracker history:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

// POST - Create new tracker
export async function POST(request: NextRequest) {
    try {
        const token = request.cookies.get('auth_token')?.value;
        if (!token) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { payload } = await jwtVerify(token, JWT_SECRET);
        const userId = (payload.userId || payload.sub) as string;

        const body = await request.json();
        const { brief_name, status, recruiter_email, role_name, application_sheet_id } = body;

        // Validate required fields
        if (!brief_name || !recruiter_email || !role_name || !application_sheet_id) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        // Validate status
        const trackerStatus = status || 'Active';
        if (!['Active', 'Not Active'].includes(trackerStatus)) {
            return NextResponse.json({ error: 'Invalid status value' }, { status: 400 });
        }

        const client = await pool.connect();
        try {
            const result = await client.query(
                `INSERT INTO public.job_trackers (user_id, brief_name, status, recruiter_email, role_name, application_sheet_id)
                 VALUES ($1, $2, $3, $4, $5, $6)
                 RETURNING *`,
                [userId, brief_name, trackerStatus, recruiter_email, role_name, application_sheet_id]
            );

            return NextResponse.json(result.rows[0], { status: 201 });
        } finally {
            client.release();
        }
    } catch (error) {
        console.error('Error creating tracker:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
