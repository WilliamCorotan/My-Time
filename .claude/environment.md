# Development Environment Setup

## Required Environment Variables

Create a `.env.local` file in the project root with:

```env
# Turso Database
TURSO_CONNECTION_URL=your_turso_database_url
TURSO_AUTH_TOKEN=your_turso_auth_token

# Clerk Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
CLERK_SECRET_KEY=your_clerk_secret_key

# Optional
NEXT_TELEMETRY_DISABLED=1
NODE_ENV=development
```

## Development Tools

### Recommended VSCode Extensions
- TypeScript and JavaScript Language Features
- Tailwind CSS IntelliSense
- ESLint
- Prettier
- Clerk

### Browser Extensions
- React Developer Tools
- Clerk Dashboard (for debugging auth)

## First Time Setup

1. **Install Dependencies**
   ```bash
   npm install
   # or
   bun install
   ```

2. **Set up Environment Variables**
   - Copy `.env.example` to `.env.local` (if exists)
   - Add your Turso and Clerk credentials

3. **Initialize Database**
   ```bash
   npx drizzle-kit push
   ```

4. **Start Development Server**
   ```bash
   npm run dev
   ```

5. **Set up Clerk Organization**
   - Create organization in Clerk dashboard
   - Invite test users
   - Assign admin roles as needed

## Troubleshooting

### Common Issues
- **Database connection**: Check Turso credentials and network
- **Authentication**: Verify Clerk keys and organization setup
- **Build errors**: Run `npm run lint` and `npx tsc --noEmit`
- **Missing components**: Check if shadcn/ui components are properly installed

### Reset Development Environment
```bash
rm -rf node_modules package-lock.json
npm install
npx drizzle-kit push
npm run dev
```