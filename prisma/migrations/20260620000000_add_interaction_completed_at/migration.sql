-- AlterTable
ALTER TABLE "Interaction" ADD COLUMN "completedAt" TIMESTAMP(3);

-- CreateIndex
CREATE INDEX "Interaction_nextStepAt_idx" ON "Interaction"("nextStepAt");
