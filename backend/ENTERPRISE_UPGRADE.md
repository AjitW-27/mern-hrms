# Enterprise HRMS Backend Upgrade

This package extends the backend with the missing enterprise areas called out in the review.

## Added or completed

- Authentication: refresh token rotation with token versioning, password reset invalidates sessions, email verification, account lockout fields.
- RBAC: permission middleware is used on new enterprise routes and full user role assignment endpoints were added.
- User management: CRUD, deactivate, role assignment, admin password reset.
- Organization: organization CRUD and branch CRUD.
- Department/designation: department update/delete and designation CRUD.
- Recruitment: jobs, candidates, and interview pipeline APIs.
- Onboarding: task/checklist and document collection model.
- Attendance: shift rules and regularization workflow APIs.
- Leave: leave policy model/API alongside existing leave approvals.
- Payroll: salary structures and generated payslips.
- Assets: update/delete plus existing assignment/return flow.
- Reports: attendance, payroll, leave, HR summary, and report export records.
- Audit logs: write middleware plus admin audit-log query endpoint.
- Security: Helmet, CORS, rate limiting, Mongo sanitization, cookie parser.
- Logging: existing Winston request/error logging retained.
- Documentation: Swagger UI at `/api/docs`.

## New API groups

- `/api/users`
- `/api/organizations`
- `/api/audit-logs`
- `/api/reports`
- `/api/enterprise/branches`
- `/api/enterprise/designations`
- `/api/enterprise/recruitment/jobs`
- `/api/enterprise/recruitment/candidates`
- `/api/enterprise/recruitment/interviews`
- `/api/enterprise/onboarding/tasks`
- `/api/enterprise/leave-policies`
- `/api/enterprise/shifts`
- `/api/enterprise/attendance/regularizations`
- `/api/enterprise/salary-structures`
- `/api/enterprise/payslips`
- `/api/enterprise/reports/hr-summary`

## Install

```bash
npm install
npm run dev
```

Set the normal environment values from `env.example`, especially `MONGO_URI`, `JWT_SECRET`, `JWT_REFRESH_SECRET`, SMTP settings, and `CLIENT_URL`.
