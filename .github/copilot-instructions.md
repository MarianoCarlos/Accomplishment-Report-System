# Project Guidelines

## Code Style
- Backend: follow Laravel conventions with Form Requests for validation and Eloquent relationships for data access.
- Frontend: use React functional components with strict TypeScript and Inertia `useForm()` for form state.
- Use generated typed route/action helpers (Wayfinder) instead of hardcoded URLs when available.
- Before finalizing changes, run:
  - PHP format/lint: `composer run-script lint`
  - Frontend format: `npm run format`
  - Frontend lint: `npm run lint`
  - Frontend types: `npm run types`

## Architecture
- Stack: Laravel 12 + Inertia.js + React 19 + TypeScript + Tailwind CSS.
- Domain core:
  - `Report` has many `ReportEntry`.
  - Users create accomplishment reports over a date range; one entry is generated per day.
- Backend boundaries:
  - HTTP controllers in `app/Http/Controllers/`
  - Validation rules in `app/Http/Requests/`
  - Business entities in `app/Models/`
  - Role middleware aliasing in `bootstrap/app.php`
- Frontend boundaries:
  - Inertia pages in `resources/js/pages/`
  - Reusable UI in `resources/js/components/`
  - Shared types in `resources/js/types/`

## Build and Test
- First-time setup:
  - `composer run-script setup`
- Development:
  - `composer run-script dev`
  - `composer run-script dev:ssr` (when SSR behavior is relevant)
- Tests:
  - `composer run-script test`
  - `./vendor/bin/pest` for quick local runs
- Production build:
  - `npm run build`

## Conventions
- Treat Form Request `authorize()` in this project as permissive by default; enforce ownership/authorization in controller actions.
- Always enforce user ownership when mutating reports and report entries.
- Report date overlap checks must exclude archived reports (`is_archived = false`).
- Archive is a workflow state, not deletion; avoid breaking restore/history behavior.
- Keep print position/office assignment admin-controlled; do not allow end users to override report print details.
- Supervisor routes currently use `auth` + `verified` only; add explicit role middleware before expanding supervisor-only features.

## Key References
- Core route/middleware map: `routes/web.php`
- Role alias registration: `bootstrap/app.php`
- Report logic and overlap behavior: `app/Http/Controllers/ReportController.php`
- Report entry ownership pattern: `app/Http/Controllers/ReportEntryController.php`
- Validation examples: `app/Http/Requests/StoreReportRequest.php`, `app/Http/Requests/UpdatePrintDetailsRequest.php`, `app/Http/Requests/UpdateReportEntryRequest.php`
- Main user report UI: `resources/js/pages/user/accomplishment-report.tsx`
- Print modal behavior: `resources/js/components/PrintModal/PrintReportModal.tsx`
- Frontend auth types: `resources/js/types/auth.ts`
- Tooling config: `composer.json`, `package.json`, `eslint.config.js`, `.prettierrc`, `vite.config.ts`
