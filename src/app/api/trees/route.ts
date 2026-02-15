import { NextRequest } from 'next/server';
import { PipelineStage } from 'mongoose';
import { withAuth } from '@/lib/auth/middleware';
import { connectDB } from '@/lib/db/connection';
import { UserTree } from '@/lib/db/models';
import { getRarityFromProbability } from '@/lib/utils/rarity';

export const GET = withAuth(async (req: NextRequest, user) => {
  await connectDB();

  const { searchParams } = new URL(req.url);
  const page = Math.max(1, parseInt(searchParams.get('page') || '1'));
  const limit = Math.min(50, Math.max(1, parseInt(searchParams.get('limit') || '12')));
  const rarity = searchParams.get('rarity');
  const favorite = searchParams.get('favorite');
  const search = searchParams.get('search');

  // Base filter
  const filter: Record<string, unknown> = { user_id: user._id };

  if (favorite === 'true') {
    filter.is_favorite = true;
  }

  // Build aggregation to filter by rarity (calculated from template.probability)
  const pipeline: PipelineStage[] = [
    { $match: filter },
    {
      $lookup: {
        from: 'templates',
        localField: 'template_id',
        foreignField: '_id',
        as: 'template',
      },
    },
    { $unwind: '$template' },
  ];

  // Filter by search (template name or custom name)
  if (search) {
    pipeline.push({
      $match: {
        $or: [
          { 'template.name': { $regex: search, $options: 'i' } },
          { custom_name: { $regex: search, $options: 'i' } },
        ],
      },
    });
  }

  // Filter by rarity
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
      pipeline.push({
        $match: {
          'template.probability': { $gte: range.min, $lte: range.max },
        },
      });
    }
  }

  // Count total before pagination
  const countPipeline = [...pipeline, { $count: 'total' }];
  const countResult = await UserTree.aggregate(countPipeline);
  const total = countResult[0]?.total || 0;

  // Sort and paginate
  pipeline.push(
    { $sort: { earned_at: -1 } },
    { $skip: (page - 1) * limit },
    { $limit: limit },
  );

  const trees = await UserTree.aggregate(pipeline);

  // Add computed rarity field
  const treesWithRarity = trees.map((tree: Record<string, unknown>) => ({
    ...tree,
    rarity: getRarityFromProbability((tree.template as Record<string, unknown>).probability as number).name,
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
