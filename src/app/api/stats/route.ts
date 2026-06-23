import { withAuth } from '@/lib/auth/middleware';
import { prisma } from '@/lib/db/prisma';
import { RARITY_CONFIG } from '@/lib/utils/constants';
import { getRarityInfo } from '@/lib/utils/rarity';

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

  // Get trees grouped by template rarity for rarity stats
  const treesWithRarity = await prisma.userTree.findMany({
    where: { userId: user.id },
    select: { template: { select: { rarity: true } } },
  });

  // Group by rarity name
  const byRarity: Record<string, number> = {};
  for (const r of RARITY_CONFIG) {
    byRarity[r.name] = 0;
  }
  for (const item of treesWithRarity) {
    const { name } = getRarityInfo(item.template.rarity);
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
