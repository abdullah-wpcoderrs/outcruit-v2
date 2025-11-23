# Admin Dashboard Implementation

## Developer Section

### Overview
- Client-side gate: non-admin users see an access-denied modal immediately and are redirected to their dashboard within ~2 seconds.
- RLS: database row-level security policies enforce admin-only global actions and per-user visibility for user-owned data.
- Claims: server sets `request.jwt.claim.sub` (user id) and `request.jwt.claim.role` (role) on every DB session so RLS policies evaluate correctly.
- Admin UI: three tabs in this order — Analytics, Activities, Users.

### Access Control Flow
1. On `/admin`, fetch current user via `/api/auth/me`.
2. If `role !== 'admin'`: show modal, schedule `router.replace('/dashboard')` after 2s, do not render admin UI.
3. If `role === 'admin'`: render admin sections and load data.

### RLS Integration
- Policies enabled on core tables: `users`, `notifications`, `files`, `job_ads`, `talent_lists`, `job_trackers`, `candidates`, `email_communications`, `interview_batches`.
- Admin privileges: full read/write on all rows.
- User privileges: read/write limited to rows owned by `user_id` or self on `users`.
- Server helpers:
  - `withClient(userId, role, fn)`: opens a client, sets session claims, runs `fn(client)`.
  - Used across admin/profile/auth endpoints and being applied to remaining routes.

### Users Tab
- Create user: dialog form with Email, Password, Name, Role (dropdown: admin/user). On submit, POST to admin users API; password hashed server-side.
- Table: columns Email, Name, Organization (editable inline), Role (badge, non-editable), Actions.
- Role toggle: switch changes role between admin/user via PUT.
- Delete: destructive button (red background, white text) removes user via DELETE.

### Activities Tab (Latest Items)
- Shows recent lists across notifications, job ads, talent lists, and trackers.
- Each list limited to the latest 10 items, ordered by creation time.

### Analytics Tab (Streamlined Metrics)
- Registered Users: total count from `users`.
- Job Postings: total count from `job_ads`.
- JD Trackers: total count from `job_trackers`.
- Candidate Records: total count from `candidates` (populated by talent sorting results).
- Emails Sent: total count from `email_communications`.
- Interview Schedules: total count from `interview_batches`.

### Data Sources and Queries
- Analytics metrics execute simple `COUNT(*)` queries on the respective tables via an admin session.
- Activities lists query latest 10 rows ordered by `created_at` from `users`, `notifications`, `job_ads`, `talent_lists`, `job_trackers`.
- Users CRUD uses admin claims so inserts/updates/deletes obey RLS policies.

### Workflow Logic Tree
- Entry
  - Verify current user
    - Not logged in → block access
    - Logged in
      - Role ≠ admin → show modal + redirect to dashboard
      - Role = admin → load admin UI
        - Analytics
          - Counts: users, job_ads, job_trackers, candidates, email_communications, interview_batches
        - Activities
          - Latest: notifications, job_ads, talent_lists, job_trackers
        - Users
          - Search → list users
          - Create (dialog) → POST (hash password) → refresh
          - Edit name/org (inline) → PUT → refresh
          - Toggle role (switch) → PUT → refresh
          - Delete (button) → DELETE → refresh

## Executive Read Section

### What the Admin Dashboard Does
- It prevents non-admins from viewing sensitive screens. If a non-admin tries to open the admin area, they see an “Access Denied” pop-up and are quickly returned to their normal dashboard.
- It shows simple, clear totals for the most important operational numbers.
- It lists recent activity so you can quickly see what changed lately.
- It lets authorized admins manage user accounts safely.

### What Each Number Means
- Registered Users: how many accounts exist in the system.
- Job Postings: how many job ads have been created or drafted.
- JD Trackers: how many job description tracking records have been set up.
- Candidate Records: how many candidate entries the system is tracking (including those pulled in from talent sorting results).
- Emails Sent: how many emails the system has sent or logged.
- Interview Schedules: how many interview batch schedules have been created.

### Recent Activities
- A feed of recent items across notifications, job postings, talent lists, and trackers. This helps you understand what just happened without digging through multiple pages.

### Managing Users
- Create a new user with email, password, name, and role (admin or user). The password is stored securely.
- Edit a user’s name or organization right from the table.
- Switch a user’s role between admin and user using a simple toggle.
- Delete a user when needed, with a clear red “Delete” button.

### How Security Is Enforced
- The system enforces strict access rules at the database level. Admins can manage everything; regular users can only see and edit what belongs to them. Every server request carries the user’s identity and role so the database knows exactly what’s allowed.