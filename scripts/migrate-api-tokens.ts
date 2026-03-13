import { db } from '@/lib/db/config';

async function migrateApiTokens() {
  console.log('Creating api_tokens table...');

  try {
    await db.run(`
      CREATE TABLE IF NOT EXISTS api_tokens (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        token TEXT NOT NULL UNIQUE,
        user_id TEXT NOT NULL,
        org_id TEXT NOT NULL,
        name TEXT NOT NULL,
        last_used_at TEXT,
        created_at TEXT NOT NULL,
        expires_at TEXT
      )
    `);

    console.log('✅ api_tokens table created successfully!');
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  }
}

migrateApiTokens();
