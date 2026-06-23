import { withAdmin } from '@/lib/auth/middleware';
import { prisma } from '@/lib/db/prisma';
import { RARITY_CONFIG } from '@/lib/utils/constants';
import { getRarityInfo } from '@/lib/utils/rarity';

export const GET = withAdmin(async () => {
  const [
    totalUsers,
    activeUsers,
    totalTemplates,
    totalTrees,
    totalSessions,
    recentActivity,
  ] = await Promise.all([
    prisma.user.count(),
    prisma.user.count({ where: { isActive: true } }),
    prisma.template.count(),
    prisma.userTree.count(),
    prisma.pomodoroSession.count({ where: { status: 'completed' } }),
    prisma.activityLog.findMany({
      orderBy: { createdAt: 'desc' },
      take: 10,
      include: {
        user: { select: { username: true } },
      },
    }),
  ]);

  // Trees by rarity
  const treesWithRarity = await prisma.userTree.findMany({
    select: { template: { select: { rarity: true } } },
  });

  const byRarity: Record<string, number> = {};
  for (const r of RARITY_CONFIG) {
    byRarity[r.name] = 0;
  }
  for (const item of treesWithRarity) {
    const { name } = getRarityInfo(item.template.rarity);
    byRarity[name] = (byRarity[name] || 0) + 1;
  }

  return Response.json({
    total_users: totalUsers,
    active_users: activeUsers,
    total_templates: totalTemplates,
    total_trees: totalTrees,
    total_sessions: totalSessions,
    by_rarity: byRarity,
    recent_activity: recentActivity,
  });
});
