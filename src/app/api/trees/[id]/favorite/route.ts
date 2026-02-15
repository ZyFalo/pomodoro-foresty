import { NextRequest } from 'next/server';
import { withAuth } from '@/lib/auth/middleware';
import { connectDB } from '@/lib/db/connection';
import { UserTree } from '@/lib/db/models';

// PUT /api/trees/:id/favorite — Toggle favorite
export const PUT = withAuth(async (req: NextRequest, user) => {
  await connectDB();

  // Extract tree id from URL
  const urlParts = req.url.split('/trees/')[1]?.split('/');
  const id = urlParts?.[0];

  const tree = await UserTree.findOne({ _id: id, user_id: user._id });
  if (!tree) {
    return Response.json({ error: 'Árbol no encontrado' }, { status: 404 });
  }

  tree.is_favorite = !tree.is_favorite;
  await tree.save();

  return Response.json({ is_favorite: tree.is_favorite });
});
