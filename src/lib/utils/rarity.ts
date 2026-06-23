import { RARITY_CONFIG } from './constants';
import type { Rarity } from '@/types';

type RarityInfo = { name: Rarity; color: string; badgeBg: string };

const FALLBACK: RarityInfo = { name: 'Común', color: '#6B7280', badgeBg: '#F3F4F6' };

/**
 * Información de presentación a partir de una rareza, aceptando tanto la clave
 * del enum de BD ('comun', 'poco_comun', ...) como el nombre visible ('Común').
 */
export function getRarityInfo(rarity: string): RarityInfo {
  const found = RARITY_CONFIG.find((r) => r.key === rarity || r.name === rarity);
  if (found) return { name: found.name, color: found.color, badgeBg: found.badgeBg };
  return FALLBACK;
}

export function getRarityColor(rarity: Rarity): string {
  return RARITY_CONFIG.find((r) => r.name === rarity)?.color ?? FALLBACK.color;
}

/** Nombre visible ('Común') a partir de la clave del enum ('comun'). */
export function rarityKeyToName(key: string): Rarity {
  return getRarityInfo(key).name;
}

/** Clave del enum ('comun') a partir del nombre visible ('Común'); null si no existe. */
export function rarityNameToKey(name: string): string | null {
  return RARITY_CONFIG.find((r) => r.name === name || r.key === name)?.key ?? null;
}
