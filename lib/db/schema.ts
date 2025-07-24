import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core';

export const organizations = sqliteTable('organizations', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  description: text('description'),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
});

export const userOrganizations = sqliteTable('user_organizations', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  userId: text('user_id').notNull(),
  orgId: text('org_id').notNull(),
  role: text('role').notNull().default('member'), // 'admin' | 'member'
  joinedAt: text('joined_at').notNull(),
});

// Invitations table for tracking pending invitations
export const invitations = sqliteTable('invitations', {
  id: text('id').primaryKey(), // nanoid for the invitation token
  email: text('email').notNull(),
  orgId: text('org_id').notNull(),
  inviterId: text('inviter_id').notNull(),
  status: text('status').notNull().default('pending'), // 'pending' | 'accepted' | 'expired'
  expiresAt: text('expires_at').notNull(),
  createdAt: text('created_at').notNull(),
  acceptedAt: text('accepted_at'), // null until accepted
});

// Keep the old dtr table for compatibility (will be migrated)
export const dtr = sqliteTable('dtr', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  userId: text('user_id').notNull(),
  orgId: text('org_id').notNull(),
  date: text('date').notNull(), // ISO date string (YYYY-MM-DD)
  timeIn: text('time_in'), // ISO time string (HH:mm:ss)
  timeOut: text('time_out'), // ISO time string (HH:mm:ss)
  message: text('message'),
});

// New time entries table for multiple time in/out per day
export const timeEntries = sqliteTable('time_entries', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  userId: text('user_id').notNull(),
  orgId: text('org_id').notNull(),
  date: text('date').notNull(), // ISO date string (YYYY-MM-DD)
  timeIn: text('time_in').notNull(), // ISO datetime string
  timeOut: text('time_out'), // ISO datetime string (null if currently clocked in)
  note: text('note'), // Required on time out
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
});
