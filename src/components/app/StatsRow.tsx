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
    <div
      className={`grid gap-4 stagger ${
        stats.length === 3 ? 'grid-cols-1 sm:grid-cols-3' : 'grid-cols-2 sm:grid-cols-4'
      }`}
    >
      {stats.map((stat) => (
        <div
          key={stat.label}
          className="group flex flex-col items-center gap-2.5 bg-white-8 border border-white-15 rounded-2xl px-4 py-6 backdrop-blur-[14px] shadow-[0_8px_32px_rgba(0,0,0,0.20)] transition-all duration-200 hover:-translate-y-0.5 hover:bg-white-10 hover:border-white-20"
        >
          <div className="w-12 h-12 rounded-2xl bg-primary/15 border border-primary/25 flex items-center justify-center transition-transform duration-200 group-hover:scale-105">
            <Icon name={stat.icon} size={24} className="text-accent-green" />
          </div>
          <p className="font-display text-3xl font-semibold text-white leading-tight tabular-nums">
            {stat.value}
          </p>
          <p className="text-sm text-white-60 text-center">{stat.label}</p>
        </div>
      ))}
    </div>
  );
}
