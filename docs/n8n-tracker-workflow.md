# n8n Workflow Setup for JD Tracker Status Updates

This guide shows you how to set up an n8n workflow to automatically update Google Sheets when tracker statuses change.

## Overview

The workflow receives webhook calls from your app and updates the corresponding row in Google Sheets. It handles:
- **Single updates**: When you change one tracker's status
- **Bulk updates**: When you use bulk actions to change multiple trackers

---

## Step 1: Create New Workflow

1. Open n8n and click **"New Workflow"**
2. Name it: `"Tracker Status Update to Google Sheets"`

---

## Step 2: Add Webhook Node

1. Click the **+** button
2. Search for **"Webhook"**
3. Select **"Webhook"** node
4. Configure:
   - **HTTP Method**: `POST`
   - **Path**: `tracker-status` (or any path you prefer)
   - **Response Mode**: `Immediately`
   - **Response Code**: `200`

5. **Copy the Production URL** (looks like: `https://your-n8n.app.n8n.cloud/webhook/tracker-status`)

---

## Step 3: Add Switch Node (Check Update Type)

1. Add **"Switch"** node after webhook
2. Configure:
   - **Mode**: `Rules`
   - **Rule 1**:
     - **Value 1**: `{{ $json.type }}`
     - **Operation**: `Equal`
     - **Value 2**: `bulk-edit`
   - **Fallback Output**: `true`

This splits the workflow into two paths:
- **Output 0** (Rule 1): Bulk updates
- **Fallback**: Single updates

---

## Step 4A: Handle Single Updates

### Add Google Sheets Node (for Single Update)

1. Connect a **"Google Sheets"** node to the **Fallback** output
2. Configure:
   - **Credential**: Add your Google account
   - **Resource**: `Sheet`
   - **Operation**: `Update Row`
   - **Document**: Select your tracker spreadsheet
   - **Sheet**: Select the sheet name
   
3. **Row Number**: `{{ $json.row_no }}`

4. **Columns to Update**:
   ```
   Status: {{ $json.status }}
   Brief Name: {{ $json.brief_name }}
   Role Name: {{ $json.role_name }}
   Recruiter Email: {{ $json.recruiter_email }}
   Application Sheet ID: {{ $json.application_sheet_id }}
   Last Updated: {{ $now.toISO() }}
   ```

---

## Step 4B: Handle Bulk Updates

### Add Split In Batches Node

1. Connect **"Split In Batches"** node to **Output 0** (bulk path)
2. Configure:
   - **Batch Size**: `1`
   - **Input Data**: `{{ $json.updates }}`

### Add Google Sheets Node (for Bulk Update)

1. Connect **"Google Sheets"** node after Split In Batches
2. Configure the same as Step 4A, but use:
   - **Lookup Value**: `{{ $json.tracker_id }}`
   - **Columns to Update**:
     ```
     Status: {{ $json.status }}
     Brief Name: {{ $json.brief_name }}
     Role Name: {{ $json.role_name }}
     Recruiter Email: {{ $json.recruiter_email }}
     Application Sheet ID: {{ $json.application_sheet_id }}
     Last Updated: {{ $now.toISO() }}
     ```

---

## Step 5: Configure Your App

Add to your `.env` file:

```env
STATUS_TRACKER_N8N_WEBHOOK_URL=https://your-n8n.app.n8n.cloud/webhook/tracker-status
```

**No secret needed!** The webhook is already configured without authentication.

---

## Workflow Diagram

```
Webhook
  ↓
Switch (Check type)
  ├─→ [bulk-edit] → Split In Batches → Google Sheets (Update)
  └─→ [single] → Google Sheets (Update)
```

---

## Testing

### Test Single Update

1. Go to your app's Tracker page
2. Click on a status dropdown
3. Change it to "Active" or "Not Active"
4. Check n8n execution log - you should see the webhook received
5. Check Google Sheets - the row should be updated

### Test Bulk Update

