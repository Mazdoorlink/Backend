import { sql } from 'drizzle-orm';
import { pgEnum, pgTable, text, timestamp, uuid, varchar } from 'drizzle-orm/pg-core';
import { USER_ROLES, USER_STATUSES } from '../../types/constants';

export const userRoleEnum = pgEnum('user_role', USER_ROLES);

export const userStatusEnum = pgEnum('user_status', USER_STATUSES);

export const users = pgTable('users', {
  id: uuid('id')
    .default(sql`uuidv7()`)
    .primaryKey(),
  mobile: varchar('mobile', { length: 10 }).notNull().unique(),
  email: text('email').unique(),
  password: text('password'),
  role: userRoleEnum('role').notNull(),
  status: userStatusEnum('status').default('ACTIVE').notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
});
