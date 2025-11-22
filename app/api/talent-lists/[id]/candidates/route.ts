import { NextRequest, NextResponse } from 'next/server'
import { pool } from '@/lib/db'
import { verifyToken } from '@/lib/auth'

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params
        const token = request.cookies.get('auth_token')?.value
        if (!token) return NextResponse.json({ items: [], page: 1, pageSize: 20, total: 0 }, { status: 200 })
        const payload = await verifyToken(token)
        if (!payload) return NextResponse.json({ items: [], page: 1, pageSize: 20, total: 0 }, { status: 200 })
        const userId = (payload.userId || payload.sub) as string

        const url = new URL(request.url)
        const page = Math.max(1, parseInt(url.searchParams.get('page') || '1'))
        const pageSize = Math.min(100, Math.max(1, parseInt(url.searchParams.get('pageSize') || '20')))
        const q = url.searchParams.get('q') || ''
        const gender = url.searchParams.get('gender') || ''
        const role = url.searchParams.get('role') || ''
        const status = url.searchParams.get('status') || ''

        const client = await pool.connect()
        try {
            // Ensure table exists to avoid 500 errors on fresh databases
            const tableExists = await client.query("SELECT to_regclass('public.talent_list_candidates') AS t")
            if (!tableExists.rows[0]?.t) {
                return NextResponse.json({ items: [], page, pageSize, total: 0 }, { status: 200 })
            }
            const listResult = await client.query('SELECT id FROM public.talent_lists WHERE id = $1 AND user_id = $2', [id, userId])
            if (listResult.rows.length === 0) return NextResponse.json({ items: [], page, pageSize, total: 0 }, { status: 200 })

            const filters: string[] = ['talent_list_id = $1', 'user_id = $2']
            const values: any[] = [id, userId]
            let idx = values.length

            if (q) {
                idx += 1
                filters.push(`(name ILIKE $${idx} OR email ILIKE $${idx} OR phone_number ILIKE $${idx} OR role_applying_for ILIKE $${idx} OR residential_address ILIKE $${idx})`)
                values.push(`%${q}%`)
            }
            if (gender) {
                idx += 1
                filters.push(`gender ILIKE $${idx}`)
                values.push(gender)
            }
            if (role) {
                idx += 1
                filters.push(`role_applying_for ILIKE $${idx}`)
                values.push(`%${role}%`)
            }
            if (status) {
                idx += 1
                filters.push(`status ILIKE $${idx}`)
                values.push(status)
            }

            const where = filters.length ? `WHERE ${filters.join(' AND ')}` : ''
            const countResult = await client.query(`SELECT COUNT(*)::int AS count FROM public.talent_list_candidates ${where}`, values)
            const total = countResult.rows[0]?.count || 0

            idx += 1
            const limitParam = idx
            values.push(pageSize)
            idx += 1
            const offsetParam = idx
            values.push((page - 1) * pageSize)

            const dataResult = await client.query(
                `SELECT id, row_no, name, email, phone_number, academic_qualification, residential_address, gender, role_applying_for, application_sheet_id, status, interview_date, interview_time_slot, meeting_venue_url, recruiter_name, recruiter_email
                 FROM public.talent_list_candidates ${where}
                 ORDER BY COALESCE(row_no, 0) ASC, created_at ASC
                 LIMIT $${limitParam} OFFSET $${offsetParam}`,
                values
            )

            return NextResponse.json({ items: dataResult.rows, page, pageSize, total })
        } finally {
            client.release()
        }
    } catch (e) {
        console.error('[TalentListCandidates]', e)
        return NextResponse.json({ items: [], page: 1, pageSize: 20, total: 0 }, { status: 200 })
    }
}

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const token = request.cookies.get('auth_token')?.value
        if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        const payload = await verifyToken(token)
        if (!payload) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        const userId = (payload.userId || payload.sub) as string
        const { id } = await params

        const body = await request.json()
        const { ids, id: singleId, updates } = body || {}
        if (!updates || typeof updates !== 'object') {
            return NextResponse.json({ error: 'updates object is required' }, { status: 400 })
        }

        const client = await pool.connect()
        try {
            // Ensure list belongs to user
            const listResult = await client.query('SELECT id FROM public.talent_lists WHERE id = $1 AND user_id = $2', [id, userId])
            if (listResult.rows.length === 0) return NextResponse.json({ error: 'Not found' }, { status: 404 })

            // Build dynamic update
            const allowed = ['status', 'name', 'email', 'phone_number', 'academic_qualification', 'residential_address', 'gender', 'role_applying_for', 'interview_date', 'interview_time_slot', 'meeting_venue_url', 'recruiter_name', 'recruiter_email']
            const fields: string[] = []
            const values: any[] = []
            let idx = 1
            for (const key of allowed) {
                if (updates[key] !== undefined) {
                    fields.push(`${key} = $${idx++}`)
                    values.push(updates[key])
                }
            }
            if (fields.length === 0) return NextResponse.json({ error: 'No valid fields to update' }, { status: 400 })

            // Determine target IDs
            let targetIds: string[] = []
            if (Array.isArray(ids) && ids.length) targetIds = ids
            else if (typeof singleId === 'string' && singleId) targetIds = [singleId]
            else return NextResponse.json({ error: 'ids or id required' }, { status: 400 })

            const placeholders = targetIds.map((_, i) => `$${idx + i}`).join(', ')
            const query = `UPDATE public.talent_list_candidates SET ${fields.join(', ')} WHERE talent_list_id = $${idx + targetIds.length + 1} AND id IN (${placeholders}) AND user_id = $${idx + targetIds.length + 2}`

            await client.query(query, [...values, ...targetIds, id, userId])
            return NextResponse.json({ success: true, updated: targetIds.length })
        } finally {
            client.release()
        }
    } catch (e) {
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
    }
}
