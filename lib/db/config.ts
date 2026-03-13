import { config } from 'dotenv';
import { drizzle } from 'drizzle-orm/libsql';

if (process.env.NODE_ENV !== 'production') {
  config({ path: '.env.local' });
}

export const db = drizzle({ connection: {
  url: process.env.TURSO_CONNECTION_URL!,
  authToken: process.env.TURSO_AUTH_TOKEN!,
}});
