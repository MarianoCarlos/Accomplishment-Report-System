# AI Coding Agent Instructions

## Project Overview
**Accomplishment Report System** – A Laravel 12 + React/Inertia.js application for managing employee accomplishment reports with daily entries, office assignments, and role-based access control (OJT project tracking).

## Architecture & Key Patterns

### Backend Organization (PHP/Laravel)
- **Controllers**: `app/Http/Controllers/` – Handle request/response. Key controllers:
  - `ReportController`: CRUD + archive logic, date overlap validation (excludes archived reports), transforms data for frontend
  - `ReportEntryController`: Daily entry updates with **user scoping authorization** (`abort_unless($entry->report->user_id === auth()->id(), 403)`)
  - `Admin/UserManagementController`: User CRUD with position assignment
  - Admin controllers for offices/positions management
- **Models**: `app/Models/` – Eloquent ORM with relationships:
  - `Report`: hasMany `ReportEntry`, belongsTo `User`; fields: office, position, reviewer, approver, is_archived
  - `ReportEntry`: belongs to `Report`
  - `User`: has many `Report`, belongsTo `Position` (position_id FK); fields: role, position_id
  - `Office`, `Position`: Reference tables
- **Requests**: `app/Http/Requests/` – Form validation
  - `StoreReportRequest`: Validates date ranges, prevents overlap (checks is_archived = false)
  - `UpdatePrintDetailsRequest`: Validates office/position/reviewer/approver
- **Authentication**: Laravel Fortify with email verification and two-factor authentication

### Frontend Organization (React/TypeScript)
- **Pages**: `resources/js/pages/` – Inertia page components
  - `user/accomplishment-report.tsx`: Main report interface with ActiveReports/ArchivedReports tabs
  - `admin/office-management.tsx`: Office/position/user management with tab structure
- **Components**: `resources/js/components/` – Reusable UI in TypeScript
  - `PrintModal/PrintReportModal.tsx`: Modal for office/position/reviewer/approver selection with **position auto-fill** from user's assigned position (read-only)
  - Searchable dropdowns for office, reviewer, approver using Search icon + Input + click-outside detection
  - `Accomplishment/ActiveReports.tsx`, `ArchivedReports.tsx`: Report listing
  - `Editor/`: Tiptap rich text editor for entry content
- **Layout system**: `resources/js/layouts/` – Page wrapping (AppLayout)
- **Type definitions**: `resources/js/types/` – Shared TypeScript interfaces
- **Hooks**: `resources/js/hooks/` – Custom React hooks (e.g., `use-appearance` for theme)

### Data Flow
1. User submits form → Laravel controller validates via `StoreReportRequest`
2. Controller creates `Report` + auto-generates `ReportEntry` records (one per day in date range)
3. Controller returns Inertia response with transformed data (e.g., separated active/archived reports)
4. React component receives props and renders UI
5. User edits entry → PATCH to `report-entries.update` endpoint

### Critical Business Logic
- **Date overlap validation**: `ReportController::store()` checks if new report date range overlaps active (non-archived) reports only. Archived reports release their date ranges. Validation uses multi-condition query with `whereBetween` + nested OR logic
- **Archive pattern**: Reports have `is_archived` boolean; archive/restore are PATCH operations; filtering must exclude archived from business logic
- **Entry generation**: When creating report with date range, entries are auto-created via loop in controller (one per day)
- **User scoping**: Reports filtered by `auth()->id()`, ReportEntry updates verified by `$entry->report->user_id` check – never trust just ID in URL
- **Position assignment flow**: Admins assign position to user in office management → Position becomes read-only in print modal → Auto-fills, no user override
- **Print modal state sync**: Uses `useEffect([report, isOpen, userPositionName])` to reset dropdowns when modal opens/closes

## Development Workflow

