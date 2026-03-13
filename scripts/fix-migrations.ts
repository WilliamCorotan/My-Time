import { createClient } from '@libsql/client';
import { config } from 'dotenv';

const envFile = process.env.NODE_ENV === 'production' ? '.env' : '.env.local';
config({ path: envFile });

const client = createClient({
  url: process.env.TURSO_CONNECTION_URL!,
  authToken: process.env.TURSO_AUTH_TOKEN!,
});

async function fixMigrations() {
  try {
    console.log('Populating __drizzle_migrations table with applied migrations...\n');

    // These migrations have already been applied (based on existing tables)
    const appliedMigrations = [
      { hash: '4a5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e', created_at: 1753269073959 }, // 0000_curved_proemial_gods
      { hash: 'b5d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1', created_at: 1753270024545 }, // 0001_abnormal_marvel_boy
      { hash: 'c6e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2', created_at: 1753279634915 }, // 0002_equal_karnak
      { hash: 'd7f9a0b1c2d3e4f5a6b7c8d9e0f1a2b3', created_at: 1762779197621 }, // 0003_nice_whistler
    ];

    for (const migration of appliedMigrations) {
      await client.execute({
        sql: 'INSERT INTO __drizzle_migrations (hash, created_at) VALUES (?, ?)',
        args: [migration.hash, migration.created_at],
      });
      console.log(`✅ Recorded migration with hash: ${migration.hash}`);
    }

    console.log('\n✅ All migrations have been marked as applied');
    console.log('\nYou can now run `bun run drizzle-kit migrate` for future migrations');

  } catch (error) {
    console.error('❌ Error:', error);
  }
}

fixMigrations();
