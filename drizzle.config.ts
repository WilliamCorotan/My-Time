import { defineConfig } from 'drizzle-kit';
import { config } from 'dotenv';

config({ path: process.env.NODE_ENV === 'production' ? '.env' : '.env.local' });

export default defineConfig({
  schema: './lib/db/schema.ts',
  out: './drizzle',
  dialect: 'turso',
  dbCredentials: {
    url: process.env.TURSO_CONNECTION_URL!,
    authToken: process.env.TURSO_AUTH_TOKEN!,
  },
});