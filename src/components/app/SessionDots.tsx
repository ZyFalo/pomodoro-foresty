'use client';

interface SessionDotsProps {
  current: number;
  total: number;
}

export function SessionDots({ current, total }: SessionDotsProps) {
  return (
    <div className="flex items-center gap-2.5">
      <div className="flex items-center gap-1.5">
        {Array.from({ length: total }, (_, i) => {
          const done = i < current;
          return (
            <span
              key={i}
              className={`h-2 rounded-full transition-all duration-300 ${
                done
                  ? 'w-6 bg-gradient-to-r from-primary-light to-primary shadow-[0_0_8px_rgba(46,139,87,0.5)]'
                  : 'w-2 bg-white-20'
              }`}
            />
          );
        })}
      </div>
      <span className="text-xs font-medium text-white-50 ml-0.5">
        Sesión {current} de {total}
      </span>
    </div>
  );
}
