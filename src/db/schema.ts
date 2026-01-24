import {
  pgTable,
  uuid,
  text,
  numeric,
  date,
  timestamp,
  jsonb,
  index,
  unique,
  check,
} from 'drizzle-orm/pg-core';
import { relations, sql } from 'drizzle-orm';

// ============================================================================
// PAINTINGS
// ============================================================================

export const paintings = pgTable(
  'paintings',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    title: text('title').notNull(),
    description: text('description'),
    medium: text('medium'), // e.g., "oil on canvas", "watercolor"
    dimensions: text('dimensions'), // e.g., "24x36 inches"
    status: text('status', { enum: ['planning', 'in_progress', 'completed', 'archived'] })
      .default('in_progress')
      .notNull(),

    // Image storage (Vercel Blob pathnames)
    primaryImagePathname: text('primary_image_pathname'),
    referenceImages: jsonb('reference_images').$type<string[]>().default([]),

    // Full-text search vector (generated column - handled in migration SQL)
    searchVector: text('search_vector'),

    // Timestamps
    startedAt: timestamp('started_at', { withTimezone: true }),
    completedAt: timestamp('completed_at', { withTimezone: true }),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    index('idx_paintings_status').on(table.status),
  ]
);

export const paintingsRelations = relations(paintings, ({ many }) => ({
  paintingSupplies: many(paintingSupplies),
  consumptionLogs: many(supplyConsumptionLog),
  plans: many(plans),
}));

// ============================================================================
// SUPPLIES (with unit_type support)
// ============================================================================

export const supplies = pgTable(
  'supplies',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    name: text('name').notNull(),
    brand: text('brand'),
    category: text('category', {
      enum: ['paint', 'brush', 'canvas', 'medium', 'tool', 'other'],
    }).notNull(),

    // Unit system (key spec requirement)
    unitType: text('unit_type', { enum: ['ml', 'each', 'g'] })
      .default('ml')
      .notNull(),
    initialQty: numeric('initial_qty').notNull(),
    currentQty: numeric('current_qty').notNull(),
    lowStockThresholdQty: numeric('low_stock_threshold_qty').default('0'),

    // Cost tracking
    costPerUnit: numeric('cost_per_unit'),
    purchaseDate: date('purchase_date'),

    // Full-text search vector (generated column - handled in migration SQL)
    searchVector: text('search_vector'),

    // Metadata
    notes: text('notes'),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    index('idx_supplies_category').on(table.category),
    index('idx_supplies_low_stock').on(table.currentQty),
  ]
);

export const suppliesRelations = relations(supplies, ({ many }) => ({
  paintingSupplies: many(paintingSupplies),
  consumptionLogs: many(supplyConsumptionLog),
}));

// ============================================================================
// PAINTING_SUPPLIES (many-to-many with usage tracking)
// ============================================================================

export const paintingSupplies = pgTable(
  'painting_supplies',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    paintingId: uuid('painting_id')
      .notNull()
      .references(() => paintings.id, { onDelete: 'cascade' }),
    supplyId: uuid('supply_id')
      .notNull()
      .references(() => supplies.id, { onDelete: 'restrict' }),

    // Snapshot of unit at time of use
    amount: numeric('amount').notNull(),
    unitType: text('unit_type').notNull(), // snapshot from supply at link time

    notes: text('notes'),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    unique('painting_supplies_unique').on(table.paintingId, table.supplyId),
    index('idx_painting_supplies_painting').on(table.paintingId),
    index('idx_painting_supplies_supply').on(table.supplyId),
  ]
);

export const paintingSuppliesRelations = relations(paintingSupplies, ({ one }) => ({
  painting: one(paintings, {
    fields: [paintingSupplies.paintingId],
    references: [paintings.id],
  }),
  supply: one(supplies, {
    fields: [paintingSupplies.supplyId],
    references: [supplies.id],
  }),
}));

// ============================================================================
// SUPPLY_CONSUMPTION_LOG (immutable event source)
// ============================================================================

export const supplyConsumptionLog = pgTable(
  'supply_consumption_log',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    supplyId: uuid('supply_id')
      .notNull()
      .references(() => supplies.id, { onDelete: 'restrict' }),
    paintingId: uuid('painting_id').references(() => paintings.id, {
      onDelete: 'set null',
    }),

    // Consumption details
    amount: numeric('amount').notNull(),
    unitType: text('unit_type').notNull(), // snapshot at consumption time
    previousQty: numeric('previous_qty').notNull(),
    newQty: numeric('new_qty').notNull(),

    // Context
    source: text('source', { enum: ['manual', 'sloppy', 'adjustment'] })
      .default('manual')
      .notNull(),
    rawInput: text('raw_input'), // original sloppy mode input
    notes: text('notes'),

    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    index('idx_consumption_log_supply').on(table.supplyId),
    index('idx_consumption_log_painting').on(table.paintingId),
    index('idx_consumption_log_created').on(table.createdAt),
  ]
);

