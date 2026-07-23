# Student Dashboard Data Flow

## Purpose

This document defines the secure data path for the Industrial Learn student dashboard.

Source IDs: IL-AGENTS-001, IL-AUTH-001, IL-DAL-001, IL-DB-001.

## Flow

```text
Authenticated session
-> auth user ID
-> student profile
-> server dashboard data loader
-> session-bound database records
-> dashboard progress model
-> server-rendered dashboard
```

The dashboard page does not accept a student identity from route parameters, query parameters, hidden form fields, or browser storage.

## Implementation

- Page: `apps/web/src/app/dashboard/page.tsx`
- Server loader: `apps/web/src/features/student-dashboard/server-data.ts`
- Progress model: `apps/web/src/features/student-dashboard/data.ts`
- Dismiss action: `apps/web/src/features/student-dashboard/actions.ts`
- UI: `apps/web/src/features/student-dashboard/components.tsx`

## Private Caching

The dashboard route is `force-dynamic`, has `revalidate = 0`, and calls `noStore()`. Supabase REST requests use `cache: "no-store"`.

## Data Sources

When Supabase is configured, records are loaded with the authenticated session token and PostgreSQL row-level security remains active.

For Playwright E2E only, `INDUSTRIAL_LEARN_AUTH_MODE=local` plus `INDUSTRIAL_LEARN_E2E=true` dynamically imports an isolated local dashboard store. That store is not used in production mode.

## Database Tables

Existing tables used:

- `profiles`
- `enrolments`
- `lesson_progress`
- `assessment_attempts`
- `simulation_attempts`
- `project_submissions`

Additive preference tables:

- `saved_lessons`
- `dashboard_recommendation_dismissals`

## Access Control

Students can only load their own dashboard because the page first calls `requireStudentProfile()`. Lecturer, reviewer, author, and administrator routes do not automatically receive student-dashboard impersonation capability.

Recommendation dismissal writes use the authenticated student's profile ID on the server.

## Current Limitations

- Supabase dashboard queries currently expect flattened view-like fields such as `programme_slug`, `lesson_slug`, and `module_slug` when those are not directly present on early schema tables. Production rollout should add SQL views or repository adapters that map normalized records without exposing hidden fields.
- Career-pathway assignment records are not yet modelled; pathway progress currently uses enrolled modules as the available evidence sequence.
