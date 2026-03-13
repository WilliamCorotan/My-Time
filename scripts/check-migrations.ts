import { createClient } from '@libsql/client';
import { config } from 'dotenv';

const envFile = process.env.NODE_ENV === 'production' ? '.env' : '.env.local';
config({ path: envFile });

const client = createClient({
  url: process.env.TURSO_CONNECTION_URL!,
  authToken: process.env.TURSO_AUTH_TOKEN!,
});

async function checkMigrations() {
  try {
    // Check if __drizzle_migrations table exists
    const result = await client.execute(`
      SELECT name FROM sqlite_master
      WHERE type='table' AND name='__drizzle_migrations'
    `);

    if (result.rows.length === 0) {
      console.log('❌ __drizzle_migrations table does not exist');
      console.log('This is why migrations are trying to rerun.');
      return;
    }

    console.log('✅ __drizzle_migrations table exists');

    // Get applied migrations
    const migrations = await client.execute('SELECT * FROM __drizzle_migrations');
    console.log('\nApplied migrations:');
    console.log(JSON.stringify(migrations.rows, null, 2));

    // List all tables
    const tables = await client.execute(`
      SELECT name FROM sqlite_master WHERE type='table' ORDER BY name
    `);
    console.log('\nAll tables in database:');
    tables.rows.forEach(row => console.log(`  - ${row.name}`));

  } catch (error) {
    console.error('Error:', error);
  }
}

checkMigrations();
