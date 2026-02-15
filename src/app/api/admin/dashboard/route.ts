import { withAdmin } from '@/lib/auth/middleware';
import { connectDB } from '@/lib/db/connection';
import { User, Template, UserTree, PomodoroSession, ActivityLog } from '@/lib/db/models';
import { RARITY_RANGES } from '@/lib/utils/constants';

export const GET = withAdmin(async () => {
  await connectDB();

  const [
    totalUsers,
    activeUsers,
    totalTemplates,
    totalTrees,
    totalSessions,
    recentActivity,
  ] = await Promise.all([
    User.countDocuments(),
    User.countDocuments({ is_active: true }),
    Template.countDocuments(),
    UserTree.countDocuments(),
    PomodoroSession.countDocuments({ status: 'completed' }),
    ActivityLog.find()
      .sort({ created_at: -1 })
      .limit(10)
      .populate('user_id', 'username')
      .lean(),
  ]);

  // Trees by rarity
  const rarityAgg = await UserTree.aggregate([
    {
      $lookup: {
        from: 'templates',
        localField: 'template_id',
        foreignField: '_id',
        as: 'template',
      },
    },
    { $unwind: '$template' },
    {
      $group: {
        _id: '$template.probability',
        count: { $sum: 1 },
      },
    },
  ]);

  const byRarity: Record<string, number> = {};
  for (const range of RARITY_RANGES) {
    byRarity[range.name] = 0;
  }
  for (const item of rarityAgg) {
    const prob = item._id as number;
    for (const range of RARITY_RANGES) {
      if (prob >= range.min && prob <= range.max) {
        byRarity[range.name] += item.count;
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
