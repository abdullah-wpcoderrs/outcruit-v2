import { google } from 'googleapis'

export function getOAuthClient() {
  const clientId = process.env.GOOGLE_CLIENT_ID || ''
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET || ''
  const redirectUri = process.env.GOOGLE_REDIRECT_URI || ''
  if (!clientId || !clientSecret || !redirectUri) {
    throw new Error('Google OAuth env vars missing: GOOGLE_CLIENT_ID/SECRET/REDIRECT_URI')
  }
  return new google.auth.OAuth2(clientId, clientSecret, redirectUri)
}

export function getAuthUrl() {
  const oAuth2Client = getOAuthClient()
  const scopes = ['https://www.googleapis.com/auth/gmail.send']
  return oAuth2Client.generateAuthUrl({
    access_type: 'offline',
    prompt: 'consent',
    scope: scopes
  })
}