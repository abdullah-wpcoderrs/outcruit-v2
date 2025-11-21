# Talent Sorting – Implementation Guide

## Overview

- Adds schema, API, and UI for viewing qualified candidates in the History → Talent Sorting tab.
- Mirrors the JD Tracker table UX with search, filters, pagination.

## What Was Added

- Schema migration: `migrations/add_talent_list_candidates.sql`
- Extended callback: `app/api/callbacks/talent-sort/route.ts` now accepts `sheetUrl`, `applicationSheetId`, `candidates` and stores them.
- Candidates API: `GET /api/talent-lists/:id/candidates` with search, filters, pagination.
- UI table: `components/history/talent-sorting-table.tsx`
- History tab integration: `app/history/page.tsx` renders the table below the list cards.

## How To Apply the Migration

- Run the SQL in `migrations/add_talent_list_candidates.sql` on your Neon database.
- Ensure `pgcrypto` or a UUID generator is available for `gen_random_uuid()` (alternatively use `uuid_generate_v4()` if using `uuid-ossp`).

## n8n Payload Format

- POST to `https://<host>/api/callbacks/talent-sort` with JSON body:

```
{
  "jobTitle": "<string>",
  "fileId": "<uuid>",
  "candidateCount": <number>,
  "recruiterEmail": "<string>",
  "sheetUrl": "<string>",
  "applicationSheetId": "<string>",
  "candidates": [
    {
      "row_no": 1,
      "name": "<string>",
      "email": "<string>",
      "phone_number": "<string>",
      "academic_qualification": "<string>",
      "grade": "<string>",
      "age": <number>,
      "residential_address": "<string>",
      "location": "<string>",
      "marital_status": "<string>",
      "gender": "<string>",
      "role_applying_for": "<string>",
      "cv_url": "<string>",
      "status": "<string>",
      "ai_rationale": "<string>",
      "candidate_tracker": "<string>",
      "application_sheet_id": "<string>"
    }
  ]
}
```

## Using the Candidates API

- Endpoint: `GET /api/talent-lists/:id/candidates`
- Query parameters:
  - `page` (default `1`), `pageSize` (default `20`, max `100`)
  - `q` (search across name/email/phone/address/role)
  - `gender`, `role`, `status`
- Returns: `{ items, page, pageSize, total }`

## UI Behavior

- Talent Sorting tab shows cards of lists and the new table underneath.
- The table defaults to the first list and lets you pick other lists via a selector.
- Columns: S/N, Name, Email, Phone no., Qualification, Residential Address, Gender, Role, Sheet url.
- Search, filters, pagination and open-sheet button are available.

## Next Steps

- Configure n8n to send the payload after sorting.
- Verify that recruiters’ email in the payload matches an existing user; otherwise, lists and candidates will be stored with `user_id` null (adjust as needed).
- Optionally add server-side validation for candidate objects and batch insert optimization.
- Optionally emit a notification (`POST /api/webhooks/notifications`) when a list is stored to surface new content.

## Testing Checklist

- Run the migration and confirm tables/columns exist.
- POST a sample payload; verify rows in `public.talent_lists` and `public.talent_list_candidates`.
- Open History → Talent Sorting; confirm the table populates, search/filters/pagination work.
- Click Open Sheet; confirm it opens the provided Sheet URL or constructed URL from `application_sheet_id`.

## File References

- Migration: `migrations/add_talent_list_candidates.sql`
- Callback: `app/api/callbacks/talent-sort/route.ts:4–43`
- Candidates API: `app/api/talent-lists/[id]/candidates/route.ts:1–75`
- Table Component: `components/history/talent-sorting-table.tsx:1–182`
- History integration: `app/history/page.tsx:5–8,267–291`

## n8n Workflow Flow (Markdown arrows)

Main workflow:

```
JD Tracker Webhook -> Set job data -> recruitersInfo -> Extract Qualification logic ->
Set filter logic from JD -> Split Out JD -> Loop Over JD's -> Append JD logic to tracker ->
Aggregates Form Response Sheet URL -> Create "Passed" Sheet Tab -> Upload Sheet to Neon DB ->
Build Talent Sort Payload -> HTTP Request: POST /api/callbacks/talent-sort -> Notification Webhook (optional)
```

Subworkflow: Talent Sorting

```
Set Sample Form Headers -> Create Headers in Job Response form -> Fetch/Read Form Responses ->
Normalize Candidate Fields -> Remove Duplicates -> Evaluate Qualification Rules ->
Map to Candidate Schema -> Aggregate Qualified Candidates -> Return candidates to Main
```

- Align node names with your existing setup in `n8n-workflow-engine/talentSorting.md`.
- The payload builder must output: `jobTitle`, `fileId`, `candidateCount`, `recruiterEmail`, `sheetUrl`, `applicationSheetId`, `candidates`.
- Configure the HTTP Request node to send JSON to `POST /api/callbacks/talent-sort`.

### HTTP Request Node Configuration

- Method: `POST`
- URL: `https://<host>/api/callbacks/talent-sort`
- Headers:
  - `Content-Type: application/json`
  - `ngrok-skip-browser-warning: true` (if tunneling)
- Body: `JSON` from the payload builder node

## cURL for HTTP Request Node

Use this cURL to validate the endpoint or to mirror the HTTP Request configuration.

