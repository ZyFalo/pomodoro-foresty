import { NextRequest } from 'next/server';
import { prisma } from '@/lib/db/prisma';
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

    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [
          { username: username.toLowerCase() },
          { email: email.toLowerCase() },
        ],
      },
    });

    if (existingUser) {
      if (existingUser.username === username.toLowerCase()) {
        return Response.json({ error: 'El nombre de usuario ya está en uso' }, { status: 409 });
      }
      return Response.json({ error: 'El email ya está registrado' }, { status: 409 });
    }

    const passwordHash = await hashPassword(password);
    const verificationCode = generateVerificationCode();
    const verificationExpires = new Date(Date.now() + VERIFICATION_CODE_EXPIRY_MINUTES * 60 * 1000);

    const user = await prisma.user.create({
      data: {
        username: username.toLowerCase(),
        email: email.toLowerCase(),
        passwordHash,
        verificationCode,
        verificationExpires,
      },
    });

    await sendVerificationEmail(email, verificationCode);

    await logActivity({
      user_id: user.id,
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
