import { describe, it, expect, vi, afterEach } from 'vitest';
import type { Template } from '@/types';

vi.mock('@/lib/db/prisma', () => ({
  prisma: {
    template: { findMany: vi.fn() },
  },
}));

import { weightedRandomTree } from '@/lib/services/trees';
import { prisma } from '@/lib/db/prisma';

const findMany = vi.mocked(prisma.template.findMany);

function makeTemplate(id: string, rarity: Template['rarity']): Template {
  return {
    id,
    name: id,
    category: 'Test',
    description: '',
    imageUrl: '',
    rarity,
    isActive: true,
    createdById: 'admin',
    createdAt: new Date(0),
    updatedAt: new Date(0),
  };
}

describe('weightedRandomTree (sorteo en dos niveles)', () => {
  afterEach(() => {
    vi.restoreAllMocks();
    findMany.mockReset();
  });

  it('devuelve null si no hay plantillas activas', async () => {
    findMany.mockResolvedValue([]);
    expect(await weightedRandomTree()).toBeNull();
  });

  it('si solo hay una rareza con stock, siempre elige de esa rareza', async () => {
    findMany.mockResolvedValue([makeTemplate('a', 'legendario')]);
    vi.spyOn(Math, 'random').mockReturnValue(0.999999);
    expect((await weightedRandomTree())?.id).toBe('a');
  });

  it('elige la rareza según su peso, renormalizado entre las disponibles', async () => {
    // Disponibles (en orden de config): legendario (peso 2) y común (peso 50) → total 52
    findMany.mockResolvedValue([makeTemplate('leg', 'legendario'), makeTemplate('com', 'comun')]);

    // random = 0 → cae en legendario (primer tramo)
    vi.spyOn(Math, 'random').mockReturnValue(0);
    expect((await weightedRandomTree())?.rarity).toBe('legendario');

    // random = 0.5 → 26 de 52 → supera el tramo de legendario (2) → común
    vi.spyOn(Math, 'random').mockReturnValue(0.5);
    expect((await weightedRandomTree())?.rarity).toBe('comun');
  });

  it('dentro de la rareza elegida devuelve una de sus plantillas', async () => {
    findMany.mockResolvedValue([makeTemplate('x', 'raro'), makeTemplate('y', 'raro')]);
    vi.spyOn(Math, 'random').mockReturnValue(0);
    const result = await weightedRandomTree();
    expect(result?.rarity).toBe('raro');
    expect(['x', 'y']).toContain(result?.id);
  });
});
