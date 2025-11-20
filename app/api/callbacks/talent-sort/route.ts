import { NextRequest, NextResponse } from 'next/server';
import { pool } from '@/lib/db';

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { jobTitle, fileId, candidateCount, recruiterEmail } = body;

        if (!jobTitle || !fileId || !recruiterEmail) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        const client = await pool.connect();
        try {
            // Find user by email
            const normalizedEmail = String(recruiterEmail).trim();
            const userResult = await client.query('SELECT id FROM public.users WHERE LOWER(email) = LOWER($1)', [normalizedEmail]);
            const userId = userResult.rows[0]?.id;

            // Insert into talent_lists
            await client.query(
                'INSERT INTO public.talent_lists (user_id, job_title, file_id, candidate_count) VALUES ($1, $2, $3, $4)',
                [userId || null, jobTitle, fileId, candidateCount || 0]
            );

            return NextResponse.json({ success: true });
        } finally {
            client.release();
        }
    } catch (error) {
        console.error('Error saving talent list:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
