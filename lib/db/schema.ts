import { sqliteTable, text, integer, index } from 'drizzle-orm/sqlite-core';

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
}, (table) => ([
  index('user_org_user_idx').on(table.userId, table.orgId),
  index('user_org_org_idx').on(table.orgId),
]));

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
}, (table) => ([
  index('time_entries_user_org_date_idx').on(table.userId, table.orgId, table.date),
  index('time_entries_active_idx').on(table.userId, table.orgId, table.timeOut),
]));

// API tokens table for CLI authentication
export const apiTokens = sqliteTable('api_tokens', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  token: text('token').notNull().unique(),
  userId: text('user_id').notNull(),
  orgId: text('org_id').notNull(),
  name: text('name').notNull(), // Friendly name for the token (e.g., "My Laptop CLI")
  lastUsedAt: text('last_used_at'),
  createdAt: text('created_at').notNull(),
  expiresAt: text('expires_at'), // null for non-expiring tokens
});
