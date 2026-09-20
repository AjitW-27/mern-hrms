# HRMS module audit

This is a source-level route/controller/model audit performed on 2026-09-17. It deliberately distinguishes APIs that exist from UI routes that happen not to be exposed.

| Module | Frontend endpoint | Backend route → controller → model | CRUD supported |
|---|---|---|---|
| Employees | `/employees` | `employeeRoutes` → `employeeController` → `employeeModel` | C/R/U/D |
| Departments | `/departments` | `departmentRoutes` → `departmentController` → `departmentModel` | C/R/U/D |
| Projects | `/projects` | `projectRoutes` → `projectController` → `projectModel` | C/R/U/D |
| Attendance | `/attendance` | `attendanceRoutes` → `attendanceController` → `attendanceModel` | C/R/U/D |
| Payroll | `/payroll` | `payrollRoutes` → `payrollController` → `payrollModel` | R; generate/approve/mark-paid actions only |
| Leave | `/leaves/my`, `/leaves/apply` | `leaveRoutes` → `leaveController` → `leaveModule` | employee R/C/cancel; manager status update |
| Assets | `/assets` | `assetRoutes` → `assetController` → `assetModel` | C/R/U/D |
| Expenses | `/expenses` | `expenseRoutes` → `expenseController` → `expenseModel` | C/R; status update only |
| Onboarding | `/onboarding` | `onboardingRoutes` → `onboardingController` → `onboardingModel` | C/R/U/D |
| Training | `/training` | `trainingRoutes` → `trainingController` → `trainingModel` | C/R/U/D |
| Performance | `/performance` | `performanceRoutes` → `performanceController` → `performanceModel` | C/R/U/D |
| Goals | `/goals` | `goalsRoutes` → `goalController` → `goalModel` | C/R/U/D |
| Users | `/admin/users` | `adminRoutes` → `adminController` → `userModel` | C/R/U/D |
| Roles | `/admin/roles` | `adminRoutes` → `adminController` → `roleModel` | C/R/U/D |
| RBAC access | `/rbac/roles`, `/rbac/permissions` | RBAC routes → RBAC controllers → `rbacRole`/`rbacPermission` | roles C/R/U/D; permissions read/matrix |
| Organization | `/admin/organization` | `adminRoutes` → `adminController` → organization model | R/U only |
| Branches | `/enterprise/branches` | `enterpriseRoutes` → `enterpriseController` → `Branch` | C/R/U/D |
| Shifts | `/enterprise/shifts` | `enterpriseRoutes` → `enterpriseController` → `Shift` | C/R/U/D |
| Leave policies | `/enterprise/leave-policies` | `enterpriseRoutes` → `enterpriseController` → `LeavePolicy` | C/R/U/D |
| Settings | `/settings` | `settingRoutes` → `settingController` → `settingModel` | R/U only |
| Audit logs | `/audit-logs` | `auditRoutes` → `auditController` → `auditLogModel` | R only |
| Reports | `/reports/*` | `reportRoutes` → report controller → aggregate/report queries | R/export only |

Additional implemented enterprise APIs without a corresponding frontend route in `App.jsx`: designations, recruitment jobs/candidates/interviews, onboarding tasks, attendance regularizations, salary structures, payslips, and report exports. They were not represented as new UI modules because that would invent user-facing functionality.

## Authorization findings

Every API above is mounted behind `protect` (or route-specific role/permission middleware). The UI's `ProtectedRoute` is a navigation guard only; authorization remains enforced by backend `authorize`, `authorizeRoles`, or `permit` middleware. Payroll, leave, expense, and organization intentionally do not expose generic delete/update endpoints; their UI must use their workflow endpoints rather than a generic CRUD form.

## Verification performed

* `frontend`: `npm run build` passed after the shared grid and lazy-route changes.
* `backend`: `npm test -- --runInBand` passed (1 suite, 3 tests).
* The frontend `lint` script is currently non-runnable because this repository has no `eslint.config.*` file while ESLint 10 is installed. This is a tooling configuration issue, not a claimed lint pass.
