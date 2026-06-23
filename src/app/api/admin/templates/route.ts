import { NextRequest } from 'next/server';
import { withAdmin, getClientIP } from '@/lib/auth/middleware';
import { prisma } from '@/lib/db/prisma';
import { logActivity } from '@/lib/services/activity-logger';

// GET /api/admin/templates
export const GET = withAdmin(async (req: NextRequest) => {
  const { searchParams } = new URL(req.url);
  const page = Math.max(1, parseInt(searchParams.get('page') || '1'));
  const limit = Math.min(50, parseInt(searchParams.get('limit') || '20'));

  const [templates, total] = await Promise.all([
    prisma.template.findMany({
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.template.count(),
  ]);

  return Response.json({
    templates,
    pagination: { page, limit, total, pages: Math.ceil(total / limit) },
  });
});

// POST /api/admin/templates
export const POST = withAdmin(async (req: NextRequest, user) => {
  try {
    const body = await req.json();
    const { name, category, description, image_url, probability } = body;

    if (!name || !category || !description || !image_url || !probability) {
      return Response.json({ error: 'Todos los campos son requeridos' }, { status: 400 });
    }

    if (probability < 1 || probability > 25) {
      return Response.json({ error: 'La probabilidad debe estar entre 1 y 25' }, { status: 400 });
    }

    const template = await prisma.template.create({
      data: {
        name,
        category,
        description,
        imageUrl: image_url,
        probability,
        createdById: user.id,
      },
    });

    await logActivity({
      user_id: user.id,
      event_type: 'template_creado',
      detail: `Plantilla creada: ${template.name}`,
      ip_address: getClientIP(req),
    });

    return Response.json(template, { status: 201 });
  } catch {
    return Response.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
});
