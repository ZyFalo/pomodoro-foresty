import { NextRequest } from 'next/server';
import { prisma } from '@/lib/db/prisma';
import { verifyEmailSchema } from '@/lib/utils/validation';
import { createToken } from '@/lib/auth/jwt';
import { extractSettings } from '@/types';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = verifyEmailSchema.safeParse(body);

    if (!parsed.success) {
      const firstError = parsed.error.issues[0]?.message ?? 'Datos inválidos';
      return Response.json({ error: firstError }, { status: 400 });
    }

    const { email, code } = parsed.data;

    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });

    if (!user) {
      return Response.json({ error: 'Usuario no encontrado' }, { status: 404 });
    }

    if (!user.isActive) {
      return Response.json({ error: 'Cuenta desactivada. Contacta al administrador.' }, { status: 403 });
    }

    // Validar el código y marcar como verificado (si aún no lo está)
    if (!user.emailVerified) {
      const devMode = !process.env.RESEND_API_KEY;

      if (!devMode) {
        if (!user.verificationCode || !user.verificationExpires) {
          return Response.json({ error: 'No hay código de verificación pendiente' }, { status: 400 });
        }

        if (new Date() > user.verificationExpires) {
          return Response.json({ error: 'El código ha expirado. Solicita uno nuevo.' }, { status: 410 });
        }

        if (user.verificationCode !== code) {
          return Response.json({ error: 'Código incorrecto' }, { status: 400 });
        }
      }

      await prisma.user.update({
        where: { id: user.id },
        data: {
          emailVerified: true,
          verificationCode: null,
          verificationExpires: null,
        },
      });
    }

    // Auto-login: emite el JWT y devuelve el usuario (mismo contrato que /login)
    const token = await createToken({ userId: user.id, role: user.role });

    return Response.json({
      message: 'Email verificado correctamente',
      token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role,
        email_verified: true,
        settings: extractSettings(user),
      },
    });
  } catch (error) {
    console.error('Error verificando email:', error);
    return Response.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}
