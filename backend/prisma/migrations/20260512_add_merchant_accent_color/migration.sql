-- AlterTable: Add accent_color to merchants (nullable — null falls back to a vertical-derived default in the frontend)
ALTER TABLE "merchants" ADD COLUMN "accent_color" TEXT;
