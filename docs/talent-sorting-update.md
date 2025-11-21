# Talent Sorting – Workflow & History Tab Updates

This guide explains, in simple terms, what changed in the Talent Sorting workflow (in n8n) and how the History page displays and previews your results. It also shows how data travels from n8n to your app and what to check if something doesn’t show up.

## What Changed
- Stopped automatic downloads during preview so files open inline (in the browser) until you explicitly click “Download”.
- Fixed app routes to work with the latest Next.js dynamic API rules (they now unwrap route params asynchronously).
- Improved the CSV preview logic so the table view reliably detects and displays CSV content.
- Clarified n8n HTTP Request node URLs and payloads so the app stores files and rows correctly.

## Step‑By‑Step: n8n Nodes You Need

1) Export the “Passed” Sheet as a PDF (optional, for document preview)

- Node type: Google Drive
- Operation: Download
- File ID: `={{ $('Create \'Passed\' Sheet Tab').item.json.spreadsheetId }}`
- Options:
  - Enable Google File Conversion
  - Docs To Format: `application/pdf`
  - File Name: `={{ $('Set Sheet URL').item.json.jobName }} - Qualified Candidates.pdf`

2) Upload the exported file to the app

- Node type: HTTP Request
- Method: POST
- URL: `https://<your-app-domain>/api/upload`
- Send Body: ON
- Content Type: multipart-form-data
- Body Parameters:
  - `file`: `={{ $binary.data }}`
  - `type`: `talent-list`
  - `jobTitle`: `={{ $('Set Sheet URL').item.json.jobName }}`
  - `candidateCount`: `={{ $items('Get All Passed Candidates').length }}`
  - `recruiterEmail`: `={{ $('Set Sheet URL').item.json.recruiterEmail }}`

3) Build and send the Talent Sort payload

- Node type: HTTP Request
- Method: POST
- URL: `https://<your-app-domain>/api/callbacks/talent-sort`
- Headers: `Content-Type: application/json`
- Body: JSON from your payload builder containing:
  - `jobTitle`, `fileId`, `candidateCount`, `recruiterEmail`, `sheetUrl`, `applicationSheetId`, `candidates`

## How the Workflow Works (Layman’s Terms)
1. n8n gathers applications from your Google Sheet and decides who “Passed”.
2. It creates a new “Passed” tab inside the sheet and fills it with those candidates.
3. It exports the sheet content (CSV/PDF) and sends the file to your app’s upload endpoint (`/api/upload`). The app stores the file and returns a `fileId`.
4. n8n builds a clean JSON list of candidates (names, emails, etc.) and posts it to the app’s callback endpoint (`/api/callbacks/talent-sort`).
5. The app saves the run as a “Talent List” (with `jobTitle`, `fileId`, `candidateCount`, and sheet details), and also saves the individual candidate rows.
6. On your History → Talent Sorting tab, you see:
   - A “Documents” view (cards) for opening or downloading the stored file.
   - A “Table” view that fetches rows from the database with search and filters.

## n8n Node Updates (What to Set)
- Use your live app domain for HTTP requests (avoid offline tunnels):
  - File upload URL: `https://<your-app-domain>/api/upload`
  - Callback URL: `https://<your-app-domain>/api/callbacks/talent-sort`
- Remove stray backticks and spaces from URL strings. Use plain URLs.
- Upload Node (multipart form-data):
  - Field name: `file`
  - Value: binary of your exported sheet (e.g., `={{ $binary.data }}` depending on your node)
- Callback Node (JSON): include exactly these fields:
  - `jobTitle`
  - `fileId` (from the upload node response)
  - `candidateCount`
  - `recruiterEmail`
  - `sheetUrl` (full Google Sheets link if available)
  - `applicationSheetId` (the string between `/d/` and `/edit` in the sheet URL)
  - `candidates` (the array of candidate objects)

### Optional: Real‑Time Notification
- Add an HTTP Request node at the end to `POST https://<your-app-domain>/api/webhooks/notifications` with JSON fields like `type`, `message`, `jobName`, `status`, `recruiterEmail` to get instant notifications in the app.

