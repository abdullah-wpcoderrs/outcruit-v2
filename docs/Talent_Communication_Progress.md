# Talent Communication Progress

This document describes what has been implemented for Talent‑sorting communication, how it works end‑to‑end, typical user scenarios, and the workflow logic.

## What’s Implemented

- Selector shows only Talent‑sorting files from existing talent-lists files (which is gotten from when a user sort an application response pool to get the qualified candidates lists.).
- All Candidates table fetches candidates for the selected list and displays communication fields:
  - Headers: `Status`, `Interview Date`, `Time Slot`, `Meeting Venue/URL`.
- Inline status updates with optimistic UI and backend persistence: `PATCH /api/talent-lists/:id/candidates`.
- Smart scheduler updates Talent‑sorting candidates and refreshes UI:
  - `POST /api/candidates/schedule` writes `status = 'Scheduled'`, `interview_date`, `interview_time_slot`, `meeting_venue_url`, `recruiter_name`, `recruiter_email`, `batch_number`.
  - Success toast and modal confirmation appear; table auto‑refreshes.
- Communications tab sends emails by candidate status for the selected Talent‑sorting list:
  - `POST /api/candidates/communicate` targets candidates by `emailType`.
  - Uses templates in `lib/email-templates.ts` and Gmail service in `lib/email-service.ts`.
- View Details pop‑up shows sheet‑derived data only for Talent‑sorting rows (has `application_sheet_id`).
- Optional Google Sheet sync via n8n webhook (`SHEET_UPDATE_N8N_WEBHOOK_URL`) to update the source sheet’s `Status`, `Interview Date`, `Time Slot`.
- Navigation improvements:
  - Sidebar item `Schedule` links to `/candidates`.
  - History → Talent Sorting includes a `Sort New` button that opens Dashboard → Talent Sorting.

## Plain-English Guide (Non‑Technical)

- Choosing a file
  - Pick the hiring list you want to work on from the dropdown. This list is the one you previously sorted.

- Seeing people in the list
  - You’ll see all the people from that list along with a few key details: their current status, the day and time of interview (if already set), and the link for where the interview will happen.

- Changing a person’s status
  - You can change someone’s status (for example, to “Shortlisted” or “Dropped”). The change shows immediately so you can keep working without waiting.

- Scheduling interviews
  - Tell the system when interviews should start, how many minutes each slot takes, how many people to schedule at once, and paste the online meeting link.
  - The system assigns times to everyone who doesn’t yet have one. You’ll see a quick confirmation and a pop‑up letting you know how many people were scheduled.

- Sending emails
  - There’s a simple section for sending messages to people based on their status.
  - For example, “Interview Schedule” goes to people marked as scheduled; “Congratulations” goes to people who passed; “Rejection” goes to people who didn’t make it.

- Keeping the spreadsheet up‑to‑date
  - If your setup allows it, the same changes (like Status, Interview Date, and Time Slot) are also written back to the original Google Sheet so your team sees a single source of truth.

- Getting around quickly
  - A “Schedule” menu item takes you straight to the management area. In History, a “Sort New” button moves you to the sorting area to start a fresh list.

## Data Model (DB)

- `public.talent_list_candidates` includes core fields and scheduling fields:
  - Core: `id`, `user_id`, `talent_list_id`, `row_no`, `name`, `email`, `phone_number`, `academic_qualification`, `residential_address`, `gender`, `role_applying_for`, `status`, `application_sheet_id`, `created_at`, etc.
  - Scheduling: `batch_number`, `interview_date`, `interview_time_slot`, `meeting_venue_url`, `recruiter_name`, `recruiter_email`.
- `public.talent_lists` provides list‑level sheet references:
  - `sheet_url`, `application_sheet_id`.

## End‑to‑End Flow

1) Select Talent‑sorting file
- Page: `/candidates`
- Selector sources: `GET /api/talent-lists`.
- Props into table/forms: `talentListId`, `jobName`.

2) View All Candidates
- Fetch: `GET /api/talent-lists/:id/candidates` with pagination and filters.
- Table shows `Status`, `Interview Date`, `Time Slot`, and sheet link via `application_sheet_id`.

3) Update Status inline
- UI updates instantly (optimistic) and persists via `PATCH /api/talent-lists/:id/candidates`.
- Table remains in sync; failure triggers a re‑fetch.

