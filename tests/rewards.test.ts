import { describe, it, expect } from 'vitest';
import {
  getDurationBonusTrees,
  getSessionReward,
  getRequiredElapsedMs,
} from '@/lib/utils/constants';

describe('getDurationBonusTrees', () => {
  it('no otorga bonus por debajo de 25 min', () => {
    expect(getDurationBonusTrees(5)).toBe(0);
    expect(getDurationBonusTrees(24)).toBe(0);
  });

  it('otorga +1 árbol cada 20 min por encima de 5', () => {
    expect(getDurationBonusTrees(25)).toBe(1);
    expect(getDurationBonusTrees(45)).toBe(2);
    expect(getDurationBonusTrees(65)).toBe(3);
  });
});

describe('getSessionReward', () => {
  it('sesión normal: 1 árbol base + bonus de duración', () => {
    const r = getSessionReward(1, 4, 25);
    expect(r.isCycleComplete).toBe(false);
    expect(r.baseTrees).toBe(1);
    expect(r.durationBonus).toBe(1);
    expect(r.treeCount).toBe(2);
  });

  it('cierre de ciclo: (sesionesPorCiclo - 1) árboles base + bonus', () => {
    const r = getSessionReward(4, 4, 25);
    expect(r.isCycleComplete).toBe(true);
    expect(r.baseTrees).toBe(3);
    expect(r.durationBonus).toBe(1);
    expect(r.treeCount).toBe(4);
  });

  it('sesión corta sin bonus de duración', () => {
    const r = getSessionReward(2, 4, 5);
    expect(r.durationBonus).toBe(0);
    expect(r.treeCount).toBe(1);
  });

  it('trata inputs no numéricos como sesión normal (no cierra ciclo)', () => {
    const r = getSessionReward(undefined, undefined, 25);
    expect(r.isCycleComplete).toBe(false);
    expect(r.baseTrees).toBe(1);
    expect(r.treeCount).toBe(2);
  });
});

describe('getRequiredElapsedMs', () => {
  it('exige el 90% de la duración en milisegundos', () => {
    expect(getRequiredElapsedMs(25)).toBe(25 * 60 * 1000 * 0.9);
    expect(getRequiredElapsedMs(10)).toBe(540_000);
  });
});
