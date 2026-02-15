import { withAuth } from '@/lib/auth/middleware';
import { connectDB } from '@/lib/db/connection';
import { UserTree, Template } from '@/lib/db/models';
import { RARITY_RANGES } from '@/lib/utils/constants';
import { getRarityFromProbability } from '@/lib/utils/rarity';

export const GET = withAuth(async (_req, user) => {
  await connectDB();

  // Get total templates for collection progress
  const totalTemplates = await Template.countDocuments({ is_active: true });

  // Get unique templates the user has
  const uniqueTemplates = await UserTree.distinct('template_id', { user_id: user._id });

  // Get trees by rarity using aggregation
  const rarityAgg = await UserTree.aggregate([
    { $match: { user_id: user._id } },
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

  // Group by rarity name
  const byRarity: Record<string, number> = {};
  for (const range of RARITY_RANGES) {
    byRarity[range.name] = 0;
  }
  for (const item of rarityAgg) {
    const { name } = getRarityFromProbability(item._id);
    byRarity[name] = (byRarity[name] || 0) + item.count;
  }

  return Response.json({
    pomodoros_completed: user.pomodoros_completed,
    total_focus_minutes: user.total_focus_minutes,
    total_trees: user.total_trees,
    collection: {
      unique: uniqueTemplates.length,
      total: totalTemplates,
      progress: totalTemplates > 0 ? Math.round((uniqueTemplates.length / totalTemplates) * 100) : 0,
    },
    by_rarity: byRarity,
  });
});
