# HRMS assistant

The existing assistant is mounted at /api/ai-assistant and rendered by dashLayout.jsx.

- AI_ASSISTANT_ENABLED=false disables both provider and local modes.
- Without OPENAI_API_KEY, the deterministic local assistant supports authenticated personal profile, current-month attendance, leave balance and request counts, holidays, and authorized approval/workforce summaries. It cannot make changes or answer general questions.
- Provider mode uses the existing OpenAI Responses API integration. OPENAI_MODEL defaults to gpt-4.1-mini; AI_PROVIDER supports openai. Keys stay on the server.
- The server loads backend/.env regardless of the launch directory. Restart it after configuration changes.
- Status identifies disabled, missing-key local mode, invalid configuration, and configured provider mode. Configuration is not a live provider health check.
- Chat failures distinguish authentication, quota, rate limit, network, timeout, invalid configuration, and provider errors without returning provider payloads or credentials.
- Provider calls use store:false and replay complete tool context. API response text is extracted from output content.
- Read tools apply existing module permissions. Personal queries use the authenticated employee link. Managers see only their own pending approvals and cannot request organization-wide workforce/directory information.

Provider tests use mocked fetch responses. No paid provider call was made during implementation.

## Orange UI update and profile linking

The panel is 400px wide, uses the central SmartHR palette, and hides its floating launcher while open. Message text explicitly inherits white on orange user bubbles. The last ten messages are sent as conversation history.

Employee lookup recognizes the existing User.employeeRef, reverse Employee.userId, employee number, and normalized email. No arbitrary employee is selected. Unlinked staff are directed to HR; unlinked HR/admin accounts are asked which employee and offered organization questions. HR/admin users can open Users and use the Link employee action. The new linking endpoint checks existing ownership and existing users/employees permissions.

Read-only intents now include leave balance/history, attendance today/current month, holidays, the current employee's approved/paid payslip, scoped team leave today, department headcount, and authorized upcoming birthdays/anniversaries. Birth years and bank details are excluded.

AI_MODEL takes precedence over the legacy OPENAI_MODEL. The retained provider is OpenAI (AI_PROVIDER=openai); no other provider SDK is introduced. Backend .env.example and env.example contain the documented variables. No provider key is required in local mode.

Logging events ai.status, ai.profile.unlinked, ai.chat.completed and ai.chat.failed include only status/mode/error code/timing. Keys, prompts, provider payloads and employee results are not logged by the assistant.

Integration verification: node scripts/assistant-integration.cjs from the repository root. It uses and drops a uniquely named QA database and does not alter application employee/payroll records.
