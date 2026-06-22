import { describe, it, expect } from 'vitest';
import { getRarityFromProbability, getRarityColor } from '@/lib/utils/rarity';

describe('getRarityFromProbability', () => {
  it('clasifica cada rango de rareza por sus límites', () => {
    expect(getRarityFromProbability(1).name).toBe('Legendario');
    expect(getRarityFromProbability(2).name).toBe('Legendario');
    expect(getRarityFromProbability(3).name).toBe('Épico');
    expect(getRarityFromProbability(5).name).toBe('Épico');
    expect(getRarityFromProbability(6).name).toBe('Raro');
    expect(getRarityFromProbability(10).name).toBe('Raro');
    expect(getRarityFromProbability(11).name).toBe('Poco común');
    expect(getRarityFromProbability(15).name).toBe('Poco común');
    expect(getRarityFromProbability(16).name).toBe('Común');
    expect(getRarityFromProbability(25).name).toBe('Común');
  });

  it('devuelve color y fondo de badge', () => {
    const legendario = getRarityFromProbability(1);
    expect(legendario.color).toBe('#FFD700');
    expect(legendario.badgeBg).toBeTruthy();
  });

  it('usa Común como fallback fuera de rango', () => {
    expect(getRarityFromProbability(0).name).toBe('Común');
    expect(getRarityFromProbability(99).name).toBe('Común');
  });
});

describe('getRarityColor', () => {
  it('devuelve el color por nombre de rareza', () => {
    expect(getRarityColor('Épico')).toBe('#9333EA');
    expect(getRarityColor('Legendario')).toBe('#FFD700');
    expect(getRarityColor('Común')).toBe('#6B7280');
  });
});
