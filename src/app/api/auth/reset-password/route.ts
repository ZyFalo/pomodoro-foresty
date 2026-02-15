import { NextRequest } from 'next/server';
import { connectDB } from '@/lib/db/connection';
import { User } from '@/lib/db/models';
import { hashPassword } from '@/lib/auth/password';
import { resetPasswordSchema } from '@/lib/utils/validation';
import { logActivity } from '@/lib/services/activity-logger';
import { getClientIP } from '@/lib/auth/middleware';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = resetPasswordSchema.safeParse(body);

    if (!parsed.success) {
      const firstError = parsed.error.issues[0]?.message ?? 'Datos inválidos';
      return Response.json({ error: firstError }, { status: 400 });
    }

    const { email, code, new_password } = parsed.data;

    await connectDB();

    const user = await User.findOne({ email: email.toLowerCase() });

    if (!user) {
      return Response.json({ error: 'Usuario no encontrado' }, { status: 404 });
    }

    if (!user.reset_code || !user.reset_expires) {
      return Response.json({ error: 'No hay solicitud de reset pendiente' }, { status: 400 });
    }

    if (new Date() > user.reset_expires) {
      return Response.json({ error: 'El código ha expirado. Solicita uno nuevo.' }, { status: 410 });
    }

    if (user.reset_code !== code) {
      return Response.json({ error: 'Código incorrecto' }, { status: 400 });
    }

    user.password_hash = await hashPassword(new_password);
    user.reset_code = undefined;
    user.reset_expires = undefined;
    await user.save();

    await logActivity({
      user_id: user._id.toString(),
      event_type: 'contrasena_cambiada',
      detail: `Contraseña restablecida para ${user.username}`,
      ip_address: getClientIP(req),
    });

    return Response.json({ message: 'Contraseña restablecida correctamente' });
  } catch (error) {
    console.error('Error en reset-password:', error);
    return Response.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}
