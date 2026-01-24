-- da Vinci Archives - Initial Schema Migration
-- This migration creates all tables with full-text search, triggers, and constraints

-- ============================================================================
-- PAINTINGS
-- ============================================================================

CREATE TABLE IF NOT EXISTS "paintings" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "title" text NOT NULL,
  "description" text,
  "medium" text,
  "dimensions" text,
  "status" text NOT NULL DEFAULT 'in_progress',

  -- Image storage (Vercel Blob pathnames)
  "primary_image_pathname" text,
  "reference_images" jsonb DEFAULT '[]',

  -- Full-text search (GENERATED column)
  "search_vector" tsvector GENERATED ALWAYS AS (
    setweight(to_tsvector('english', coalesce("title", '')), 'A') ||
    setweight(to_tsvector('english', coalesce("description", '')), 'B') ||
    setweight(to_tsvector('english', coalesce("medium", '')), 'C')
  ) STORED,

  -- Timestamps
  "started_at" timestamp with time zone,
  "completed_at" timestamp with time zone,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  "updated_at" timestamp with time zone DEFAULT now() NOT NULL,

  -- Constraints
  CONSTRAINT "paintings_status_check" CHECK (
    "status" IN ('planning', 'in_progress', 'completed', 'archived')
  )
);

-- Indexes
CREATE INDEX IF NOT EXISTS "idx_paintings_status" ON "paintings" ("status");
CREATE INDEX IF NOT EXISTS "idx_paintings_search" ON "paintings" USING GIN("search_vector");

-- ============================================================================
-- SUPPLIES (with unit_type support)
-- ============================================================================

CREATE TABLE IF NOT EXISTS "supplies" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "name" text NOT NULL,
  "brand" text,
  "category" text NOT NULL,

  -- Unit system
  "unit_type" text NOT NULL DEFAULT 'ml',
  "initial_qty" numeric NOT NULL,
  "current_qty" numeric NOT NULL,
  "low_stock_threshold_qty" numeric DEFAULT 0,

  -- Cost tracking
  "cost_per_unit" numeric,
  "purchase_date" date,

  -- Full-text search (GENERATED column)
  "search_vector" tsvector GENERATED ALWAYS AS (
    setweight(to_tsvector('english', coalesce("name", '')), 'A') ||
    setweight(to_tsvector('english', coalesce("brand", '')), 'B') ||
    setweight(to_tsvector('english', coalesce("notes", '')), 'C')
  ) STORED,

  -- Metadata
  "notes" text,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  "updated_at" timestamp with time zone DEFAULT now() NOT NULL,

  -- Constraints
  CONSTRAINT "supplies_category_check" CHECK (
    "category" IN ('paint', 'brush', 'canvas', 'medium', 'tool', 'other')
  ),
  CONSTRAINT "supplies_unit_type_check" CHECK (
    "unit_type" IN ('ml', 'each', 'g')
  ),
  CONSTRAINT "supplies_initial_qty_check" CHECK ("initial_qty" >= 0),
  CONSTRAINT "supplies_current_qty_check" CHECK ("current_qty" >= 0)
);

-- Indexes
CREATE INDEX IF NOT EXISTS "idx_supplies_category" ON "supplies" ("category");
CREATE INDEX IF NOT EXISTS "idx_supplies_search" ON "supplies" USING GIN("search_vector");
CREATE INDEX IF NOT EXISTS "idx_supplies_low_stock" ON "supplies" ("current_qty")
  WHERE "current_qty" <= "low_stock_threshold_qty";

-- ============================================================================
-- PAINTING_SUPPLIES (many-to-many with usage tracking)
-- ============================================================================

CREATE TABLE IF NOT EXISTS "painting_supplies" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "painting_id" uuid NOT NULL REFERENCES "paintings"("id") ON DELETE CASCADE,
  "supply_id" uuid NOT NULL REFERENCES "supplies"("id") ON DELETE RESTRICT,

  -- Snapshot of unit at time of use
  "amount" numeric NOT NULL,
  "unit_type" text NOT NULL,

  "notes" text,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,

  -- Constraints
  CONSTRAINT "painting_supplies_unique" UNIQUE ("painting_id", "supply_id"),
  CONSTRAINT "painting_supplies_amount_check" CHECK ("amount" > 0)
);

-- Indexes
CREATE INDEX IF NOT EXISTS "idx_painting_supplies_painting" ON "painting_supplies" ("painting_id");
CREATE INDEX IF NOT EXISTS "idx_painting_supplies_supply" ON "painting_supplies" ("supply_id");

-- ============================================================================
-- SUPPLY_CONSUMPTION_LOG (immutable event source)
-- ============================================================================

CREATE TABLE IF NOT EXISTS "supply_consumption_log" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "supply_id" uuid NOT NULL REFERENCES "supplies"("id") ON DELETE RESTRICT,
  "painting_id" uuid REFERENCES "paintings"("id") ON DELETE SET NULL,

  -- Consumption details
  "amount" numeric NOT NULL,
  "unit_type" text NOT NULL,
  "previous_qty" numeric NOT NULL,
  "new_qty" numeric NOT NULL,

  -- Context
  "source" text NOT NULL DEFAULT 'manual',
  "raw_input" text,
  "notes" text,

  "created_at" timestamp with time zone DEFAULT now() NOT NULL,

  -- Constraints
  CONSTRAINT "consumption_log_source_check" CHECK (
    "source" IN ('manual', 'sloppy', 'adjustment')
  )
);

