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
          className={`w-2.5 h-2.5 rounded-full transition-colors ${
            i < current ? 'bg-primary' : 'bg-white-20'
          }`}
        />
      ))}
      <span className="text-xs text-white-60 ml-1">
        Sesión {current + 1} de {total}
      </span>
    </div>
  );
}
