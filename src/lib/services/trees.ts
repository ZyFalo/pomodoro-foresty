import { prisma } from '@/lib/db/prisma';
import { logActivity } from './activity-logger';
import type { Template, UserTree } from '@/generated/prisma/client';

export async function weightedRandomTree(): Promise<Template | null> {
  const templates = await prisma.template.findMany({
    where: { isActive: true },
  });

  if (templates.length === 0) return null;

  const totalWeight = templates.reduce((sum, t) => sum + t.probability, 0);
  const random = Math.random() * totalWeight;

  let accumulated = 0;
  for (const template of templates) {
    accumulated += template.probability;
    if (accumulated > random) {
      return template;
    }
  }

  return templates[templates.length - 1];
}

export async function earnTree(
  userId: string,
  ip_address: string = ''
): Promise<{ userTree: UserTree & { template: Template }; template: Template } | null> {
  const template = await weightedRandomTree();
  if (!template) return null;

  const userTree = await prisma.userTree.create({
    data: {
      userId,
      templateId: template.id,
    },
    include: { template: true },
  });

  await prisma.user.update({
    where: { id: userId },
    data: { totalTrees: { increment: 1 } },
  });

  await logActivity({
    user_id: userId,
    event_type: 'arbol_ganado',
    detail: `Árbol ganado: ${template.name} (${template.category})`,
    ip_address,
  });

  return { userTree, template };
}
