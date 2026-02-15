import { NextRequest } from 'next/server';
import { prisma } from '@/lib/db/prisma';
import { forgotPasswordSchema } from '@/lib/utils/validation';
import { sendResetPasswordEmail, generateVerificationCode } from '@/lib/services/email';
import { RESET_CODE_EXPIRY_MINUTES } from '@/lib/utils/constants';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = forgotPasswordSchema.safeParse(body);

    if (!parsed.success) {
      const firstError = parsed.error.issues[0]?.message ?? 'Datos inválidos';
      return Response.json({ error: firstError }, { status: 400 });
    }

    const { email } = parsed.data;

    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });

    // Always return success to prevent email enumeration
    if (!user || !user.emailVerified) {
      return Response.json({ message: 'Si el email está registrado, recibirás un código de recuperación.' });
    }

    const resetCode = generateVerificationCode();
    const resetExpires = new Date(Date.now() + RESET_CODE_EXPIRY_MINUTES * 60 * 1000);

    await prisma.user.update({
      where: { id: user.id },
      data: { resetCode, resetExpires },
    });

    await sendResetPasswordEmail(email, resetCode);

    return Response.json({ message: 'Si el email está registrado, recibirás un código de recuperación.' });
  } catch (error) {
    console.error('Error en forgot-password:', error);
    return Response.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}
