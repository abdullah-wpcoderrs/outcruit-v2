# n8n Integration Guide

## Webhook Endpoint for Notifications

### Production Endpoint
```
https://your-domain.vercel.app/api/webhooks/notifications
```

### Local Development Endpoint
```
http://localhost:3000/api/webhooks/notifications
```

## How It Works

### 1. User Submits Form
When a user submits any form (JD Tracker, Talent Sorting, or Create Job Ads):
- Form automatically includes the **logged-in user's email** (`recruiterEmail`)
- No need to manually enter email anymore
- Email is pulled from Supabase auth session

### 2. n8n Processes Job
Your n8n workflow receives the form data including:
```json
{
  "jobName": "Senior Developer",
  "recruiterName": "John Doe",
  "recruiterEmail": "john@example.com",  ← Automatically from logged-in user
  "jdFile": "...",
  "additionalLogic": "..."
}
```

### 3. n8n Sends Notification
At the end of your n8n workflow, add an **HTTP Request node**:

**Method:** POST  
**URL:** `https://your-domain.vercel.app/api/webhooks/notifications`  
**Body (JSON):**
```json
{
  "type": "jd-tracker",
  "message": "Your job has been processed successfully!",
  "jobName": "{{ $json.jobName }}",
  "recruiterName": "{{ $json.recruiterName }}",
  "recruiterEmail": "{{ $json.recruiterEmail }}",
  "status": "success"
}
```

### 4. Notification Appears
- Webhook looks up user by `recruiterEmail`
- Inserts notification into Supabase with correct `user_id`
- Supabase Realtime broadcasts to that user
- User sees notification instantly in their dashboard

## Changes Made

### ✅ Removed from Forms
- **Recruiter Email field** - No longer visible in forms
- Users don't need to type their email anymore
- Cleaner, simpler forms

### ✅ Auto-Populated
- Email is automatically pulled from authenticated user
- Sent to n8n in the background
- n8n can use it to send notifications back

## n8n Workflow Setup

### Step 1: Receive Form Data
Your existing webhook trigger receives form data with `recruiterEmail` included.

### Step 2: Process Job
Your workflow processes the job (AI, logic, etc.)

### Step 3: Send Notification (NEW)
Add HTTP Request node at the end:

**Configuration:**
- **Method:** POST
- **URL:** `https://your-domain.vercel.app/api/webhooks/notifications`
- **Authentication:** None (or add API key if you want)
- **Headers:**
  ```
  Content-Type: application/json
  ```
- **Body:**
  ```json
  {
    "type": "jd-tracker",
    "message": "Job processing complete! Your results are ready.",
    "jobName": "{{ $json.jobName }}",
    "recruiterName": "{{ $json.recruiterName }}",
    "recruiterEmail": "{{ $json.recruiterEmail }}",
    "status": "success",
    "metadata": {
      "processingTime": "{{ $json.processingTime }}",
      "resultsUrl": "{{ $json.resultsUrl }}"
    }
  }
  ```

## Notification Types

Use these `type` values for different workflows:

| Workflow | Type Value | Icon |
|----------|-----------|------|
| JD Tracker | `jd-tracker` | 📄 |
| Talent Sorting | `talent-sorting` | 👥 |
| Create Job Ads | `job-ads` | ⚡ |
| System Messages | `system` | 🔔 |

## Status Values

| Status | Meaning |
|--------|---------|
| `success` | Job completed successfully |
| `error` | Job failed |
| `processing` | Job still in progress |

## Example Workflows

### JD Tracker Success
```json
{
  "type": "jd-tracker",
  "message": "JD analysis complete! 15 candidates matched.",
  "jobName": "Senior Developer",
  "recruiterName": "John Doe",
  "recruiterEmail": "john@example.com",
  "status": "success",
  "metadata": {
    "candidatesFound": 15,
    "matchScore": "85%"
  }
}
```

### Talent Sorting Complete
```json
{
  "type": "talent-sorting",
  "message": "Talent pool sorted! Top 10 candidates identified.",
  "jobName": "Marketing Manager",
  "recruiterName": "Jane Smith",
  "recruiterEmail": "jane@example.com",
  "status": "success",
  "metadata": {
    "totalCandidates": 50,
    "topCandidates": 10
  }
}
```

### Job Ads Ready
```json
{
  "type": "job-ads",
  "message": "Your job ad copy is ready! Check your email.",
  "jobName": "Product Designer",
  "recruiterName": "Mike Johnson",
  "recruiterEmail": "mike@example.com",
  "status": "success"
}
```

### Error Notification
```json
{
  "type": "jd-tracker",
  "message": "Job processing failed. Please try again or contact support.",
  "jobName": "Senior Developer",
  "recruiterName": "John Doe",
  "recruiterEmail": "john@example.com",
  "status": "error",
  "metadata": {
    "errorCode": "PDF_PARSE_ERROR",
    "errorMessage": "Unable to parse PDF file"
  }
}
```

## Testing

### Test Locally
1. Start your dev server: `npm run dev`
2. Use this endpoint: `http://localhost:3000/api/webhooks/notifications`
3. Send test request:
   ```bash
   curl -X POST http://localhost:3000/api/webhooks/notifications \
     -H "Content-Type: application/json" \
     -d '{
       "type": "system",
       "message": "Test notification",
       "recruiterEmail": "recruiter@outcruit.com",
       "status": "success"
     }'
   ```

### Test in Production
1. Deploy to Vercel
2. Update n8n HTTP Request node URL to production domain
3. Submit a form and verify notification appears

## Troubleshooting

### Notification not appearing?
1. Check `recruiterEmail` matches a user in your database
2. Verify user is logged in
3. Check webhook response for `user_id`
4. Look at browser console for Realtime connection

### User not found?
- Webhook will use first user as fallback
- Check response: `{ "success": true, "user_id": "..." }`
- Ensure user exists in `public.users` table

### Multiple users?
- Each user only sees their own notifications
- `recruiterEmail` determines which user gets the notification
- RLS policies ensure security

## Summary

✅ **Endpoint:** `https://your-domain.vercel.app/api/webhooks/notifications`  
✅ **Method:** POST  
✅ **Body:** JSON with `type`, `message`, `recruiterEmail`, etc.  
✅ **Forms:** Automatically include logged-in user's email  
✅ **Security:** RLS ensures users only see their notifications  
✅ **Real-time:** Notifications appear instantly via Supabase Realtime  

Your n8n workflows can now send notifications directly to the correct user!
