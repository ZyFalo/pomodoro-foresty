'use client';

import { Icon } from '@/components/ui';

interface Stat {
  icon: string;
  label: string;
  value: string | number;
}

interface StatsRowProps {
  stats: Stat[];
}

export function StatsRow({ stats }: StatsRowProps) {
  return (
    <div className={`grid gap-4 ${stats.length === 3 ? 'grid-cols-1 sm:grid-cols-3' : 'grid-cols-2 sm:grid-cols-4'}`}>
      {stats.map((stat) => (
        <div
          key={stat.label}
          className="flex flex-col items-center gap-2 bg-white/15 backdrop-blur-md rounded-2xl px-4 py-5 border border-white/20"
        >
          <div className="w-12 h-12 rounded-full bg-white/15 flex items-center justify-center">
            <Icon name={stat.icon} size={24} className="text-white" />
          </div>
          <p className="text-3xl font-bold text-white leading-tight">{stat.value}</p>
          <p className="text-sm text-white/80">{stat.label}</p>
        </div>
      ))}
    </div>
  );
}
