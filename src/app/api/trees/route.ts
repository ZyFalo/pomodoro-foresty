import { NextRequest } from 'next/server';
import { withAuth } from '@/lib/auth/middleware';
import { prisma } from '@/lib/db/prisma';
import { getRarityFromProbability } from '@/lib/utils/rarity';
import { Prisma } from '@/generated/prisma/client';

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

  // Filter by rarity (via template probability range)
  if (rarity) {
    const rarityRanges: Record<string, { min: number; max: number }> = {
      'Legendario': { min: 1, max: 2 },
      'Épico': { min: 3, max: 5 },
      'Raro': { min: 6, max: 10 },
      'Poco común': { min: 11, max: 15 },
      'Común': { min: 16, max: 25 },
    };
    const range = rarityRanges[rarity];
    if (range) {
      where.template = {
        probability: { gte: range.min, lte: range.max },
      };
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
    rarity: getRarityFromProbability(tree.template.probability).name,
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
