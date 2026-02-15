import { NextRequest } from 'next/server';
import { withAdmin } from '@/lib/auth/middleware';
import { prisma } from '@/lib/db/prisma';

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
export const PUT = withAdmin(async (req: NextRequest) => {
  try {
    const id = getIdFromUrl(req.url);
    const body = await req.json();
    const { name, category, description, image_url, probability, is_active } = body;

    const update: Record<string, unknown> = {};
    if (name !== undefined) update.name = name;
    if (category !== undefined) update.category = category;
    if (description !== undefined) update.description = description;
    if (image_url !== undefined) update.imageUrl = image_url;
    if (probability !== undefined) {
      if (probability < 1 || probability > 25) {
        return Response.json({ error: 'La probabilidad debe estar entre 1 y 25' }, { status: 400 });
      }
      update.probability = probability;
    }
    if (is_active !== undefined) update.isActive = is_active;

    const template = await prisma.template.update({
      where: { id },
      data: update,
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
export const DELETE = withAdmin(async (req: NextRequest) => {
  const id = getIdFromUrl(req.url);
  try {
    await prisma.template.delete({ where: { id } });
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
