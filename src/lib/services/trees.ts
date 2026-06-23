import { prisma } from '@/lib/db/prisma';
import { logActivity } from './activity-logger';
import { RARITY_CONFIG } from '@/lib/utils/constants';
import type { Template, UserTree } from '@/generated/prisma/client';

/**
 * Sorteo ponderado en DOS niveles (estilo gacha):
 *   1. Se elige la RAREZA según pesos fijos (RARITY_CONFIG.weight), renormalizando
 *      solo entre rarezas que tienen al menos una plantilla activa.
 *   2. Se elige UNIFORMEMENTE una plantilla dentro de esa rareza.
 * Así la probabilidad de cada rareza es estable e independiente del número de
 * plantillas que existan por rareza.
 */
export async function weightedRandomTree(): Promise<Template | null> {
  const templates = await prisma.template.findMany({ where: { isActive: true } });
  if (templates.length === 0) return null;

  // Agrupar plantillas por rareza
  const byRarity = new Map<string, Template[]>();
  for (const t of templates) {
    const arr = byRarity.get(t.rarity) ?? [];
    arr.push(t);
    byRarity.set(t.rarity, arr);
  }

  // Paso 1: elegir rareza por peso, solo entre las que tienen stock (renormalizado)
  const available = RARITY_CONFIG.filter((r) => byRarity.has(r.key));
  if (available.length === 0) return null;
  const totalWeight = available.reduce((sum, r) => sum + r.weight, 0);
  let random = Math.random() * totalWeight;
  let chosen = available[available.length - 1];
  for (const r of available) {
    random -= r.weight;
    if (random < 0) {
      chosen = r;
      break;
    }
  }

  // Paso 2: elegir uniformemente dentro de la rareza
  const pool = byRarity.get(chosen.key)!;
  return pool[Math.floor(Math.random() * pool.length)];
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
