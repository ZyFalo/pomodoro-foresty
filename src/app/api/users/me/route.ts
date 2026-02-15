import { withAuth } from '@/lib/auth/middleware';
import { extractSettings } from '@/types';

// GET /api/users/me
export const GET = withAuth(async (_req, user) => {
  return Response.json({
    id: user.id,
    username: user.username,
    email: user.email,
    role: user.role,
    email_verified: user.emailVerified,
    settings: extractSettings(user),
    pomodoros_completed: user.pomodorosCompleted,
    total_focus_minutes: user.totalFocusMinutes,
    total_trees: user.totalTrees,
    created_at: user.createdAt,
  });
});
