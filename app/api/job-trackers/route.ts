import { NextRequest, NextResponse } from 'next/server';
import { pool } from '@/lib/db';

export async function GET() {
    try {
        const result = await pool.query(
            'SELECT id, role_name, brief_name FROM job_trackers ORDER BY created_at DESC'
        );
        return NextResponse.json(result.rows);
    } catch (error) {
        console.error('Error fetching job trackers:', error);
        return NextResponse.json({ error: (error as Error).message }, { status: 500 });
    }
}
