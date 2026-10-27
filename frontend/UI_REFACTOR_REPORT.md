# Frontend design system implementation

This pass changes frontend source only. The backend already contained uncommitted changes when work started. SHA-256 comparison against the pre-edit snapshot confirms no backend source was changed in this pass. No routes, stack, authorization rules or database models were replaced.

## Implemented

- One palette, typography, radius and shadow source: src/theme/designTokens.js. CSS custom properties, MUI and Tailwind consume it. Primary overrides update buttons, active navigation, charts, focus styling and derived translucent accents.
- Shared exports in src/components/common/UI.jsx: Button/IconButton, Card/CardHeader, StatCard, Badge, Avatar, Tabs/Tab, Input/SearchInput, Select, DatePicker, Modal, ConfirmDialog, Pagination, EmptyState, ErrorState, Skeleton and Toast/ToastProvider. Existing page imports now use these adapters.
- One actual table renderer: src/components/common/DataTable.jsx. Existing DataGrid paths are compatibility re-exports. Search, sorting with computed values, column visibility, filtering, refresh, CSV export, Add actions, row actions, pagination, sizes, dates, money, progress and status cells share the same renderer. Employee-specific Excel/CSV and import actions remain available.
- Full-height table cards with internal horizontal scrolling and sticky headers. Empty and error states stay centered inside the visible viewport even when the columns extend off-screen. Loading uses skeleton rows; failed loads offer Retry.
- Employees: labelled All/Active/Inactive/Probation selector, API totals, real rows, shared toolbar, primary Add action, reporting manager, date formatting, grid/list view and exports.
- Leave: shared Tabs, StatCard, DataTable and form controls; a neutral unlinked-profile state; an Admin/HR employee selector; existing apply, cancel and approval endpoints preserved.
- Shared table rendering across Employees, Projects, Attendance, Leave/Approvals, Payroll, Assets, Expenses, Training, Onboarding, Performance, Goals, Departments, enterprise modules, Users, Roles, Audit Logs, Reports, permission matrices and dashboard mini tables. There is no standalone recruitment or invoice route in the current router; their dashboard cards use empty states when no data is available.
- AppHeader alone owns route titles, subtitles and breadcrumbs. Desktop/tablet have no navigation toggle. Desktop sidebar is a fixed 72px rail that expands over content to 260px on hover/focus, then closes with a delay. Content does not shift. Mobile retains its drawer toggle.
- Existing purple AW artwork recovered from the original committed logo component and reused for branding/favicon. App name and asset location live in src/config/branding.js. Removed reference branding and the old S favicon.
- Dashboard rebuilt using shared cards and real summary, employee, project, attendance and performance responses. Tasks come from project tasks; birthdays come only from real dateOfBirth values, grouped Today/Tomorrow/Upcoming. Fictional fixtures and prototype statistic defaults were removed.
- Assistant UI uses theme variables, white text on primary user bubbles, a 400px panel, and a launcher that is hidden while open and avoids table pagination. Provider integration was left unchanged as requested for this frontend-only pass.

## Validation

- npm run build --prefix frontend: passed. Vite reports a bundle-size advisory for the main chunk; production output was generated.
- npm run lint --prefix frontend: passed, zero errors, 14 existing warnings in authentication/session, communication, chart helpers and payroll code. These are not suppressed.
- npm test --prefix frontend: 6 tests passed. Includes palette contrast, primary override propagation (including translucent accents), forbidden source styles/branding and exactly one table-markup owner.
- node frontend/scripts/unification-browser.cjs --smoke: passed for Dashboard, Employees, Projects, Leave, Attendance and Reports at 1440, 1024, 768 and 390 widths. Zero application runtime/console errors, exactly one h1, no page/main horizontal overflow and no desktop hamburger.
- A broader browser pass also covered Assets, Training, Onboarding, Expenses, Payroll, Performance, Goals and Departments at desktop width. Admin follow-up passed for Users, Roles and Audit Logs at 1440 and 390 widths, with zero runtime/console errors. Actual Admin/HR employee selection on Leave also passed. The isolated runner command was node .tmp/frontend-unification/admin-isolated.cjs --admin --smoke; results are saved under .tmp/frontend-unification/ui/admin-results.json. The reproducible frontend runner supports --admin --smoke.
- Browser assertions passed for sidebar hover/focus expansion, unchanged 72px content offset, AW logo/favicon, primary color switch from orange to blue on the actual Add button and active sidebar icon, assistant bubble contrast, hidden launcher, pagination clearance, full-height empty table and error/Retry recovery. Paid provider calls were not made; the assistant chat response was intercepted only in the QA runner.
- Source audit: 139 JS/JSX/CSS files outside the token file; zero hex literals, legacy color-name literals, reference branding or large rounded utilities. Oversized radius scan and AST checks passed. Exactly one native table exists in DataTable.jsx; no MUI Table renderer remains.
- git diff --check -- frontend: passed; Git may print CRLF normalization notices.
- Screenshots and machine-readable results: .tmp/frontend-unification/ui/.

## Practical limits

Recruitment and sales APIs are absent, and invoice data is not supplied by the current summary API. These widgets show explicit empty states instead of invented reference values. Pixel-for-pixel equality with a populated reference cannot be claimed for an empty or partially populated database. Top performer and birthdays also remain empty until permitted real records exist. The existing employee directory API filters active records; frontend Inactive filtering cannot recover records that API does not return. Unlinked accounts still receive the backend's existing 404 response; the leave UI displays it as a neutral profile-linking state. No backend/provider configuration was changed.

## Files

Exact files created, modified and deleted relative to the snapshot taken before this pass are listed in UI_REFACTOR_FILES.txt. Deleted source/assets: frontend/src/components/dashboard/referenceDemoData.js and frontend/public/favicon.svg. No backend files or existing modules were deleted.
