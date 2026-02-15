import { NextRequest } from 'next/server';
import { withAuth } from '@/lib/auth/middleware';
import { connectDB } from '@/lib/db/connection';
import { UserTree } from '@/lib/db/models';
import { getRarityFromProbability } from '@/lib/utils/rarity';

function getTreeIdFromUrl(url: string): string {
  return url.split('/trees/')[1]?.split('?')[0]?.split('/')[0] ?? '';
}

// GET /api/trees/:id
export const GET = withAuth(async (req: NextRequest, user) => {
  await connectDB();
  const id = getTreeIdFromUrl(req.url);

  const tree = await UserTree.findOne({ _id: id, user_id: user._id }).populate('template_id');
  if (!tree) {
    return Response.json({ error: 'Árbol no encontrado' }, { status: 404 });
  }

  const treeObj = tree.toObject();
  return Response.json({
    ...treeObj,
    template: treeObj.template_id,
    rarity: getRarityFromProbability(treeObj.template_id.probability).name,
  });
});

// PUT /api/trees/:id — Rename
export const PUT = withAuth(async (req: NextRequest, user) => {
  await connectDB();
  const id = getTreeIdFromUrl(req.url);
  const body = await req.json();
  const { custom_name } = body;

  if (!custom_name || typeof custom_name !== 'string' || custom_name.trim().length === 0) {
    return Response.json({ error: 'Nombre requerido' }, { status: 400 });
  }

  if (custom_name.trim().length > 50) {
    return Response.json({ error: 'Nombre demasiado largo (máx. 50 caracteres)' }, { status: 400 });
  }

  const tree = await UserTree.findOneAndUpdate(
    { _id: id, user_id: user._id },
    { custom_name: custom_name.trim() },
    { new: true }
  ).populate('template_id');

  if (!tree) {
    return Response.json({ error: 'Árbol no encontrado' }, { status: 404 });
  }

  return Response.json(tree);
});

// DELETE /api/trees/:id
export const DELETE = withAuth(async (req: NextRequest, user) => {
  await connectDB();
  const id = getTreeIdFromUrl(req.url);

  const tree = await UserTree.findOneAndDelete({ _id: id, user_id: user._id });
  if (!tree) {
    return Response.json({ error: 'Árbol no encontrado' }, { status: 404 });
  }

  // Decrement user tree count
  const { User } = await import('@/lib/db/models');
  await User.findByIdAndUpdate(user._id, { $inc: { total_trees: -1 } });

  return Response.json({ message: 'Árbol eliminado' });
});
