import { google } from 'googleapis';
import nodemailer from 'nodemailer';
import fs from 'fs';
import path from 'path';
import { pool } from '@/lib/db';
import { getOAuthClient } from '@/lib/google-oauth';

export interface EmailOptions {
    to: string;
    subject: string;
    html: string;
    replyTo?: string;
}

/**
 * Sends an email using Gmail API via a Service Account.
 * Requires the following environment variables:
 *   GMAIL_SERVICE_ACCOUNT_KEY - path to the JSON key file
 *   GMAIL_SENDER_EMAIL - the Gmail address to send from
 */
export async function sendEmail(options: EmailOptions): Promise<void> {
    // Try sending as connected user (OAuth) if we find a token for replyTo
    const replyToEmail = options.replyTo || ''
    let usedOAuthUser = false
    if (replyToEmail) {
        const res = await pool.query('SELECT user_email, refresh_token FROM public.user_google_tokens WHERE user_email = $1', [replyToEmail])
        const row = res.rows[0]
        if (row?.refresh_token) {
            const oAuth2Client = getOAuthClient()
            oAuth2Client.setCredentials({ refresh_token: row.refresh_token })
            const accessTokenObj = await oAuth2Client.getAccessToken()
            const accessToken = typeof accessTokenObj === 'string' ? accessTokenObj : accessTokenObj?.token
            if (accessToken) {
                const transporter = nodemailer.createTransport({
                    service: 'gmail',
                    auth: {
                        type: 'OAuth2',
                        user: row.user_email,
                        accessToken,
                    },
                })
                await transporter.sendMail({
                    from: row.user_email,
                    to: options.to,
                    subject: options.subject,
                    html: options.html,
                    replyTo: options.replyTo,
                })
                usedOAuthUser = true
            }
        }
    }

    if (usedOAuthUser) {
        return
    }

    // Fallback to organization Service Account sender
    const keyPath = process.env.GMAIL_SERVICE_ACCOUNT_KEY;
    if (!keyPath) {
        throw new Error('GMAIL_SERVICE_ACCOUNT_KEY env variable not set');
    }
    const keyFile = path.resolve(keyPath);
    const key = JSON.parse(fs.readFileSync(keyFile, 'utf8'));

    const scopes = ['https://www.googleapis.com/auth/gmail.send'];
    const jwt = new google.auth.JWT({ email: key.client_email, key: key.private_key, scopes });

    const accessTokenResponse = await jwt.authorize();
    if (!accessTokenResponse.access_token) {
        throw new Error('Failed to obtain access token for Gmail API');
    }

    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            type: 'OAuth2',
            user: process.env.GMAIL_SENDER_EMAIL,
            accessToken: accessTokenResponse.access_token,
        },
    });

    await transporter.sendMail({
        from: process.env.GMAIL_SENDER_EMAIL,
        to: options.to,
        subject: options.subject,
        html: options.html,
        replyTo: options.replyTo,
    });
}
