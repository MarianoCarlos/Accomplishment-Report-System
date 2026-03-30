# Accomplishment Report System — Copilot Instructions

## Project Overview

A **CHED (Commission on Higher Education)** accomplishment report management system built with **Laravel 12 + Inertia.js + React 19 + TypeScript**. Three roles—**Admin**, **Supervisor**, and **Employee**—manage daily accomplishment report entries across offices and positions.

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Backend | Laravel 12, PHP 8.4+, Fortify (auth) |
| Frontend | React 19, Inertia.js 2, TypeScript 5.7 |
| Styling | Tailwind CSS 4 (v4 `@theme` directives, oklch colors) |
| Components | shadcn/ui (New York style), Radix UI, Lucide icons |
| Rich Text | Tiptap / ProseMirror |
| Build | Vite 7, SSR-capable |
| Testing | Pest (PHP), ESLint + Prettier (JS) |
| CI | GitHub Actions (lint + tests on PHP 8.4/8.5) |

## Commands

```bash
# Development
composer dev          # Starts server + queue + Vite concurrently
composer dev:ssr      # SSR development mode

# Testing & Linting
composer test         # Clear config → lint → full Pest suite
composer lint         # PHP linting (Pint, parallel)
npm run lint          # ESLint with auto-fix
npm run format        # Prettier formatting
npm run types         # TypeScript type checking

# Build
npm run build         # Production assets
npm run build:ssr     # Production assets + SSR

# Setup
composer setup        # Full init (install, key:generate, migrate, npm install, build)
```

## Architecture

### Roles & Route Groups

| Role | Prefix | Middleware | Controllers |
|------|--------|-----------|-------------|
| Employee | `/` | `role:Employee` | `ReportController`, `ReportEntryController` |
| Admin | `/admin` | `role:Admin` | `Admin\UserManagementController`, `Admin\OfficeManagementController`, `Admin\SupervisorOfficeController`, `OfficeController`, `PositionController` |
| Supervisor | `/supervisor` | `role:Supervisor` | `Supervisor\SupervisorController` |

All authenticated routes use `['auth', 'verified', 'role:RoleName']` middleware.

### Directory Layout

```
app/
  Http/Controllers/
    Admin/               # Admin-only controllers
    Supervisor/          # Supervisor-only controllers
    Settings/            # Profile, password, 2FA
    ReportController.php
    ReportEntryController.php
    OfficeController.php
    PositionController.php
  Middleware/
    CheckRole.php        # Role gate (role:Admin, role:Supervisor, etc.)
  Models/                # Eloquent models (User, Report, ReportEntry, Office, Position)
  Requests/              # Form requests per action

resources/js/
  pages/                 # Inertia pages (auth/, user/, admin/, supervisor/, settings/)
  components/
    ui/                  # shadcn/ui primitives
    Accomplishment/      # Report components (ActiveReports, ArchivedReports)
    Admin/               # Admin tab panels (OfficeTab, PositionTab, UserTab, SupervisorOfficeTab)
    Editor/              # TiptapEditor (rich text)
    PrintTemplate/       # Print layouts
    PrintModal/          # Print modal
  layouts/               # App, Auth, Settings layouts
  hooks/                 # Custom React hooks
  types/                 # TypeScript type definitions (auth.ts, navigation.ts, ui.ts)
  routes/                # Wayfinder type-safe route helpers
```

### Database Schema

- **users** — `name`, `email`, `password`, `role` (default: Employee), `position_id` (FK nullable), `office_id` (FK nullable), 2FA columns
- **reports** — `user_id` (FK), `start_date`, `end_date`, `office`, `position`, `reviewer`, `approver`, `is_archived`
- **report_entries** — `report_id` (FK cascade), `entry_date`, `content`; unique on `(report_id, entry_date)`
- **offices** — `name` (unique), `supervisor_id` (FK nullable → users)
- **positions** — `name` (unique)

### Key Relationships

```
User → hasMany Report
User → belongsTo Office, Position
Report → hasMany ReportEntry (cascade delete)
Office → belongsTo User (as supervisor)
Office → hasMany User (as members)
```

## Conventions

### Backend

- **Form Requests** authorize permissively (`return true`) — **ownership is enforced in controllers**. Always check `$report->user_id === auth()->id()` before mutations.
- **Dates** use `CarbonImmutable` globally (configured in `AppServiceProvider`).
- Report creation auto-generates one `ReportEntry` per day in the date range.
- Report date ranges must not overlap for the same user (archive-aware: only checks non-archived reports).
- `office_id` and `supervisor_id` are nullable — not all users belong to an office.
- Use existing Form Request classes for validation; keep controllers thin.

### Frontend

- **Inertia router** for all server mutations: `router.post()`, `router.patch()`, `router.delete()` with `{ preserveScroll: true }`.
- **shadcn/ui** components from `@/components/ui/` — do not install alternative component libraries.
- **`cn()` utility** from `@/lib/utils` for conditional class merging (clsx + tailwind-merge).
- **Type-safe routes** via Wayfinder — import from `@/routes/` instead of hardcoding URL strings.
- Rich text content sanitized with **DOMPurify** before rendering.
- User role type: `'Admin' | 'Supervisor' | 'Employee'` — defined in `@/types/auth.ts`.
- Appearance theming via `useAppearance()` hook — supports light/dark/system.

### Code Style

- **PHP**: Laravel Pint (PSR-12 based) — auto-fixed via `composer lint`.
- **TypeScript/React**: Prettier (4-space indent, single quotes, semicolons) + ESLint flat config.
- Import order: builtin → external → internal (enforced by ESLint).
- No `React.Fragment` imports needed (JSX automatic runtime).

## Pitfalls

- **ReportEntry unique constraint**: `(report_id, entry_date)` — never create duplicate entries for the same date.
- **Date overlap validation**: When creating reports, the date range must not overlap with existing non-archived reports for the same user.
- **Role middleware**: The `CheckRole` middleware accepts variable roles — `role:Admin,Supervisor` allows either. A missing role returns 403.
- **Default password**: `UserManagementController@store` creates users with password `"password"` — acceptable for admin-created accounts in this context.
- **Tests use SQLite in-memory**: Schema differences from MySQL/PostgreSQL may cause issues with JSON columns or advanced queries.
- **Tailwind v4**: Uses `@theme` directive in CSS, not `tailwind.config.ts`. Theme tokens are CSS custom properties in oklch.
