Verification: Candidate Integration
Goal
Verify that the new Candidate Management system works correctly with Neon DB.

Test Scenarios
1. API Connectivity & Data Access
 Fetch Job Trackers (GET /api/job-trackers)
 Ensure connection to Neon DB is successful.
2. Candidate Management
 Create a new Candidate (POST /api/candidates)
 Verify Candidate appears in list (GET /api/candidates)
3. Smart Scheduler
 Trigger Scheduler (POST /api/candidates/schedule)
 Verify Candidate status updates to 'Scheduled'
 Verify Batch and Interview Date assigned
4. Email Communication
 Trigger Email (POST /api/candidates/communicate)
 Verify Email Log created
 Verify Candidate status updates (if applicable)
Automated Verification Script
Executed 
verify-flow.js
 successfully.

Output:

🚀 Starting Verification...
1. Fetching Job Trackers...
✅ Found 1 trackers. Using ID: e0ab4fe8-9c3c-4d4d-8417-8a40f8ce1074
2. Creating Test Candidate...
✅ Created Candidate: Test Candidate (e1fd32a5-a914-4862-a1a4-2d6fe2315dce)
3. Scheduling Interview...
✅ Scheduled 1 candidates.
4. Sending Interview Email...
✅ Emails Processed: 1 sent.
✨ Verification Complete! All systems go.
Gmail Service Account Setup Guide (Layman's Terms)
Why a Service Account?
A Service Account lets your server send emails on behalf of your app without needing a real user to log in each time. Think of it as a special robot user that has permission to use the Gmail API.

Step‑by‑Step Instructions
Create a Google Cloud Project

Go to the Google Cloud Console.
Click "Select a project" → "New Project".
Give it a name like Outcruit Email Service and click Create.
Enable the Gmail API

In the left sidebar, select APIs & Services → Library.
Search for "Gmail API" and click Enable.
Create a Service Account

Navigate to APIs & Services → Credentials.
Click "Create Credentials" → Service account.
Fill in a name (e.g., outcruit-email-bot) and click Create.
In the next step you can skip granting roles – the default is fine for now. Click Done.
Generate a JSON Key

In the Service Accounts list, find the one you just created and click the three‑dot menu → "Manage keys".
Click "Add key" → Create new key → JSON → Create.
A file like outcruit-email-bot-12345.json will download. Keep this file safe! It contains the private credentials.
Give the Service Account Gmail Access

Open the downloaded JSON file and note the client_email value (something like outcruit-email-bot@your-project.iam.gserviceaccount.com).
Go to the Gmail account you want the app to send from (e.g., yourcompany@gmail.com).
Open Gmail → Settings → Accounts and Import → Grant access to your account.
Add the client_email as a delegated user. Google will send an email to confirm – accept it.
Alternatively, if you control a G Suite domain, you can enable Domain‑wide delegation in the Service Account settings and grant the scope https://www.googleapis.com/auth/gmail.send.
Add the Key to Your Project

Place the JSON file somewhere safe in your project, e.g., config/gmail-service-account.json.
Add the path to your 
.env
 file:
GMAIL_SERVICE_ACCOUNT_KEY=./config/gmail-service-account.json
Also add the email address you will send from:
GMAIL_SENDER_EMAIL=yourcompany@gmail.com
Install Required Packages (already done)

We installed googleapis and nodemailer. The code in 
lib/email-service.ts
 will use googleapis to obtain an access token from the service account and nodemailer to actually send the email.
Update the Email Sending Logic (already a placeholder)

In 
lib/email-service.ts
 replace the simulated send with something like:
import { google } from 'googleapis';
import nodemailer from 'nodemailer';
import path from 'path';
import fs from 'fs';
const key = JSON.parse(fs.readFileSync(process.env.GMAIL_SERVICE_ACCOUNT_KEY!, 'utf8'));
const scopes = ['https://www.googleapis.com/auth/gmail.send'];
const jwt = new google.auth.JWT(key.client_email, undefined, key.private_key, scopes);
const accessToken = await jwt.getAccessToken();
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    type: 'OAuth2',
    user: process.env.GMAIL_SENDER_EMAIL,
    accessToken: accessToken.token,
  },
});
await transporter.sendMail({
  from: process.env.GMAIL_SENDER_EMAIL,
  to: options.to,
  subject: options.subject,
  html: options.html,
});
This code will now actually send real emails using the service account.
Test It!

Restart your dev server (npm run dev).
Use the Send Email tab in the Candidate Management UI.
If everything is set up correctly, you should receive an email at the address you specified.
Quick Checklist
 Google Cloud project created
 Gmail API enabled
 Service account created
 JSON key downloaded and stored securely
 Service account granted Gmail send permission (delegated user or domain‑wide delegation)
 
.env
 variables GMAIL_SERVICE_ACCOUNT_KEY and GMAIL_SENDER_EMAIL set
 googleapis and nodemailer installed (done)
 Email sending code updated (placeholder replaced)
 Tested sending an email
Once these steps are done, your app can send interview invitation emails, congratulations, or rejection notices automatically. Users of the app will not need to connect their own Gmail accounts – the service account handles all outbound mail.