-- AlterTable: Add Stripe Connect fields to merchants
ALTER TABLE "merchants" DROP COLUMN IF EXISTS "stripe_customer_id";
ALTER TABLE "merchants" ADD COLUMN IF NOT EXISTS "stripe_access_token" TEXT;
ALTER TABLE "merchants" ADD COLUMN IF NOT EXISTS "stripe_publishable_key" TEXT;
ALTER TABLE "merchants" ADD COLUMN IF NOT EXISTS "stripe_connected" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "merchants" ADD COLUMN IF NOT EXISTS "stripe_connected_at" TIMESTAMP(3);

-- CreateIndex: Unique constraint on stripe_account_id
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_indexes WHERE indexname = 'merchants_stripe_account_id_key'
  ) THEN
    CREATE UNIQUE INDEX "merchants_stripe_account_id_key" ON "merchants"("stripe_account_id");
  END IF;
END $$;
