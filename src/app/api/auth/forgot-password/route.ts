import { NextRequest } from 'next/server';
import { connectDB } from '@/lib/db/connection';
import { User } from '@/lib/db/models';
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

    await connectDB();

    const user = await User.findOne({ email: email.toLowerCase() });

    // Always return success to prevent email enumeration
    if (!user || !user.email_verified) {
      return Response.json({ message: 'Si el email está registrado, recibirás un código de recuperación.' });
    }

    const reset_code = generateVerificationCode();
    const reset_expires = new Date(Date.now() + RESET_CODE_EXPIRY_MINUTES * 60 * 1000);

    user.reset_code = reset_code;
    user.reset_expires = reset_expires;
    await user.save();

    await sendResetPasswordEmail(email, reset_code);

    return Response.json({ message: 'Si el email está registrado, recibirás un código de recuperación.' });
  } catch (error) {
    console.error('Error en forgot-password:', error);
    return Response.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}
