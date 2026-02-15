import { NextRequest } from 'next/server';
import { withAuth } from '@/lib/auth/middleware';
import { prisma } from '@/lib/db/prisma';

// PUT /api/trees/:id/favorite — Toggle favorite
export const PUT = withAuth(async (req: NextRequest, user) => {
  // Extract tree id from URL
  const urlParts = req.url.split('/trees/')[1]?.split('/');
  const id = urlParts?.[0];

  const tree = await prisma.userTree.findFirst({
    where: { id, userId: user.id },
  });

  if (!tree) {
    return Response.json({ error: 'Árbol no encontrado' }, { status: 404 });
  }

  const updated = await prisma.userTree.update({
    where: { id: tree.id },
    data: { isFavorite: !tree.isFavorite },
  });

  return Response.json({ is_favorite: updated.isFavorite });
});
