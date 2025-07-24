# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a Daily Time Record (DTR) system built with Next.js 15 and App Router. It's a time tracking application for organizations with multi-tenancy support via Clerk authentication and organizations.

## Key Technology Stack

- **Framework**: Next.js 15 with App Router and React 19
- **Authentication**: Clerk with organization support
- **Database**: Turso (LibSQL) with Drizzle ORM
- **Styling**: Tailwind CSS 4 with shadcn/ui components
- **Icons**: Lucide React
- **Runtime**: Designed for Bun (though Node.js compatible)

## Development Commands

```bash
# Start development server with Turbopack
npm run dev
# or
bun dev

# Build for production
npm run build
# or
bun run build

# Start production server
npm run start
# or
bun start

# Lint code
npm run lint
# or
bun run lint
```

## Architecture Overview

### Database Schema (`libs/db/schema.ts`)
- **`organizations`**: Custom organization management (id, name, description, createdAt, updatedAt)
- **`userOrganizations`**: User-organization relationships with roles (id, userId, orgId, role, joinedAt)
- **`timeEntries`**: Multiple time entries per day (id, userId, orgId, date, timeIn, timeOut, note, createdAt, updatedAt)
- **`dtr`**: Legacy time records table (kept for compatibility)
- Uses SQLite via Turso with Drizzle ORM
- Times stored as full ISO datetime strings for precise tracking

### Authentication & Authorization
- Clerk provides user authentication only (no organization features used)
- Custom organization system with `organizations` and `userOrganizations` tables
- Routes check both `userId` and `orgId` for multi-tenant isolation using custom `auth()` helper
- Admin panel restricted to users with 'admin' role in the custom organization system
- Organization selector in sidebar allows switching between organizations

### App Router Structure
- **`/`**: Landing page with feature overview and sign-in/sign-up links
- **`/sign-in/[[...sign-in]]`**: Clerk sign-in page with custom styling
- **`/sign-up/[[...sign-up]]`**: Clerk sign-up page with custom styling
- **`/welcome`**: Onboarding page for users without organizations
- **`/dashboard`**: Main dashboard with time tracking widgets and statistics
- **`/dtr`**: Time clock interface for clock in/out
- **`/tracker`**: Time tracking history and records
- **`/calendar`**: Calendar view of time records
- **`/admin`**: Admin panel for organization management

### API Routes Pattern
Each feature has its own API route in the feature directory:
- **`/app/dtr/api/route.ts`**: Handle clock in/out operations
- **`/app/tracker/api/route.ts`**: Fetch time tracking records
- **`/app/admin/api/route.ts`**: Admin operations for time records
- **`/app/api/organizations/route.ts`**: Organization CRUD operations
- **`/app/api/organizations/[orgId]/route.ts`**: Single organization operations
- **`/app/api/organizations/[orgId]/members/route.ts`**: Organization member management

### Component Architecture
- **`/components/ui/`**: Reusable shadcn/ui components (Button, Card, Avatar, etc.)
- **`/components/layout/`**: Layout components including:
  - `ConditionalLayout`: Shows/hides sidebar based on authentication state
  - `Sidebar`: Navigation with responsive design and OrganizationSelector
  - `OrganizationSelector`: Dropdown for switching between organizations
- **`/components/dashboard/`**: Dashboard-specific widgets (StatsCards, TimeClockWidget, RecentActivity)
- **`/components/admin/`**: Admin-specific components (OrganizationManagement)

### Database Configuration
- Database connection configured in `libs/db/config.ts`
- Requires `TURSO_CONNECTION_URL` and `TURSO_AUTH_TOKEN` environment variables
- Uses different .env files based on NODE_ENV (`.env` for production, `.env.local` for development)

### Key Utilities
- **`lib/utils.ts`**: Contains `cn()` utility for merging Tailwind classes with clsx and tailwind-merge
- **`lib/auth.ts`**: Custom auth helper that provides userId, orgId, and orgRole from custom organization system
- **`lib/organizations.ts`**: Organization management utilities and database operations
- **`lib/time-entries.ts`**: Time tracking utilities (clockIn, clockOut, duration calculations, formatting)
- **`lib/hooks/use-organization.ts`**: React hook for organization state management

## Development Notes

- The application uses a custom organization system (not Clerk organizations)
- **Time Tracking System**: Supports multiple clock in/out sessions per day with required notes on clock out
- **New time entries workflow**: Users can clock in/out multiple times, each session requires a note when clocking out
- **Duration Calculations**: Automatic calculation of session and daily totals, formatted as hours:minutes
- Conditional layout system: sidebar only shows for authenticated users, full-width for auth pages
- Authentication flow: landing page → sign-in/sign-up → welcome (if no orgs) → dashboard
- All database operations include both userId and orgId for proper data isolation
- Time calculations handle both active sessions (time in without time out) and completed sessions
- Responsive design with mobile sidebar overlay and desktop fixed sidebar
- Organization switching supported via cookie persistence and UI selector
- Protected routes handled by middleware, redirects unauthenticated users to sign-in
- Error handling implemented throughout with user-friendly error messages

## Environment Variables Required

```
TURSO_CONNECTION_URL=your_turso_database_url
TURSO_AUTH_TOKEN=your_turso_auth_token
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
CLERK_SECRET_KEY=your_clerk_secret_key
```