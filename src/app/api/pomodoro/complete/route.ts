import { NextRequest } from 'next/server';
import { withAuth, getClientIP } from '@/lib/auth/middleware';
import { prisma } from '@/lib/db/prisma';
import { earnTrees } from '@/lib/services/trees';
import { logActivity } from '@/lib/services/activity-logger';
import { TIME_VALIDATION_THRESHOLD, getDurationBonusTrees } from '@/lib/utils/constants';

export const POST = withAuth(async (req: NextRequest, user) => {
  try {
    const body = await req.json().catch(() => ({}));
    const { session_id, session_number, sessions_per_cycle } = body;

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

    // Update session status
    await prisma.pomodoroSession.update({
      where: { id: session.id },
      data: {
        status: 'completed',
        completedAt: new Date(),
      },
    });

    // Update user stats
    await prisma.user.update({
      where: { id: user.id },
      data: {
        pomodorosCompleted: { increment: 1 },
        totalFocusMinutes: { increment: session.duration },
      },
    });

    // Determine tree count based on cycle position + duration bonus
    const isCycleComplete =
      typeof session_number === 'number' &&
      typeof sessions_per_cycle === 'number' &&
      session_number === sessions_per_cycle;
    const baseTrees = isCycleComplete ? sessions_per_cycle - 1 : 1;
    const durationBonus = getDurationBonusTrees(session.duration);
    const treeCount = baseTrees + durationBonus;

    // Earn trees
    const ip = getClientIP(req);
    const earnedResults = await earnTrees(user.id, treeCount, ip, session.id);

    // Read final user stats (after earnTrees incremented totalTrees)
    const updatedUser = await prisma.user.findUniqueOrThrow({
      where: { id: user.id },
    });

    // Log activity
    await logActivity({
      user_id: user.id,
      event_type: 'pomodoro_completado',
      detail: `Pomodoro de ${session.duration} min completado${durationBonus > 0 ? ` (+${durationBonus} bonus duración)` : ''}${isCycleComplete ? ` (ciclo completo, +${baseTrees} árboles)` : ''}`,
      ip_address: ip,
    });

    return Response.json({
      trees: earnedResults.map((r) => ({ tree: r.userTree, template: r.template })),
      is_cycle_complete: isCycleComplete,
      duration_bonus: durationBonus,
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