### Commands
```bash
# Setup & Installation
composer install              # Install PHP dependencies
npm install                   # Install Node.js dependencies
php artisan key:generate     # Generate APP_KEY (one-time setup)
php artisan migrate          # Run database migrations

# Development
npm run dev              # Vite dev server with HMR (watches frontend/backend)
php artisan serve       # Laravel dev server (if not using npm run dev)
php artisan tinker      # Interactive shell for testing models/queries
php artisan queue:listen --tries=1  # Process jobs in dev (if needed)

# Code Quality
php artisan pint        # Format PHP (PSR-12 standards)
npm run format          # Format JS/TS/CSS with Prettier
npm run lint            # ESLint with auto-fix
npm run types           # TypeScript type checking (no emit)

# Testing
./vendor/bin/pest       # Run all Pest tests
./vendor/bin/pest tests/Feature/ReportTest.php  # Run specific test file
./vendor/bin/pest --filter="test_user_can_create_report"  # Run specific test
php artisan test        # Alternative test runner

# Building
npm run build           # Production build (Vite) – creates public/build/
php artisan migrate:fresh --seed  # Reset DB with seeders (dev only!)

# Debugging
php artisan tinker      # REPL for DB queries: Report::all(), User::find(1), etc.
php artisan pail        # Stream logs in real-time (SSR dev)
```

### Quick Setup
```bash
# First-time setup
composer install
npm install
php artisan key:generate
php artisan migrate
npm run dev  # Start both Vite + Laravel in one terminal
```

### Database Migrations & Schema
Located in `database/migrations/`. Key tables:

**reports**
- `id` (PK)
- `user_id` (FK → users, non-nullable)
- `start_date` (date, non-nullable)
- `end_date` (date, non-nullable)
- `office` (string, nullable – stores office name as string, not FK)
- `position` (string, nullable – stores position name as string, not FK)
- `reviewer` (string, nullable – stores reviewer name/ID)
- `approver` (string, nullable – stores approver name/ID)
- `is_archived` (boolean, default: false)
- `created_at`, `updated_at`

**report_entries**
- `id` (PK)
- `report_id` (FK → reports, cascade delete)
- `entry_date` (date, non-nullable)
- `content` (text, nullable)
- `created_at`, `updated_at`

**users**
- `id` (PK)
- `name`, `email` (unique), `password` (hashed)
- `role` (string: 'Employee', 'Admin', 'Supervisor')
- `position_id` (FK → positions, nullable, cascade delete)
- `email_verified_at`, `two_factor_secret`, `two_factor_recovery_codes`
- `created_at`, `updated_at`

**offices** & **positions**
- `id` (PK)
- `name` (string, unique)
- `is_active` (boolean, default: true)

## Code Conventions & Patterns

### PHP/Laravel
- **Form Requests**: Validation rules in dedicated request classes (not in controller)
- **Eloquent relationships**: Use `with()` for eager loading to avoid N+1 queries
- **Middleware**: Routes use `['auth', 'verified']` to enforce authentication
- **Inertia responses**: Always use `Inertia::render('page-path', $data)` and pass collections as transformed arrays
- **Date casts**: Use `protected $casts = ['date_field' => 'date']` for automatic Carbon conversion

### React/TypeScript
- **Strict TypeScript**: No `any` types; leverage inference where possible. User interface example includes position_id
- **Component structure**: Functional components with hooks; no class components
- **Styling**: Tailwind CSS utility classes only; component library uses Radix UI primitives
- **Form handling**: Inertia's `useForm()` hook for submission + validation feedback; `useEffect` for state sync on prop changes
- **State management**: Local component state via `useState`; server state via Inertia props
- **Searchable dropdowns pattern**: Use Input + Search icon + absolute positioned dropdown list with click-outside detection via `useRef` + `useEffect`
- **Display names with related data**: Format "Name, Position" using helper functions (e.g., `getPositionName(positionId)`) rather than embedding logic in JSX
- **Auto-fill on selection**: When user selects an item with related data (e.g., user with position_id), auto-populate connected fields

### Naming
- Controllers: singular + `Controller` (e.g., `ReportController`, not `ReportsController`)
- Routes: plural resource routes (e.g., `Route::resource('reports', ReportController)`)
- Component files: kebab-case + `.tsx` extension
- CSS classes: Tailwind utility-first; no custom CSS classes except major components

