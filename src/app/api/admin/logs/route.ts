import { NextRequest } from 'next/server';
import { withAdmin } from '@/lib/auth/middleware';
import { prisma } from '@/lib/db/prisma';
import { Prisma, EventType } from '@/generated/prisma/client';

export const GET = withAdmin(async (req: NextRequest) => {
  const { searchParams } = new URL(req.url);
  const page = Math.max(1, parseInt(searchParams.get('page') || '1'));
  const limit = Math.min(100, parseInt(searchParams.get('limit') || '20'));
  const event_type = searchParams.get('event_type');
  const user_id = searchParams.get('user_id');

  const where: Prisma.ActivityLogWhereInput = {};
  if (event_type) where.eventType = event_type as EventType;
  if (user_id) where.userId = user_id;

  const [logs, total] = await Promise.all([
    prisma.activityLog.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * limit,
      take: limit,
      include: {
        user: { select: { username: true } },
      },
    }),
    prisma.activityLog.count({ where }),
  ]);

  return Response.json({
    logs,
    pagination: { page, limit, total, pages: Math.ceil(total / limit) },
  });
});