-- Indexes
CREATE INDEX IF NOT EXISTS "idx_consumption_log_supply" ON "supply_consumption_log" ("supply_id");
CREATE INDEX IF NOT EXISTS "idx_consumption_log_painting" ON "supply_consumption_log" ("painting_id");
CREATE INDEX IF NOT EXISTS "idx_consumption_log_created" ON "supply_consumption_log" ("created_at");

-- ============================================================================
-- PLANS (canvas planning documents)
-- ============================================================================

CREATE TABLE IF NOT EXISTS "plans" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "title" text NOT NULL,
  "description" text,
  "painting_id" uuid REFERENCES "paintings"("id") ON DELETE SET NULL,

  -- Checklist items (JSONB array)
  "checklist" jsonb DEFAULT '[]',

  -- Reference images (Vercel Blob pathnames)
  "reference_images" jsonb DEFAULT '[]',

  -- Full-text search (GENERATED column)
  "search_vector" tsvector GENERATED ALWAYS AS (
    setweight(to_tsvector('english', coalesce("title", '')), 'A') ||
    setweight(to_tsvector('english', coalesce("description", '')), 'B')
  ) STORED,

  -- Status
  "status" text NOT NULL DEFAULT 'active',

  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  "updated_at" timestamp with time zone DEFAULT now() NOT NULL,

  -- Constraints
  CONSTRAINT "plans_status_check" CHECK (
    "status" IN ('active', 'completed', 'archived')
  )
);

-- Indexes
CREATE INDEX IF NOT EXISTS "idx_plans_painting" ON "plans" ("painting_id");
CREATE INDEX IF NOT EXISTS "idx_plans_status" ON "plans" ("status");
CREATE INDEX IF NOT EXISTS "idx_plans_search" ON "plans" USING GIN("search_vector");

-- ============================================================================
-- CANVAS_SNAPSHOTS (tldraw persistence - full history)
-- ============================================================================

CREATE TABLE IF NOT EXISTS "canvas_snapshots" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "plan_id" uuid NOT NULL REFERENCES "plans"("id") ON DELETE CASCADE,

  -- tldraw document state
  "document" jsonb NOT NULL,

  -- Sync tracking
  "client_timestamp" timestamp with time zone,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL
);

-- Indexes
CREATE INDEX IF NOT EXISTS "idx_canvas_snapshots_plan_time" ON "canvas_snapshots" ("plan_id", "created_at" DESC);
CREATE INDEX IF NOT EXISTS "idx_canvas_snapshots_client_time" ON "canvas_snapshots" ("plan_id", "client_timestamp" DESC);

-- ============================================================================
-- SESSIONS (auth)
-- ============================================================================

CREATE TABLE IF NOT EXISTS "sessions" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "token" text NOT NULL UNIQUE,

  -- Session metadata
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  "expires_at" timestamp with time zone NOT NULL,
  "last_activity" timestamp with time zone DEFAULT now() NOT NULL,

  -- Optional: device/browser info
  "user_agent" text
);

-- Indexes
CREATE INDEX IF NOT EXISTS "idx_sessions_token" ON "sessions" ("token");
CREATE INDEX IF NOT EXISTS "idx_sessions_expires" ON "sessions" ("expires_at");

-- ============================================================================
-- CONSUMPTION TRIGGER (Concurrency-Safe)
-- ============================================================================

CREATE OR REPLACE FUNCTION decrement_supply_qty()
RETURNS TRIGGER AS $$
DECLARE
  locked_supply supplies%ROWTYPE;
BEGIN
  -- Lock the supply row to prevent concurrent modifications
  SELECT * INTO locked_supply
  FROM supplies
  WHERE id = NEW.supply_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Supply not found: %', NEW.supply_id;
  END IF;

  -- Check sufficient stock
  IF locked_supply.current_qty < NEW.amount THEN
    RAISE EXCEPTION 'Insufficient stock: have %, need %',
      locked_supply.current_qty, NEW.amount;
  END IF;

  -- Record previous/new values
  NEW.previous_qty := locked_supply.current_qty;
  NEW.new_qty := locked_supply.current_qty - NEW.amount;
  NEW.unit_type := locked_supply.unit_type;

  -- Update supply
  UPDATE supplies
  SET current_qty = NEW.new_qty,
      updated_at = NOW()
  WHERE id = NEW.supply_id;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger
DROP TRIGGER IF EXISTS trg_consumption_decrement ON supply_consumption_log;
CREATE TRIGGER trg_consumption_decrement
BEFORE INSERT ON supply_consumption_log
FOR EACH ROW
EXECUTE FUNCTION decrement_supply_qty();

-- ============================================================================
-- UPDATED_AT TRIGGER (auto-update timestamps)
-- ============================================================================

CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply to all tables with updated_at
DROP TRIGGER IF EXISTS trg_paintings_updated_at ON paintings;
CREATE TRIGGER trg_paintings_updated_at
BEFORE UPDATE ON paintings
FOR EACH ROW
EXECUTE FUNCTION update_updated_at();

DROP TRIGGER IF EXISTS trg_supplies_updated_at ON supplies;
CREATE TRIGGER trg_supplies_updated_at
BEFORE UPDATE ON supplies
FOR EACH ROW
EXECUTE FUNCTION update_updated_at();

DROP TRIGGER IF EXISTS trg_plans_updated_at ON plans;
CREATE TRIGGER trg_plans_updated_at
BEFORE UPDATE ON plans
FOR EACH ROW
EXECUTE FUNCTION update_updated_at();