## Authorization & Security Patterns

### Role-Based Access Control
Three roles defined in User model:
- **Employee**: Can create and manage own reports and entries; cannot access admin features
- **Supervisor**: Can review reports (role field stored but no built-in UI enforcement yet)
- **Admin**: Full access to user/office/position management via admin routes

Note: Role enforcement via middleware not yet fully implemented on routes; validate `auth()->user()->role` in controller when restricting features to specific roles.

### Entry-Level Access Control
- **Never trust URL parameters alone** – Always verify resource ownership at the controller level
- **ReportEntry authorization**: `abort_unless($entry->report->user_id === auth()->id(), 403)` prevents cross-user edits
- **Report filtering**: Always use `where('user_id', auth()->id())` when querying reports
- Example: Even if user knows a report_entry ID, they cannot modify it without ownership verification
- **Admin CRUD**: Admin users can modify users/offices/positions without same-user checks (check role if needed)

### Archive-Aware Business Logic
- **Date conflicts check**: `is_archived` status affects overlap validation
- When checking for date range conflicts, filter by `.where('is_archived', false)` to allow date reuse after archiving
- Archived reports should be excluded from business logic (conflicts, availability) but included in history/display

### Position as Admin-Controlled Data
- Once assigned in office management, position is **read-only** in user-facing workflows (PrintModal uses `disabled` Input)
- Users cannot override their position; it must be changed via admin interface
- This prevents users from falsifying their role on printed reports

## Key Integration Points

### Inertia.js Middleware
- `HandleInertiaRequests`: Configured in `app/Http/Middleware/`
- **Automatically shared data**: 
  - `auth.user`: Full authenticated user object with `role`, `position_id`, `name`, `email`
  - `name`: App name from `config('app.name')`
  - `sidebarOpen`: Boolean from cookie `sidebar_state` (default: true)
  - CSRF token (auto-managed by Inertia)
- Controllers pass additional data via `Inertia::render('page-name', $data)`; all props are automatically available in React components

### Route Protection
- `auth` + `verified` middleware required for most user/report routes
- Admin routes not yet visible in current routes file (check `Admin/` controller namespace)

### Editor & Rich Text
- Tiptap library integrated (`@tiptap/react`, `@tiptap/starter-kit`)
- Used in `Editor/` component directory for `ReportEntry` content editing

## Common Workflows for AI Agents

### Adding a New Report Field (End-to-End)
1. **Create migration**: `php artisan make:migration add_field_to_reports_table`
   - Add column: `$table->string('field_name')->nullable();`
2. **Update Model** (`app/Models/Report.php`)
   - Add to `$fillable`: `'field_name'`
   - Add cast if needed: `'field_name' => 'boolean'` or `'json'`
3. **Update Request** (`app/Http/Requests/StoreReportRequest.php` or `UpdatePrintDetailsRequest.php`)
   - Add validation rule: `'field_name' => ['nullable', 'string', 'max:255']`
4. **Update Controller** (`app/Http/Controllers/ReportController.php`)
   - If displaying: Add to `transformReports()` output
   - If accepting input in store/update: Already handled if in `$fillable`
5. **Update Frontend** (`resources/js/pages/user/accomplishment-report.tsx`)
   - Add form field: `<Input name="fieldName" value={...} onChange={...} />`
   - Add TypeScript type in `resources/js/types/`
   - Update `useForm` initial data with new field
6. **Test**: Run `php artisan migrate:fresh` then `npm run dev`; create report and verify

### Adding a User Role Filter to a Page
1. Check user's role: Use `auth().user().role` or pass from controller as shared data
2. In controller: `$canViewAdmin = auth()->user()->role === 'Admin';` then pass to Inertia
3. In React: Check prop conditionally: `{canViewAdmin && <AdminSection />}`
4. For restricting routes: Add middleware or check in controller: `abort_unless(auth()->user()->role === 'Admin', 403);`
5. Test with different roles: Create seeds for test users with different roles

