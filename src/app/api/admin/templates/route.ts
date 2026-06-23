import { NextRequest } from 'next/server';
import { withAdmin, getClientIP } from '@/lib/auth/middleware';
import { prisma } from '@/lib/db/prisma';
import { logActivity } from '@/lib/services/activity-logger';
import { RARITY_CONFIG } from '@/lib/utils/constants';

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
    const { name, category, description, image_url, rarity } = body;

    if (!name || !category || !description || !image_url || !rarity) {
      return Response.json({ error: 'Todos los campos son requeridos' }, { status: 400 });
    }

    if (!RARITY_CONFIG.some((r) => r.key === rarity)) {
      return Response.json({ error: 'Rareza no válida' }, { status: 400 });
    }

    const template = await prisma.template.create({
      data: {
        name,
        category,
        description,
        imageUrl: image_url,
        rarity,
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
