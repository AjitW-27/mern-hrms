# SmartHR UI and assistant update

## Implemented

- Replaced the active dashboard presentation with the requested six-row layout: eight KPI tiles and department bars; employee status, attendance gauge and clock-in/out; jobs, employees and personal todo; sales and invoices; projects and task gauge; schedules, activities and birthdays/holidays. White cards, orange primary, dark teal actions, soft borders, 20px gaps and 4px corners use the central theme.
- The live greeting, counts and year come from the authenticated account/current data. Reference-only clients, task statistics, recruitment, sales and invoices are visibly marked **Demo data**, with fixtures in `frontend/src/components/dashboard/referenceDemoData.js`. These fixtures are never used by the assistant or returned as real HR statistics.
- Added the 260px grouped/collapsible sidebar, global navigation search with Ctrl+/, fullscreen/apps/inbox controls, and retained notification/profile/logout behavior and existing route permissions. Sidebar sections can be collapsed independently.
- Added the real employee directory table as the default employee view. It includes the specified columns, round avatars, reporting manager population, 25-row server pagination, name sort, search, department/designation filters, grid/list toggle, exports, existing JSON bulk import, and existing view/edit/deactivate actions. Missing values are displayed honestly, and the Team Lead display typo is corrected.
- Standardized frontend color literals and radii with a syntax-aware migration. MUI and Tailwind use `frontend/src/theme/designTokens.js`; CSS receives matching variables. Shared table headers, 64px rows, hover styling, badges, buttons, inputs, dialogs and pagination use the same system. Legacy components and prior edits were preserved.
- The assistant panel is 400px wide with explicit white user-message text, white bordered replies, a hidden launcher while open, last-ten-message history, suggestions, typing state, retry, copy, new-chat controls and Enter/Shift+Enter handling.
- Assistant read tools now support personal leave balance/history, attendance today/current month, upcoming holidays, own approved/paid payslip, scoped team leave today, department headcount, organization attendance and authorized upcoming birthdays/anniversaries. Birth years and bank details are not returned.
- Added HR/admin employee linking under **Users → Link employee**, using the existing User.employeeRef and Employee.userId fields, with permission checks and protection against taking another account's employee profile. Normal employees cannot call this operation even when global RBAC is disabled.

## AI root causes and corrections

1. **No configured provider credential:** inspected backend environment configuration without printing any keys. OPENAI_API_KEY, ANTHROPIC_API_KEY and GEMINI/GOOGLE_API_KEY were absent. The local-mode banner therefore describes the actual configuration; it now explains how an administrator can enable the retained OpenAI integration. Local mode remains fully usable for supported database queries.
2. **Incomplete employee lookup:** the earlier service ignored the existing User.employeeRef. Lookup now recognizes that field, reverse userId, employee number and normalized email, and does not match an empty email or select an arbitrary employee.
3. **Unlinked administrator handled like staff:** unlinked staff receive the contact-HR message; administrators are asked which employee and offered authorized organization questions. No employee record is created or silently reassigned by chat.
4. **Message contrast inheritance:** nested Typography supplied its own color. It now explicitly inherits white from the orange user bubble.
5. **Floating launcher:** it stayed mounted while the drawer was open. It is now absent while the panel is open, preventing overlap with Send/input controls.
6. **Frontend/backend origins:** isolated browser QA initially encountered an API URL pointing at a different port and an unlisted CLIENT_URL origin. QA now supplies matching environment values; production CORS/authentication were not weakened. Keep CLIENT_URL aligned with the actual frontend origin.

The retained service uses native fetch and the OpenAI Responses API. It supports AI_MODEL with legacy OPENAI_MODEL fallback, distinguishes configuration/authentication/quota/rate-limit/network/timeout errors, and reuses the existing authenticated read-tool layer. Logging now records status/mode, unlinked-profile events, completion duration and safe error codes, without assistant prompts, keys or raw employee/provider results.

## Configuration

In **backend/.env**, optional provider mode uses:

```dotenv
AI_ASSISTANT_ENABLED=true
AI_PROVIDER=openai
AI_MODEL=gpt-4.1-mini
OPENAI_API_KEY=your_server_only_key
CLIENT_URL=http://localhost:5173
```

Leave OPENAI_API_KEY empty to use the deterministic local assistant. Do not place keys in VITE_* variables. Both `backend/.env.example` and the existing `backend/env.example` document the configuration. The existing integration is OpenAI; other provider SDKs were not added. Restart the backend after environment/code changes.

## Verification

- `npm run build` in frontend: passed.
- `npm run lint` in frontend: passed with zero errors; 19 pre-existing unused-variable/hook-dependency warnings remain. The missing ESLint flat configuration is now supplied.
- `npm test` in frontend: 3 tests passed, including palette/radius audits and dark/muted text contrast on white cards.
- `npm test -- --watch=false` in backend: 6 suites, 41 tests passed, covering AI configuration/provider failures, profile/role scoping, employee linking, notifications and leave behavior.
- `node scripts/assistant-integration.cjs`: 11 authenticated API checks passed against actual MongoDB queries in a uniquely named temporary QA database. Includes a linked employeeRef with different account/employee emails, real leave balance, unlinked staff/admin handling, denied scopes, API errors and employee search/sort/filter/pagination. The QA database was removed afterward; application employee/payroll data was not used as test fixtures or rewritten.
- `node scripts/visual-review.cjs`: headless Chrome inspected the actual rendered app with the existing local data at 1440, 1024, 768 and 390 pixels. No page/main horizontal overflow, browser runtime exceptions, console errors or failed network requests in the passing run. All seven employee columns remain present; narrow tables scroll internally. Sidebar offsets are 72/260px, employee search empty state and grid/list switching work, assistant launcher is hidden, and user bubble computed colors are white on the specified orange.
- Backend startup and `/health` succeeded during isolated browser QA. Paid provider requests were not made; provider failures/protocol responses are mocked in unit tests.
- `node --check` passed for 22 changed backend and QA JavaScript files.
- `git diff --check`: passed. Existing logs have line-ending notices; they were preserved and runtime checks appended normal logs.

Browser artifacts are under `.tmp/ui-review/` (ignored by Git): dashboard screenshots at each width, desktop lower sections, employee screenshots at each width, assistant screenshot and `results.json`.

## File inventory and limits

The complete source/config/test inventory for this update is in **SMART_HR_CHANGED_FILES.txt**. Main rendered entry points remain Dashboard.jsx, Employees.jsx, dashLayout.jsx and appbar.jsx; their new presentation components are actually imported and rendered.

Live record counts, names, available categories and current dates intentionally differ from the reference's fixed sample data. Missing APIs have labelled demos rather than invented live results. Existing supported routes are used for scheduling, communication and row navigation; this does not introduce a recruitment/invoicing backend or certify a pixel-for-pixel match to every reference detail. The date button identifies the current snapshot rather than adding unsupported historical dashboard filtering. Destructive import/deactivation/link operations were not exercised against real application records. Live paid provider access remains untested. The requested orange/white UI pairing is preserved; contrast assertions cover the specified dark and muted body text, not a full accessibility certification.
