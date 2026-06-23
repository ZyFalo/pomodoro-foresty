import { NextRequest } from 'next/server';
import { withAuth } from '@/lib/auth/middleware';
import { prisma } from '@/lib/db/prisma';
import { getRarityInfo, rarityNameToKey } from '@/lib/utils/rarity';
import { Prisma, type TreeRarity } from '@/generated/prisma/client';

export const GET = withAuth(async (req: NextRequest, user) => {
  const { searchParams } = new URL(req.url);
  const page = Math.max(1, parseInt(searchParams.get('page') || '1'));
  const limit = Math.min(50, Math.max(1, parseInt(searchParams.get('limit') || '12')));
  const rarity = searchParams.get('rarity');
  const favorite = searchParams.get('favorite');
  const search = searchParams.get('search');

  // Build where clause
  const where: Prisma.UserTreeWhereInput = { userId: user.id };

  if (favorite === 'true') {
    where.isFavorite = true;
  }

  // Filter by rarity
  if (rarity) {
    const key = rarityNameToKey(rarity);
    if (key) {
      where.template = { rarity: key as TreeRarity };
    }
  }

  // Filter by search (template name or custom name)
  if (search) {
    where.OR = [
      { template: { name: { contains: search, mode: 'insensitive' } } },
      { customName: { contains: search, mode: 'insensitive' } },
    ];
  }

  const [trees, total] = await Promise.all([
    prisma.userTree.findMany({
      where,
      include: { template: true },
      orderBy: { earnedAt: 'desc' },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.userTree.count({ where }),
  ]);

  const treesWithRarity = trees.map((tree) => ({
    ...tree,
    rarity: getRarityInfo(tree.template.rarity).name,
  }));

  return Response.json({
    trees: treesWithRarity,
    pagination: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit),
    },
  });
});
