import { NextRequest } from 'next/server';
import { withAuth, getClientIP } from '@/lib/auth/middleware';
import { prisma } from '@/lib/db/prisma';
import { verifyPassword, hashPassword } from '@/lib/auth/password';
import { changePasswordSchema } from '@/lib/utils/validation';
import { logActivity } from '@/lib/services/activity-logger';

// PUT /api/users/me/password
export const PUT = withAuth(async (req: NextRequest, user) => {
  try {
    const body = await req.json();
    const result = changePasswordSchema.safeParse(body);

    if (!result.success) {
      return Response.json(
        { error: result.error.issues[0]?.message || 'Datos inválidos' },
        { status: 400 }
      );
    }

    const { current_password, new_password } = result.data;

    // Verify current password
    const isValid = await verifyPassword(current_password, user.passwordHash);
    if (!isValid) {
      return Response.json({ error: 'Contraseña actual incorrecta' }, { status: 400 });
    }

    // Hash new password and update
    const passwordHash = await hashPassword(new_password);
    await prisma.user.update({
      where: { id: user.id },
      data: { passwordHash },
    });

    // Log activity
    const ip = getClientIP(req);
    await logActivity({
      user_id: user.id,
      event_type: 'contrasena_cambiada',
      detail: 'Contraseña actualizada desde ajustes',
      ip_address: ip,
    });

    return Response.json({ message: 'Contraseña actualizada exitosamente' });
  } catch {
    return Response.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
});
