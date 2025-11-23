import { NextRequest, NextResponse } from 'next/server';
import { withClient } from '@/lib/db';

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const briefName = body.briefName ?? body.Brief_Name ?? body.brief_name ?? ''
        const status = body.status ?? body.Status ?? ''
        const recruiterEmail = body.recruiterEmail ?? body.Recruiter_Email ?? ''
        let roleName = body.roleName ?? body.Role_Name ?? ''
        let applicationSheetId = body.applicationSheetId ?? body.Application_Sheet_ID ?? ''
        const rowNoRaw = body.rowNo ?? body.row_no ?? null
        const gradeRaw = body.grade ?? body.Grade ?? null
        const incomingUserId = body.userId ?? body.UserId ?? body.user_id ?? ''

        const bn = String(briefName).trim()
        const st = String(status).trim()
        const re = String(recruiterEmail).trim()
        if (!bn || !st || !re) {
            return NextResponse.json({ error: 'Missing required fields: briefName, status, recruiterEmail' }, { status: 400 })
        }
        roleName = String(roleName).trim() || bn
        const asId = String(applicationSheetId || '').trim()
        if (!asId) {
            return NextResponse.json({ error: 'Missing required field: applicationSheetId' }, { status: 400 })
        }

        const normalizedEmail = String(recruiterEmail || '').trim();
        const rowNo = (() => {
            const r = rowNoRaw
            if (r === null || r === undefined || r === '') return null
            const n = parseInt(String(r), 10)
            return Number.isFinite(n) ? n : null
        })()
        const gradeVal = (() => {
            const g = gradeRaw
            if (g === null || g === undefined) return null
            const s = String(g).trim()
            return s || null
        })()
        const trackerStatus = ['Active', 'Not Active'].includes(String(status).trim()) ? String(status).trim() : 'Active'

        // Prefer userId from payload; fallback to lookup by email when missing
        const resolvedUserId = await (async () => {
            if (incomingUserId && String(incomingUserId).trim() !== '') {
                return String(incomingUserId).trim();
            }
            const res = await withClient(undefined, 'admin', async (client) => {
                return client.query('SELECT id FROM public.users WHERE LOWER(email) = LOWER($1)', [normalizedEmail]);
            });
            return res.rows[0]?.id || null;
        })();

        // Insert under RLS by setting session claims; if we have a userId, use role 'user'
        // otherwise insert as admin (rare, but preserves behavior)
        const roleForInsert = resolvedUserId ? 'user' : 'admin';

        await withClient(resolvedUserId || undefined, roleForInsert, async (client) => {
            const cols: string[] = ['user_id','brief_name','status','recruiter_email','role_name','application_sheet_id']
            const vals: any[] = [resolvedUserId, bn, trackerStatus, re, roleName, asId]
            try {
                const res = await client.query(
                    `select column_name from information_schema.columns where table_schema='public' and table_name='job_trackers' and column_name in ('row_no','grade')`
                )
                const names = res.rows.map((r: any) => r.column_name)
                if (names.includes('row_no')) {
                    cols.push('row_no')
                    vals.push(rowNo)
                }
                if (names.includes('grade')) {
                    cols.push('grade')
                    vals.push(gradeVal)
                }
            } catch {}
            const placeholders = cols.map((_, i) => `$${i+1}`).join(', ')
            await client.query(
                `INSERT INTO public.job_trackers (${cols.join(', ')}) VALUES (${placeholders})`,
                vals
            )
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error saving tracker data:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
