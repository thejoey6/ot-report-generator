/*
  Warnings:

  - Added the required column `updatedAt` to the `Report` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "public"."Report" DROP CONSTRAINT "Report_userId_fkey";

-- DropForeignKey
ALTER TABLE "public"."Section" DROP CONSTRAINT "Section_reportId_fkey";

-- DropForeignKey
ALTER TABLE "public"."Template" DROP CONSTRAINT "Template_userId_fkey";

-- AlterTable
ALTER TABLE "public"."Report" ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;

-- CreateTable
CREATE TABLE "public"."UserSuggestion" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "category" TEXT NOT NULL,
    "fieldName" TEXT NOT NULL,
    "suggestionText" TEXT NOT NULL,
    "usageCount" INTEGER NOT NULL DEFAULT 1,
    "lastUsed" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "UserSuggestion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."AgeBasedSuggestion" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER,
    "minAgeMonths" INTEGER NOT NULL,
    "maxAgeMonths" INTEGER NOT NULL,
    "category" TEXT NOT NULL,
    "suggestionText" TEXT NOT NULL,
    "isSystemDefault" BOOLEAN NOT NULL DEFAULT false,
    "usageCount" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AgeBasedSuggestion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."QuickTextTemplate" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "title" TEXT NOT NULL,
    "shortcut" TEXT,
    "templateText" TEXT NOT NULL,
    "category" TEXT,
    "usageCount" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "QuickTextTemplate_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."SystemSuggestion" (
    "id" SERIAL NOT NULL,
    "category" TEXT NOT NULL,
    "fieldName" TEXT NOT NULL,
    "suggestionText" TEXT NOT NULL,
    "displayOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SystemSuggestion_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "UserSuggestion_userId_category_fieldName_idx" ON "public"."UserSuggestion"("userId", "category", "fieldName");

-- CreateIndex
CREATE INDEX "UserSuggestion_userId_usageCount_idx" ON "public"."UserSuggestion"("userId", "usageCount");

-- CreateIndex
CREATE UNIQUE INDEX "UserSuggestion_userId_category_fieldName_suggestionText_key" ON "public"."UserSuggestion"("userId", "category", "fieldName", "suggestionText");

-- CreateIndex
CREATE INDEX "AgeBasedSuggestion_minAgeMonths_maxAgeMonths_category_idx" ON "public"."AgeBasedSuggestion"("minAgeMonths", "maxAgeMonths", "category");

-- CreateIndex
CREATE INDEX "AgeBasedSuggestion_userId_category_idx" ON "public"."AgeBasedSuggestion"("userId", "category");

-- CreateIndex
CREATE INDEX "QuickTextTemplate_userId_category_idx" ON "public"."QuickTextTemplate"("userId", "category");

-- CreateIndex
CREATE INDEX "QuickTextTemplate_userId_shortcut_idx" ON "public"."QuickTextTemplate"("userId", "shortcut");

-- CreateIndex
CREATE INDEX "SystemSuggestion_category_fieldName_displayOrder_idx" ON "public"."SystemSuggestion"("category", "fieldName", "displayOrder");

-- CreateIndex
CREATE UNIQUE INDEX "SystemSuggestion_category_fieldName_suggestionText_key" ON "public"."SystemSuggestion"("category", "fieldName", "suggestionText");

-- AddForeignKey
ALTER TABLE "public"."Report" ADD CONSTRAINT "Report_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Section" ADD CONSTRAINT "Section_reportId_fkey" FOREIGN KEY ("reportId") REFERENCES "public"."Report"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Template" ADD CONSTRAINT "Template_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."UserSuggestion" ADD CONSTRAINT "UserSuggestion_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."AgeBasedSuggestion" ADD CONSTRAINT "AgeBasedSuggestion_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."QuickTextTemplate" ADD CONSTRAINT "QuickTextTemplate_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
