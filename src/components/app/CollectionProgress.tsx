'use client';

import { Icon } from '@/components/ui';

interface CollectionProgressProps {
  unique: number;
  total: number;
  progress: number;
}

export function CollectionProgress({ unique, total, progress }: CollectionProgressProps) {
  return (
    <div className="bg-white-8 border border-white-15 rounded-2xl px-5 py-4 backdrop-blur-[14px] shadow-[0_8px_32px_rgba(0,0,0,0.20)]">
      <div className="flex items-center justify-between mb-2.5">
        <span className="flex items-center gap-2 text-sm font-semibold text-white-90">
          <Icon name="forest" size={16} className="text-accent-green" />
          Progreso de colección
        </span>
        <span className="text-sm font-medium text-white-60 tabular-nums">
          {unique}/{total} especies <span className="text-accent-green">({progress}%)</span>
        </span>
      </div>
      <div className="w-full h-2.5 bg-white-8 rounded-full overflow-hidden border border-white-10">
        <div
          className="h-full bg-gradient-to-r from-primary via-primary-light to-accent-green rounded-full transition-all duration-700 ease-out shadow-[0_0_12px_rgba(46,139,87,0.5)]"
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
}
