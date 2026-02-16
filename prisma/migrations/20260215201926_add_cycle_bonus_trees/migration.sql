-- DropForeignKey
ALTER TABLE "pomodoro_sessions" DROP CONSTRAINT "pomodoro_sessions_tree_earned_id_fkey";

-- DropIndex
DROP INDEX "pomodoro_sessions_tree_earned_id_key";

-- Migrate existing data: copy tree_earned_id to user_trees.session_id
ALTER TABLE "user_trees" ADD COLUMN "session_id" UUID;

UPDATE "user_trees" ut
SET "session_id" = ps."id"
FROM "pomodoro_sessions" ps
WHERE ps."tree_earned_id" = ut."id";

-- AlterTable
ALTER TABLE "pomodoro_sessions" DROP COLUMN "tree_earned_id";

-- CreateIndex
CREATE INDEX "user_trees_session_id_idx" ON "user_trees"("session_id");

-- AddForeignKey
ALTER TABLE "user_trees" ADD CONSTRAINT "user_trees_session_id_fkey" FOREIGN KEY ("session_id") REFERENCES "pomodoro_sessions"("id") ON DELETE SET NULL ON UPDATE CASCADE;
