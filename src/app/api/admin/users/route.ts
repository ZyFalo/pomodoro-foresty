import { NextRequest } from 'next/server';
import { withAdmin } from '@/lib/auth/middleware';
import { prisma } from '@/lib/db/prisma';
import { Prisma } from '@/generated/prisma/client';

export const GET = withAdmin(async (req: NextRequest) => {
  const { searchParams } = new URL(req.url);
  const page = Math.max(1, parseInt(searchParams.get('page') || '1'));
  const limit = Math.min(50, parseInt(searchParams.get('limit') || '20'));
  const search = searchParams.get('search');
  const role = searchParams.get('role');

  const where: Prisma.UserWhereInput = {};

  if (search) {
    where.OR = [
      { username: { contains: search, mode: 'insensitive' } },
      { email: { contains: search, mode: 'insensitive' } },
    ];
  }

  if (role === 'user' || role === 'admin') {
    where.role = role;
  }

  const [users, total] = await Promise.all([
    prisma.user.findMany({
      where,
      select: {
        id: true,
        username: true,
        email: true,
        emailVerified: true,
        role: true,
        pomodorosCompleted: true,
        totalFocusMinutes: true,
        totalTrees: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
      },
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.user.count({ where }),
  ]);

  return Response.json({
    users,
    pagination: { page, limit, total, pages: Math.ceil(total / limit) },
  });
});
