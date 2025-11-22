# n8n Workflow: Google Sheet Schedule Update for Talent-Sorting

This workflow updates the same Google Sheet used by a Talent‑sorting document with interview scheduling data coming from the Outcruit web application. It receives a POST webhook payload containing candidate schedule updates and writes them to the sheet by matching the `Row No` column.

## Overview

- Trigger: HTTP Webhook (POST) from Outcruit `SHEET_UPDATE_N8N_WEBHOOK_URL`.
- Input: `talentListId` and `updates[]` where each update includes `application_sheet_id`, `row_no`, `status`, `interview_date`, `interview_time_slot`, `meeting_venue_url`, `name`, `email`.
- Action: For each row, update the Google Sheet tab to set Status, Interview Date, Time Slot, Meeting Venue/URL and optionally Name/Email.
- Output: JSON response summarizing successes/failures.

## Prerequisites

- Google Sheets OAuth2 credential configured in n8n with access to the target spreadsheets.
- The Talent‑sorting Google Sheet contains a column named `Row No` that matches `row_no` in payload; and columns: `Status`, `Interview Date`, `Time Slot`, `Meeting Venue/URL`, `Name`, `Email`.
- Outcruit app configured with `SHEET_UPDATE_N8N_WEBHOOK_URL` pointing to this workflow’s webhook URL.

## Webhook Payload

Example body sent by Outcruit after scheduling:

```json
{
  "talentListId": "a3f2e1c0-...",
  "updates": [
    {
      "id": "candidate-uuid",
      "row_no": 12,
      "application_sheet_id": "1cFkJqjkxjJ8vPkbwCocs4veg3sKhhOd93rCSpR99dSI",
      "status": "Scheduled",
      "interview_date": "2025-11-25",
      "interview_time_slot": "09:45 AM",
      "meeting_venue_url": "https://zoom.us/j/123",
      "name": "Jane Doe",
      "email": "jane.doe@example.com"
    }
  ]
}
```

## Node‑by‑Node Configuration

1) Webhook
- Node: `Webhook`
- HTTP Method: `POST`
- Path: `/outcruit/schedule-update`
- Response: `JSON` (Return immediately after processing)
- Options: Enable `Response Code` mapping (200 success; 400 validation errors)

2) Set: Normalize Input
- Node: `Set`
- Purpose: Ensure consistent field names and defaults
- Mode: `Keep Only Set`
- Values:
  - `talentListId` → `{{$json.talentListId}}`
  - `updates` → `{{$json.updates}}`

3) IF: Validate Payload
- Node: `IF`
- Conditions:
  - `updates` exists AND `updates.length > 0`
- True → proceed; False → route to `Webhook Response (error)`

4) Split In Batches: Iterate Updates
- Node: `Split In Batches`
- Batch Size: `1` (process rows one‑by‑one for deterministic updates)
- Input: `{{$json.updates}}`

5) Google Sheets: Get Spreadsheet Metadata
- Node: `Google Sheets`
- Resource: `Spreadsheet`
- Operation: `Get Spreadsheet`
- Fields:
  - `Document ID`: `={{ $item().json.application_sheet_id }}`
- Output: List of sheets (`sheets[].properties.title` and `.sheetId`).

6) Function: Select Target Tab
- Node: `Function`
- Code:
  - Prefer sheet tab named `Passed` if present, else first tab.
  - Emit `sheetTitle` and `sheetId`.
  - Example:
    ```js
    const sheets = $json.sheets || [];
    const passed = sheets.find(s => s.properties?.title === 'Passed');
    const chosen = passed || sheets[0];
    return [{
      sheetTitle: chosen?.properties?.title || 'Sheet1',
      sheetId: chosen?.properties?.sheetId
    }];
    ```

7) Set: Map Row Values
- Node: `Set`
- Mode: `Keep Only Set`
- Values (these must match the Google Sheet’s column headers):
  - `Row No` → `={{ $json.row_no }}`
  - `Status` → `={{ $json.status }}`
  - `Interview Date` → `={{ $json.interview_date }}`
  - `Time Slot` → `={{ $json.interview_time_slot }}`
  - `Meeting Venue/URL` → `={{ $json.meeting_venue_url }}`
  - `Name` → `={{ $json.name }}`
  - `Email` → `={{ $json.email }}`

8) Google Sheets: Append or Update by `Row No`
- Node: `Google Sheets`
- Resource: `Sheet Within Document`
- Operation: `Append or update`
- Document ID: `={{ $item(5).json.application_sheet_id }}` (use original item context holding payload)
- Sheet Name: `={{ $item(6).json.sheetTitle }}` (from the Select Target Tab node)
- Mapping Mode: `Define Below`
- Columns: Map from the Set node outputs.
- Matching Columns: `Row No` (exact header text in the sheet)
- Options:
  - `Value Input Option`: `USER_ENTERED`
  - `Attempt To Convert Types`: `true`

9) Merge: Collect Results
- Node: `Merge`
- Mode: `Multiplex`
- Purpose: Combine success outputs per row with original input for final reporting.

10) Webhook Response (success)
- Node: `Webhook`
- Response:
  - Status Code: `200`
  - Body: `{ "success": true, "updated": {{ $items().length }} }`

11) Webhook Response (error)
- Node: `Webhook`
- Triggered from IF false branch.
- Response:
  - Status Code: `400`
  - Body: `{ "success": false, "error": "No updates provided" }`

## Notes and Variations

- If your sheet uses different column headers, update the Set node keys and Matching Columns accordingly.
- If you need to target a specific tab other than `Passed`, change the Function logic to find the correct title (or store the tab title in DB and pass it from Outcruit).
- For strict row targeting without lookup, you can use `Update` operation with A1 ranges (e.g., `={{ $json.sheetTitle }}!A{{$json.row_no}}:Z{{$json.row_no}}`) and pass an ordered array of values. This is more brittle if columns are re‑ordered; prefer `Append or update` with `matchingColumns` when possible.

## Testing

- Send a test POST to the webhook with one `updates` item. Verify the corresponding row in the Google Sheet updates.
- Test with multiple items. The node sequence will process each item in batches.
- Review run data to confirm `sheetTitle` resolution and `matchingColumns` behavior.

## References

- n8n Google Sheets node docs: https://docs.n8n.io/integrations/builtin/app-nodes/n8n-nodes-base.googlesheets/ [1]
- n8n Google Sheets Sheet‑within‑Document operations: https://docs.n8n.io/integrations/builtin/app-nodes/n8n-nodes-base.googlesheets/sheet-operations/ [2]

Footnotes:
- [1] “Google Sheets | n8n Docs” — operations overview and credentials guidance.
- [2] “Google Sheets Sheet Within Document operations” — append/update modes, automatic mapping, and matching columns.