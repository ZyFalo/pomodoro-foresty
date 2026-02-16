import type { Rarity } from '@/types';
import { getRarityFromProbability } from '@/lib/utils/rarity';

interface BadgeProps {
  rarity?: Rarity;
  probability?: number;
  className?: string;
}

const RARITY_STYLES: Record<string, { bg: string; text: string }> = {
  'Común': { bg: '#6B7280', text: '#FFFFFF' },
  'Poco común': { bg: '#22C55E', text: '#FFFFFF' },
  'Raro': { bg: '#3B82F6', text: '#FFFFFF' },
  'Épico': { bg: '#9333EA', text: '#FFFFFF' },
  'Legendario': { bg: 'linear-gradient(135deg, #FFD700, #F59E0B)', text: '#1a1a1a' },
};

export function Badge({ rarity, probability, className = '' }: BadgeProps) {
  const info = probability !== undefined
    ? getRarityFromProbability(probability)
    : rarity
      ? { name: rarity, color: '', badgeBg: '' }
      : null;

  if (!info) return null;

  const style = RARITY_STYLES[info.name] ?? RARITY_STYLES['Común'];
  const isGradient = style.bg.includes('gradient');

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${className}`}
      style={{
        background: style.bg,
        color: style.text,
        ...(isGradient ? {} : { backgroundColor: style.bg }),
      }}
    >
      {info.name}
    </span>
  );
}
