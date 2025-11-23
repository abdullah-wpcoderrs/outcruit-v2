# Gmail Setup Guide (Outcruit)

This guide explains, in simple steps, how to configure Google so your app can send emails with Gmail. There are two ways to connect Gmail:

1) Organization sending via a Google Workspace Service Account (already supported by the code)
2) Individual users connecting their own Gmail via OAuth (requires an extra implementation step)

Pick the option that matches your needs and follow the steps.

---

## Option A: Organization Gmail via Service Account

Use this if you want your app to send emails from a company Gmail address (e.g., noreply@yourcompany.com). This requires Google Workspace and an admin who can approve domain‑wide access.

What you’ll end up with:
- A Service Account JSON key on your server
- Domain‑wide delegation allowing the app to send as your chosen Gmail user
- Two environment variables:
  - `GMAIL_SERVICE_ACCOUNT_KEY` → path to the JSON key file
  - `GMAIL_SENDER_EMAIL` → the Gmail address to send from

Step‑by‑step:
1. Create a Google Cloud project (console.cloud.google.com → New Project)
2. Enable the Gmail API (APIs & Services → Library → search “Gmail API” → Enable)
3. Create a Service Account (IAM & Admin → Service Accounts → Create)
   - Name it clearly, e.g., “Outcruit Email Sender”
4. Enable Domain‑Wide Delegation on that Service Account
   - Edit the service account → tick “Enable G Suite Domain‑wide Delegation”
   - Note the “Client ID” shown after enabling
5. In Google Admin Console (admin.google.com) as a Workspace admin:
   - Security → Access and data control → API Controls → Domain‑wide delegation
   - Click “Add new” and enter the Service Account “Client ID”
   - Scopes: add `https://www.googleapis.com/auth/gmail.send`
     - If you also want reading, add `https://www.googleapis.com/auth/gmail.readonly`
   - Save
6. Create and download a JSON key for the Service Account
   - Service Accounts → your account → Keys → Add key → Create new key → JSON
   - Save the file on your server (for example, `config/gmail-service-account.json`)
7. Set environment variables in your app:
   - `GMAIL_SERVICE_ACCOUNT_KEY` → the file path, e.g., `config/gmail-service-account.json`
   - `GMAIL_SENDER_EMAIL` → a Workspace user you want to send as, e.g., `noreply@yourcompany.com`
8. Restart your app.

How the app uses this:
- The code loads the JSON key and requests an access token for the Gmail API
- It uses the token to send emails via Nodemailer
- Code reference: `lib/email-service.ts:19` reads `GMAIL_SERVICE_ACCOUNT_KEY` and `GMAIL_SENDER_EMAIL`

Common pitfalls:
- This only works with Google Workspace (business accounts). It does not work for regular @gmail.com accounts without Workspace and admin approval.
- The Service Account must be granted domain‑wide delegation in Admin Console, not just in Cloud Console.
- The sender must be a valid Workspace user (`GMAIL_SENDER_EMAIL`).

---

## Option B: Users Connect Their Own Gmail via OAuth

Use this if each user should connect their personal Gmail and send from their account. This requires an OAuth consent screen and a Web OAuth client in Google Cloud.

What you’ll set up:
- OAuth Consent Screen with basic app info and Gmail scopes
- OAuth Client ID (Web) with Redirect URI(s)
- Three environment variables in your app:
  - `GOOGLE_CLIENT_ID`
  - `GOOGLE_CLIENT_SECRET`
  - `GOOGLE_REDIRECT_URI`

Step‑by‑step:
1. In Google Cloud, go to APIs & Services → OAuth consent screen
   - User type: External (unless you’re only inside your Workspace)
   - App name, logo, support email
   - Scopes: add `https://www.googleapis.com/auth/gmail.send` (and `gmail.readonly` if needed)
   - Test users: add your email(s) during development
   - Save and submit for verification if you go public later
2. Create OAuth client credentials (APIs & Services → Credentials → Create Credentials → OAuth client ID)
   - Type: Web application
   - Authorized JavaScript origins: your site origin, e.g., `http://localhost:3000` and your production domain
   - Authorized redirect URIs: e.g., `http://localhost:3000/api/auth/google/callback` and your production callback URL
   - Save the `Client ID` and `Client Secret`
3. Set environment variables:
   - `GOOGLE_CLIENT_ID` → your client ID
   - `GOOGLE_CLIENT_SECRET` → your client secret
   - `GOOGLE_REDIRECT_URI` → the exact callback URL you configured

App implementation (what your code needs to do):
1. Add a “Connect Gmail” button that sends users to Google’s OAuth URL with your Client ID, scopes, and redirect URI
2. Handle the callback at `GOOGLE_REDIRECT_URI`
   - Exchange the `code` for tokens (`access_token`, `refresh_token`)
   - Store the tokens securely on your server
3. Use the tokens to call Gmail API
   - For sending: `gmail.users.messages.send`
   - Refresh the token automatically when it expires

Notes:
- The current codebase includes `googleapis`, but email sending is implemented with a Service Account, not user OAuth. To support user‑connected Gmail, add the OAuth flow endpoints and token storage.
- Never expose `GOOGLE_CLIENT_SECRET` to the browser; keep it on the server.

---

## “Confirming” Your Google Configuration

Use this checklist to confirm you’re set up correctly:

Service Account sending (Option A):
- [ ] Gmail API is enabled in your Cloud project
- [ ] Service Account has domain‑wide delegation enabled
- [ ] Admin Console has a domain‑wide delegation entry for the Service Account Client ID
- [ ] Scopes include `https://www.googleapis.com/auth/gmail.send`
- [ ] JSON key file exists and path is set in `GMAIL_SERVICE_ACCOUNT_KEY`
- [ ] `GMAIL_SENDER_EMAIL` is a valid Workspace user address

User OAuth sending (Option B):
- [ ] OAuth consent screen configured with the right scopes
- [ ] OAuth Client ID (Web) created with correct origins and redirect URIs
- [ ] `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `GOOGLE_REDIRECT_URI` set
- [ ] Callback endpoint exchanges code for tokens and stores them securely
- [ ] Gmail send calls use the user’s tokens (not the service account)

---

## Troubleshooting

- “Not authorized to send as this user” → The Service Account needs domain‑wide delegation and the sender must be a Workspace user; check Admin Console scopes.
- “invalid_grant” during OAuth → Redirect URI mismatch or consent screen not configured; check that `GOOGLE_REDIRECT_URI` exactly matches your Cloud credentials.
- Emails not delivered → Check Gmail ‘Sent’ folder, spam, and the transporter logs. Verify `GMAIL_SENDER_EMAIL` and that the Gmail API scope is correct.

Once these steps are complete, your app will be able to send emails via Gmail. Use Option A for centralized organizational sending. Choose Option B if you want each user to connect their own mailbox.