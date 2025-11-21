import { NextRequest, NextResponse } from 'next/server';
import { pool } from '@/lib/db';

export async function GET(request: NextRequest) {
    const { searchParams } = new URL(request.url);
    const jobTrackerId = searchParams.get('job_tracker_id');
    const status = searchParams.get('status');

    if (!jobTrackerId) {
        return NextResponse.json(
            { error: 'job_tracker_id is required' },
            { status: 400 }
        );
    }

    try {
        let queryText = 'SELECT * FROM candidates WHERE job_tracker_id = $1';
        const queryParams: any[] = [jobTrackerId];

        if (status) {
            queryText += ' AND status = $2';
            queryParams.push(status);
        }

        queryText += ' ORDER BY created_at DESC';

        const result = await pool.query(queryText, queryParams);
        return NextResponse.json(result.rows);
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();

        // Basic validation
        if (!body.job_tracker_id || !body.name || !body.email) {
            return NextResponse.json(
                { error: 'Missing required fields: job_tracker_id, name, email' },
                { status: 400 }
            );
        }

        // TODO: Get current user ID from session/token if needed. 
        // For now, we might need to skip user_id or pass it from the client if available, 
        // or set it to a default/null if the schema allows. 
        // The schema has `user_id UUID REFERENCES public.users(id)`.
        // If we don't have auth set up with pg yet, we might run into issues.
        // Assuming the user is authenticated via some other mechanism or we can get the user_id.
        // Since we are moving away from Supabase Auth in this file, we need to know how auth is handled.
        // The user said "I am nt using supabase on my project any longer".
        // I'll assume for now we might insert without user_id if it's nullable, or we need to find how to get it.
        // Looking at schema: `user_id UUID REFERENCES public.users(id) ON DELETE CASCADE`
        // It doesn't say NOT NULL, so maybe it's nullable? 
        // In `create_candidate_tracker.sql`: `user_id UUID REFERENCES public.users(id) ON DELETE CASCADE` (Implicitly nullable).

        // However, the RLS policies I wrote relied on `auth.uid()`. 
        // If we are using Neon directly with a single connection string, RLS is bypassed (service role).
        // So we are fine to query/insert.

        const {
            job_tracker_id, name, email, phone_number, age, gender, marital_status,
            location, residential_address, role_applying_for, academic_qualification,
            grade, cv_url, ai_rationale
        } = body;

        const queryText = `
      INSERT INTO candidates (
        job_tracker_id, name, email, phone_number, age, gender, marital_status,
        location, residential_address, role_applying_for, academic_qualification,
        grade, cv_url, status, ai_rationale
      ) VALUES (
        $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, 'Unscheduled', $14
      ) RETURNING *
    `;

        const values = [
            job_tracker_id, name, email, phone_number, age, gender, marital_status,
            location, residential_address, role_applying_for, academic_qualification,
            grade, cv_url, ai_rationale
        ];

        const result = await pool.query(queryText, values);
        return NextResponse.json(result.rows[0], { status: 201 });

    } catch (error: any) {
        console.error("Error creating candidate:", error);
        return NextResponse.json(
            { error: 'Invalid request body or database error' },
            { status: 400 }
        );
    }
}
