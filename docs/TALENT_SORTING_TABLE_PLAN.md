# Talent Sorting Tab – Table UX and Data Plan

## Goal

- Show a full table of qualified candidates in the Talent Sorting tab, with search, filters, and pagination, matching the JD Tracker table UX.
- Map database fields to friendly headers: S/N, Name, Email, Phone no., Qualification, Residential Address, Gender, Role, Sheet url.

## Data Model

- New table `public.talent_list_candidates`:
  - `id` (uuid, PK)
  - `user_id` (uuid, FK `users.id`)
  - `talent_list_id` (uuid, FK `talent_lists.id`)
  - `row_no` (integer) → S/N
  - `name` (text)
  - `email` (text)
  - `phone_number` (text)
  - `academic_qualification` (text)
  - `grade` (text)
  - `age` (integer)
  - `residential_address` (text)
  - `location` (text)
  - `marital_status` (text)
  - `gender` (text)
  - `role_applying_for` (text)
  - `cv_url` (text, optional)
  - `status` (text, e.g., Passed/Not Qualified)
  - `ai_rationale` (text, optional)
  - `candidate_tracker` (text, optional)
  - `application_sheet_id` (text, optional)
  - `created_at` (timestamptz default now)
  - Indexes: `talent_list_id`, `user_id`, `email`, `role_applying_for`, `status`

- Add columns on `public.talent_lists`:
  - `sheet_url` (text, optional)
  - `application_sheet_id` (text, optional)

### Sample SQL Migration (sketch)

```sql
CREATE TABLE public.talent_list_candidates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  talent_list_id UUID NOT NULL REFERENCES public.talent_lists(id) ON DELETE CASCADE,
  row_no INTEGER,
  name TEXT,
  email TEXT,
  phone_number TEXT,
  academic_qualification TEXT,
  grade TEXT,
  age INTEGER,
  residential_address TEXT,
  location TEXT,
  marital_status TEXT,
  gender TEXT,
  role_applying_for TEXT,
  cv_url TEXT,
  status TEXT,
  ai_rationale TEXT,
  candidate_tracker TEXT,
  application_sheet_id TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX ON public.talent_list_candidates (talent_list_id);
CREATE INDEX ON public.talent_list_candidates (user_id);
CREATE INDEX ON public.talent_list_candidates (email);
CREATE INDEX ON public.talent_list_candidates (role_applying_for);
CREATE INDEX ON public.talent_list_candidates (status);

ALTER TABLE public.talent_lists
  ADD COLUMN sheet_url TEXT,
  ADD COLUMN application_sheet_id TEXT;
```

## API Design

- Existing: `GET /api/talent-lists` returns lists for the logged-in user.

- New: `GET /api/talent-lists/:id/candidates`
  - Auth via `auth_token`; validates that `:id` belongs to the current user.
  - Query params:
    - `page`, `pageSize` (defaults: 1, 20)
    - `q` (search across `name`, `email`, `phone_number`, `role_applying_for`, `residential_address`)
    - `gender`, `role`, `status`
  - Returns `{ items: Candidate[], page, pageSize, total }`.

- Ingestion: extend `POST /api/callbacks/talent-sort` to accept candidates array and optional `sheetUrl`/`applicationSheetId`.
  - Body keys:
    - `jobTitle` (string)
    - `fileId` (uuid)
    - `candidateCount` (number)
    - `recruiterEmail` (string)
    - `sheetUrl` (string, optional)
    - `applicationSheetId` (string, optional)
    - `candidates` (array of candidate objects)
  - Behavior:
    - Resolve `user_id` from `recruiterEmail` (case-insensitive, trimmed).
    - Insert `talent_lists` row; set `sheet_url`, `application_sheet_id` if present.
    - Bulk insert candidates into `talent_list_candidates` with `user_id` and `talent_list_id`.

### Candidate Object Schema (from n8n)

```json
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
  "cv_url": "https://.../cv.pdf",
  "status": "Passed",
  "ai_rationale": "...",
  "candidate_tracker": "Unscheduled",
  "application_sheet_id": "<sheetId>"
}
```

## Frontend UI

- New component `TalentSortingTable` with JD Tracker UX:
  - Columns (DB → UI header):
    - `row_no` → `S/N`
    - `name` → `Name`
    - `email` → `Email`
    - `phone_number` → `Phone no.`
    - `academic_qualification` → `Qualification`
    - `residential_address` → `Residential Address`
    - `gender` → `Gender`
    - `role_applying_for` → `Role`
    - `sheet_url` → `Sheet url` (link button)
  - Features:
    - Search across name/email/phone/address/role
    - Filters: gender, role (distinct values), status (Passed/Not Qualified)
    - Pagination: page size 10/20/50 + page controls
    - Sorting: S/N, Name, Role, Gender
    - Empty and loading states

- Integration in `Talent Sorting` tab:
  - Option A: replace cards with the table for the latest list.
  - Option B: keep cards and add “View Candidates” to open the table for the selected list.

## n8n Workflow Update

- Add an HTTP Request node to send candidates payload to the app after sorting.
- Configuration:

```json
{
  "method": "POST",
  "url": "https://<host>/api/callbacks/talent-sort",
  "sendBody": true,
  "contentType": "json",
  "body": {
    "jobTitle": "={{ $('Set Sheet URL').item.json.jobName }}",
    "fileId": "={{ $('Upload Sheet to Neon DB').item.json.id }}",
    "candidateCount": "={{ $json.totalQualified }}",
    "recruiterEmail": "={{ $('JD Tracker Webhook').item.json.body.recruiterEmail }}",
    "sheetUrl": "={{ $('Create \\"Passed\\" Sheet Tab').item.json.spreadsheetUrl }}",
    "applicationSheetId": "={{ $('Create \\"Passed\\" Sheet Tab').item.json.spreadsheetId }}",
    "candidates": "={{ $json.qualifiedCandidates }}"
  },
  "options": {
    "headerParameters": [{ "name": "ngrok-skip-browser-warning", "value": "true" }]
  }
}
```

## Implementation Steps

1. Create SQL migration for `talent_list_candidates` and add columns on `talent_lists`.
2. Update `POST /api/callbacks/talent-sort` to accept `sheetUrl`, `applicationSheetId`, and bulk `candidates` insert.
3. Add `GET /api/talent-lists/:id/candidates` with search, filters, pagination.
4. Build `TalentSortingTable` component modeled after `TrackerTable` and wire into `Talent Sorting` tab.
5. Update n8n workflow to send the candidates payload; test end-to-end and validate DB inserts.
6. Optionally post a notification to `POST /api/webhooks/notifications` with `type: 'talent-sorting'` after storing.

## Acceptance Criteria

- Talent Sorting tab displays a paginated table with the specified headers and mapped fields for the selected or latest list.
- Search and filters behave as expected; pagination and sorting work.
- Sheet url opens the Google Sheet URL in a new tab.
- Data is scoped to the logged-in user; unauthorized access is blocked.
- Ingesting a new talent sorting run creates the list, stores candidates, and updates the UI.

## File References

- Talent Lists API: `app/api/talent-lists/route.ts:7–25`
- Talent Sorting callback: `app/api/callbacks/talent-sort/route.ts:4–33`
- History tab structure: `app/history/page.tsx:166–203`
- Tracker table UX reference: `components/history/tracker-table.tsx:387–408`