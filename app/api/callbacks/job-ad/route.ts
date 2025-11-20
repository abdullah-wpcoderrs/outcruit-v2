import { NextRequest, NextResponse } from 'next/server';
import { pool } from '@/lib/db';

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { jobTitle, fileId, recruiterEmail } = body;

        if (!jobTitle || !fileId || !recruiterEmail) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        const client = await pool.connect();
        try {
            // Find user by email to link the record
            const userResult = await client.query('SELECT id FROM public.users WHERE email = $1', [recruiterEmail]);
            const userId = userResult.rows[0]?.id;

            // Insert into job_ads
            await client.query(
                'INSERT INTO public.job_ads (user_id, job_title, file_id) VALUES ($1, $2, $3)',
                [userId || null, jobTitle, fileId]
            );

            return NextResponse.json({ success: true });
        } finally {
            client.release();
        }
    } catch (error) {
        console.error('Error saving job ad:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
