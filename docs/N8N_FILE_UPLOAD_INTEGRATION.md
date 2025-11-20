# n8n File Upload Integration Guide
## Storing Job Ads & Talent Sorting Files in Neon DB for History Display

This guide shows you how to extend your existing n8n workflows to upload generated PDF files to your Neon database, making them available in the History page.

---

## 🎯 Overview

Currently, your n8n workflows generate PDFs (Job Ads and Talent Sorting results) and send them via email. This guide shows you how to:

1. **Upload the generated PDF files** to your Neon database
2. **Display them** in the History page tabs ("Job Ads" and "Talent Lists")
3. **Download them** via the Outcruit web application

---

## 📊 Current Workflow Status

### Job Ads Workflow (`createJobAds.md`)
**Current Flow:**
```
Webhook → Extract PDF → Process with AI → Create Google Doc → 
Download as PDF → Email PDF → Send Notification
```

**We'll add:** Store PDF in Neon DB after download step

### Talent Sorting Workflow (`talentSorting.md`)
**Current Flow:**
```
Webhook → Get Applicants → Qualify → Create Qualified Sheet → 
Email Sheet Link → Send Notification
```

**We'll add:** Export sheet as PDF → Store PDF in Neon DB

---

## 🔧 Part 1: Job Ads Workflow Extension

### Step 1: Add HTTP Request Node to Upload PDF

After the "Download file4" node in your Job Ads workflow, add a new **HTTP Request** node:

#### Node Configuration

**Node Name:** `Upload PDF to Neon DB`

**Method:** `POST`

**URL:** 
```
https://your-domain.com/api/upload
```

**Authentication:** None (uses cookies for auth)

**Send Body:** ON

**Body Content Type:** `Form Data`

**Body Parameters:**
```
file: ={{ $binary.data }}
type: job-ad
jobTitle: ={{ $('Edit Fields1').item.json.jdName }}
recruiterEmail: ={{ $('Edit Fields1').item.json.recruiterEmail }}
```

### Step 2: Connect the Nodes

Update your workflow connections:

**Old Flow:**
```
Download file4 → Email Alert Notification
```

**New Flow:**
```
Download file4 → Upload PDF to Neon DB → Email Alert Notification
```

### Step 3: Update the HTTP Request Node (Notification)

Modify the existing "Job Ad Copy HTTP Request" node to run AFTER the PDF upload:

**Connection:**
```
Email Alert Notification → Job Ad Copy HTTP Request
```

---

## 🔧 Part 2: Talent Sorting Workflow Extension

### Step 1: Export Qualified Sheet as PDF

After the "Append or update row in sheet1" node, add a **Google Drive** node:

#### Node Configuration

**Node Name:** `Export Qualified Sheet as PDF`

**Operation:** `Download`

**File ID:** 
```
={{ $('Create \'Passed\' Sheet Tab').item.json.spreadsheetId }}
```

**Options:**
- Enable "Google File Conversion"
- Set "Docs To Format": `application/pdf`
- Set "File Name": `{{ $('Set Sheet URL').item.json.jobName }} - Qualified Candidates.pdf`

### Step 2: Add HTTP Request Node to Upload PDF

After the export node, add **HTTP Request** node:

#### Node Configuration

**Node Name:** `Upload Qualified List PDF to Neon DB`

**Method:** `POST`

**URL:**
```
https://your-domain.com/api/upload
```

**Send Body:**  ON

**Body Content Type:** `Form Data`

**Body Parameters:**
```
file: ={{ $binary.data }}
type: talent-list
jobTitle: ={{ $('Set Sheet URL').item.json.jobName }}
candidateCount: ={{ $items('Get All Passed Candidates').length }}
recruiterEmail: ={{ $('Set Sheet URL').item.json.recruiterEmail }}
```

### Step 3: Update Workflow Connections

**Old Flow:**
```
Append or update row → Aggregate → Send a message
```

**New Flow:**
```
Append or update row → Export Qualified Sheet as PDF → 
Upload Qualified List PDF to Neon DB → Aggregate → Send a message
```

---

## 📝 Part 3: Backend API Route (Already Exists!)

