import { NextRequest } from 'next/server';
import { withAuth, getClientIP } from '@/lib/auth/middleware';
import { connectDB } from '@/lib/db/connection';
import { PomodoroSession, User } from '@/lib/db/models';
import { earnTree } from '@/lib/services/trees';
import { logActivity } from '@/lib/services/activity-logger';
import { TIME_VALIDATION_THRESHOLD } from '@/lib/utils/constants';

export const POST = withAuth(async (req: NextRequest, user) => {
  try {
    const body = await req.json().catch(() => ({}));
    const { session_id } = body;

    if (!session_id) {
      return Response.json({ error: 'session_id es requerido' }, { status: 400 });
    }

    await connectDB();

    const session = await PomodoroSession.findOne({
      _id: session_id,
      user_id: user._id,
      status: 'active',
    });

    if (!session) {
      return Response.json({ error: 'Sesión no encontrada o ya completada' }, { status: 404 });
    }

    // Validate elapsed time (90% of duration)
    const elapsedMs = Date.now() - session.started_at.getTime();
    const requiredMs = session.duration * 60 * 1000 * TIME_VALIDATION_THRESHOLD;

    if (elapsedMs < requiredMs) {
      const remainingSeconds = Math.ceil((requiredMs - elapsedMs) / 1000);
      return Response.json(
        { error: `Aún faltan ${remainingSeconds} segundos para completar el pomodoro` },
        { status: 400 }
      );
    }

    // Earn a tree
    const ip = getClientIP(req);
    const result = await earnTree(user._id.toString(), ip);

    if (!result) {
      return Response.json(
        { error: 'No hay plantillas de árboles disponibles' },
        { status: 500 }
      );
    }

    // Update session
    session.status = 'completed';
    session.completed_at = new Date();
    session.tree_earned_id = result.userTree._id;
    await session.save();

    // Update user stats
    await User.findByIdAndUpdate(user._id, {
      $inc: {
        pomodoros_completed: 1,
        total_focus_minutes: session.duration,
      },
    });

    // Log activity
    await logActivity({
      user_id: user._id.toString(),
      event_type: 'pomodoro_completado',
      detail: `Pomodoro de ${session.duration} min completado`,
      ip_address: ip,
    });

    // Fetch updated stats
    const updatedUser = await User.findById(user._id).select(
      'pomodoros_completed total_focus_minutes total_trees'
    );

    return Response.json({
      tree: result.userTree,
      template: result.template,
      stats: {
        pomodoros_completed: updatedUser?.pomodoros_completed ?? 0,
        total_focus_minutes: updatedUser?.total_focus_minutes ?? 0,
        total_trees: updatedUser?.total_trees ?? 0,
      },
    });
  } catch (error) {
    console.error('Error completing pomodoro:', error);
    return Response.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
});
