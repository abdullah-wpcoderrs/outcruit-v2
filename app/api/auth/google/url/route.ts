import { NextResponse } from 'next/server'
import { getAuthUrl } from '@/lib/google-oauth'

export async function GET() {
  try {
    const url = getAuthUrl()
    return NextResponse.json({ url })
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || 'OAuth not configured' }, { status: 500 })
  }
}