import { withAdmin } from '@/lib/auth/middleware';
import { prisma } from '@/lib/db/prisma';
import { RARITY_RANGES } from '@/lib/utils/constants';

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
  const treesWithProb = await prisma.userTree.findMany({
    select: { template: { select: { probability: true } } },
  });

  const byRarity: Record<string, number> = {};
  for (const range of RARITY_RANGES) {
    byRarity[range.name] = 0;
  }
  for (const item of treesWithProb) {
    const prob = item.template.probability;
    for (const range of RARITY_RANGES) {
      if (prob >= range.min && prob <= range.max) {
        byRarity[range.name] += 1;
        break;
      }
    }
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