Your `/api/upload` route already exists and handles file uploads. It:

1. Receives the file from n8n
2. Stores it in the `files` table  
3. Creates a record in `job_ads` or `talent_lists` table
4. Returns the file ID

**Current Implementation:** `app/api/upload/route.ts`

This route correctly:
- ✅ Validates file uploads
- ✅ Stores binary data in PostgreSQL
- ✅ Links to authenticated users
- ✅ Returns file IDs for history display

---

## 🎨 Part 4: Frontend Display (Already Working!)

Your History page already fetches and displays these files:

**Location:** `app/history/page.tsx`

**API Endpoints Used:**
- `/api/job-ads` - Fetches job ad records
- `/api/talent-lists` - Fetches talent list records  
- `/api/files/[id]` - Downloads PDF files

**Display Cards:**
- `JobAdCard` - Shows job ad with download link
- `TalentListCard` - Shows talent list with download link

---

## ✅ Complete n8n Workflow JSON Updates

### Job Ads Workflow - Add This Node

```json
{
  "parameters": {
    "method": "POST",
    "url": "https://outcruit.vercel.app/api/upload",
    "sendBody": true,
    "contentType": "multipart-form-data",
    "bodyParameters": {
      "parameters": [
        {
          "name": "file",
          "inputDataFieldName": "={{ $binary.data }}"
        },
        {
          "name": "type",
          "value": "job-ad"
        },
        {
          "name": "jobTitle",
          "value": "={{ $('Edit Fields1').item.json.jdName }}"
        },
        {
          "name": "recruiterEmail",
          "value": "={{ $('Edit Fields1').item.json.recruiterEmail }}"
        }
      ]
    }
  },
  "type": "n8n-nodes-base.httpRequest",
  "typeVersion": 4.2,
  "position": [1720, 1056],
  "id": "upload-job-ad-pdf",
  "name": "Upload PDF to Neon DB"
}
```

**Connect it between:**
- Input: "Download file4"  
- Output: "Email Alert Notification"

### Talent Sorting Workflow - Add These 2 Nodes

#### Node 1: Export Sheet as PDF

```json
{
  "parameters": {
    "operation": "download",
    "fileId": {
      "__rl": true,
      "value": "={{ $('Create \\'Passed\\' Sheet Tab').item.json.spreadsheetId }}",
      "mode": "id"
    },
    "options": {
      "googleFileConversion": {
        "conversion": {
          "sheetsToFormat": "application/pdf"
        }
      },
      "fileName": "={{ $('Set Sheet URL').item.json.jobName }} - Qualified Candidates.pdf"
    }
  },
  "type": "n8n-nodes-base.googleDrive",
  "typeVersion": 3,
  "position": [2600, -1072],
  "id": "export-sheet-pdf",
  "name": "Export Qualified Sheet as PDF",
  "credentials": {
    "googleDriveOAuth2Api": {
      "id": "YOUR_GOOGLE_DRIVE_CREDENTIAL_ID"
    }
  }
}
```

#### Node 2: Upload to Database

```json
{
  "parameters": {
    "method": "POST",
    "url": "https://outcruit.vercel.app/api/upload",
    "sendBody": true,
    "contentType": "multipart-form-data",
    "bodyParameters": {
      "parameters": [
        {
          "name": "file",
          "inputDataFieldName": "={{ $binary.data }}"
        },
        {
          "name": "type",
          "value": "talent-list"
        },
        {
          "name": "jobTitle",
          "value": "={{ $('Set Sheet URL').item.json.jobName }}"
        },
        {
          "name": "candidateCount",
          "value": "={{ $items('Get All Passed Candidates').length }}"
        },
        {
          "name": "recruiterEmail",
          "value": "={{ $('Set Sheet URL').item.json.recruiterEmail }}"
        }
      ]
    }
  },
  "type": "n8n-nodes-base.httpRequest",
  "typeVersion": 4.2,
  "position": [2720, -1072],
  "id": "upload-talent-pdf",
  "name": "Upload Qualified List PDF to Neon DB"
}
```

**Connect them:**
```
Append or update row → Export Qualified Sheet as PDF → 
Upload Qualified List PDF to Neon DB → Aggregate → Send a message
```

