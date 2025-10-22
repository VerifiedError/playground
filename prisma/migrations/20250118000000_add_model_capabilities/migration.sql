-- AlterTable: Add all new model capability and metadata fields
-- Migration: add_model_capabilities

-- Add new metadata fields
ALTER TABLE "groq_models" ADD COLUMN "owner" TEXT NOT NULL DEFAULT 'Unknown';
ALTER TABLE "groq_models" ADD COLUMN "model_type" TEXT NOT NULL DEFAULT 'chat';
ALTER TABLE "groq_models" ADD COLUMN "description" TEXT;
ALTER TABLE "groq_models" ADD COLUMN "is_deprecated" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "groq_models" ADD COLUMN "deprecation_date" TIMESTAMP(3);
ALTER TABLE "groq_models" ADD COLUMN "release_date" TIMESTAMP(3);

-- Add context and limit fields
ALTER TABLE "groq_models" ADD COLUMN "max_input_tokens" INTEGER;
ALTER TABLE "groq_models" ADD COLUMN "max_output_tokens" INTEGER;
ALTER TABLE "groq_models" ADD COLUMN "max_image_size" INTEGER;
ALTER TABLE "groq_models" ADD COLUMN "max_image_count" INTEGER;
ALTER TABLE "groq_models" ADD COLUMN "max_audio_duration" INTEGER;

-- Add capability boolean fields
ALTER TABLE "groq_models" ADD COLUMN "supports_tools" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "groq_models" ADD COLUMN "supports_web_search" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "groq_models" ADD COLUMN "supports_code_execution" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "groq_models" ADD COLUMN "supports_browser_automation" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "groq_models" ADD COLUMN "supports_visit_website" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "groq_models" ADD COLUMN "supports_wolfram_alpha" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "groq_models" ADD COLUMN "supports_vision" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "groq_models" ADD COLUMN "supports_reasoning" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "groq_models" ADD COLUMN "supports_audio" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "groq_models" ADD COLUMN "supports_streaming" BOOLEAN NOT NULL DEFAULT true;
ALTER TABLE "groq_models" ADD COLUMN "supports_json_mode" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "groq_models" ADD COLUMN "supports_prompt_caching" BOOLEAN NOT NULL DEFAULT false;

-- Add enhanced pricing fields
ALTER TABLE "groq_models" ADD COLUMN "input_pricing_cached" DOUBLE PRECISION;
ALTER TABLE "groq_models" ADD COLUMN "audio_pricing" DOUBLE PRECISION;
ALTER TABLE "groq_models" ADD COLUMN "batch_discount" DOUBLE PRECISION;

-- Add performance fields
ALTER TABLE "groq_models" ADD COLUMN "avg_latency_ms" DOUBLE PRECISION;
ALTER TABLE "groq_models" ADD COLUMN "tokens_per_second" DOUBLE PRECISION;
ALTER TABLE "groq_models" ADD COLUMN "uptime" DOUBLE PRECISION DEFAULT 99.9;

-- Add admin override flag
ALTER TABLE "groq_models" ADD COLUMN "capabilities_overridden" BOOLEAN NOT NULL DEFAULT false;

-- Migrate data from old is_vision column to new supports_vision column
UPDATE "groq_models" SET "supports_vision" = "is_vision";

-- Drop old is_vision column
ALTER TABLE "groq_models" DROP COLUMN "is_vision";

-- Create indexes for filtering
CREATE INDEX "groq_models_model_type_idx" ON "groq_models"("model_type");
CREATE INDEX "groq_models_owner_idx" ON "groq_models"("owner");
CREATE INDEX "groq_models_is_active_idx" ON "groq_models"("is_active");
CREATE INDEX "groq_models_is_deprecated_idx" ON "groq_models"("is_deprecated");
