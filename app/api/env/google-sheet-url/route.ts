import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  // Read the tracker sheet URL from server environment for client consumption
  const url = process.env.GOOGLE_SHEET_JDTRACKER_URL || process.env.NEXT_PUBLIC_GOOGLE_SHEET_JDTRACKER_URL || ''
  if (!url) {
    return NextResponse.json({ error: 'Not configured' }, { status: 404 })
  }
  return NextResponse.json({ url })
}