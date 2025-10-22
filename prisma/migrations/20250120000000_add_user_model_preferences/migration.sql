-- CreateTable
CREATE TABLE "user_model_preferences" (
    "id" TEXT NOT NULL,
    "user_id" INTEGER NOT NULL,
    "model_id" TEXT NOT NULL,
    "is_enabled" BOOLEAN NOT NULL DEFAULT true,
    "is_favorite" BOOLEAN NOT NULL DEFAULT false,
    "custom_label" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "user_model_preferences_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "user_model_preferences_user_id_idx" ON "user_model_preferences"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "user_model_preferences_user_id_model_id_key" ON "user_model_preferences"("user_id", "model_id");

-- AddForeignKey
ALTER TABLE "user_model_preferences" ADD CONSTRAINT "user_model_preferences_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
