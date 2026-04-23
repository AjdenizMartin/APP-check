-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('ADMIN', 'SUPERVISOR', 'EMPLOYEE');
CREATE TYPE "CustomerAssetType" AS ENUM ('ID_PHOTO', 'FACE_PHOTO');
CREATE TYPE "VisitStatus" AS ENUM ('ACTIVE', 'CHECKED_OUT', 'FORCED_OUT');
CREATE TYPE "VisitResultType" AS ENUM ('WIN', 'LOSS', 'EVEN');
CREATE TYPE "VisitFinancialStatus" AS ENUM ('RECORDED', 'CORRECTED');
CREATE TYPE "ClosureActionType" AS ENUM ('FORCE_CHECKOUT_ALL');

CREATE TABLE "users" (
  "id" TEXT PRIMARY KEY,
  "email" TEXT NOT NULL UNIQUE,
  "name" TEXT NOT NULL,
  "role" "UserRole" NOT NULL,
  "password_hash" TEXT NOT NULL,
  "is_active" BOOLEAN NOT NULL DEFAULT TRUE,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL
);

CREATE TABLE "customers" (
  "id" TEXT PRIMARY KEY,
  "internal_code" TEXT UNIQUE,
  "full_name" TEXT NOT NULL,
  "phone" TEXT NOT NULL,
  "address" TEXT NOT NULL,
  "notes" TEXT,
  "is_active" BOOLEAN NOT NULL DEFAULT TRUE,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL,
  "created_by_user_id" TEXT,
  "updated_by_user_id" TEXT,
  CONSTRAINT "customers_created_by_user_id_fkey" FOREIGN KEY ("created_by_user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT "customers_updated_by_user_id_fkey" FOREIGN KEY ("updated_by_user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE
);

CREATE TABLE "customer_assets" (
  "id" TEXT PRIMARY KEY,
  "customer_id" TEXT NOT NULL,
  "asset_type" "CustomerAssetType" NOT NULL,
  "storage_key" TEXT NOT NULL,
  "mime_type" TEXT NOT NULL,
  "size_bytes" INTEGER NOT NULL,
  "uploaded_by_user_id" TEXT,
  "is_active" BOOLEAN NOT NULL DEFAULT TRUE,
  "replaced_at" TIMESTAMP(3),
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "customer_assets_customer_id_fkey" FOREIGN KEY ("customer_id") REFERENCES "customers"("id") ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT "customer_assets_uploaded_by_user_id_fkey" FOREIGN KEY ("uploaded_by_user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE
);

CREATE TABLE "closure_events" (
  "id" TEXT PRIMARY KEY,
  "action_type" "ClosureActionType" NOT NULL,
  "reason" TEXT NOT NULL,
  "executed_by_user_id" TEXT NOT NULL,
  "executed_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "affected_visits_count" INTEGER NOT NULL,
  CONSTRAINT "closure_events_executed_by_user_id_fkey" FOREIGN KEY ("executed_by_user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

CREATE TABLE "visits" (
  "id" TEXT PRIMARY KEY,
  "customer_id" TEXT NOT NULL,
  "status" "VisitStatus" NOT NULL DEFAULT 'ACTIVE',
  "check_in_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "check_out_at" TIMESTAMP(3),
  "check_in_by_user_id" TEXT NOT NULL,
  "check_out_by_user_id" TEXT,
  "forced_reason" TEXT,
  "closure_event_id" TEXT,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "visits_customer_id_fkey" FOREIGN KEY ("customer_id") REFERENCES "customers"("id") ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT "visits_check_in_by_user_id_fkey" FOREIGN KEY ("check_in_by_user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT "visits_check_out_by_user_id_fkey" FOREIGN KEY ("check_out_by_user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT "visits_closure_event_id_fkey" FOREIGN KEY ("closure_event_id") REFERENCES "closure_events"("id") ON DELETE SET NULL ON UPDATE CASCADE
);

CREATE TABLE "visit_financials" (
  "id" TEXT PRIMARY KEY,
  "visit_id" TEXT NOT NULL UNIQUE,
  "result_type" "VisitResultType" NOT NULL,
  "amount" DECIMAL(12,2) NOT NULL,
  "currency" TEXT NOT NULL DEFAULT 'EUR',
  "status" "VisitFinancialStatus" NOT NULL DEFAULT 'RECORDED',
  "recorded_by_user_id" TEXT NOT NULL,
  "recorded_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "correction_reason" TEXT,
  "corrected_by_user_id" TEXT,
  "corrected_at" TIMESTAMP(3),
  CONSTRAINT "visit_financials_visit_id_fkey" FOREIGN KEY ("visit_id") REFERENCES "visits"("id") ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT "visit_financials_recorded_by_user_id_fkey" FOREIGN KEY ("recorded_by_user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT "visit_financials_corrected_by_user_id_fkey" FOREIGN KEY ("corrected_by_user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT "visit_financials_amount_non_negative" CHECK ("amount" >= 0),
  CONSTRAINT "visit_financials_even_zero" CHECK (("result_type" = 'EVEN' AND "amount" = 0) OR ("result_type" <> 'EVEN' AND "amount" >= 0))
);

CREATE TABLE "audit_logs" (
  "id" TEXT PRIMARY KEY,
  "actor_user_id" TEXT,
  "entity_type" TEXT NOT NULL,
  "entity_id" TEXT,
  "action" TEXT NOT NULL,
  "reason" TEXT,
  "before_json" JSONB,
  "after_json" JSONB,
  "ip" TEXT,
  "user_agent" TEXT,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "audit_logs_actor_user_id_fkey" FOREIGN KEY ("actor_user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE
);

CREATE TABLE "app_settings" (
  "id" INTEGER PRIMARY KEY DEFAULT 1,
  "default_currency" TEXT NOT NULL DEFAULT 'EUR',
  "max_image_size_mb" INTEGER NOT NULL DEFAULT 5,
  "signed_url_ttl_seconds" INTEGER NOT NULL DEFAULT 300,
  "allow_employee_view_sensitive_images" BOOLEAN NOT NULL DEFAULT FALSE,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL
);

CREATE INDEX "customers_full_name_idx" ON "customers"("full_name");
CREATE INDEX "customers_phone_idx" ON "customers"("phone");
CREATE INDEX "customer_assets_customer_id_asset_type_idx" ON "customer_assets"("customer_id", "asset_type");
CREATE INDEX "visits_status_check_in_at_idx" ON "visits"("status", "check_in_at");
CREATE INDEX "visits_customer_id_status_idx" ON "visits"("customer_id", "status");
CREATE INDEX "visits_check_out_at_idx" ON "visits"("check_out_at");
CREATE INDEX "visit_financials_status_recorded_at_idx" ON "visit_financials"("status", "recorded_at");
CREATE INDEX "closure_events_executed_at_idx" ON "closure_events"("executed_at");
CREATE INDEX "audit_logs_entity_type_entity_id_idx" ON "audit_logs"("entity_type", "entity_id");
CREATE INDEX "audit_logs_created_at_idx" ON "audit_logs"("created_at");

-- Critical partial unique index: one active visit per customer
CREATE UNIQUE INDEX "visits_one_active_per_customer_uq"
  ON "visits"("customer_id")
  WHERE "status" = 'ACTIVE';

-- One active asset per type per customer
CREATE UNIQUE INDEX "customer_assets_active_type_per_customer_uq"
  ON "customer_assets"("customer_id", "asset_type")
  WHERE "is_active" = TRUE;