4) Schedule Interviews
- Submit `startDate`, `startTime`, `timeIntervalMinutes`, `candidatesPerBatch`, `meetingVenueUrl`.
- API: `POST /api/candidates/schedule` applies schedule to unscheduled candidates in the selected list.
- Returns count; shows toast + success modal; dispatches UI refresh event; table reloads with scheduled data.
- Optional: posts to n8n webhook to update the corresponding Google Sheet using `application_sheet_id` + `row_no`.

5) Communications
- Choose `emailType` in Communications tab:
  - `interview_schedule` → targets `Scheduled`; status unchanged.
  - `congratulatory` → targets `Shortlisted`; status updated to `PROCEEDING` after send.
  - `rejection` → targets `Dropped`; status updated to `Notified-Rejected - CLOSED` after send.
- API: `POST /api/candidates/communicate` selects candidates by `talentListId` + `status` and sends emails via Gmail service, using templates.
- Logs communication and (if applicable) updates status, then returns success/fail counts.

## Plain-English Flow (Non‑Technical)

1) Pick the hiring list you want to manage.
2) Review the people in that list and update their status if needed.
3) Set up the interview details (start date, start time, slot length, number per batch, and meeting link) and let the system assign times.
4) Send emails to the right group of people based on their status (schedule notices, congratulations, or rejections).
5) If connected, the original spreadsheet is also updated with the latest status and interview details.

## User Scenarios

- Scenario A: Schedule interviews for a Talent‑sorting file
  - Select list → fill schedule form → submit.
  - See toast and modal confirming X candidates scheduled.
  - All Candidates table shows `Status = Scheduled`, `Interview Date`, `Time Slot`, and `Meeting Venue/URL` per candidate.
  - If webhook configured, source Google Sheet updates the same fields for the exact rows.

- Scenario B: Send interview schedule emails
  - Ensure candidates are `Scheduled` and have `meeting_venue_url`.
  - Go to Communications tab → choose “Interview Schedule” → submit.
  - Emails sent with link and time; DB records communication.

- Scenario C: Congratulatory emails
  - Candidates currently `Shortlisted`.
  - Choose “Congratulatory” → emails sent; statuses update to `PROCEEDING`.

- Scenario D: Rejection emails
  - Candidates currently `Dropped`.
  - Choose “Rejection” → emails sent; statuses update to `Notified-Rejected - CLOSED`.

- Scenario E: CSV‑uploaded candidates
  - View Details hidden (no `application_sheet_id`).
  - Status updates and scheduling still work via DB; no sheet sync.

## Logic Tree (Markdown)

- Candidate Management
  - Selector → Talent Lists (DB)
  - All Candidates Table
    - GET candidates by `talentListId`
    - Show Status/Date/Slot
    - Inline PATCH updates
  - Schedule Interviews
    - POST schedule
    - DB update → toast + modal → refresh event
    - If webhook present → POST to n8n → sheet update
  - Communications
    - Switch `emailType`
    - Map to `targetStatus` and optional `nextStatus`
    - Fetch candidates by `talentListId` + `targetStatus`
    - For each:
      - Build template data → send via Gmail
      - Log email
      - If `nextStatus != targetStatus` → update status
    - Return success/fail counts

## Configuration & Environment

- Gmail
  - `GMAIL_SERVICE_ACCOUNT_KEY` → path to JSON key
  - `GMAIL_SENDER_EMAIL` → sender address
- Optional Sheet Sync
  - `SHEET_UPDATE_N8N_WEBHOOK_URL` → n8n endpoint URL to update Google Sheet.

## Key File References

- Selector and tabs: `app/candidates/page.tsx:28–36`, `app/candidates/page.tsx:42–99`
- Candidates table fetch/columns: `components/candidate-table.tsx:61–76`, `components/candidate-table.tsx:181–186`
- Inline status update (optimistic): `components/candidate-table.tsx:132–143`
- Schedule form and success modal: `components/schedule-interview-form.tsx:70–73`, `components/schedule-interview-form.tsx:81–101`
- Schedule API (DB update + optional sheet webhook): `app/api/candidates/schedule/route.ts:41–71`, `app/api/candidates/schedule/route.ts:89–106`
- Communications API (selection + send + status update): `app/api/candidates/communicate/route.ts:32–44`, `app/api/candidates/communicate/route.ts:49–58`, `app/api/candidates/communicate/route.ts:95–109`
- Email templates and send: `lib/email-templates.ts:15–37`, `lib/email-service.ts:19–57`
- History Sort New button: `app/history/page.tsx:270–282`
- Sidebar Schedule nav: `components/sidebar.tsx:24–29`