### Assigning Position to User (Admin Flow)
1. Admin visits office management → Users tab
2. Clicks add/edit user → Position dropdown filled from `Position::all()`
3. Form submits to `UserManagementController::store/update()` with position_id
4. Controller validates `'position_id' => ['nullable', 'integer', 'exists:positions,id']`
5. User model updated with position_id FK
6. When user prints report → position auto-fills from `auth.user.position_id` in PrintModal (read-only)

### Fixing Print Modal Searchable Dropdowns
- **Pattern for searchable dropdowns**: Input shows `showDropdown ? searchTerm : selectedDisplayName`
- For office: `selectedOffice` (office name), search via `setOfficeSearch`
- For reviewer/approver: Show combo name like "John Doe, Senior Developer" using helper function
- **Click-outside detection**: useRef on container, useEffect listener on mousedown event
- **Display format changes**: Use helper function `getPositionName(positionId)` to avoid hardcoding names, making it easy to update format globally

### Creating a New Report-Related Feature
1. Create controller (extend `Controller` base class) in appropriate directory
2. Add routes to `routes/web.php` within `middleware(['auth', 'verified'])` group if user-facing
3. Create form request for validation (if accepting form data)
4. Build React page in `resources/js/pages/` using Inertia props
5. For admin features: Create controller in `Admin/` directory
6. Test with Pest in `tests/Feature/` – create test class extending `Tests\TestCase`

### Debugging Common Issues
- **"Report not found"**: Check route model binding; ensure `where('user_id', auth()->id())` in controller
- **Form validation not showing error**: Verify Form Request `authorize()` returns true; check field name matches between backend/frontend
- **Position not auto-filling in PrintModal**: Check `useEffect` dependency array includes `userPositionName`
- **Date overlap false positive**: Manually test date ranges in `tinker`; the 3-part WHERE is correct, don't simplify
- **Frontend type errors**: Run `npm run types` to see all TypeScript issues; check `resources/js/types/` for missing interfaces

### Styling New Components
- Import Radix UI components from `@radix-ui/*` (Button, Dialog, Input, Label)
- Use Tailwind utility classes only; no custom CSS
- Read-only/disabled inputs use `bg-muted/40` background
- Error states use `border-red-500`; validation messages with `text-xs text-red-500`
- Dropdown hover states: `hover:bg-blue-50` for list items
- Check `resources/css/app.css` and `vite.config.ts` for Tailwind configuration
- Common patterns: `flex`, `gap-2`, `p-4`, `border`, `rounded`, `shadow` for consistent spacing

## Testing & Validation
- **Unit tests**: `tests/Unit/` (model logic, utilities)
- **Feature tests**: `tests/Feature/` (controller actions, routes)
- **Test database**: SQLite in-memory (see `phpunit.xml`)
- **Assertions**: Pest uses `expect()` syntax; check existing tests for patterns
- **Database reset**: `RefreshDatabase` trait resets database before each test (see `tests/Pest.php`)

## Error Handling Patterns

### Controller Error Responses
- **Validation errors**: Use Form Request classes; validation errors auto-returned with `withErrors(keypaths)` when using Inertia
- **Authorization errors**: `abort_unless($condition, 403)` or `abort(403)` with reason message
- **Resource not found**: Route model binding auto-handles with 404; manual `abort(404)` if needed
- **Redirect on success**: Most create/update/delete actions return `back()` (Inertia handles page refresh)

### Frontend Error Handling
- Form errors arrive as `errors` prop (from `withErrors()` in controller)
- Display per-field: Check `errors.fieldName` in React component
- Clear errors when user starts fixing: `delete newErrors.fieldName` then re-render
- Server errors on non-form actions: Wrap API calls in try-catch; no built-in UI yet (log to console or add flash message)

## Known Gotchas & Common Mistakes

