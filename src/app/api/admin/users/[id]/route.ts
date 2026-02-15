import { NextRequest } from 'next/server';
import { withAdmin, getClientIP } from '@/lib/auth/middleware';
import { connectDB } from '@/lib/db/connection';
import { User } from '@/lib/db/models';
import { logActivity } from '@/lib/services/activity-logger';

function getUserIdFromUrl(url: string): string {
  return url.split('/users/')[1]?.split('?')[0]?.split('/')[0] ?? '';
}

// GET /api/admin/users/:id
export const GET = withAdmin(async (req: NextRequest) => {
  await connectDB();
  const id = getUserIdFromUrl(req.url);
  const user = await User.findById(id)
    .select('-password_hash -verification_code -reset_code')
    .lean();

  if (!user) {
    return Response.json({ error: 'Usuario no encontrado' }, { status: 404 });
  }
  return Response.json(user);
});

// PUT /api/admin/users/:id — Update role or status
export const PUT = withAdmin(async (req: NextRequest, admin) => {
  try {
    await connectDB();
    const id = getUserIdFromUrl(req.url);
    const body = await req.json();
    const { role, is_active } = body;

    const update: Record<string, unknown> = {};
    if (role !== undefined && ['user', 'admin'].includes(role)) update.role = role;
    if (is_active !== undefined) update.is_active = is_active;

    const user = await User.findByIdAndUpdate(id, update, { new: true })
      .select('-password_hash -verification_code -reset_code');

    if (!user) {
      return Response.json({ error: 'Usuario no encontrado' }, { status: 404 });
    }

    // Log if user was deactivated
    if (is_active === false) {
      const ip = getClientIP(req);
      await logActivity({
        user_id: admin._id.toString(),
        event_type: 'usuario_desactivado',
        detail: `Usuario ${user.username} desactivado por admin`,
        ip_address: ip,
      });
    }

    return Response.json(user);
  } catch {
    return Response.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
});