---

## 🧪 Testing Steps

### Test Job Ads Workflow

1. **Trigger the workflow** via your Outcruit dashboard
2. **Upload a JD PDF** and submit the form
3. **Wait for n8n** to process the job ad
4. **Check your History page** → Job Ads tab
5. **Verify:**
   - New job ad card appears
   - Click "Download PDF" works
   - Timestamp is correct

### Test Talent Sorting Workflow

1. **Trigger the workflow** with a candidate sheet URL
2. ** Wait for processing** to complete
3. **Check your History page** → Talent Lists tab
4. **Verify:**
   - New talent list card appears
   - Candidate count is correct
   - Click "Download Sheet" works
   - PDF contains qualified candidates

---

## 🔍 Troubleshooting

### PDF not appearing in History page?

**Check these:**
1. ✅ n8n workflow completed successfully
2. ✅ HTTP Request node returned 200 status
3. ✅ Check database: `SELECT * FROM job_ads ORDER BY created_at DESC LIMIT 5;`
4. ✅ Check files table: `SELECT * FROM files ORDER BY created_at DESC LIMIT 5;`
5. ✅ Refresh your History page (hard refresh: Ctrl+Shift+R)

### "File not found" when downloading?

**Possible causes:**
- File ID mismatch in database
- Binary data not stored correctly
- Check n8n execution logs for upload errors

### n8n Upload returning 400/500 error?

**Debug steps:**
1. Check n8n execution log for the HTTP Request node
2. Verify `recruiterEmail` matches a user in your database
3. Test the endpoint manually with cURL:

```bash
curl -X POST https://outcruit.vercel.app/api/upload \
  -H "Cookie: auth_token=YOUR_TOKEN" \
  -F "file=@test.pdf" \
  -F "type=job-ad" \
  -F "jobTitle=Test Job" \
  -F "recruiterEmail=your@email.com"
```

---

## 📋 Checklist

Before deploying to production:

- [ ] Added "Upload PDF to Neon DB" node to Job Ads workflow
- [ ] Connected nodes in correct order
- [ ] Tested Job Ads workflow end-to-end
- [ ] Added "Export Qualified Sheet as PDF" node to Talent Sorting
- [ ] Added "Upload Qualified List PDF to Neon DB" node
- [ ] Connected talent sorting nodes correctly
- [ ] Tested Talent Sorting workflow end-to-end
-[] Verified PDFs appear in History → Job Ads tab
- [ ] Verified sheets appear in History → Talent Lists tab
- [ ] Tested PDF downloads from History page
- [ ] Checked database has correct records
- [ ] Updated webhook URLs to production domain

---

## 🎉 Result

After implementing these changes:

1. **Every Job Ad generated** → Automatically stored in Neon DB → Appears in History
2. **Every Talent List created** → PDF exported → Stored in database → Appears in History
3. **Users can view history** of all their processed jobs
4. **Download PDFs** directly from the web app
5. **Track activity** with timestamps and metadata

---

## 🔗 Related Documentation

- [N8N_WEBHOOK_SETUP.md](file:///c:/Users/HomePC/Documents/Outcruit/outcruit-web-application/docs/N8N_WEBHOOK_SETUP.md) - Setting up webhook notifications
- [createJobAds.md](file:///c:/Users/HomePC/Documents/Outcruit/outcruit-web-application/n8n-workflow-engine/createJobAds.md) - Full Job Ads workflow
- [talentSorting.md](file:///c:/Users/HomePC/Documents/Outcruit/outcruit-web-application/n8n-workflow-engine/talentSorting.md) - Full Talent Sorting workflow

---

## 💡 Pro Tips

1. **Use descriptive job titles** - They appear as card titles in History
2. **Consistent naming** - Use the same format for PDF file names
3. **Monitor file sizes** - Large PDFs may take longer to upload
4. **Test on staging first** - Verify everything works before production
5. **Check n8n logs** - Always review execution logs after changes

---

Need help? The upload API route is already built and tested. Just add the nodes to your n8n workflows and connect them as shown above! 🚀
