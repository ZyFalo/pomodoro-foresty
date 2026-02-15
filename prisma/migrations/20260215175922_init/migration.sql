-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('user', 'admin');

-- CreateEnum
CREATE TYPE "SessionStatus" AS ENUM ('active', 'completed', 'abandoned');

-- CreateEnum
CREATE TYPE "EventType" AS ENUM ('login', 'registro', 'pomodoro_completado', 'arbol_ganado', 'template_creado', 'template_editado', 'template_eliminado', 'usuario_desactivado', 'contrasena_cambiada');

-- CreateTable
CREATE TABLE "users" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "username" VARCHAR(30) NOT NULL,
    "email" VARCHAR(255) NOT NULL,
    "password_hash" VARCHAR(255) NOT NULL,
    "email_verified" BOOLEAN NOT NULL DEFAULT false,
    "verification_code" VARCHAR(6),
    "verification_expires" TIMESTAMP,
    "reset_code" VARCHAR(6),
    "reset_expires" TIMESTAMP,
    "role" "UserRole" NOT NULL DEFAULT 'user',
    "pomodoro_duration" INTEGER NOT NULL DEFAULT 25,
    "break_duration" INTEGER NOT NULL DEFAULT 5,
    "sessions_per_cycle" INTEGER NOT NULL DEFAULT 4,
    "ambient_sound" BOOLEAN NOT NULL DEFAULT true,
    "notifications" BOOLEAN NOT NULL DEFAULT true,
    "auto_start_break" BOOLEAN NOT NULL DEFAULT false,
    "pomodoros_completed" INTEGER NOT NULL DEFAULT 0,
    "total_focus_minutes" INTEGER NOT NULL DEFAULT 0,
    "total_trees" INTEGER NOT NULL DEFAULT 0,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "templates" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "name" VARCHAR(100) NOT NULL,
    "category" VARCHAR(50) NOT NULL,
    "description" TEXT NOT NULL,
    "image_url" VARCHAR(500) NOT NULL,
    "probability" INTEGER NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_by" UUID NOT NULL,
    "created_at" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "templates_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_trees" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "user_id" UUID NOT NULL,
    "template_id" UUID NOT NULL,
    "custom_name" VARCHAR(50),
    "is_favorite" BOOLEAN NOT NULL DEFAULT false,
    "earned_at" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "user_trees_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "pomodoro_sessions" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "user_id" UUID NOT NULL,
    "duration" INTEGER NOT NULL,
    "started_at" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completed_at" TIMESTAMP,
    "tree_earned_id" UUID,
    "status" "SessionStatus" NOT NULL DEFAULT 'active',

    CONSTRAINT "pomodoro_sessions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "activity_logs" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "user_id" UUID NOT NULL,
    "event_type" "EventType" NOT NULL,
    "detail" VARCHAR(500) NOT NULL,
    "ip_address" VARCHAR(45) NOT NULL DEFAULT '',
    "created_at" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "activity_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "phrase_cache" (
    "id" SERIAL NOT NULL,
    "phrases" TEXT[],
    "fetched_at" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "phrase_cache_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_username_key" ON "users"("username");

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE INDEX "templates_is_active_idx" ON "templates"("is_active");

-- CreateIndex
CREATE INDEX "templates_created_by_idx" ON "templates"("created_by");

-- CreateIndex
CREATE INDEX "user_trees_user_id_idx" ON "user_trees"("user_id");

-- CreateIndex
CREATE INDEX "user_trees_user_id_earned_at_idx" ON "user_trees"("user_id", "earned_at" DESC);

-- CreateIndex
CREATE INDEX "user_trees_user_id_is_favorite_idx" ON "user_trees"("user_id", "is_favorite");

-- CreateIndex
CREATE UNIQUE INDEX "pomodoro_sessions_tree_earned_id_key" ON "pomodoro_sessions"("tree_earned_id");

-- CreateIndex
CREATE INDEX "pomodoro_sessions_user_id_status_idx" ON "pomodoro_sessions"("user_id", "status");

-- CreateIndex
CREATE INDEX "pomodoro_sessions_status_idx" ON "pomodoro_sessions"("status");

-- CreateIndex
CREATE INDEX "activity_logs_user_id_idx" ON "activity_logs"("user_id");

-- CreateIndex
CREATE INDEX "activity_logs_event_type_idx" ON "activity_logs"("event_type");

-- CreateIndex
CREATE INDEX "activity_logs_created_at_idx" ON "activity_logs"("created_at" DESC);

-- AddForeignKey
ALTER TABLE "templates" ADD CONSTRAINT "templates_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_trees" ADD CONSTRAINT "user_trees_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_trees" ADD CONSTRAINT "user_trees_template_id_fkey" FOREIGN KEY ("template_id") REFERENCES "templates"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pomodoro_sessions" ADD CONSTRAINT "pomodoro_sessions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pomodoro_sessions" ADD CONSTRAINT "pomodoro_sessions_tree_earned_id_fkey" FOREIGN KEY ("tree_earned_id") REFERENCES "user_trees"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "activity_logs" ADD CONSTRAINT "activity_logs_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
