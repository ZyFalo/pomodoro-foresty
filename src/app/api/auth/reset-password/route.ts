import { NextRequest } from 'next/server';
import { prisma } from '@/lib/db/prisma';
import { hashPassword } from '@/lib/auth/password';
import { createToken } from '@/lib/auth/jwt';
import { resetPasswordSchema } from '@/lib/utils/validation';
import { logActivity } from '@/lib/services/activity-logger';
import { getClientIP } from '@/lib/auth/middleware';
import { extractSettings } from '@/types';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = resetPasswordSchema.safeParse(body);

    if (!parsed.success) {
      const firstError = parsed.error.issues[0]?.message ?? 'Datos inválidos';
      return Response.json({ error: firstError }, { status: 400 });
    }

    const { email, code, new_password } = parsed.data;

    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });

    if (!user) {
      return Response.json({ error: 'Usuario no encontrado' }, { status: 404 });
    }

    if (!user.isActive) {
      return Response.json({ error: 'Cuenta desactivada. Contacta al administrador.' }, { status: 403 });
    }

    const devMode = !process.env.RESEND_API_KEY;

    if (!devMode) {
      if (!user.resetCode || !user.resetExpires) {
        return Response.json({ error: 'No hay solicitud de reset pendiente' }, { status: 400 });
      }

      if (new Date() > user.resetExpires) {
        return Response.json({ error: 'El código ha expirado. Solicita uno nuevo.' }, { status: 410 });
      }

      if (user.resetCode !== code) {
        return Response.json({ error: 'Código incorrecto' }, { status: 400 });
      }
    }

    const passwordHash = await hashPassword(new_password);

    await prisma.user.update({
      where: { id: user.id },
      data: {
        passwordHash,
        resetCode: null,
        resetExpires: null,
      },
    });

    await logActivity({
      user_id: user.id,
      event_type: 'contrasena_cambiada',
      detail: `Contraseña restablecida para ${user.username}`,
      ip_address: getClientIP(req),
    });

    // Auto-login: emite el JWT y devuelve el usuario (mismo contrato que /login)
    const token = await createToken({ userId: user.id, role: user.role });

    return Response.json({
      message: 'Contraseña restablecida correctamente',
      token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role,
        email_verified: user.emailVerified,
        settings: extractSettings(user),
      },
    });
  } catch (error) {
    console.error('Error en reset-password:', error);
    return Response.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}
