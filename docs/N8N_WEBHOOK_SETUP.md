# n8n Webhook Setup - Production Ready

## 🎯 Overview
This guide shows you how to configure the HTTP Request node in n8n to send **real-time notifications** to your Outcruit application when a workflow completes. Notifications appear **instantly** using Server-Sent Events (SSE).

## 📍 Webhook Endpoint

```
POST https://your-domain.com/api/webhooks/notifications
```

Replace `your-domain.com` with your actual domain (e.g., `outcruit.vercel.app`)

**🚀 Real-time Delivery**: Notifications appear instantly in the browser (no polling delay!)

## 🔧 n8n HTTP Request Node Configuration

### Method
```
POST
```

### URL
```
https://your-domain.com/api/webhooks/notifications
```

### Authentication
```
None (for now - add API key in production)
```

### Headers
```json
{
  "Content-Type": "application/json"
}
```

### Body (JSON)

#### For JD Tracker Success:
```json
{
  "type": "jd-tracker",
  "message": "Your JD '{{ $json.jobName }}' has been processed successfully! You can now view the results.",
  "jobName": "{{ $json.jobName }}",
  "status": "success",
  "recruiterName": "{{ $json.recruiterName }}",
  "recruiterEmail": "{{ $json.recruiterEmail }}",
  "metadata": {
    "processedAt": "{{ $now }}",
    "workflowId": "{{ $workflow.id }}",
    "executionId": "{{ $execution.id }}"
  }
}
```

#### For Talent Sorting Success:
```json
{
  "type": "talent-sorting",
  "message": "Talent sorting for '{{ $json.jobName }}' is complete! Check your results.",
  "jobName": "{{ $json.jobName }}",
  "status": "success",
  "recruiterName": "{{ $json.recruiterName }}",
  "recruiterEmail": "{{ $json.recruiterEmail }}",
  "metadata": {
    "processedAt": "{{ $now }}",
    "candidatesProcessed": "{{ $json.candidateCount }}",
    "sortingCriteria": "{{ $json.sortingCriteria }}"
  }
}
```

#### For Job Ads Success:
```json
{
  "type": "job-ads",
  "message": "Job ad for '{{ $json.jobName }}' has been created successfully!",
  "jobName": "{{ $json.jobName }}",
  "status": "success",
  "recruiterName": "{{ $json.recruiterName }}",
  "recruiterEmail": "{{ $json.recruiterEmail }}",
  "metadata": {
    "processedAt": "{{ $now }}",
    "adPlatforms": "{{ $json.platforms }}",
    "adBudget": "{{ $json.budget }}"
  }
}
```

#### For Errors:
```json
{
  "type": "jd-tracker",
  "message": "There was an error processing '{{ $json.jobName }}'. Please try again or contact support.",
  "jobName": "{{ $json.jobName }}",
  "status": "error",
  "recruiterName": "{{ $json.recruiterName }}",
  "recruiterEmail": "{{ $json.recruiterEmail }}",
  "metadata": {
    "error": "{{ $json.errorMessage }}",
    "timestamp": "{{ $now }}",
    "retryCount": "{{ $json.retryCount }}"
  }
}
```

## 📋 Step-by-Step Setup in n8n

### 1. Add HTTP Request Node
- At the end of your workflow, add an **HTTP Request** node
- This should be after all processing is complete

### 2. Configure the Node

**Request Method:**
- Select: `POST`

**URL:**
- Enter: `https://your-domain.com/api/webhooks/notifications`
- Replace `your-domain.com` with your actual domain