## App Updates (So Preview Doesn’t Auto-Download)
- File preview returns inline content and uses a `preview=1` query to signal preview mode.
- CSV files are served as `text/plain` in preview so browsers display them instead of downloading.
- The History page “Open in new tab” now uses `preview=1`.

## Data Flow (Simple View)
- Upload: n8n → `POST /api/upload` → app stores the binary → returns `fileId` and `url`.
- Save rows: n8n → `POST /api/callbacks/talent-sort` → app saves list + candidates.
- History page:
  - Lists: `GET /api/talent-lists` (requires you to be logged in).
  - Table rows: `GET /api/talent-lists/<id>/candidates` (scoped to your user).
  - File preview: `GET /api/files/<fileId>?preview=1` (opens inline, not downloaded).

## How To Test End-To-End
1. Log into the app (so endpoints can tie data to your user).
2. Run the n8n workflow:
   - Confirm upload node returns a real `fileId`.
   - Confirm callback node returns `{ success: true }`.
3. Open the app → History → Talent Sorting.
   - “Documents” view: cards appear; “Open” shows the file inline; “Download” saves the file.
- “Table” view: select a list from the dropdown; rows load; search and filters work.

### Test Upload with cURL (quick manual check)

```bash
curl -X POST https://<your-app-domain>/api/upload \
  -H "Cookie: auth_token=YOUR_TOKEN" \
  -F "file=@test.pdf" \
  -F "type=talent-list" \
  -F "jobTitle=Test Job" \
  -F "recruiterEmail=your@email.com" \
  -F "candidateCount=3"
```

## Troubleshooting (Plain English)
- “File opens but downloads immediately”
  - Use “Open” or “Open in new tab” (they use preview mode). Only “Download” should download.
- “No rows in the table”
  - Make sure n8n callback uses your live app domain.
  - Ensure `recruiterEmail` in n8n matches the email of the logged-in app user. The app associates rows with your user.
  - Confirm you are logged in; the table endpoints require your auth cookie to scope data to your user.
- “Endpoint offline”
  - If a tunnel like ngrok shows an offline error, switch your nodes to the live domain.
- “Dynamic API params error in terminal”
  - Next.js now treats `params` as asynchronous for route handlers. The app now awaits `params` before using `id`.

## Exact Spots Changed (Code References)
- Prevent auto-download and support preview:
  - `app/api/files/[id]/route.ts:28–45` (sets inline disposition, handles `preview=1`, adjusts `Content-Type` for CSV)
  - `app/history/page.tsx:80–82` (opens preview with `?preview=1`)
- Improve CSV table detection:
  - `components/history/csv-preview.tsx:43–53` (detects CSV by header width or content type)
- Fix Next.js dynamic API params:
  - `app/api/files/[id]/route.ts:4–9` (await `params`)
  - `app/api/talent-lists/[id]/candidates/route.ts:5–9, 23, 26–28` (await `params`, use `id`)

## Checklist (Before You Call It Done)
- Updated n8n nodes to use your live domain (no offline tunnels).
- Upload node returns a `fileId`.
- Callback node returns success and saves list + candidates.
- History → Talent Sorting shows cards and table.
- Table fetch works with search, filters, pagination while logged in.
- “Open” and “Open in new tab” preview inline; “Download” saves the file.
- Recruiter email used by n8n matches a user in the app.
- Talent sort saving endpoints:
  - `app/api/upload/route.ts:6–15, 19–31` (reads `file` form field, stores, returns `fileId`)
  - `app/api/callbacks/talent-sort/route.ts:7–8, 20–26, 28–56` (validates payload, inserts list and candidate rows)
- Table view fetching:
  - `components/history/talent-sorting-table.tsx:42–51` (fetch lists)
  - `components/history/talent-sorting-table.tsx:54–71` (fetch rows with search/filters)
  - `components/history/talent-sorting-table.tsx:75–81` (derive `sheetUrl` if missing)

## Key Points to Remember
- Use your live domain in n8n. Avoid offline tunnels for production data.
- Keep `recruiterEmail` consistent with app accounts.
- Preview is inline; downloading only happens when you click “Download”.
- Next.js dynamic APIs (`params`, `searchParams`) are asynchronous; the app awaits them now.