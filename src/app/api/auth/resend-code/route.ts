import { NextRequest } from 'next/server';
import { prisma } from '@/lib/db/prisma';
import { resendCodeSchema } from '@/lib/utils/validation';
import { sendVerificationEmail, generateVerificationCode } from '@/lib/services/email';
import { VERIFICATION_CODE_EXPIRY_MINUTES } from '@/lib/utils/constants';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = resendCodeSchema.safeParse(body);

    if (!parsed.success) {
      const firstError = parsed.error.issues[0]?.message ?? 'Datos inválidos';
      return Response.json({ error: firstError }, { status: 400 });
    }

    const { email } = parsed.data;

    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });

    if (!user) {
      return Response.json({ message: 'Si el email existe, se enviará un nuevo código.' });
    }

    if (user.emailVerified) {
      return Response.json({ message: 'El email ya está verificado' });
    }

    const verificationCode = generateVerificationCode();
    const verificationExpires = new Date(Date.now() + VERIFICATION_CODE_EXPIRY_MINUTES * 60 * 1000);

    await prisma.user.update({
      where: { id: user.id },
      data: { verificationCode, verificationExpires },
    });

    await sendVerificationEmail(email, verificationCode);

    return Response.json({ message: 'Se ha enviado un nuevo código de verificación.' });
  } catch (error) {
    console.error('Error reenviando código:', error);
    return Response.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}
