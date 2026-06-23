import { describe, it, expect } from 'vitest';
import { getRarityInfo, getRarityColor, rarityKeyToName, rarityNameToKey } from '@/lib/utils/rarity';

describe('getRarityInfo', () => {
  it('mapea la clave del enum al nombre visible', () => {
    expect(getRarityInfo('legendario').name).toBe('Legendario');
    expect(getRarityInfo('epico').name).toBe('Épico');
    expect(getRarityInfo('raro').name).toBe('Raro');
    expect(getRarityInfo('poco_comun').name).toBe('Poco común');
    expect(getRarityInfo('comun').name).toBe('Común');
  });

  it('acepta también el nombre visible y devuelve color/badge', () => {
    const leg = getRarityInfo('Legendario');
    expect(leg.color).toBe('#FFD700');
    expect(leg.badgeBg).toBeTruthy();
  });

  it('usa Común como fallback ante una rareza desconocida', () => {
    expect(getRarityInfo('desconocido').name).toBe('Común');
  });
});

describe('getRarityColor', () => {
  it('devuelve el color por nombre de rareza', () => {
    expect(getRarityColor('Épico')).toBe('#9333EA');
    expect(getRarityColor('Legendario')).toBe('#FFD700');
    expect(getRarityColor('Común')).toBe('#6B7280');
  });
});

describe('rarityKeyToName / rarityNameToKey', () => {
  it('convierte clave → nombre y nombre → clave', () => {
    expect(rarityKeyToName('raro')).toBe('Raro');
    expect(rarityNameToKey('Raro')).toBe('raro');
  });

  it('rarityNameToKey devuelve null si no existe', () => {
    expect(rarityNameToKey('inexistente')).toBeNull();
  });
});
