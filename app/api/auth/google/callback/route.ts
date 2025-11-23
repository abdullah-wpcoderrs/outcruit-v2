import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { verifyToken } from '@/lib/auth'
import { withClient } from '@/lib/db'
import { getOAuthClient } from '@/lib/google-oauth'

export async function GET(request: NextRequest) {
  try {
    const cookieStore = await cookies()
    const token = cookieStore.get('auth_token')?.value
    const payload = token ? await verifyToken(token) : null
    if (!payload) {
      return NextResponse.redirect(new URL('/profile?gmail=auth_required', request.url))
    }

    const url = new URL(request.url)
    const code = url.searchParams.get('code') || ''
    const oAuth2Client = getOAuthClient()
    const { tokens } = await oAuth2Client.getToken(code)
    if (!tokens?.refresh_token && !tokens?.access_token) {
      return NextResponse.redirect(new URL('/settings?gmail=failed', request.url))
    }

    const scope = tokens.scope || 'https://www.googleapis.com/auth/gmail.send'
    const expiryDate = tokens.expiry_date ? new Date(tokens.expiry_date) : null

    await withClient(payload.userId as string, payload.role as string, async (client) => {
      await client.query(
        `INSERT INTO public.user_google_tokens (user_id, user_email, provider, access_token, refresh_token, scope, expiry_date, created_at, updated_at)
         VALUES ($1, $2, 'google', $3, $4, $5, $6, NOW(), NOW())
         ON CONFLICT (user_id) DO UPDATE SET access_token = EXCLUDED.access_token, refresh_token = EXCLUDED.refresh_token, scope = EXCLUDED.scope, expiry_date = EXCLUDED.expiry_date, updated_at = NOW()`,
        [payload.userId, payload.email || payload.userEmail || '', tokens.access_token || '', tokens.refresh_token || '', scope, expiryDate]
      )
    })

    return NextResponse.redirect(new URL('/settings?gmail=connected', request.url))
  } catch (e) {
    return NextResponse.redirect(new URL('/settings?gmail=error', request.url))
  }
}