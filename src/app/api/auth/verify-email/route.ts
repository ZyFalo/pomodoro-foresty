import { NextRequest } from 'next/server';
import { connectDB } from '@/lib/db/connection';
import { User } from '@/lib/db/models';
import { verifyEmailSchema } from '@/lib/utils/validation';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = verifyEmailSchema.safeParse(body);

    if (!parsed.success) {
      const firstError = parsed.error.issues[0]?.message ?? 'Datos inválidos';
      return Response.json({ error: firstError }, { status: 400 });
    }

    const { email, code } = parsed.data;

    await connectDB();

    const user = await User.findOne({ email: email.toLowerCase() });

    if (!user) {
      return Response.json({ error: 'Usuario no encontrado' }, { status: 404 });
    }

    if (user.email_verified) {
      return Response.json({ message: 'El email ya está verificado' });
    }

    if (!user.verification_code || !user.verification_expires) {
      return Response.json({ error: 'No hay código de verificación pendiente' }, { status: 400 });
    }

    if (new Date() > user.verification_expires) {
      return Response.json({ error: 'El código ha expirado. Solicita uno nuevo.' }, { status: 410 });
    }

    if (user.verification_code !== code) {
      return Response.json({ error: 'Código incorrecto' }, { status: 400 });
    }

    user.email_verified = true;
    user.verification_code = undefined;
    user.verification_expires = undefined;
    await user.save();

    return Response.json({ message: 'Email verificado correctamente' });
  } catch (error) {
    console.error('Error verificando email:', error);
    return Response.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}
