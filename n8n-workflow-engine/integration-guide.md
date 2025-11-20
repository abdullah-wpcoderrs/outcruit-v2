# n8n Integration Guide

This guide details how to update your n8n workflows to integrate with the new Neon DB-backed API endpoints.

## Base URL
All API requests should be made to your application's base URL (e.g., `https://your-app.vercel.app` or `http://localhost:3000` for testing).

## 1. File Uploads
To store files (PDFs, Excel sheets) in the database, use the `/api/upload` endpoint.

*   **Method:** `POST`
*   **URL:** `/api/upload`
*   **Body Content Type:** `multipart/form-data`
*   **Form Fields:**
    *   `file`: The binary file data.
*   **Response:**
    ```json
    {
      "url": "https://...",
      "id": "uuid-of-file"
    }
    ```

**n8n Node Configuration (HTTP Request):**
*   **Method:** POST
*   **URL:** `{{$env.BASE_URL}}/api/upload`
*   **Send Binary Data:** true
*   **Binary Property:** (The name of the binary property in n8n, e.g., `data`)

---

## 2. Job Ads Workflow (`createJobAds`)

**Goal:** Save the generated Job Ad PDF and metadata to the database.

**Steps:**
1.  **Upload PDF:** Add an HTTP Request node after the PDF generation/download step to upload the PDF to `/api/upload`.
2.  **Save Metadata:** Add another HTTP Request node to save the job ad details.

**Save Metadata Node Configuration:**
*   **Method:** `POST`
*   **URL:** `{{$env.BASE_URL}}/api/callbacks/job-ad`
*   **Body Content Type:** `JSON`
*   **JSON Body:**
    ```json
    {
      "jobTitle": "{{ $json.jobTitle }}",
      "fileId": "{{ $json.uploadResult.id }}", 
      "recruiterEmail": "{{ $json.recruiterEmail }}"
    }
    ```
    *(Replace `{{...}}` with actual expressions to get data from previous nodes)*

---

## 3. Talent Sorting Workflow (`talentSorting`)

**Goal:** Save the sorted candidate list (Sheet) and metadata.

**Steps:**
1.  **Upload Sheet:** If you are generating a physical Excel file, upload it to `/api/upload`. If you are just using Google Sheets, you might want to generate a PDF export or just save the Google Sheet URL (though the current DB schema expects a `file_id` for a stored file). *Recommendation: Export the Google Sheet to PDF or Excel binary in n8n, then upload.*
2.  **Save Metadata:** Add an HTTP Request node.

**Save Metadata Node Configuration:**
*   **Method:** `POST`
*   **URL:** `{{$env.BASE_URL}}/api/callbacks/talent-sort`
*   **Body Content Type:** `JSON`
*   **JSON Body:**
    ```json
    {
      "jobTitle": "{{ $json.jobTitle }}",
      "fileId": "{{ $json.uploadResult.id }}",
      "candidateCount": {{ $json.candidateCount }},
      "recruiterEmail": "{{ $json.recruiterEmail }}"
    }
    ```

---

## 4. JD Tracker Workflow (`jdTracker`)

**Goal:** Populate the `job_trackers` table.

**Steps:**
1.  **Save Tracker Data:** Add an HTTP Request node at the end of the workflow.

**Save Metadata Node Configuration:**
*   **Method:** `POST`
*   **URL:** `{{$env.BASE_URL}}/api/callbacks/tracker`
*   **Body Content Type:** `JSON`
*   **JSON Body:**
    ```json
    {
      "briefName": "{{ $json.Brief_Name }}",
      "status": "{{ $json.Status }}",
      "recruiterEmail": "{{ $json.Recruiter_Email }}",
      "additionalRequirements": "{{ $json.Additional_Requirements }}",
      "roleName": "{{ $json.Role_Name }}",
      "requiredSkills": "{{ $json.Required_Skills }}",
      "educationLevel": "{{ $json.Education_Level }}",
      "locationReqs": "{{ $json.Location_Reqs }}",
      "aiBriefText": "{{ $json.AI_Brief_Text }}",
      "applicationSheetId": "{{ $json.Application_Sheet_ID }}",
      "recruitmentType": "{{ $json.Recruitment_Type }}",
      "grade": "{{ $json.Grade }}",
      "age": "{{ $json.Age }}"
    }
    ```
