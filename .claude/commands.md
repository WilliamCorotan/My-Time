# Claude Code Commands & Shortcuts

## Quick Development Commands

### Start Development
```bash
npm run dev
# Starts Next.js dev server with Turbopack
```

### Build & Deploy
```bash
npm run build   # Build for production
npm run start   # Start production server
npm run lint    # Run ESLint
```

### TypeScript
```bash
npx tsc --noEmit  # Type checking without compilation
```

## Database Operations

### Drizzle Commands
```bash
# Generate migrations
npx drizzle-kit generate

# Push schema changes
npx drizzle-kit push

# Open Drizzle Studio
npx drizzle-kit studio
```

## Common Development Tasks

### Adding New Features
1. Create API route in `app/[feature]/api/route.ts`
2. Create page in `app/[feature]/page.tsx`
3. Add navigation item to sidebar
4. Create components in `components/[feature]/`

### Component Development
- UI components go in `components/ui/`
- Feature components go in `components/[feature]/`
- Use existing patterns from dashboard components

### Database Schema Changes
1. Update `libs/db/schema.ts`
2. Generate migration: `npx drizzle-kit generate`
3. Apply changes: `npx drizzle-kit push`

## Debugging

### Common Issues
- Check Clerk organization setup for multi-tenant features
- Verify environment variables in `.env.local`
- Check database connection with Drizzle Studio

### Logging
- Client errors: Check browser console
- Server errors: Check terminal output
- Database queries: Use Drizzle Studio