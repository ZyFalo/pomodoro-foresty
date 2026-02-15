import { RARITY_RANGES } from './constants';
import type { Rarity } from '@/types';

export function getRarityFromProbability(probability: number): {
  name: Rarity;
  color: string;
  badgeBg: string;
} {
  for (const range of RARITY_RANGES) {
    if (probability >= range.min && probability <= range.max) {
      return { name: range.name, color: range.color, badgeBg: range.badgeBg };
    }
  }
  // Fallback to common
  return { name: 'Común', color: '#6B7280', badgeBg: '#F3F4F6' };
}

export function getRarityColor(rarity: Rarity): string {
  const found = RARITY_RANGES.find(r => r.name === rarity);
  return found?.color ?? '#6B7280';
}
