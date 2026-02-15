import { NextRequest } from 'next/server';
import { prisma } from '@/lib/db/prisma';
import { verifyPassword } from '@/lib/auth/password';
import { createToken } from '@/lib/auth/jwt';
import { loginSchema } from '@/lib/utils/validation';
import { logActivity } from '@/lib/services/activity-logger';
import { getClientIP } from '@/lib/auth/middleware';
import { extractSettings } from '@/types';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = loginSchema.safeParse(body);

    if (!parsed.success) {
      const firstError = parsed.error.issues[0]?.message ?? 'Datos inválidos';
      return Response.json({ error: firstError }, { status: 400 });
    }

    const { username, password } = parsed.data;

    const user = await prisma.user.findUnique({
      where: { username: username.toLowerCase() },
    });

    if (!user) {
      return Response.json({ error: 'Credenciales incorrectas' }, { status: 401 });
    }

    if (!user.isActive) {
      return Response.json({ error: 'Cuenta desactivada. Contacta al administrador.' }, { status: 403 });
    }

    const isValidPassword = await verifyPassword(password, user.passwordHash);

    if (!isValidPassword) {
      return Response.json({ error: 'Credenciales incorrectas' }, { status: 401 });
    }

    const token = await createToken({ userId: user.id, role: user.role });

    await logActivity({
      user_id: user.id,
      event_type: 'login',
      detail: `Login de ${user.username}`,
      ip_address: getClientIP(req),
    });

    return Response.json({
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
    console.error('Error en login:', error);
    return Response.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}
