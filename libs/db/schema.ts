import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core';

export const dtr = sqliteTable('dtr', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  userId: text('user_id').notNull(),
  orgId: text('org_id').notNull(),
  date: text('date').notNull(), // ISO date string (YYYY-MM-DD)
  timeIn: text('time_in'), // ISO time string (HH:mm:ss)
  timeOut: text('time_out'), // ISO time string (HH:mm:ss)
  message: text('message'),
});