**Authentication:**
- Select: `None` (or configure API key if you've set it up)

**Send Headers:**
- Toggle: `ON`
- Add header:
  - Name: `Content-Type`
  - Value: `application/json`

**Send Body:**
- Toggle: `ON`
- Body Content Type: `JSON`

**JSON Body:**
```json
{
  "type": "jd-tracker",
  "message": "Your JD '{{ $json.jobName }}' has been processed successfully!",
  "jobName": "{{ $json.jobName }}",
  "status": "success",
  "recruiterName": "{{ $json.recruiterName }}",
  "recruiterEmail": "{{ $json.recruiterEmail }}",
  "metadata": {
    "processedAt": "{{ $now }}",
    "workflowId": "{{ $workflow.id }}"
  }
}
```

### 3. Map Your Variables
Replace the placeholders with your actual n8n variables:
- `{{ $json.jobName }}` - The job name from your workflow
- `{{ $json.recruiterName }}` - The recruiter's full name (e.g., "John Smith")
- `{{ $json.recruiterEmail }}` - The recruiter's email address
- `{{ $now }}` - Current timestamp
- `{{ $workflow.id }}` - n8n workflow ID
- `{{ $execution.id }}` - n8n execution ID
- Add any other relevant data from your workflow

### 4. Test the Connection
1. Click "Execute Node" in n8n
2. Check your Outcruit application
3. **Notification appears instantly** (no waiting!)
4. Click the bell icon (🔔) in the header to view details

## 🔄 Complete Workflow Example

```
Webhook Trigger (receives form data)
    ↓
Process JD (your AI/logic)
    ↓
Store Results (database/file)
    ↓
HTTP Request (send notification) ← Add this node
    ↓
End
```

## 📝 Payload Field Reference

### Required Fields
| Field | Type | Description | Example |
|-------|------|-------------|---------|
| `type` | string | Notification type | `"jd-tracker"` |
| `message` | string | Message to display | `"Your JD has been processed!"` |

### Optional Fields
| Field | Type | Description | Example |
|-------|------|-------------|---------|
| `jobName` | string | Name of the job | `"Senior Developer"` |
| `status` | string | Status of the job | `"success"` or `"error"` |
| `recruiterName` | string | Full name of recruiter | `"John Smith"` |
| `recruiterEmail` | string | Recruiter's email | `"john@company.com"` |
| `metadata` | object | Additional data | `{ "processedAt": "..." }` |

### Valid Types
- `jd-tracker` - For JD Tracker workflows
- `talent-sorting` - For Talent Sorting workflows
- `job-ads` - For Job Ad creation workflows
- `system` - For system notifications

## 🧪 Testing

### Test with cURL
```bash
curl -X POST https://your-domain.com/api/webhooks/notifications \
  -H "Content-Type: application/json" \
  -d '{
    "type": "jd-tracker",
    "message": "Test notification from n8n!",
    "jobName": "Test Job",
    "status": "success"
  }'
```

### Expected Response
```json
{
  "success": true,
  "message": "Notification received and broadcasted",
  "notificationId": "notif_1699564800000_abc123",
  "timestamp": "2024-11-06T10:30:00.000Z"
}
```

**🚀 Real-time**: Notification is instantly broadcasted to all connected browsers via Server-Sent Events!

## 🔒 Security (Production)

### Add API Key Authentication
1. Generate a secure API key
2. Add to your `.env.local`:
```bash
WEBHOOK_API_KEY=your-secure-api-key-here
```

3. Update the API route to validate the key
4. In n8n, add the header:
   - Name: `X-API-Key`
   - Value: `your-secure-api-key-here`

## 🐛 Troubleshooting

### Notification not appearing?
1. **Refresh your browser** to establish SSE connection
2. Check n8n execution log for errors
3. Verify the URL is correct (include https://)
4. Check browser console for SSE connection messages
5. Verify the payload format matches the examples

### Getting 400 error?
- Check that `type` and `message` fields are present
- Verify `type` is one of the valid types
- Ensure JSON is properly formatted

### Getting 500 error?
- Check your application logs
- Verify the API route is deployed
- Test the endpoint with cURL first

## ✅ Checklist

Before going live:
- [ ] Replace `your-domain.com` with actual domain
- [ ] Test with cURL command
- [ ] Test from n8n workflow
- [ ] Verify notification appears in app
- [ ] Check bell icon updates with badge
- [ ] Test on mobile device
- [ ] Add API key authentication (recommended)
- [ ] Monitor application logs

## 🎉 You're Ready!

Once configured, every time your n8n workflow completes:
1. n8n sends a POST request to your webhook
2. Your app receives the notification
3. **Notification is instantly broadcasted** via Server-Sent Events
4. Users see the notification **immediately** (0ms delay!)
5. Bell icon updates with unread count
6. Users can view, read, and manage notifications

The notification will persist in localStorage and be available even after page refresh!