1. **Forgetting user scoping**: Always filter reports by `auth()->id()` even if you're checking archive status
2. **Date overlap logic**: The three-part WHERE clause is complex; copy the existing pattern rather than simplifying
3. **Entry generation**: Loop runs per-day; ensure start_date ≤ end_date in validation to avoid infinite loop
4. **Position FK cascade**: Deleting a position sets all user.position_id to null; this is intentional but verify no orphaned users
5. **Inertia page naming**: Use `kebab-case` for page paths (e.g., `user/accomplishment-report`), not `CamelCase`
6. **React hooks in components**: Never call hooks conditionally; organize hooks at top of component function
7. **Searchable dropdowns**: Must manually handle click-outside detection; Radix UI doesn't auto-close on blur
8. **Position auto-fill sync**: PrintModal useEffect must include all dependencies; missing `userPositionName` breaks position reset

## Key Learnings & Recent Updates

### Model Relationships Summary
- `Report.entries` → hasMany ReportEntry
- `Report.user` → belongsTo User
- `ReportEntry.report` → belongsTo Report
- `User.reports` → hasMany Report
- `User.position` → belongsTo Position (position_id FK)
- `Position.users` → hasMany User (inverse relationship, not in code but exists in database)

### Position Management Integration (Latest)
- **User has position_id FK** – Allows role assignment without changing user's core data
- **Cascade delete configured** – Removing a position updates all users with that position to null
- **Print workflow synchronization** – Position from `auth.user.position_id` takes precedence over stored report position
- **Display format**: Position shown as comma-separated in dropdowns (e.g., "John Doe, Senior Developer")

### Print Modal State Management
- **useEffect dependency critical** – Must include `userPositionName` to sync position auto-fill when modal opens
- **Display vs. Input state** – Searchable dropdowns show search term while dropdown open, display name when closed
- **Click-outside handling** – Applied to all three menus (office, reviewer, approver) with shared handler pattern

### Frontend-Backend Data Sync
- **Inertia props structure** – Pass offices, positions, users as simple arrays to frontend (no nested relationships)
- **Display helper functions** – Use `getPositionName(id)` to compute display strings, avoiding hardcoded position names
- **Error clearing pattern** – Clear specific error key when user starts fixing that field (e.g., `delete newErrors.office`)

## Important Files to Know
- [config/app.php](config/app.php) – App name, timezone, locale
- [config/fortify.php](config/fortify.php) – Auth features (2FA, email verification)
- [config/inertia.php](config/inertia.php) – Inertia middleware config
- [app/Providers/AppServiceProvider.php](app/Providers/AppServiceProvider.php) – Service providers, model scopes
- [vite.config.ts](vite.config.ts) – Build optimization, plugin configuration
- [routes/web.php](routes/web.php) – All routes with middleware requirements
- [app/Http/Middleware/HandleInertiaRequests.php](app/Http/Middleware/HandleInertiaRequests.php) – Shared data to frontend

## Quick Codebase Navigation

### Key Directories
- `app/Models/` – Eloquent models with relationships (Report, ReportEntry, User, Office, Position)
- `app/Http/Controllers/` – Request/response handlers; `Admin/` subdirectory for admin routes
- `app/Http/Requests/` – Form validation rules
- `app/Http/Middleware/` – HandleInertiaRequests (shared data), HandleAppearance
- `resources/js/pages/` – Inertia page components; `user/` and `admin/` subdirectories
- `resources/js/components/` – Reusable UI components
- `resources/js/types/` – TypeScript interface definitions
- `database/migrations/` – Schema changes (always run `php artisan migrate` after pulling)
- `tests/Feature/` – Feature tests (HTTP requests, controller logic)
- `routes/web.php` – All user-facing routes

### Where to Add Code
- **New endpoint**: Add controller method to `ReportController` or create new controller in `app/Http/Controllers/`
- **Frontend page**: Create component in `resources/js/pages/[path]/NewPage.tsx`
- **Reusable component**: Create in `resources/js/components/ComponentName/ComponentName.tsx`
- **Validation rule**: Create `app/Http/Requests/StoreOrUpdateRequest.php`
- **Modal logic**: Create component in `resources/js/components/[Feature]Modal.tsx`
- **Test**: Create `tests/Feature/[Feature]Test.php` extending `TestCase`
- **Admin feature**: Create controller in `app/Http/Controllers/Admin/` and route in `routes/web.php`
