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

export type EarnedTreeResult = { userTree: UserTree & { template: Template }; template: Template };

export async function earnTrees(
  userId: string,
  count: number,
  ip_address: string = '',
  sessionId?: string
): Promise<EarnedTreeResult[]> {
  const results: EarnedTreeResult[] = [];

  for (let i = 0; i < count; i++) {
    const template = await weightedRandomTree();
    if (!template) break;

    const userTree = await prisma.userTree.create({
      data: {
        userId,
        templateId: template.id,
        ...(sessionId ? { sessionId } : {}),
      },
      include: { template: true },
    });

    results.push({ userTree, template });

    await logActivity({
      user_id: userId,
      event_type: 'arbol_ganado',
      detail: `Árbol ganado: ${template.name} (${template.category})`,
      ip_address,
    });
  }

  if (results.length > 0) {
    await prisma.user.update({
      where: { id: userId },
      data: { totalTrees: { increment: results.length } },
    });
  }

  return results;
}

export async function earnTree(
  userId: string,
  ip_address: string = '',
  sessionId?: string
): Promise<EarnedTreeResult | null> {
  const results = await earnTrees(userId, 1, ip_address, sessionId);
  return results[0] ?? null;
}
