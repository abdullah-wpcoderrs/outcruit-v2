# 🚀 Production Deployment Checklist

Complete checklist for deploying Outcruit to production.

## Pre-Deployment

### 1. Database Setup
- [ ] Run `supabase-production.sql` in Supabase SQL Editor
- [ ] Verify all tables created successfully
- [ ] Confirm RLS is enabled on all tables
- [ ] Verify Realtime is enabled for notifications table
- [ ] Check all policies are active
- [ ] Create production users (remove default test user)

### 2. Environment Variables
- [ ] `NEXT_PUBLIC_SUPABASE_URL` - Supabase project URL
- [ ] `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Supabase anon key
- [ ] `SUPABASE_SERVICE_ROLE_KEY` - Supabase service role key (CRITICAL)
- [ ] `NEXT_PUBLIC_CREATE_JOB_ADS_WEBHOOK` - n8n webhook URL
- [ ] `NEXT_PUBLIC_JD_TRACKER_WEBHOOK` - n8n webhook URL
- [ ] `NEXT_PUBLIC_TALENT_SORTING_WEBHOOK` - n8n webhook URL

### 3. Code Review
- [ ] Run `npm run build` - No errors
- [ ] Run `npm run lint` - No critical issues
- [ ] All TypeScript errors resolved
- [ ] No console.logs in production code (optional)
- [ ] All TODO comments addressed

### 4. Security Review
- [ ] Service role key NOT exposed in client code
- [ ] RLS policies tested and working
- [ ] Auth session management working
- [ ] CORS configured properly
- [ ] No hardcoded credentials in code

## Deployment

### 5. Vercel Setup
- [ ] GitHub repository connected to Vercel
- [ ] Environment variables added to Vercel
- [ ] Build settings configured (Next.js)
- [ ] Domain configured (if custom domain)
- [ ] SSL certificate active

### 6. Deploy
- [ ] Push code to main branch
- [ ] Verify Vercel build succeeds
- [ ] Check deployment logs for errors
- [ ] Visit production URL
- [ ] Verify app loads correctly

## Post-Deployment

### 7. Functionality Testing

#### Authentication
- [ ] Can access login page
- [ ] Can login with valid credentials
- [ ] Invalid credentials show error
- [ ] Session persists on refresh
- [ ] Logout works correctly
- [ ] Redirects work properly

#### Forms
- [ ] JD Tracker form loads
- [ ] Talent Sorting form loads
- [ ] Create Job Ads form loads
- [ ] Email auto-populated from logged-in user
- [ ] Can submit forms successfully
- [ ] File uploads work (PDF)
- [ ] Form validation works
- [ ] Success/error modals display

#### Notifications
- [ ] Notification bell shows in header
- [ ] Can open notification panel
- [ ] Realtime connection established (check console)
- [ ] Submit form → n8n processes → notification appears
- [ ] Notification appears instantly (no refresh needed)
- [ ] Can mark notification as read
- [ ] Counter updates immediately
- [ ] Can delete notifications
- [ ] Can clear all notifications
- [ ] Refresh button works

### 8. n8n Integration
- [ ] Update all n8n HTTP Request nodes to production URL
- [ ] Test JD Tracker workflow end-to-end
- [ ] Test Talent Sorting workflow end-to-end
- [ ] Test Create Job Ads workflow end-to-end
- [ ] Verify notifications sent to correct user
- [ ] Check webhook response codes (200 OK)
- [ ] Verify notification payload format

### 9. Performance Testing
- [ ] Page load time acceptable (<3s)
- [ ] Forms submit quickly
- [ ] Notifications appear instantly
- [ ] No memory leaks (check DevTools)
- [ ] Realtime connection stable
- [ ] Database queries optimized

### 10. Browser Testing
- [ ] Chrome (latest)
- [ ] Firefox (latest)
- [ ] Safari (latest)
- [ ] Edge (latest)
- [ ] Mobile Chrome
- [ ] Mobile Safari

### 11. Error Handling
- [ ] Network errors handled gracefully
- [ ] Invalid form data shows errors
- [ ] Failed uploads show error messages
- [ ] Auth errors display properly
- [ ] 404 page works
- [ ] API errors logged

## Monitoring

### 12. Setup Monitoring
- [ ] Vercel Analytics enabled
- [ ] Error tracking configured (optional: Sentry)
- [ ] Supabase logs monitored
- [ ] n8n workflow logs checked
- [ ] Database performance monitored

### 13. Backup & Recovery
- [ ] Database backup strategy in place
- [ ] Supabase automatic backups enabled
- [ ] Recovery procedure documented
- [ ] Test restore process

## Documentation

### 14. Update Documentation
- [ ] Production URL in README
- [ ] n8n webhook URLs documented
- [ ] User creation process documented
- [ ] Troubleshooting guide updated
- [ ] API endpoints documented

### 15. Team Handoff
- [ ] Access credentials shared securely
- [ ] Deployment process documented
- [ ] Support contacts listed
- [ ] Escalation process defined

## Maintenance

### 16. Regular Tasks
- [ ] Monitor notification table size
- [ ] Run cleanup function monthly (old notifications)
- [ ] Review error logs weekly
- [ ] Check Supabase usage/limits
- [ ] Update dependencies quarterly
- [ ] Review and update RLS policies as needed

### 17. User Management
- [ ] Process for creating new users
- [ ] Process for deactivating users
- [ ] Password reset flow tested
- [ ] User roles defined (if applicable)

## Rollback Plan

### 18. If Issues Occur
- [ ] Previous deployment URL saved
- [ ] Rollback procedure documented
- [ ] Database migration rollback plan
- [ ] Communication plan for downtime
- [ ] Support team notified

## Sign-Off

### Final Checks
- [ ] All checklist items completed
- [ ] Stakeholders notified of deployment
- [ ] Support team ready
- [ ] Monitoring active
- [ ] Documentation updated

---

## Quick Reference

### Production URLs
- **App:** https://your-domain.vercel.app
- **Webhook:** https://your-domain.vercel.app/api/webhooks/notifications

### Critical Credentials
- Supabase Project: https://app.supabase.com/project/[project-id]
- Vercel Dashboard: https://vercel.com/[team]/[project]
- n8n Instance: [your-n8n-url]

### Support Contacts
- Technical Lead: [name/email]
- DevOps: [name/email]
- Product Owner: [name/email]

### Emergency Procedures
1. Check Vercel deployment logs
2. Check Supabase logs
3. Check n8n workflow logs
4. Review error tracking (if configured)
5. Rollback if critical issue
6. Notify stakeholders

---

## Post-Launch

### Week 1
- [ ] Monitor error rates daily
- [ ] Check user feedback
- [ ] Review performance metrics
- [ ] Address any critical issues
- [ ] Document any workarounds

### Month 1
- [ ] Review usage patterns
- [ ] Optimize slow queries
- [ ] Clean up old notifications
- [ ] Update documentation based on feedback
- [ ] Plan next iteration

---

**Deployment Date:** _____________  
**Deployed By:** _____________  
**Version:** 2.0 (Realtime Implementation)  
**Status:** ⬜ Ready | ⬜ In Progress | ⬜ Complete  

