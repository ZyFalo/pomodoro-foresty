import { connectDB } from '@/lib/db/connection';
import { Template, UserTree, User, type ITemplateDocument } from '@/lib/db/models';
import { logActivity } from './activity-logger';

export async function weightedRandomTree(): Promise<ITemplateDocument | null> {
  await connectDB();

  const templates = await Template.find({ is_active: true });
  if (templates.length === 0) return null;

  // Sum all probabilities
  const totalWeight = templates.reduce((sum, t) => sum + t.probability, 0);

  // Random number in [0, totalWeight)
  const random = Math.random() * totalWeight;

  // Accumulate and find winner
  let accumulated = 0;
  for (const template of templates) {
    accumulated += template.probability;
    if (accumulated > random) {
      return template;
    }
  }

  // Fallback: return last template
  return templates[templates.length - 1];
}

export async function earnTree(
  userId: string,
  ip_address: string = ''
): Promise<{ userTree: any; template: ITemplateDocument } | null> {
  const template = await weightedRandomTree();
  if (!template) return null;

  await connectDB();

  // Create user tree
  const userTree = await UserTree.create({
    user_id: userId,
    template_id: template._id,
    earned_at: new Date(),
  });

  // Update user stats
  await User.findByIdAndUpdate(userId, {
    $inc: { total_trees: 1 },
  });

  // Log activity
  await logActivity({
    user_id: userId,
    event_type: 'arbol_ganado',
    detail: `Árbol ganado: ${template.name} (${template.category})`,
    ip_address,
  });

  // Populate template for response
  const populated = await UserTree.findById(userTree._id).populate('template_id');

  return { userTree: populated, template };
}
