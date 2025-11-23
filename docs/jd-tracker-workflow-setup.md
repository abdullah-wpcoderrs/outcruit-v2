# JD Tracker — n8n Workflow Setup (End‑to‑End)

This guide provides a complete, node‑by‑node configuration to process JD Tracker submissions, store results, and update the Outcruit dashboard for the correct user. It includes recommended payload fields, returning data to the app, and RLS‑friendly user identification.

## Overview
- Accept JD Tracker form submissions from the app via `Webhook` (multipart/form‑data with binary PDF)
- Extract recruiter and job details; optionally upload the JD to Drive
- Create/update rows in Google Sheets as needed
- Send a callback to the app to persist trackers and notify the user
- Use `userId` in payloads to align with database RLS and per‑user notifications

## Prerequisites
- App environment
  - `NEXT_PUBLIC_JD_TRACKER_WEBHOOK` points to your n8n `Webhook` URL
  - `STATUS_TRACKER_N8N_WEBHOOK_URL` points to your status update Webhook (for later updates)
- n8n credentials
  - Google Drive (optional, if storing PDFs)
  - Google Sheets (optional, if Sheets are part of the flow)
- App callback endpoints
  - `POST /api/callbacks/tracker` accepts tracker payload to store in DB
  - `POST /api/webhooks/notifications` for user notifications (optional)

## Incoming Payload (from App)
The JD Tracker form sends multipart FormData with only the required fields:
- `jobName`: string
- `jdFile`: PDF binary
- `jdFileName`: string
- `recruiterName`: string
- `recruiterEmail`: string
- `recruitment_type`: string
- `userId`: UUID of the logged‑in user (used for RLS alignment)

## Node‑by‑Node Setup
1) Webhook (Trigger)
- Method: `POST`
- Response: Respond after workflow finishes or immediately (your choice)
- Allowed Origins (CORS): include your app domain
- Binary Property: enable to receive file uploads; leave property name empty to accept multiple files in `$binary` (per n8n guidance)
- References:
  - n8n Webhook node docs: https://docs.n8n.io/integrations/builtin/core-nodes/n8n-nodes-base.webhook/

2) Set (Normalize fields)
- Map incoming JSON and add defaults:
```json
{
  "briefName": "={{ $json.jobName }}",
  "recruiterName": "={{ $json.recruiterName }}",
  "recruiterEmail": "={{ $json.recruiterEmail }}",
  "recruitmentType": "={{ $json.recruitment_type }}",
  "userId": "={{ $json.userId || '' }}",
  "status": "Active",
  "jdFileName": "={{ $json.jdFileName || 'brief.pdf' }}"
}
```

3) (Optional) Google Drive — Upload JD PDF
- If you want to store the JD file:
  - Input Binary: select from `$binary` (e.g., first file)
  - Target Folder: your Drive folder
  - Output: store `driveFileId` and link in item JSON

4) Google Sheets — Append or Update Row
- Operation: `Append or Update Row`
- Map fields like `Brief Name`, `Role`, `Recruiter Email`, `Status`, `Application Sheet Id`
- References:
  - n8n Google Sheets docs: https://docs.n8n.io/integrations/builtin/app-nodes/n8n-nodes-base.googlesheets/
  - Update/Append operations: https://docs.n8n.io/integrations/builtin/app-nodes/n8n-nodes-base.googlesheets/sheet-operations/

5) (Optional) AI Extraction / Derived Fields
- If your workflow enriches data (e.g., parsing JD text or generating role metadata), produce those fields inside n8n. They are not sent from the app form and should be computed within the workflow as needed.

6) HTTP Request — Callback to App (Persist Tracker)
- Method: `POST`
- URL: `https://<your-app-host>/api/callbacks/tracker`
- Content Type: `json`
 - Body example (match app API):
 ```json
  {
    "briefName": "={{ $json.briefName }}",
    "status": "={{ $json.status }}",
    "recruiterEmail": "={{ $json.recruiterEmail }}",
    "roleName": "={{ $json.roleName || $json.briefName }}",
    "rowNo": "={{ $json.row_no || $json.rowNo || '' }}",
    "grade": "={{ $json.grade || '' }}",
    "applicationSheetId": "={{ $json.applicationSheetId }}",
    "userId": "={{ $json.userId || '' }}"
  }
 ```
- App behavior:
  - Current implementation resolves `userId` by email if `userId` is absent
  - Recommended: send `userId` to ensure exact per‑user storage under RLS

7) (Optional) HTTP Request — Notify App
- Method: `POST`
- URL: `https://<your-app-host>/api/webhooks/notifications`
- Content Type: `json`
- Body example:
```json
{
  "userId": "={{ $json.userId }}",
  "type": "jd_tracker",
  "message": "={{ $json.briefName }} Brief uploaded",
  "job_name": "={{ $json.briefName }}",
  "recruiter_name": "={{ $json.recruiterName }}",
  "recruiter_email": "={{ $json.recruiterEmail }}"
}
```
- The app displays notifications on the dashboard; read/unread is managed by `/api/notifications` endpoints

8) Respond to Webhook
- Return a success JSON to the caller (the app form):
```json
{
  "ok": true,
  "message": "JD Tracker submission received",
  "sheetId": "={{ $json.applicationSheetId || '' }}",
  "driveFileId": "={{ $json.driveFileId || '' }}"
}
```

## Status Updates (Later in the lifecycle)
- Use `STATUS_TRACKER_N8N_WEBHOOK_URL` to send status changes back to the app
- Single update payload:
```json
{
  "tracker_id": "...",
  "status": "Scheduled",
  "row_no": 12,
  "application_sheet_id": "...",
  "brief_name": "...",
  "role_name": "...",
  "recruiter_email": "...",
  "userId": "..."
}
```
- Bulk update payload:
```json
{
  "type": "bulk-edit",
  "count": 3,
  "updates": [
    {
      "tracker_id": "...",
      "status": "Scheduled",
      "row_no": 12,
      "application_sheet_id": "...",
      "brief_name": "...",
      "role_name": "...",
      "recruiter_email": "...",
      "userId": "..."
    }
  ]
}
```

## Dashboard Data Flow
- Storage: `POST /api/callbacks/tracker` persists a record in `public.job_trackers`
- Fetch: History page calls
  - `GET /api/history/tracker` for trackers
  - `GET /api/job-ads` and `GET /api/talent-lists` for other tabs
- Notifications: `GET /api/notifications` reads per‑user notices

## RLS and Identity
- The app enforces Row Level Security across tables
- Sending `userId` with payloads ensures:
  - Correct `user_id` association on inserts
  - Accurate per‑user reads on the dashboard
  - Proper notifications routing

## Troubleshooting
- “Failed to fetch” on the app form:
  - Ensure the Webhook URL in `.env` has no leading/trailing spaces
  - Validate CORS settings in the Webhook node (Allowed Origins)
- Missing binary:
  - Enable `Binary Property` in Webhook; file will be under `$binary`
- Sheets not updating:
  - Use `Append or Update Row` operation and verify mapping

## References
- Webhook node: https://docs.n8n.io/integrations/builtin/core-nodes/n8n-nodes-base.webhook/
- Google Sheets node: https://docs.n8n.io/integrations/builtin/app-nodes/n8n-nodes-base.googlesheets/
- HTTP Request node: https://docs.n8n.io/integrations/builtin/core-nodes/n8n-nodes-base.httprequest/