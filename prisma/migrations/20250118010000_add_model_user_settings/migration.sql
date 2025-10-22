-- CreateTable
CREATE TABLE "model_user_settings" (
    "id" TEXT NOT NULL,
    "user_id" INTEGER NOT NULL,
    "model_id" TEXT NOT NULL,
    "enabled" BOOLEAN NOT NULL DEFAULT true,
    "custom_label" TEXT,
    "file_parser" TEXT DEFAULT 'auto',
    "file_parser_api_key" TEXT,
    "ai_provider" TEXT DEFAULT 'auto',
    "ai_provider_api_key" TEXT,
    "formatting_rules" TEXT,
    "system_prompt_type" TEXT DEFAULT 'default',
    "custom_system_prompt" TEXT,
    "chat_memory" INTEGER DEFAULT 10,
    "temperature" DOUBLE PRECISION DEFAULT 0.7,
    "max_tokens" INTEGER DEFAULT 2048,
    "top_p" DOUBLE PRECISION DEFAULT 0.9,
    "web_search" BOOLEAN DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "model_user_settings_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "model_user_settings_user_id_model_id_key" ON "model_user_settings"("user_id", "model_id");

-- CreateIndex
CREATE INDEX "model_user_settings_user_id_idx" ON "model_user_settings"("user_id");

-- CreateIndex
CREATE INDEX "model_user_settings_model_id_idx" ON "model_user_settings"("model_id");
