import { withAuth } from '@/lib/auth/middleware';
import { prisma } from '@/lib/db/prisma';
import { RARITY_RANGES } from '@/lib/utils/constants';
import { getRarityFromProbability } from '@/lib/utils/rarity';

export const GET = withAuth(async (_req, user) => {
  // Get total active templates for collection progress
  const totalTemplates = await prisma.template.count({
    where: { isActive: true },
  });

  // Get unique templates the user has
  const uniqueResult = await prisma.userTree.findMany({
    where: { userId: user.id },
    select: { templateId: true },
    distinct: ['templateId'],
  });
  const uniqueCount = uniqueResult.length;

  // Get trees grouped by template probability for rarity stats
  const treesWithProb = await prisma.userTree.findMany({
    where: { userId: user.id },
    select: { template: { select: { probability: true } } },
  });

  // Group by rarity name
  const byRarity: Record<string, number> = {};
  for (const range of RARITY_RANGES) {
    byRarity[range.name] = 0;
  }
  for (const item of treesWithProb) {
    const { name } = getRarityFromProbability(item.template.probability);
    byRarity[name] = (byRarity[name] || 0) + 1;
  }

  return Response.json({
    pomodoros_completed: user.pomodorosCompleted,
    total_focus_minutes: user.totalFocusMinutes,
    total_trees: user.totalTrees,
    collection: {
      unique: uniqueCount,
      total: totalTemplates,
      progress: totalTemplates > 0 ? Math.round((uniqueCount / totalTemplates) * 100) : 0,
    },
    by_rarity: byRarity,
  });
});