export const supplyConsumptionLogRelations = relations(supplyConsumptionLog, ({ one }) => ({
  supply: one(supplies, {
    fields: [supplyConsumptionLog.supplyId],
    references: [supplies.id],
  }),
  painting: one(paintings, {
    fields: [supplyConsumptionLog.paintingId],
    references: [paintings.id],
  }),
}));

// ============================================================================
// PLANS (canvas planning documents)
// ============================================================================

export type ChecklistItem = {
  text: string;
  completed: boolean;
  order: number;
};

export const plans = pgTable(
  'plans',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    title: text('title').notNull(),
    description: text('description'),
    paintingId: uuid('painting_id').references(() => paintings.id, {
      onDelete: 'set null',
    }),

    // Checklist items (JSONB array)
    checklist: jsonb('checklist').$type<ChecklistItem[]>().default([]),

    // Reference images (Vercel Blob pathnames)
    referenceImages: jsonb('reference_images').$type<string[]>().default([]),

    // Full-text search vector (generated column - handled in migration SQL)
    searchVector: text('search_vector'),

    // Status
    status: text('status', { enum: ['active', 'completed', 'archived'] })
      .default('active')
      .notNull(),

    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    index('idx_plans_painting').on(table.paintingId),
    index('idx_plans_status').on(table.status),
  ]
);

export const plansRelations = relations(plans, ({ one, many }) => ({
  painting: one(paintings, {
    fields: [plans.paintingId],
    references: [paintings.id],
  }),
  canvasSnapshots: many(canvasSnapshots),
}));

// ============================================================================
// CANVAS_SNAPSHOTS (tldraw persistence - full history)
// ============================================================================

export const canvasSnapshots = pgTable(
  'canvas_snapshots',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    planId: uuid('plan_id')
      .notNull()
      .references(() => plans.id, { onDelete: 'cascade' }),

    // tldraw document state
    document: jsonb('document').notNull(),

    // Sync tracking
    clientTimestamp: timestamp('client_timestamp', { withTimezone: true }),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    index('idx_canvas_snapshots_plan_time').on(table.planId, table.createdAt),
    index('idx_canvas_snapshots_client_time').on(table.planId, table.clientTimestamp),
  ]
);

export const canvasSnapshotsRelations = relations(canvasSnapshots, ({ one }) => ({
  plan: one(plans, {
    fields: [canvasSnapshots.planId],
    references: [plans.id],
  }),
}));

// ============================================================================
// SESSIONS (auth)
// ============================================================================

export const sessions = pgTable(
  'sessions',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    token: text('token').notNull().unique(),

    // Session metadata
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
    expiresAt: timestamp('expires_at', { withTimezone: true }).notNull(),
    lastActivity: timestamp('last_activity', { withTimezone: true }).defaultNow().notNull(),

    // Optional: device/browser info
    userAgent: text('user_agent'),
  },
  (table) => [
    index('idx_sessions_token').on(table.token),
    index('idx_sessions_expires').on(table.expiresAt),
  ]
);

// ============================================================================
// TYPE EXPORTS
// ============================================================================

export type Painting = typeof paintings.$inferSelect;
export type NewPainting = typeof paintings.$inferInsert;

export type Supply = typeof supplies.$inferSelect;
export type NewSupply = typeof supplies.$inferInsert;

export type PaintingSupply = typeof paintingSupplies.$inferSelect;
export type NewPaintingSupply = typeof paintingSupplies.$inferInsert;

export type SupplyConsumptionLogEntry = typeof supplyConsumptionLog.$inferSelect;
export type NewSupplyConsumptionLogEntry = typeof supplyConsumptionLog.$inferInsert;

export type Plan = typeof plans.$inferSelect;
export type NewPlan = typeof plans.$inferInsert;

export type CanvasSnapshot = typeof canvasSnapshots.$inferSelect;
export type NewCanvasSnapshot = typeof canvasSnapshots.$inferInsert;

export type Session = typeof sessions.$inferSelect;
export type NewSession = typeof sessions.$inferInsert;
