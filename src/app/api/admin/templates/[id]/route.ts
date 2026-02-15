import { NextRequest } from 'next/server';
import { withAdmin } from '@/lib/auth/middleware';
import { connectDB } from '@/lib/db/connection';
import { Template } from '@/lib/db/models';

function getIdFromUrl(url: string): string {
  return url.split('/templates/')[1]?.split('?')[0]?.split('/')[0] ?? '';
}

// GET /api/admin/templates/:id
export const GET = withAdmin(async (req: NextRequest) => {
  await connectDB();
  const id = getIdFromUrl(req.url);
  const template = await Template.findById(id);
  if (!template) {
    return Response.json({ error: 'Plantilla no encontrada' }, { status: 404 });
  }
  return Response.json(template);
});

// PUT /api/admin/templates/:id
export const PUT = withAdmin(async (req: NextRequest) => {
  try {
    await connectDB();
    const id = getIdFromUrl(req.url);
    const body = await req.json();
    const { name, category, description, image_url, probability, is_active } = body;

    const update: Record<string, unknown> = {};
    if (name !== undefined) update.name = name;
    if (category !== undefined) update.category = category;
    if (description !== undefined) update.description = description;
    if (image_url !== undefined) update.image_url = image_url;
    if (probability !== undefined) {
      if (probability < 1 || probability > 25) {
        return Response.json({ error: 'La probabilidad debe estar entre 1 y 25' }, { status: 400 });
      }
      update.probability = probability;
    }
    if (is_active !== undefined) update.is_active = is_active;

    const template = await Template.findByIdAndUpdate(id, update, { new: true });
    if (!template) {
      return Response.json({ error: 'Plantilla no encontrada' }, { status: 404 });
    }
    return Response.json(template);
  } catch {
    return Response.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
});

// DELETE /api/admin/templates/:id
export const DELETE = withAdmin(async (req: NextRequest) => {
  await connectDB();
  const id = getIdFromUrl(req.url);
  const template = await Template.findByIdAndDelete(id);
  if (!template) {
    return Response.json({ error: 'Plantilla no encontrada' }, { status: 404 });
  }
  return Response.json({ message: 'Plantilla eliminada' });
});
