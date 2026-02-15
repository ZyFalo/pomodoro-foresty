import { NextRequest } from 'next/server';
import { withAuth, getClientIP } from '@/lib/auth/middleware';
import { prisma } from '@/lib/db/prisma';
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

    const session = await prisma.pomodoroSession.findFirst({
      where: {
        id: session_id,
        userId: user.id,
        status: 'active',
      },
    });

    if (!session) {
      return Response.json({ error: 'Sesión no encontrada o ya completada' }, { status: 404 });
    }

    // Validate elapsed time (90% of duration)
    const elapsedMs = Date.now() - session.startedAt.getTime();
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
    const result = await earnTree(user.id, ip);

    if (!result) {
      return Response.json(
        { error: 'No hay plantillas de árboles disponibles' },
        { status: 500 }
      );
    }

    // Update session
    await prisma.pomodoroSession.update({
      where: { id: session.id },
      data: {
        status: 'completed',
        completedAt: new Date(),
        treeEarnedId: result.userTree.id,
      },
    });

    // Update user stats
    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: {
        pomodorosCompleted: { increment: 1 },
        totalFocusMinutes: { increment: session.duration },
      },
    });

    // Log activity
    await logActivity({
      user_id: user.id,
      event_type: 'pomodoro_completado',
      detail: `Pomodoro de ${session.duration} min completado`,
      ip_address: ip,
    });

    return Response.json({
      tree: result.userTree,
      template: result.template,
      stats: {
        pomodoros_completed: updatedUser.pomodorosCompleted,
        total_focus_minutes: updatedUser.totalFocusMinutes,
        total_trees: updatedUser.totalTrees,
      },
    });
  } catch (error) {
    console.error('Error completing pomodoro:', error);
    return Response.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
});