```bash
curl -X POST "https://<host>/api/callbacks/talent-sort" \
  -H "Content-Type: application/json" \
  -H "ngrok-skip-browser-warning: true" \
  -d '{
    "jobTitle": "Service Associate",
    "fileId": "11111111-2222-3333-4444-555555555555",
    "candidateCount": 1,
    "recruiterEmail": "recruiter@example.com",
    "sheetUrl": "https://docs.google.com/spreadsheets/d/abc123",
    "applicationSheetId": "abc123",
    "candidates": [
      {
        "row_no": 1,
        "name": "Omowaire Modupe",
        "email": "hopetomisin68@gmail.com",
        "phone_number": "9161812438",
        "academic_qualification": "HND",
        "grade": "Lower Credit",
        "age": 24,
        "residential_address": "10, kadiri street, Jibowu Yaba",
        "location": "Lagos",
        "marital_status": "Single",
        "gender": "Male",
        "role_applying_for": "Service Associate",
        "cv_url": "https://example.com/cv.pdf",
        "status": "Passed",
        "ai_rationale": "Qualified based on role criteria",
        "candidate_tracker": "Unscheduled",
        "application_sheet_id": "abc123"
      }
    ]
  }'
```

### Mapping From Existing Workflow

- Webhook or Trigger: receives tracker context (job name, recruiter email).
- Sheet nodes: produce `sheetUrl` and `applicationSheetId` for the “Passed” tab.
- Upload step: returns `fileId` that references the stored sheet or PDF in your app.
- Transform step: builds `candidates` array with required attributes.
- HTTP Request: submits the final JSON payload to the app.


## Additional Notes from Chat

What These Fields Mean

`fileId`: Internal file identifier used by the app to link the talent list to a stored artifact (e.g., the “Passed” candidates sheet or a generated PDF). It lets the History page open or download via /api/files/<fileId>.

`candidateCount`: Number of qualified candidates in this run. Used to show counts and for quick summaries on cards and tables.

`recruiterEmail`: Email used to associate the run with the logged-in user in Neon. The server resolves user_id from this email.

`sheetUrl`: Public URL to the Google Sheet tab that contains the “Passed” candidates (or the full responses). Used for the “Open Sheet” button on the UI.

`applicationSheetId`: The Google Sheet’s ID (the string between /d/ and /edit in the URL). Used to construct a sheet link if sheetUrl is missing, and stored for reference.
References: docs/TALENT_SORTING_IMPLEMENTATION.md:137–141

Get These From Your Existing Workflow

`recruiterEmail`:
Source: webhook or “Set job data” step in the main workflow.
Your existing node already maps recruiter details. Example expression: ={{ $json.body.recruiterEmail }} (see n8n-workflow-engine/jdTracker.md:400–418 for a similar mapping).

`sheetUrl and applicationSheetId:`
Source: the node that creates or updates the Google Sheet tab for “Passed” candidates.
Typical outputs: spreadsheetsUrl (full URL) and spreadsheetId (ID).
Example expressions:
={{ $('Create "Passed" Sheet Tab').item.json.spreadsheetUrl }}
={{ $('Create "Passed" Sheet Tab').item.json.spreadsheetId }}

`fileId:`
Source: the step that uploads or registers the sheet/PDF in your app (labeled “Upload Sheet to Neon DB” in the plan).
Use the returned ID from your app’s upload/registration endpoint:
={{ $('Upload Sheet to Neon DB').item.json.id }}

`candidateCount:`
Source: the subworkflow output that aggregates “Qualified” candidates.
Compute as the length of the final qualified array:
If the list is at $json.qualifiedCandidates: `={{ $json.qualifiedCandidates.length }}`
If it's a different field, use its name accordingly.
If Any Field Is Missing, Add These Steps

==================================================
`fileId:`
Add an HTTP Request or Database node after the sheet creation to register the sheet in your app and return an ID. Store that ID and pass it forward.

`candidateCount:`
Add a Set node after you aggregate qualified candidates:
Name: “Set candidate count”
Field: candidateCount
Value: `={{ $json.qualifiedCandidates.length }}`

==================================================
`sheetUrl and applicationSheetId:`
Ensure your Google Sheets node returns both. If you only have spreadsheetId, construct the URL downstream:
`={{ 'https://docs.google.com/spreadsheets/d/' + $json.spreadsheetId }}`

`recruiterEmail:`
If not present, map it from the initial webhook payload where JD Tracker is triggered. Keep the email consistent with the app’s user records so the server can resolve user_id.
End-to-End Mapping Example

Build Talent Sort Payload node:
jobTitle: from JD `context, e.g., ={{ $('Set job data').item.json.jobName }}`
fileId: `={{ $('Upload Sheet to Neon DB').item.json.id }}`
candidateCount: `={{ $json.qualifiedCandidates.length }}`
recruiterEmail: `={{ $('Set job data').item.json.recruiterEmail }}`
sheetUrl: `={{ $('Create "Passed" Sheet Tab').item.json.spreadsheetUrl }}`
applicationSheetId: `={{ $('Create "Passed" Sheet Tab').item.json.spreadsheetId }}`
candidates: `={{ $json.qualifiedCandidates }}`


## Workflow Flow (Markdown Arrows)

### Main:
JD Tracker Webhook -> Set job data -> recruitersInfo -> Extract Qualification logic -> Set filter logic from JD -> Split Out JD -> Loop Over JD's -> Append JD logic to tracker -> Aggregates Form Response Sheet URL -> Create "Passed" Sheet Tab -> Upload Sheet to Neon DB -> Build Talent Sort Payload -> HTTP Request: POST /api/callbacks/talent-sort -> Notification Webhook (optional)

### Subworkflow: Talent Sorting
Set Sample Form Headers -> Create Headers in Job Response form -> Fetch/Read Form Responses -> Normalize Candidate Fields -> Remove Duplicates -> Evaluate Qualification Rules -> Map to Candidate Schema -> Aggregate Qualified Candidates -> Return candidates to Main

This mapping uses the nodes and data you already have. If you want, I can open n8n-workflow-engine/talentSorting.md and inject the exact expressions for your current node names.