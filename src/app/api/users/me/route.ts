import { withAuth } from '@/lib/auth/middleware';

// GET /api/users/me
export const GET = withAuth(async (_req, user) => {
  return Response.json({
    id: user._id,
    username: user.username,
    email: user.email,
    role: user.role,
    email_verified: user.email_verified,
    settings: user.settings,
    pomodoros_completed: user.pomodoros_completed,
    total_focus_minutes: user.total_focus_minutes,
    total_trees: user.total_trees,
    created_at: user.created_at,
  });
});
