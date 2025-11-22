import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { verifyToken } from '@/lib/auth'
import { pool, withClient } from '@/lib/db'
import { hashPassword } from '@/lib/auth'

function requireAdmin(payload: any) {
  return payload && payload.role === 'admin'
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const cookieStore = await cookies()
    const token = cookieStore.get('auth_token')?.value
    const payload = token ? await verifyToken(token) : null
    if (!requireAdmin(payload)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }
    const { id } = await params
    const res = await withClient(payload.userId, payload.role, async (client) => client.query(
      'SELECT id, email, name, role, organization, phone, created_at, updated_at FROM public.users WHERE id = $1',
      [id]
    ))
    if (res.rows.length === 0) {
      return NextResponse.json({ error: 'Not Found' }, { status: 404 })
    }
    return NextResponse.json({ user: res.rows[0] })
  } catch (error) {
    console.error('Admin GET user error:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const cookieStore = await cookies()
    const token = cookieStore.get('auth_token')?.value
    const payload = token ? await verifyToken(token) : null
    if (!requireAdmin(payload)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }
    const { id } = await params
    const body = await request.json()
    const { email, name, role, organization, phone, password } = body

    const res = await withClient(payload.userId, payload.role, async (client) => {
      if (password) {
        const password_hash = await hashPassword(password)
        return client.query(
          `UPDATE public.users SET 
             email = COALESCE($1, email),
             name = COALESCE($2, name),
             role = COALESCE($3, role),
             organization = COALESCE($4, organization),
             phone = COALESCE($5, phone),
             password_hash = COALESCE($6, password_hash),
             updated_at = NOW()
           WHERE id = $7
           RETURNING id, email, name, role, organization, phone, created_at, updated_at`,
          [email || null, name || null, role || null, organization || null, phone || null, password_hash, id]
        )
      }
      return client.query(
        `UPDATE public.users SET 
           email = COALESCE($1, email),
           name = COALESCE($2, name),
           role = COALESCE($3, role),
           organization = COALESCE($4, organization),
           phone = COALESCE($5, phone),
           updated_at = NOW()
         WHERE id = $6
         RETURNING id, email, name, role, organization, phone, created_at, updated_at`,
        [email || null, name || null, role || null, organization || null, phone || null, id]
      )
    })
    if (res.rows.length === 0) {
      return NextResponse.json({ error: 'Not Found' }, { status: 404 })
    }
    return NextResponse.json({ user: res.rows[0] })
  } catch (error) {
    console.error('Admin PUT user error:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const cookieStore = await cookies()
    const token = cookieStore.get('auth_token')?.value
    const payload = token ? await verifyToken(token) : null
    if (!requireAdmin(payload)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }
    const { id } = await params
    const res = await withClient(payload.userId, payload.role, async (client) => client.query('DELETE FROM public.users WHERE id = $1 RETURNING id', [id]))
    if (res.rows.length === 0) {
      return NextResponse.json({ error: 'Not Found' }, { status: 404 })
    }
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Admin DELETE user error:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}