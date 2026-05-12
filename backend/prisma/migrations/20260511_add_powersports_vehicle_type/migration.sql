-- AlterEnum: Add POWERSPORTS to MerchantVertical
ALTER TYPE "MerchantVertical" ADD VALUE 'POWERSPORTS';

-- CreateEnum: VehicleType
CREATE TYPE "VehicleType" AS ENUM ('MOTORCYCLE', 'BOAT', 'ATV', 'UTV', 'SNOWMOBILE', 'CAR', 'OTHER');

-- AlterTable: Add type column to vehicles (nullable — preserves legacy automotive rows)
ALTER TABLE "vehicles" ADD COLUMN "type" "VehicleType";
