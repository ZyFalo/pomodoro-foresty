import type { Rarity } from '@/types';
import { getRarityFromProbability } from '@/lib/utils/rarity';

interface BadgeProps {
  rarity?: Rarity;
  probability?: number;
  className?: string;
}

export function Badge({ rarity, probability, className = '' }: BadgeProps) {
  const info = probability !== undefined
    ? getRarityFromProbability(probability)
    : rarity
      ? { name: rarity, color: '', badgeBg: '' }
      : null;

  if (!info) return null;

  const finalInfo = probability !== undefined ? info : (() => {
    const colorMap: Record<string, { color: string; badgeBg: string }> = {
      'Comun': { color: '#6B7280', badgeBg: '#F3F4F6' },
      'Poco comun': { color: '#22C55E', badgeBg: '#D1FAE5' },
      'Raro': { color: '#3B82F6', badgeBg: '#DBEAFE' },
      'Epico': { color: '#9333EA', badgeBg: '#EDE9FE' },
      'Legendario': { color: '#FFD700', badgeBg: '#FEF3C7' },
    };
    return { name: rarity!, ...colorMap[rarity!] ?? { color: '#6B7280', badgeBg: '#F3F4F6' } };
  })();

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${className}`}
      style={{ backgroundColor: finalInfo.badgeBg, color: finalInfo.color }}
    >
      {finalInfo.name}
    </span>
  );
}
