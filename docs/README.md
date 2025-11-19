# Outcruit Documentation

Complete documentation for the Outcruit recruitment automation platform.

## 📚 Table of Contents

### Getting Started
- [README](../README.md) - Project overview and quick start
- [Deployment Checklist](./DEPLOYMENT_CHECKLIST.md) - Pre-deployment checklist

### Setup Guides

#### Authentication
- [Auth Setup](./AUTH_SETUP.md) - Supabase authentication implementation
- [Supabase Setup](./SUPABASE_SETUP.md) - Database and Supabase configuration

#### Notifications
- [Realtime Setup](./REALTIME_SETUP.md) - Supabase Realtime notification system
- [Implementation Summary](./IMPLEMENTATION_SUMMARY.md) - Complete refactor overview
- [Notification Architecture](./NOTIFICATION_ARCHITECTURE.md) - System architecture
- [Notification System](./NOTIFICATION_SYSTEM.md) - Detailed system documentation
- [Notification Sound](./NOTIFICATION_SOUND.md) - Audio notification setup

#### n8n Integration
- [n8n Endpoint Guide](./N8N_ENDPOINT_GUIDE.md) - Webhook endpoint and integration
- [n8n Quick Reference](./N8N_QUICK_REFERENCE.md) - Quick reference card
- [n8n Webhook Setup](./N8N_WEBHOOK_SETUP.md) - Detailed webhook configuration

### Production

- [Production Deployment](./PRODUCTION_DEPLOYMENT.md) - Deployment guide
- [Production Ready](./PRODUCTION_READY.md) - Production readiness checklist
- [Implementation Complete](./IMPLEMENTATION_COMPLETE.md) - Implementation status

### Maintenance

- [Service Worker Cleanup](./SW_CLEANUP_INSTRUCTIONS.md) - Cleanup instructions

## 🏗️ Architecture Overview

### Tech Stack
- **Frontend:** Next.js 16 (App Router), React, TypeScript
- **Backend:** Supabase (PostgreSQL + Realtime)
- **Authentication:** Supabase Auth
- **Automation:** n8n workflows
- **Deployment:** Vercel

### Key Features
- ✅ Real-time notifications via Supabase Realtime
- ✅ Row-Level Security (RLS) for data protection
- ✅ Automatic user authentication
- ✅ n8n workflow integration
- ✅ Multi-form job processing

## 🚀 Quick Start

1. **Setup Database:**
   ```bash
   # Run supabase-setup.sql in Supabase SQL Editor
   ```

2. **Configure Environment:**
   ```bash
   cp .env.example .env
   # Add your Supabase credentials
   ```

3. **Install Dependencies:**
   ```bash
   npm install
   ```

4. **Run Development Server:**
   ```bash
   npm run dev
   ```

5. **Create Test User:**
   - See [Auth Setup](./AUTH_SETUP.md) for SQL commands

## 📖 Documentation Structure

```
docs/
├── README.md (this file)
│
├── Setup Guides
│   ├── AUTH_SETUP.md
│   ├── SUPABASE_SETUP.md
│   └── REALTIME_SETUP.md
│
├── n8n Integration
│   ├── N8N_ENDPOINT_GUIDE.md
│   ├── N8N_QUICK_REFERENCE.md
│   └── N8N_WEBHOOK_SETUP.md
│
├── Notifications
│   ├── NOTIFICATION_ARCHITECTURE.md
│   ├── NOTIFICATION_SYSTEM.md
│   └── NOTIFICATION_SOUND.md
│
├── Production
│   ├── PRODUCTION_DEPLOYMENT.md
│   ├── PRODUCTION_READY.md
│   └── DEPLOYMENT_CHECKLIST.md
│
└── Implementation
    ├── IMPLEMENTATION_SUMMARY.md
    └── IMPLEMENTATION_COMPLETE.md
```

## 🔑 Key Concepts

### Authentication Flow
```
User Login → Supabase Auth → Session Created → 
Dashboard Loads → Forms Auto-populate Email
```

### Notification Flow
```
Form Submit → n8n Processes → n8n Sends Webhook → 
Supabase Insert → Realtime Broadcast → User Sees Notification
```

### Security
- **RLS Policies:** Users only see their own data
- **Service Role:** Server-side operations bypass RLS
- **Auth Session:** Automatic token refresh and management

## 🛠️ Common Tasks

### Add a New User
```sql
-- See AUTH_SETUP.md for complete SQL
INSERT INTO auth.users (email, encrypted_password, ...)
VALUES ('user@example.com', crypt('password', gen_salt('bf')), ...);
```

### Test Notifications
```bash
curl -X POST http://localhost:3000/api/webhooks/notifications \
  -H "Content-Type: application/json" \
  -d '{"type":"system","message":"Test","recruiterEmail":"user@example.com"}'
```

### Deploy to Production
1. Push to GitHub
2. Connect to Vercel
3. Add environment variables
4. Deploy
5. Update n8n webhook URLs

## 📞 Support

For issues or questions:
1. Check relevant documentation in this folder
2. Review [Implementation Summary](./IMPLEMENTATION_SUMMARY.md)
3. Check [Troubleshooting sections](./REALTIME_SETUP.md#troubleshooting)

## 🔄 Recent Changes

### Latest Update: Supabase Realtime Implementation
- ✅ Removed SSE and polling
- ✅ Implemented Supabase Realtime
- ✅ Added proper RLS security
- ✅ Auto-populate user email in forms
- ✅ Removed hardcoded authentication

See [Implementation Summary](./IMPLEMENTATION_SUMMARY.md) for details.

## 📝 Contributing

When adding new documentation:
1. Place in appropriate category folder
2. Update this README with link
3. Follow existing documentation style
4. Include code examples where relevant

---

**Last Updated:** 2024
**Version:** 2.0 (Realtime Implementation)
