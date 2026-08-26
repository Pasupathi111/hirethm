/**
 * Platform-wide billing/subscription tables — these are NOT org-scoped like
 * everything in app.ts. `plan` is a global catalog defined by HireThm staff
 * (platform admins); `organizationSubscription` links exactly one active
 * plan to each organization. See server/utils/requirePlatformAdmin.ts for
 * the authorization boundary that gates all of this.
 */
import {
  pgTable,
  text,
  timestamp,
  integer,
  boolean,
  jsonb,
  pgEnum,
  uniqueIndex,
} from 'drizzle-orm/pg-core'
import { relations, sql } from 'drizzle-orm'
import { organization } from './auth'

export const planTierEnum = pgEnum('plan_tier', ['free', 'premium', 'enterprise'])
export const subscriptionStatusEnum = pgEnum('subscription_status', ['active', 'past_due', 'cancelled', 'trialing'])

/**
 * Global catalog of subscription plans. Not org-scoped — every organization
 * on the platform chooses from the same set of plans.
 */
export const plan = pgTable('plan', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  name: text('name').notNull(),
  tier: planTierEnum('tier').notNull(),
  /** Null = "Custom / contact sales" pricing (shown as such, not $0) */
  priceMonthlyCents: integer('price_monthly_cents'),
  currency: text('currency').notNull().default('USD'),
  /** Null = unlimited */
  activeJobLimit: integer('active_job_limit'),
  /** Monthly candidate-profile-view quota per BRD §4.7 — null = unlimited */
  profileViewQuota: integer('profile_view_quota'),
  features: jsonb('features').$type<string[]>().notNull().default(sql`'[]'::jsonb`),
  /** Whether this plan can be newly assigned — false hides it from selection without deleting history */
  isActive: boolean('is_active').notNull().default(true),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
})

/**
 * One row per organization — the plan currently assigned to it. Every org
 * has exactly one subscription (enforced by the unique index), defaulting
 * to the platform's Free plan when an org is created.
 */
export const organizationSubscription = pgTable('organization_subscription', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  organizationId: text('organization_id').notNull().references(() => organization.id, { onDelete: 'cascade' }),
  planId: text('plan_id').notNull().references(() => plan.id, { onDelete: 'restrict' }),
  status: subscriptionStatusEnum('status').notNull().default('active'),
  currentPeriodStart: timestamp('current_period_start').notNull().defaultNow(),
  currentPeriodEnd: timestamp('current_period_end'),
  cancelledAt: timestamp('cancelled_at'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
}, (t) => ([
  uniqueIndex('organization_subscription_org_idx').on(t.organizationId),
]))

export const planRelations = relations(plan, ({ many }) => ({
  subscriptions: many(organizationSubscription),
}))

export const organizationSubscriptionRelations = relations(organizationSubscription, ({ one }) => ({
  organization: one(organization, { fields: [organizationSubscription.organizationId], references: [organization.id] }),
  plan: one(plan, { fields: [organizationSubscription.planId], references: [plan.id] }),
}))
