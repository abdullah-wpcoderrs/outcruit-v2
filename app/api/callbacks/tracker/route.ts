import { NextRequest, NextResponse } from 'next/server';
import { pool } from '@/lib/db';

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const {
            briefName,
            status,
            recruiterEmail,
            additionalRequirements,
            roleName,
            requiredSkills,
            educationLevel,
            locationReqs,
            aiBriefText,
            applicationSheetId,
            recruitmentType,
            grade,
            age
        } = body;

        const client = await pool.connect();
        try {
            // Find user by email
            const userResult = await client.query('SELECT id FROM public.users WHERE email = $1', [recruiterEmail]);
            const userId = userResult.rows[0]?.id;

            // Insert into job_trackers
            await client.query(
                `INSERT INTO public.job_trackers (
          user_id, brief_name, status, recruiter_email, additional_requirements, 
          role_name, required_skills, education_level, location_reqs, ai_brief_text, 
          application_sheet_id, recruitment_type, grade, age
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)`,
                [
                    userId || null, briefName, status, recruiterEmail, additionalRequirements,
                    roleName, requiredSkills, educationLevel, locationReqs, aiBriefText,
                    applicationSheetId, recruitmentType, grade, age
                ]
            );

            return NextResponse.json({ success: true });
        } finally {
            client.release();
        }
    } catch (error) {
        console.error('Error saving tracker data:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
