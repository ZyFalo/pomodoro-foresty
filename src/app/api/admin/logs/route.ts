import { NextRequest } from 'next/server';
import { withAdmin } from '@/lib/auth/middleware';
import { connectDB } from '@/lib/db/connection';
import { ActivityLog } from '@/lib/db/models';

export const GET = withAdmin(async (req: NextRequest) => {
  await connectDB();

  const { searchParams } = new URL(req.url);
  const page = Math.max(1, parseInt(searchParams.get('page') || '1'));
  const limit = Math.min(100, parseInt(searchParams.get('limit') || '20'));
  const event_type = searchParams.get('event_type');
  const user_id = searchParams.get('user_id');

  const filter: Record<string, unknown> = {};
  if (event_type) filter.event_type = event_type;
  if (user_id) filter.user_id = user_id;

  const [logs, total] = await Promise.all([
    ActivityLog.find(filter)
      .sort({ created_at: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .populate('user_id', 'username')
      .lean(),
    ActivityLog.countDocuments(filter),
  ]);

  return Response.json({
    logs,
    pagination: { page, limit, total, pages: Math.ceil(total / limit) },
  });
});
