# Phase 2: Core Authentication, User Onboarding & Course APIs

This phase focuses on securing the platform, setting up the user invitation flow, and building the core entity management APIs (Courses and Assignments), along with their corresponding frontend UI.

## User Review Required
> [!IMPORTANT]
> - **Resend API Key**: To send invitation emails, you will need a Resend API Key. If you don't have one, we can output the invitation links to the terminal/console for now so you can test locally without an email provider. Let me know what you prefer!
> - **Initial Admin User**: We will use the `prisma:seed` script to create the default Admin account (`admin@lecturehub.com`) so you can log in immediately.

## Proposed Changes

---
### Backend API (Express & Prisma)

#### [NEW] `backend/src/controllers/auth.controller.ts`
Implement authentication logic:
- `login`: Validates credentials, issues JWT containing user ID and Role.
- `invite`: Admin-only endpoint. Generates a secure token, saves it temporarily (or embeds it in a password reset URL), and emails the user via Resend.
- `setPassword`: Verifies the token and hashes the new password using `bcryptjs`.

#### [NEW] `backend/src/controllers/course.controller.ts`
Implement course management:
- `createCourse`: Admin/Teacher endpoint.
- `getCourses`: Returns courses based on the requester's role (Admins see all, Teachers/Students see assigned).
- `assignUser`: Adds a user to a course.
- `unassignUser`: Removes a user from a course.

#### [NEW] `backend/src/routes/auth.routes.ts` & `course.routes.ts`
- Wire up the controllers to Express routers.
- Attach the existing `authMiddleware` and `validate` middlewares to secure these routes.

#### [MODIFY] `backend/src/index.ts`
- Register the new API routes under `/api/v1/auth` and `/api/v1/courses`.

---
### Frontend Web App (Next.js & shadcn/ui)

#### [MODIFY] `frontend/package.json`
- Install dependencies for form validation (`zod`, `@hookform/resolvers/zod`).
- Install shadcn UI primitives (button, input, form, card, sonner/toast, dropdown).

#### [NEW] `frontend/src/app/login/page.tsx`
- Build a beautiful, production-grade login form.
- Use `react-hook-form` and `zod` for client-side validation.
- Securely store the JWT token (in cookies or local storage) upon success.

#### [NEW] `frontend/src/app/dashboard/layout.tsx`
- Create an authenticated layout shell with a sidebar/navbar.
- Protect the routes (redirect to `/login` if not authenticated).

#### [NEW] `frontend/src/app/dashboard/page.tsx`
- Admin/Teacher dashboard showing a list of courses.
- A "Create Course" modal for authorized users.

## Verification Plan

### Automated Checks
- `npm run build` on both frontend and backend to ensure no TypeScript compilation errors.
- Run `npx prisma seed` to populate the database with a test Admin user.

### Manual Verification
1. I will start both servers.
2. We will navigate to `http://localhost:3000/login` and log in as the seeded Admin.
3. We will create a new course via the UI to verify the Course APIs and RBAC middlewares work.
4. We will simulate inviting a Teacher via the UI.
