import { NextRequest } from 'next/server';
import { connectDB } from '@/lib/db/connection';
import { User } from '@/lib/db/models';
import { verifyPassword } from '@/lib/auth/password';
import { createToken } from '@/lib/auth/jwt';
import { loginSchema } from '@/lib/utils/validation';
import { logActivity } from '@/lib/services/activity-logger';
import { getClientIP } from '@/lib/auth/middleware';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = loginSchema.safeParse(body);

    if (!parsed.success) {
      const firstError = parsed.error.issues[0]?.message ?? 'Datos inválidos';
      return Response.json({ error: firstError }, { status: 400 });
    }

    const { username, password } = parsed.data;

    await connectDB();

    const user = await User.findOne({ username: username.toLowerCase() });

    if (!user) {
      return Response.json({ error: 'Credenciales incorrectas' }, { status: 401 });
    }

    if (!user.is_active) {
      return Response.json({ error: 'Cuenta desactivada. Contacta al administrador.' }, { status: 403 });
    }

    const isValidPassword = await verifyPassword(password, user.password_hash);

    if (!isValidPassword) {
      return Response.json({ error: 'Credenciales incorrectas' }, { status: 401 });
    }

    const token = await createToken({ userId: user._id.toString(), role: user.role });

    await logActivity({
      user_id: user._id.toString(),
      event_type: 'login',
      detail: `Login de ${user.username}`,
      ip_address: getClientIP(req),
    });

    return Response.json({
      token,
      user: {
        id: user._id.toString(),
        username: user.username,
        email: user.email,
        role: user.role,
        email_verified: user.email_verified,
        settings: user.settings,
      },
    });
  } catch (error) {
    console.error('Error en login:', error);
    return Response.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}
