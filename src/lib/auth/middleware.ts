import { NextRequest } from 'next/server';
import { verifyToken } from './jwt';
import { connectDB } from '@/lib/db/connection';
import { User, type IUserDocument } from '@/lib/db/models';

type AuthHandler = (req: NextRequest, user: IUserDocument) => Promise<Response>;

export function withAuth(handler: AuthHandler) {
  return async (req: NextRequest) => {
    const authHeader = req.headers.get('authorization');
    const token = authHeader?.replace('Bearer ', '');

    if (!token) {
      return Response.json({ error: 'No autorizado' }, { status: 401 });
    }

    try {
      const payload = await verifyToken(token);
      await connectDB();
      const user = await User.findById(payload.userId);

      if (!user) {
        return Response.json({ error: 'Usuario no encontrado' }, { status: 401 });
      }

      if (!user.is_active) {
        return Response.json({ error: 'Cuenta desactivada' }, { status: 403 });
      }

      return handler(req, user);
    } catch {
      return Response.json({ error: 'Token inválido o expirado' }, { status: 401 });
    }
  };
}

export function withAdmin(handler: AuthHandler) {
  return withAuth(async (req, user) => {
    if (user.role !== 'admin') {
      return Response.json({ error: 'Acceso denegado: se requiere rol de administrador' }, { status: 403 });
    }
    return handler(req, user);
  });
}

export function getClientIP(req: NextRequest): string {
  return req.headers.get('x-forwarded-for')?.split(',')[0]?.trim()
    ?? req.headers.get('x-real-ip')
    ?? '';
}
