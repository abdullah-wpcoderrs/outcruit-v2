import { NextRequest, NextResponse } from 'next/server'
import { pool } from '@/lib/db'
import { verifyToken } from '@/lib/auth'

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
    try {
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
            const listResult = await client.query('SELECT id FROM public.talent_lists WHERE id = $1 AND user_id = $2', [params.id, userId])
            if (listResult.rows.length === 0) return NextResponse.json({ items: [], page, pageSize, total: 0 }, { status: 200 })

            const filters: string[] = ['talent_list_id = $1', 'user_id = $2']
            const values: any[] = [params.id, userId]
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
                `SELECT id, row_no, name, email, phone_number, academic_qualification, residential_address, gender, role_applying_for, application_sheet_id
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
        return NextResponse.json({ items: [], page: 1, pageSize: 20, total: 0 }, { status: 500 })
    }
}
