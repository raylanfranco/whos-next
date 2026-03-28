-- CreateEnum
CREATE TYPE "BookingStatus" AS ENUM ('PENDING', 'CONFIRMED', 'CHECKED_IN', 'WAITING_ON_PARTS', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED', 'NO_SHOW');

-- CreateEnum
CREATE TYPE "PartStatus" AS ENUM ('NEEDED', 'ORDERED', 'RECEIVED');

-- CreateEnum
CREATE TYPE "QuestionType" AS ENUM ('RADIO', 'CHECKBOX', 'TEXT', 'SELECT', 'TINT_ZONE');

-- CreateTable
CREATE TABLE "merchants" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "timezone" TEXT NOT NULL DEFAULT 'America/New_York',
    "shop_hours_json" JSONB,
    "settings_json" JSONB,
    "email" TEXT,
    "password_hash" TEXT,
    "clover_merchant_id" TEXT,
    "clover_access_token" TEXT,
    "clover_refresh_token" TEXT,
    "clover_token_expiry" TIMESTAMP(3),
    "stripe_customer_id" TEXT,
    "stripe_account_id" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "merchants_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "services" (
    "id" TEXT NOT NULL,
    "merchant_id" TEXT NOT NULL,
    "clover_item_id" TEXT,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "category" TEXT,
    "image_url" TEXT,
    "duration_mins" INTEGER NOT NULL,
    "price_cents" INTEGER NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "parts_mappings_json" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "services_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "customers" (
    "id" TEXT NOT NULL,
    "merchant_id" TEXT NOT NULL,
    "clover_customer_id" TEXT,
    "name" TEXT NOT NULL,
    "email" TEXT,
    "phone" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "customers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "vehicles" (
    "id" TEXT NOT NULL,
    "customer_id" TEXT NOT NULL,
    "year" INTEGER,
    "make" TEXT,
    "model" TEXT,
    "trim" TEXT,
    "notes" TEXT,
    "photos_json" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "vehicles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "bookings" (
    "id" TEXT NOT NULL,
    "merchant_id" TEXT NOT NULL,
    "service_id" TEXT NOT NULL,
    "customer_id" TEXT NOT NULL,
    "vehicle_id" TEXT,
    "starts_at" TIMESTAMP(3) NOT NULL,
    "ends_at" TIMESTAMP(3) NOT NULL,
    "status" "BookingStatus" NOT NULL DEFAULT 'PENDING',
    "is_walk_in" BOOLEAN NOT NULL DEFAULT false,
    "clover_order_id" TEXT,
    "intake_data_json" JSONB,
    "notes" TEXT,
    "deposit_amount_cents" INTEGER,
    "deposit_paid_at" TIMESTAMP(3),
    "clover_charge_id" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "bookings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "booking_parts" (
    "id" TEXT NOT NULL,
    "booking_id" TEXT NOT NULL,
    "part_name" TEXT NOT NULL,
    "part_number" TEXT,
    "status" "PartStatus" NOT NULL DEFAULT 'NEEDED',
    "notes" TEXT,
    "ordered_at" TIMESTAMP(3),
    "received_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "booking_parts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "availability_rules" (
    "id" TEXT NOT NULL,
    "merchant_id" TEXT NOT NULL,
    "day_of_week" INTEGER NOT NULL,
    "start_time" TEXT NOT NULL,
    "end_time" TEXT NOT NULL,
    "is_blocked" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "availability_rules_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "blocked_dates" (
    "id" TEXT NOT NULL,
    "merchant_id" TEXT NOT NULL,
    "date" DATE NOT NULL,
    "reason" TEXT,

    CONSTRAINT "blocked_dates_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "intake_questions" (
    "id" TEXT NOT NULL,
    "service_id" TEXT NOT NULL,
    "question" TEXT NOT NULL,
    "type" "QuestionType" NOT NULL,
    "options" JSONB,
    "required" BOOLEAN NOT NULL DEFAULT false,
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "intake_questions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "push_subscriptions" (
    "id" TEXT NOT NULL,
    "merchant_id" TEXT NOT NULL,
    "endpoint" TEXT NOT NULL,
    "p256dh" TEXT NOT NULL,
    "auth" TEXT NOT NULL,
    "device_label" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "push_subscriptions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "fitment_entries" (
    "id" TEXT NOT NULL,
    "year" INTEGER NOT NULL,
    "make" TEXT NOT NULL,
    "model" TEXT NOT NULL,
    "trim" TEXT,
    "category" TEXT NOT NULL,
    "part_number" TEXT NOT NULL,
    "part_name" TEXT NOT NULL,
    "brand" TEXT,
    "notes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "fitment_entries_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "merchants_email_key" ON "merchants"("email");

-- CreateIndex
CREATE UNIQUE INDEX "merchants_clover_merchant_id_key" ON "merchants"("clover_merchant_id");

-- CreateIndex
CREATE UNIQUE INDEX "customers_merchant_id_email_key" ON "customers"("merchant_id", "email");

-- CreateIndex
CREATE UNIQUE INDEX "customers_merchant_id_clover_customer_id_key" ON "customers"("merchant_id", "clover_customer_id");

-- CreateIndex
CREATE INDEX "bookings_merchant_id_starts_at_idx" ON "bookings"("merchant_id", "starts_at");

-- CreateIndex
CREATE INDEX "bookings_merchant_id_status_idx" ON "bookings"("merchant_id", "status");

-- CreateIndex
CREATE INDEX "booking_parts_booking_id_idx" ON "booking_parts"("booking_id");

-- CreateIndex
CREATE UNIQUE INDEX "availability_rules_merchant_id_day_of_week_key" ON "availability_rules"("merchant_id", "day_of_week");

-- CreateIndex
CREATE UNIQUE INDEX "blocked_dates_merchant_id_date_key" ON "blocked_dates"("merchant_id", "date");

-- CreateIndex
CREATE INDEX "intake_questions_service_id_idx" ON "intake_questions"("service_id");

-- CreateIndex
CREATE UNIQUE INDEX "push_subscriptions_merchant_id_endpoint_key" ON "push_subscriptions"("merchant_id", "endpoint");

-- CreateIndex
CREATE INDEX "fitment_entries_year_make_model_idx" ON "fitment_entries"("year", "make", "model");

-- CreateIndex
CREATE INDEX "fitment_entries_category_idx" ON "fitment_entries"("category");

-- AddForeignKey
ALTER TABLE "services" ADD CONSTRAINT "services_merchant_id_fkey" FOREIGN KEY ("merchant_id") REFERENCES "merchants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "customers" ADD CONSTRAINT "customers_merchant_id_fkey" FOREIGN KEY ("merchant_id") REFERENCES "merchants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "vehicles" ADD CONSTRAINT "vehicles_customer_id_fkey" FOREIGN KEY ("customer_id") REFERENCES "customers"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bookings" ADD CONSTRAINT "bookings_merchant_id_fkey" FOREIGN KEY ("merchant_id") REFERENCES "merchants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bookings" ADD CONSTRAINT "bookings_service_id_fkey" FOREIGN KEY ("service_id") REFERENCES "services"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bookings" ADD CONSTRAINT "bookings_customer_id_fkey" FOREIGN KEY ("customer_id") REFERENCES "customers"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bookings" ADD CONSTRAINT "bookings_vehicle_id_fkey" FOREIGN KEY ("vehicle_id") REFERENCES "vehicles"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "booking_parts" ADD CONSTRAINT "booking_parts_booking_id_fkey" FOREIGN KEY ("booking_id") REFERENCES "bookings"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "availability_rules" ADD CONSTRAINT "availability_rules_merchant_id_fkey" FOREIGN KEY ("merchant_id") REFERENCES "merchants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "blocked_dates" ADD CONSTRAINT "blocked_dates_merchant_id_fkey" FOREIGN KEY ("merchant_id") REFERENCES "merchants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "intake_questions" ADD CONSTRAINT "intake_questions_service_id_fkey" FOREIGN KEY ("service_id") REFERENCES "services"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "push_subscriptions" ADD CONSTRAINT "push_subscriptions_merchant_id_fkey" FOREIGN KEY ("merchant_id") REFERENCES "merchants"("id") ON DELETE CASCADE ON UPDATE CASCADE;
