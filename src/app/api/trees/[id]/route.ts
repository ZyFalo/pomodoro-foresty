import { NextRequest } from 'next/server';
import { withAuth } from '@/lib/auth/middleware';
import { prisma } from '@/lib/db/prisma';
import { getRarityInfo } from '@/lib/utils/rarity';

function getTreeIdFromUrl(url: string): string {
  return url.split('/trees/')[1]?.split('?')[0]?.split('/')[0] ?? '';
}

// GET /api/trees/:id
export const GET = withAuth(async (req: NextRequest, user) => {
  const id = getTreeIdFromUrl(req.url);

  const tree = await prisma.userTree.findFirst({
    where: { id, userId: user.id },
    include: { template: true },
  });

  if (!tree) {
    return Response.json({ error: 'Árbol no encontrado' }, { status: 404 });
  }

  return Response.json({
    ...tree,
    rarity: getRarityInfo(tree.template.rarity).name,
  });
});

// PUT /api/trees/:id — Rename
export const PUT = withAuth(async (req: NextRequest, user) => {
  const id = getTreeIdFromUrl(req.url);
  const body = await req.json();
  const { custom_name } = body;

  if (!custom_name || typeof custom_name !== 'string' || custom_name.trim().length === 0) {
    return Response.json({ error: 'Nombre requerido' }, { status: 400 });
  }

  if (custom_name.trim().length > 50) {
    return Response.json({ error: 'Nombre demasiado largo (máx. 50 caracteres)' }, { status: 400 });
  }

  const existing = await prisma.userTree.findFirst({
    where: { id, userId: user.id },
  });

  if (!existing) {
    return Response.json({ error: 'Árbol no encontrado' }, { status: 404 });
  }

  const tree = await prisma.userTree.update({
    where: { id },
    data: { customName: custom_name.trim() },
    include: { template: true },
  });

  return Response.json(tree);
});

// DELETE /api/trees/:id
export const DELETE = withAuth(async (req: NextRequest, user) => {
  const id = getTreeIdFromUrl(req.url);

  const existing = await prisma.userTree.findFirst({
    where: { id, userId: user.id },
  });

  if (!existing) {
    return Response.json({ error: 'Árbol no encontrado' }, { status: 404 });
  }

  await prisma.userTree.delete({ where: { id } });

  await prisma.user.update({
    where: { id: user.id },
    data: { totalTrees: { decrement: 1 } },
  });

  return Response.json({ message: 'Árbol eliminado' });
});
