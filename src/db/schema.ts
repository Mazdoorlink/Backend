import { sql } from 'drizzle-orm';
import { pgTable, uuid, varchar, timestamp, bigint } from 'drizzle-orm/pg-core';

export const users = pgTable('users', {
  id: uuid('id')
    .default(sql`uuidv7()`)
    .primaryKey(),
  mobile: varchar('mobile', { length: 10 }).notNull().unique(),
  password: varchar('password').notNull(),
  role: varchar('role', { enum: ['ADMIN', 'WORKER', 'CONTRACTOR', 'AGENT'] }).notNull(),
  status: varchar('status', { enum: ['ACTIVE', 'PENDING', 'BLOCKED'] }).default('PENDING'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Production-grade session management
export const refreshTokens = pgTable('refresh_tokens', {
  id: bigint('id', { mode: 'number' }).primaryKey().generatedAlwaysAsIdentity(),
  userId: uuid('user_id')
    .references(() => users.id, { onDelete: 'cascade' })
    .notNull(),
  token: varchar('token').notNull().unique(),
  expiresAt: timestamp('expires_at').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});
