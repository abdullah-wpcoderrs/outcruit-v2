import { google } from 'googleapis';
import nodemailer from 'nodemailer';
import fs from 'fs';
import path from 'path';

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
    // Load service account key
    const keyPath = process.env.GMAIL_SERVICE_ACCOUNT_KEY;
    if (!keyPath) {
        throw new Error('GMAIL_SERVICE_ACCOUNT_KEY env variable not set');
    }
    const keyFile = path.resolve(keyPath);
    const key = JSON.parse(fs.readFileSync(keyFile, 'utf8'));

    const scopes = ['https://www.googleapis.com/auth/gmail.send'];
    const jwt = new google.auth.JWT({ email: key.client_email, key: key.private_key, scopes });

    // Obtain access token
    const accessTokenResponse = await jwt.authorize();
    if (!accessTokenResponse.access_token) {
        throw new Error('Failed to obtain access token for Gmail API');
    }

    // Create Nodemailer transporter using OAuth2
    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            type: 'OAuth2',
            user: process.env.GMAIL_SENDER_EMAIL,
            accessToken: accessTokenResponse.access_token,
        },
    });

    // Send the email
    await transporter.sendMail({
        from: process.env.GMAIL_SENDER_EMAIL,
        to: options.to,
        subject: options.subject,
        html: options.html,
        replyTo: options.replyTo,
    });

    console.log('Email sent successfully to', options.to);
}
