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

function makeTemplate(id: string, probability: number): Template {
  return {
    id,
    name: id,
    category: 'Test',
    description: '',
    imageUrl: '',
    probability,
    isActive: true,
    createdById: 'admin',
    createdAt: new Date(0),
    updatedAt: new Date(0),
  };
}

describe('weightedRandomTree', () => {
  afterEach(() => {
    vi.restoreAllMocks();
    findMany.mockReset();
  });

  it('devuelve null si no hay plantillas activas', async () => {
    findMany.mockResolvedValue([]);
    expect(await weightedRandomTree()).toBeNull();
  });

  it('selecciona según el peso acumulado de probabilidad', async () => {
    const templates = [
      makeTemplate('a', 1),
      makeTemplate('b', 1),
      makeTemplate('c', 1),
    ];
    findMany.mockResolvedValue(templates);

    // total = 3. random = Math.random() * 3
    vi.spyOn(Math, 'random').mockReturnValue(0); // random = 0 → acumulado 'a' (1) > 0
    expect((await weightedRandomTree())?.id).toBe('a');

    vi.spyOn(Math, 'random').mockReturnValue(0.5); // random = 1.5 → acumulado 'b' (2) > 1.5
    expect((await weightedRandomTree())?.id).toBe('b');
  });

  it('respeta los pesos desiguales (mayor probabilidad = más frecuente)', async () => {
    const templates = [makeTemplate('raro', 1), makeTemplate('comun', 9)];
    findMany.mockResolvedValue(templates);

    // total = 10. random = 5 → acumulado 'raro' (1) no, 'comun' (10) sí
    vi.spyOn(Math, 'random').mockReturnValue(0.5);
    expect((await weightedRandomTree())?.id).toBe('comun');
  });

  it('cae al último elemento como fallback', async () => {
    findMany.mockResolvedValue([makeTemplate('a', 1), makeTemplate('b', 1)]);
    vi.spyOn(Math, 'random').mockReturnValue(0.999999); // random ≈ 2 → último
    expect((await weightedRandomTree())?.id).toBe('b');
  });
});
