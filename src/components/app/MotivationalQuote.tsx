'use client';

import { Icon } from '@/components/ui';

interface MotivationalQuoteProps {
  phrase: string;
}

export function MotivationalQuote({ phrase }: MotivationalQuoteProps) {
  if (!phrase) return null;

  return (
    <div className="flex items-start gap-2 max-w-md text-center">
      <Icon name="format_quote" size={20} className="text-white-40 shrink-0 mt-0.5" />
      <p className="text-sm text-white-80 italic leading-relaxed">{phrase}</p>
    </div>
  );
}
