import { NextRequest } from 'next/server';
import { withAdmin, getClientIP } from '@/lib/auth/middleware';
import { prisma } from '@/lib/db/prisma';
import { logActivity } from '@/lib/services/activity-logger';

function getUserIdFromUrl(url: string): string {
  return url.split('/users/')[1]?.split('?')[0]?.split('/')[0] ?? '';
}

// GET /api/admin/users/:id
export const GET = withAdmin(async (req: NextRequest) => {
  const id = getUserIdFromUrl(req.url);
  const user = await prisma.user.findUnique({
    where: { id },
    select: {
      id: true,
      username: true,
      email: true,
      emailVerified: true,
      role: true,
      pomodoroDuration: true,
      breakDuration: true,
      sessionsPerCycle: true,
      ambientSound: true,
      notifications: true,
      autoStartBreak: true,
      pomodorosCompleted: true,
      totalFocusMinutes: true,
      totalTrees: true,
      isActive: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  if (!user) {
    return Response.json({ error: 'Usuario no encontrado' }, { status: 404 });
  }
  return Response.json(user);
});

// PUT /api/admin/users/:id — Update role or status
export const PUT = withAdmin(async (req: NextRequest, admin) => {
  try {
    const id = getUserIdFromUrl(req.url);
    const body = await req.json();
    const { role, is_active } = body;

    const update: Record<string, unknown> = {};
    if (role !== undefined && (role === 'user' || role === 'admin')) update.role = role;
    if (is_active !== undefined) update.isActive = is_active;

    const user = await prisma.user.update({
      where: { id },
      data: update,
      select: {
        id: true,
        username: true,
        email: true,
        emailVerified: true,
        role: true,
        pomodorosCompleted: true,
        totalFocusMinutes: true,
        totalTrees: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    // Log if user was deactivated
    if (is_active === false) {
      const ip = getClientIP(req);
      await logActivity({
        user_id: admin.id,
        event_type: 'usuario_desactivado',
        detail: `Usuario ${user.username} desactivado por admin`,
        ip_address: ip,
      });
    }

    return Response.json(user);
  } catch (error) {
    if ((error as { code?: string }).code === 'P2025') {
      return Response.json({ error: 'Usuario no encontrado' }, { status: 404 });
    }
    return Response.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
});
