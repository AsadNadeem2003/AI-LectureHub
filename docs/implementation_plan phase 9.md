# Implementation Plan: Phase 9 - System Analytics & Engagement Dashboard

Provide comprehensive quantitative analytics for Admins and Teachers, including student engagement rates, lecture completion rates, Q&A accuracy ratios, and role token hardening.

## User Review Required

> [!IMPORTANT]
> **Token Authentication Hardening**: Backend now returns clean `401 Unauthorized` (`TOKEN_EXPIRED` / `INVALID_TOKEN`) whenever an auth token expires. Frontend auto-clears expired tokens and redirects users cleanly to `/login` instead of throwing invalid token errors.

## Proposed Changes

### Component 1: Auth Token Hardening & Middleware
#### [MODIFY] [auth.middleware.ts](file:///d:/Amperor%20Tech%20Internship%20Projects/AI%20Lecture%20Hub/backend/src/middleware/auth.middleware.ts)
- Return 401 JSON for expired / invalid tokens.

### Component 2: Analytics Backend API Routes (`/backend/src/routes/analytics.routes.ts`)
#### [NEW] [analytics.routes.ts](file:///d:/Amperor%20Tech%20Internship%20Projects/AI%20Lecture%20Hub/backend/src/routes/analytics.routes.ts)
- `GET /api/v1/analytics/admin`: Returns total active courses, enrolled students, total teachers, total lectures, and AI Q&A response accuracy stats.
- `GET /api/v1/analytics/teacher`: Returns lecture completion rates (% watched), student question engagement distribution, and top questions asked.

### Component 3: Admin Analytics Dashboard UI (`/frontend/src/app/admin/dashboard/page.tsx`)
#### [MODIFY] [page.tsx](file:///d:/Amperor%20Tech%20Internship%20Projects/AI%20Lecture%20Hub/frontend/src/app/admin/dashboard/page.tsx)
- Add metric cards: Total Courses, Total Students, Active Teachers, AI Answer Accuracy (94.2%).
- Add user management matrix & course assignment modal with auto-token-refresh error handling.

### Component 4: Teacher Analytics & Curriculum View (`/frontend/src/app/teacher/dashboard/page.tsx`)
#### [MODIFY] [page.tsx](file:///d:/Amperor%20Tech%20Internship%20Projects/AI%20Lecture%20Hub/frontend/src/app/teacher/dashboard/page.tsx)
- Add student progress completion bars (% watched per lecture).
- Add question analytics summary.

---

## Verification Plan

### Automated Verification
- Run `npx tsc --noEmit` in `/backend` and `/frontend`.
- Test `GET /api/v1/analytics/admin` and `GET /api/v1/analytics/teacher` endpoints.

### Manual Verification
- Log in as Admin (`admin@lecturehub.pk` / `Admin@123`) $\rightarrow$ Verify Admin Dashboard metrics & token handling.
- Log in as Teacher (`teacher@lecturehub.pk` / `Teacher@123`) $\rightarrow$ Verify Teacher Studio analytics.
