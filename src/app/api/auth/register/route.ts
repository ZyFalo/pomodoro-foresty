import { NextRequest } from 'next/server';
import { connectDB } from '@/lib/db/connection';
import { User } from '@/lib/db/models';
import { hashPassword } from '@/lib/auth/password';
import { registerSchema } from '@/lib/utils/validation';
import { sendVerificationEmail, generateVerificationCode } from '@/lib/services/email';
import { logActivity } from '@/lib/services/activity-logger';
import { getClientIP } from '@/lib/auth/middleware';
import { VERIFICATION_CODE_EXPIRY_MINUTES } from '@/lib/utils/constants';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = registerSchema.safeParse(body);

    if (!parsed.success) {
      const firstError = parsed.error.issues[0]?.message ?? 'Datos inválidos';
      return Response.json({ error: firstError }, { status: 400 });
    }

    const { username, email, password } = parsed.data;

    await connectDB();

    const existingUser = await User.findOne({
      $or: [
        { username: username.toLowerCase() },
        { email: email.toLowerCase() },
      ],
    });

    if (existingUser) {
      if (existingUser.username === username.toLowerCase()) {
        return Response.json({ error: 'El nombre de usuario ya está en uso' }, { status: 409 });
      }
      return Response.json({ error: 'El email ya está registrado' }, { status: 409 });
    }

    const password_hash = await hashPassword(password);
    const verification_code = generateVerificationCode();
    const verification_expires = new Date(Date.now() + VERIFICATION_CODE_EXPIRY_MINUTES * 60 * 1000);

    const user = await User.create({
      username: username.toLowerCase(),
      email: email.toLowerCase(),
      password_hash,
      verification_code,
      verification_expires,
    });

    await sendVerificationEmail(email, verification_code);

    await logActivity({
      user_id: user._id.toString(),
      event_type: 'registro',
      detail: `Usuario ${username} registrado`,
      ip_address: getClientIP(req),
    });

    return Response.json({
      message: 'Usuario registrado. Revisa tu email para el código de verificación.',
      email: email.toLowerCase(),
    }, { status: 201 });
  } catch (error) {
    console.error('Error en registro:', error);
    return Response.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}
