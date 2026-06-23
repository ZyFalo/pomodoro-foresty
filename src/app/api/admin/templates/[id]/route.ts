import { NextRequest } from 'next/server';
import { withAdmin, getClientIP } from '@/lib/auth/middleware';
import { prisma } from '@/lib/db/prisma';
import { logActivity } from '@/lib/services/activity-logger';
import { RARITY_CONFIG } from '@/lib/utils/constants';

function getIdFromUrl(url: string): string {
  return url.split('/templates/')[1]?.split('?')[0]?.split('/')[0] ?? '';
}

// GET /api/admin/templates/:id
export const GET = withAdmin(async (req: NextRequest) => {
  const id = getIdFromUrl(req.url);
  const template = await prisma.template.findUnique({ where: { id } });
  if (!template) {
    return Response.json({ error: 'Plantilla no encontrada' }, { status: 404 });
  }
  return Response.json(template);
});

// PUT /api/admin/templates/:id
export const PUT = withAdmin(async (req: NextRequest, admin) => {
  try {
    const id = getIdFromUrl(req.url);
    const body = await req.json();
    const { name, category, description, image_url, rarity, is_active } = body;

    const update: Record<string, unknown> = {};
    if (name !== undefined) update.name = name;
    if (category !== undefined) update.category = category;
    if (description !== undefined) update.description = description;
    if (image_url !== undefined) update.imageUrl = image_url;
    if (rarity !== undefined) {
      if (!RARITY_CONFIG.some((r) => r.key === rarity)) {
        return Response.json({ error: 'Rareza no válida' }, { status: 400 });
      }
      update.rarity = rarity;
    }
    if (is_active !== undefined) update.isActive = is_active;

    const template = await prisma.template.update({
      where: { id },
      data: update,
    });

    await logActivity({
      user_id: admin.id,
      event_type: 'template_editado',
      detail: `Plantilla editada: ${template.name}`,
      ip_address: getClientIP(req),
    });

    return Response.json(template);
  } catch (error) {
    // Check if it's a "not found" error from Prisma
    if ((error as { code?: string }).code === 'P2025') {
      return Response.json({ error: 'Plantilla no encontrada' }, { status: 404 });
    }
    return Response.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
});

// DELETE /api/admin/templates/:id
export const DELETE = withAdmin(async (req: NextRequest, admin) => {
  const id = getIdFromUrl(req.url);
  try {
    const deleted = await prisma.template.delete({ where: { id } });
    await logActivity({
      user_id: admin.id,
      event_type: 'template_eliminado',
      detail: `Plantilla eliminada: ${deleted.name}`,
      ip_address: getClientIP(req),
    });
    return Response.json({ message: 'Plantilla eliminada' });
  } catch (error) {
    if ((error as { code?: string }).code === 'P2025') {
      return Response.json({ error: 'Plantilla no encontrada' }, { status: 404 });
    }
    // P2003 = foreign key constraint (template has user_trees)
    if ((error as { code?: string }).code === 'P2003') {
      return Response.json(
        { error: 'No se puede eliminar: esta plantilla ya fue ganada por usuarios' },
        { status: 409 }
      );
    }
    return Response.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
});
