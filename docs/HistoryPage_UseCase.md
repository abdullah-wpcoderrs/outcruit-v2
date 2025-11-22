# History Page Use Cases

This document explains how the History page works, typical user flows for each tab, and the logic behind the features.

## Overview

- Tabs on History:
  - Job Ads
  - Talent Sorting
  - Tracker
- Common actions: open preview, open in new tab, download, delete, refresh.
- A “Sort New” button on Talent Sorting routes to Dashboard → Talent Sorting.

## Plain-English Overview (Non‑Technical)

- Past work at a glance
  - You can review past job content, sorted candidate lists, and progress trackers in one place.

- Easy actions
  - Quickly open, download, or remove older items. If you want to start sorting new candidates, there’s a button for that.

## What’s Implemented

- Fetches and renders Job Ads, Talent Lists, and Tracker entries for the logged‑in user.
- Preview modal for files with download and open‑in‑new‑tab actions.
- Talent Sorting tab supports two views: document grid and table view.
- Tracker table supports inline update, bulk actions, and deletion.

## Data Fetching

- Initial load fetches data in parallel:
  - `GET /api/job-ads`
  - `GET /api/talent-lists`
  - `GET /api/history/tracker`
- References: `app/history/page.tsx:56–65`

## Job Ads Tab

- Cards show job ad metadata: title, file id, created at.
- Actions:
  - Preview in modal
  - Open in new tab
  - Download file
  - Delete job ad (optimistic remove, fallback refetch)
- References: `app/history/page.tsx:245–268`, `app/history/page.tsx:260–267`, `app/history/page.tsx:84–100`, `app/history/page.tsx:102–121`

### Plain-English (Non‑Technical)

- What you see
  - A gallery of previous job promotions or descriptions.

- What you can do
  - Open any item to take a look, save a copy, or remove it if it’s no longer needed.

## Talent Sorting Tab

- View toggle:
  - Documents grid with action cards
  - Table view using `TalentSortingTable`
- Actions:
  - Preview in modal, open new tab, download, delete list
  - “Sort New” button navigates to `/dashboard?tab=talent-sorting`
- References: `app/history/page.tsx:270–303`

### Plain-English (Non‑Technical)

- What you see
  - Sorted candidate lists either as cards or as a table view.

- What you can do
  - Open the list, save a copy, or remove it. If you want to run a new sorting session, click the “Sort New” button.

## Tracker Tab

- Renders tracker table with tools:
  - Update fields inline (PATCH)
  - Delete entries
  - Bulk actions (POST `/api/history/tracker/bulk`)
  - Refresh data
- References: `components/history/tracker-table.tsx`, `app/history/page.tsx:305–313`, `app/history/page.tsx:144–167`, `app/history/page.tsx:169–187`, `app/history/page.tsx:190–207`, `app/history/page.tsx:209–218`

### Plain-English (Non‑Technical)

- What you see
  - A list showing the current state of roles you are hiring for.

- What you can do
  - Update a row if something changes, remove a row that’s outdated, or apply actions to several rows at once.

## Workflow Logic Tree (Markdown)

- History Page Load
  - Parallel fetch of Job Ads, Talent Lists, Tracker
  - Show loading → then render tabs
- Job Ads
  - Show cards
  - Actions: preview/open/download/delete
  - On delete failure → refetch
- Talent Sorting
  - View toggle (documents/table)
  - Actions: preview/open/download/delete
  - “Sort New” → Dashboard Talent Sorting
- Tracker
  - Render table
  - Inline update (PATCH)
  - Delete (DELETE)
  - Bulk actions (POST bulk)
  - Refresh (GET)

## Plain-English Flow (Non‑Technical)

1) The page loads a summary of your past work and current hiring progress.
2) You can browse older job content, view your sorted candidate lists, and check the hiring tracker.
3) From here, you can open items, save copies, remove outdated entries, or start new sorting work.

## Preview Modal

- Opens a full‑height side modal with file preview and controls.
- References: `app/history/page.tsx:315–332`

## Navigation Notes

- “Sort New” button ensures quick return to talent sorting forms.
- Dashboard opens with the `tab` query param: `app/dashboard/page.tsx:16–18`, `app/dashboard/page.tsx:24–31`

## Acceptance Criteria (History)

- Job Ads: Cards list entries with working actions.
- Talent Sorting: Toggle views and navigate to new sorting.
- Tracker: Updates, deletes, bulk actions, and refresh work reliably.
- Preview modal functions for supported files.