'use client';

interface SessionDotsProps {
  current: number;
  total: number;
}

export function SessionDots({ current, total }: SessionDotsProps) {
  return (
    <div className="flex items-center gap-2">
      {Array.from({ length: total }, (_, i) => (
        <div
          key={i}
          className={`w-3 h-3 rounded-full transition-colors ${
            i < current
              ? 'bg-primary'
              : i === current
                ? 'bg-primary/50'
                : 'bg-white-20'
          }`}
        />
      ))}
      <span className="text-xs text-white-50 ml-1">
        {current}/{total}
      </span>
    </div>
  );
}
