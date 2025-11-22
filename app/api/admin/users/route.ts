import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { verifyToken } from '@/lib/auth'
import { pool, withClient } from '@/lib/db'
import { hashPassword } from '@/lib/auth'

function requireAdmin(payload: any) {
  return payload && payload.role === 'admin'
}

export async function GET(request: NextRequest) {
  try {
    const cookieStore = await cookies()
    const token = cookieStore.get('auth_token')?.value
    const payload = token ? await verifyToken(token) : null
    if (!requireAdmin(payload)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const { searchParams } = new URL(request.url)
    const q = (searchParams.get('q') || '').trim()
    const page = Number(searchParams.get('page') || '1')
    const pageSize = Number(searchParams.get('pageSize') || '20')
    const offset = (page - 1) * pageSize

    let where = ''
    const params: any[] = []
    if (q) {
      where = `WHERE email ILIKE $1 OR COALESCE(name,'') ILIKE $1 OR COALESCE(organization,'') ILIKE $1`
      params.push(`%${q}%`)
    }

    const list = await withClient(payload.userId, payload.role, async (client) => client.query(
      `SELECT id, email, name, role, organization, phone, created_at, updated_at
       FROM public.users ${where}
       ORDER BY created_at DESC
       LIMIT $${params.length + 1} OFFSET $${params.length + 2}`,
      [...params, pageSize, offset]
    ))
    const count = await withClient(payload.userId, payload.role, async (client) => client.query(
      `SELECT COUNT(*) as count FROM public.users ${where}`,
      params
    ))

    return NextResponse.json({ users: list.rows, page, pageSize, total: Number(count.rows[0].count) })
  } catch (error) {
    console.error('Admin GET users error:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const cookieStore = await cookies()
    const token = cookieStore.get('auth_token')?.value
    const payload = token ? await verifyToken(token) : null
    if (!requireAdmin(payload)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const body = await request.json()
    const { email, password, name, role = 'user', organization, phone } = body
    if (!email || !password) {
      return NextResponse.json({ error: 'email and password required' }, { status: 400 })
    }

    const password_hash = await hashPassword(password)
    const res = await withClient(payload.userId, payload.role, async (client) => client.query(
      `INSERT INTO public.users (email, password_hash, name, role, organization, phone)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING id, email, name, role, organization, phone, created_at`,
      [email, password_hash, name || null, role, organization || null, phone || null]
    ))
    return NextResponse.json({ user: res.rows[0] }, { status: 201 })
  } catch (error) {
    console.error('Admin POST user error:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}