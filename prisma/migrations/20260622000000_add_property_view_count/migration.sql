-- AlterTable
ALTER TABLE "Property" ADD COLUMN "viewCount" INTEGER NOT NULL DEFAULT 0;
ALTER TABLE "Property" ADD COLUMN "lastViewedAt" TIMESTAMP(3);

-- CreateIndex
CREATE INDEX "Property_viewCount_idx" ON "Property"("viewCount");
CREATE INDEX "Property_lastViewedAt_idx" ON "Property"("lastViewedAt");
