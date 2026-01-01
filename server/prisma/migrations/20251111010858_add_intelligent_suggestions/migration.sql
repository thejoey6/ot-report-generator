/*
  Warnings:

  - Added the required column `fieldName` to the `AgeBasedSuggestion` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "public"."AgeBasedSuggestion" ADD COLUMN     "fieldName" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "public"."UserSuggestion" ADD COLUMN     "isPinned" BOOLEAN NOT NULL DEFAULT false;

-- CreateTable
CREATE TABLE "public"."ContextualPattern" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "category" TEXT NOT NULL,
    "targetField" TEXT NOT NULL,
    "contextField" TEXT NOT NULL,
    "contextValue" TEXT NOT NULL,
    "suggestionText" TEXT NOT NULL,
    "frequency" INTEGER NOT NULL DEFAULT 1,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ContextualPattern_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ContextualPattern_userId_category_targetField_idx" ON "public"."ContextualPattern"("userId", "category", "targetField");

-- CreateIndex
CREATE INDEX "ContextualPattern_userId_frequency_idx" ON "public"."ContextualPattern"("userId", "frequency");

-- CreateIndex
CREATE UNIQUE INDEX "ContextualPattern_userId_category_targetField_contextField__key" ON "public"."ContextualPattern"("userId", "category", "targetField", "contextField", "contextValue", "suggestionText");

-- CreateIndex
CREATE INDEX "AgeBasedSuggestion_category_fieldName_idx" ON "public"."AgeBasedSuggestion"("category", "fieldName");

-- CreateIndex
CREATE INDEX "UserSuggestion_userId_isPinned_idx" ON "public"."UserSuggestion"("userId", "isPinned");

-- AddForeignKey
ALTER TABLE "public"."ContextualPattern" ADD CONSTRAINT "ContextualPattern_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
