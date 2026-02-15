import { NextRequest } from 'next/server';
import { withAdmin } from '@/lib/auth/middleware';
import { connectDB } from '@/lib/db/connection';
import { User } from '@/lib/db/models';

export const GET = withAdmin(async (req: NextRequest) => {
  await connectDB();

  const { searchParams } = new URL(req.url);
  const page = Math.max(1, parseInt(searchParams.get('page') || '1'));
  const limit = Math.min(50, parseInt(searchParams.get('limit') || '20'));
  const search = searchParams.get('search');
  const role = searchParams.get('role');

  const filter: Record<string, unknown> = {};
  if (search) {
    filter.$or = [
      { username: { $regex: search, $options: 'i' } },
      { email: { $regex: search, $options: 'i' } },
    ];
  }
  if (role) filter.role = role;

  const [users, total] = await Promise.all([
    User.find(filter)
      .select('-password_hash -verification_code -reset_code')
      .sort({ created_at: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean(),
    User.countDocuments(filter),
  ]);

  return Response.json({
    users,
    pagination: { page, limit, total, pages: Math.ceil(total / limit) },
  });
});
