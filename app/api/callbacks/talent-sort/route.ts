import { NextRequest, NextResponse } from 'next/server';
import { pool } from '@/lib/db';

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { jobTitle, fileId, candidateCount, recruiterEmail, sheetUrl, applicationSheetId, candidates } = body;

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
            const listResult = await client.query(
                'INSERT INTO public.talent_lists (user_id, job_title, file_id, candidate_count, sheet_url, application_sheet_id) VALUES ($1, $2, $3, $4, $5, $6) RETURNING id',
                [userId || null, jobTitle, fileId, candidateCount || 0, sheetUrl || null, applicationSheetId || null]
            );

            const talentListId = listResult.rows[0]?.id;

            if (Array.isArray(candidates) && talentListId) {
                for (const c of candidates) {
                    await client.query(
                        `INSERT INTO public.talent_list_candidates (
                            user_id, talent_list_id, row_no, name, email, phone_number, academic_qualification, grade, age, residential_address, location, marital_status, gender, role_applying_for, cv_url, status, ai_rationale, candidate_tracker, application_sheet_id
                        ) VALUES (
                            $1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19
                        )`,
                        [
                            userId || null,
                            talentListId,
                            c.row_no || null,
                            c.name || null,
                            c.email || null,
                            c.phone_number || null,
                            c.academic_qualification || null,
                            c.grade || null,
                            c.age || null,
                            c.residential_address || null,
                            c.location || null,
                            c.marital_status || null,
                            c.gender || null,
                            c.role_applying_for || null,
                            c.cv_url || null,
                            c.status || null,
                            c.ai_rationale || null,
                            c.candidate_tracker || null,
                            c.application_sheet_id || applicationSheetId || null
                        ]
                    );
                }
            }

            return NextResponse.json({ success: true });
        } finally {
            client.release();
        }
    } catch (error) {
        console.error('Error saving talent list:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
