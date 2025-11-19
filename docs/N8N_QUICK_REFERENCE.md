# n8n HTTP Request Node - Quick Reference Card

## 🎯 Add This Node at the End of Your Workflow
**🚀 Real-time notifications via Server-Sent Events - appears instantly!**

### Node Configuration

**Node Type:** `HTTP Request`

**Method:** `POST`

**URL:** 
```
https://your-domain.com/api/webhooks/notifications
```
*Replace `your-domain.com` with your actual domain*

---

## 📋 Headers

Click "Add Header" and add:

| Name | Value |
|------|-------|
| `Content-Type` | `application/json` |

---

## 📝 Body Configuration

**Body Content Type:** `JSON`

**JSON Body:**

### For JD Tracker Success:
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
    "workflowId": "{{ $workflow.id }}"
  }
}
```

### For Talent Sorting Success:
```json
{
  "type": "talent-sorting",
  "message": "Talent sorting for '{{ $json.jobName }}' is complete! Check your results.",
  "jobName": "{{ $json.jobName }}",
  "status": "success",
  "recruiterName": "{{ $json.recruiterName }}",
  "recruiterEmail": "{{ $json.recruiterEmail }}",
  "metadata": {
    "candidatesProcessed": "{{ $json.candidateCount }}"
  }
}
```

### For Job Ads Success:
```json
{
  "type": "job-ads",
  "message": "Job ad for '{{ $json.jobName }}' has been created successfully!",
  "jobName": "{{ $json.jobName }}",
  "status": "success",
  "recruiterName": "{{ $json.recruiterName }}",
  "recruiterEmail": "{{ $json.recruiterEmail }}",
  "metadata": {
    "adPlatforms": "{{ $json.platforms }}"
  }
}
```

### For Errors:
```json
{
  "type": "jd-tracker",
  "message": "There was an error processing '{{ $json.jobName }}'. Please try again.",
  "jobName": "{{ $json.jobName }}",
  "status": "error",
  "recruiterName": "{{ $json.recruiterName }}",
  "recruiterEmail": "{{ $json.recruiterEmail }}",
  "metadata": {
    "error": "{{ $json.errorMessage }}"
  }
}
```

---

## 🔑 Required Fields

| Field | Type | Required | Example |
|-------|------|----------|---------|
| `type` | string | ✅ Yes | `"jd-tracker"` |
| `message` | string | ✅ Yes | `"Your JD has been processed!"` |
| `jobName` | string | ⚪ Optional | `"Senior Developer"` |
| `status` | string | ⚪ Optional | `"success"` or `"error"` |
| `recruiterName` | string | ⚪ Optional | `"John Smith"` |
| `recruiterEmail` | string | ⚪ Optional | `"john@company.com"` |
| `metadata` | object | ⚪ Optional | `{ "processedAt": "..." }` |

---

## 📌 Valid Types

- `jd-tracker` - JD Tracker workflows
- `talent-sorting` - Talent Sorting workflows  
- `job-ads` - Job Ad creation workflows
- `system` - System notifications

---

## ✅ Expected Response

```json
{
  "success": true,
  "message": "Notification received and broadcasted",
  "notificationId": "notif_1699564800000_abc123",
  "timestamp": "2024-11-06T10:30:00.000Z"
}
```

**🚀 Instant delivery**: Notification appears immediately in all connected browsers!

**Status Code:** `200 OK`

---

## 🧪 Test with cURL

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

---

## 🔍 Troubleshooting

### Getting 400 Error?
- ✅ Check `type` field is present
- ✅ Check `message` field is present
- ✅ Verify `type` is one of: `jd-tracker`, `talent-sorting`, `job-ads`, `system`

### Getting 500 Error?
- ✅ Check your application is deployed
- ✅ Verify the URL is correct
- ✅ Check application logs

### Notification not appearing?
- ✅ **Refresh browser** to establish SSE connection
- ✅ Check browser console for connection messages
- ✅ Check bell icon in app header
- ✅ Click bell to open notification panel

---

## 📸 Visual Guide

```
Your n8n Workflow:
┌─────────────────────┐
│  Webhook Trigger    │
└──────────┬──────────┘
           │
┌──────────▼──────────┐
│  Process Data       │
│  (AI, Logic, etc.)  │
└──────────┬──────────┘
           │
┌──────────▼──────────┐
│  Store Results      │
└──────────┬──────────┘
           │
┌──────────▼──────────┐
│  HTTP Request       │ ← ADD THIS NODE
│  POST notification  │
└──────────┬──────────┘
           │
┌──────────▼──────────┐
│  End                │
└─────────────────────┘
```

---

## 💡 Pro Tips

1. **Use workflow variables** - Replace `{{ $json.jobName }}` with your actual variable names
2. **Test first** - Use the cURL command to test before connecting n8n
3. **Check logs** - Monitor your application logs for webhook receipts
4. **Add error handling** - Use n8n's error workflow to catch failures
5. **Customize messages** - Make messages user-friendly and actionable

---

## 📞 Need Help?

1. Check `N8N_WEBHOOK_SETUP.md` for detailed setup
2. Check `PRODUCTION_DEPLOYMENT.md` for deployment guide
3. Test the endpoint with cURL first
4. Check browser console for errors
5. Verify polling is active (every 10 seconds)

---

## ✨ That's It!

Copy the JSON body, paste into your n8n HTTP Request node, update the URL, and you're done! Notifications will appear in your app within 10 seconds of workflow completion.
