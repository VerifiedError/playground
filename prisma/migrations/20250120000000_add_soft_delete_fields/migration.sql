-- AlterTable
ALTER TABLE "agentic_sessions" ADD COLUMN "deleted_at" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "agentic_messages" ADD COLUMN "deleted_at" TIMESTAMP(3);

-- CreateIndex
CREATE INDEX "agentic_sessions_deleted_at_idx" ON "agentic_sessions"("deleted_at");

-- CreateIndex
CREATE INDEX "agentic_messages_deleted_at_idx" ON "agentic_messages"("deleted_at");
