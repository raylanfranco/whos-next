-- CreateEnum: MerchantPlan
CREATE TYPE "MerchantPlan" AS ENUM ('FREE', 'PRO', 'GRANDFATHERED');

-- CreateEnum: MerchantVertical
CREATE TYPE "MerchantVertical" AS ENUM ('GENERIC', 'AUTOMOTIVE', 'TATTOO', 'BEAUTY');

-- AlterTable: Add plan + vertical fields to merchants
ALTER TABLE "merchants" ADD COLUMN "plan" "MerchantPlan" NOT NULL DEFAULT 'FREE';
ALTER TABLE "merchants" ADD COLUMN "plan_activated_at" TIMESTAMP(3);
ALTER TABLE "merchants" ADD COLUMN "stripe_subscription_id" TEXT;
ALTER TABLE "merchants" ADD COLUMN "vertical" "MerchantVertical" NOT NULL DEFAULT 'GENERIC';

-- AlterEnum: Add new QuestionType values
ALTER TYPE "QuestionType" ADD VALUE 'PHOTO_UPLOAD';
ALTER TYPE "QuestionType" ADD VALUE 'BODY_MAP';

-- CreateTable: AdapterRecord
CREATE TABLE "adapter_records" (
    "id" TEXT NOT NULL,
    "booking_id" TEXT,
    "customer_id" TEXT,
    "adapter_type" TEXT NOT NULL,
    "data_json" JSONB NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "adapter_records_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "adapter_records_booking_id_idx" ON "adapter_records"("booking_id");
CREATE INDEX "adapter_records_customer_id_idx" ON "adapter_records"("customer_id");