1. Select multiple trackers using checkboxes
2. Use "Set Active" or "Set Not Active" from bulk actions
3. Click "Apply"
4. Check n8n execution log - you should see one webhook with multiple updates
5. Check Google Sheets - all selected rows should be updated

---

## Expected Webhook Payloads

### Single Update
```json
{
  "tracker_id": "uuid-here",
  "status": "Active",
  "application_sheet_id": "1cFkJq...",
  "brief_name": "Job Name",
  "role_name": "Role Name",
  "recruiter_email": "email@example.com"
}
```

### Bulk Update
```json
{
  "type": "bulk-edit",
  "count": 3,
  "updates": [
    {
      "tracker_id": "uuid-1",
      "status": "Active",
      "application_sheet_id": "1cFkJq...",
      "brief_name": "Job 1",
      "role_name": "Role 1",
      "recruiter_email": "email1@example.com"
    },
    {
      "tracker_id": "uuid-2",
      "status": "Active",
      ...
    }
  ]
}
```

---

## Troubleshooting

**Webhook not firing?**
- Check `.env` has the correct webhook URL
- Restart your dev server: `npm run dev`
- Check terminal logs for webhook errors

**Google Sheets not updating?**
- Verify the row number matches your sheet
- Check Google Sheets permissions
- View n8n execution details for errors

**Bulk updates only updating one row?**
- Make sure Split In Batches is connected properly
- Check that Batch Size = 1

---

## Optional Enhancement: Email Notifications

Send email alerts when tracker statuses change.

### Setup Email Node

1. **After Google Sheets node**, add one of these email nodes:
   - **Gmail** (if using Google Workspace)
   - **Send Email** (SMTP)
   - **Outlook** (if using Microsoft)

2. **Configure Email Node:**
   - **To**: `={{ $json.recruiter_email }}` (or your admin email)
   - **Subject**: `JD Tracker Status Update - {{ $json.brief_name }}`
   - **Email Type**: `Text` or `HTML`

3. **Email Body Template (Text):**
```
Hello,

The status for the following tracker has been updated:

Brief Name: {{ $json.brief_name }}
Role: {{ $json.role_name }}
New Status: {{ $json.status }}
Recruiter: {{ $json.recruiter_email }}

View the sheet: https://docs.google.com/spreadsheets/d/{{ $json.application_sheet_id }}

Best regards,
Outcruit JD Tracker
```

4. **Email Body Template (HTML):**
```html
<h2>JD Tracker Status Update</h2>
<p>The status for the following tracker has been updated:</p>
<table style="border-collapse: collapse;">
  <tr>
    <td style="padding: 8px; font-weight: bold;">Brief Name:</td>
    <td style="padding: 8px;">{{ $json.brief_name }}</td>
  </tr>
  <tr>
    <td style="padding: 8px; font-weight: bold;">Role:</td>
    <td style="padding: 8px;">{{ $json.role_name }}</td>
  </tr>
  <tr>
    <td style="padding: 8px; font-weight: bold;">New Status:</td>
    <td style="padding: 8px;"><strong>{{ $json.status }}</strong></td>
  </tr>
  <tr>
    <td style="padding: 8px; font-weight: bold;">Recruiter:</td>
    <td style="padding: 8px;">{{ $json.recruiter_email }}</td>
  </tr>
</table>
<p><a href="https://docs.google.com/spreadsheets/d/{{ $json.application_sheet_id }}">View Google Sheet</a></p>
```

### For Bulk Updates

If you want emails for bulk updates, add the email node after the **Split In Batches** node so each update gets an email.

Alternatively, send one summary email:
- Skip Split In Batches
- Send email with list of all changes
- Use: `{{ $json.updates.length }} trackers updated`

### Testing

1. Change a tracker status
2. Check Google Sheets (should update)
3. Check email inbox (should receive notification)

---

That's it! Your tracker status updates will now automatically sync to Google Sheets and send email notifications! 🎉
