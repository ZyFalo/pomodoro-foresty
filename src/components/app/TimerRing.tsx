'use client';

interface TimerRingProps {
  progress: number; // 0 to 1
  timeDisplay: string;
  totalDisplay: string;
  size?: number;
}

export function TimerRing({
  progress,
  timeDisplay,
  totalDisplay,
  size = 260,
}: TimerRingProps) {
  const center = size / 2;
  const radius = center - 10;
  const circumference = 2 * Math.PI * radius;
  const dashOffset = circumference * (1 - progress);

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg viewBox={`0 0 ${size} ${size}`} className="absolute inset-0 -rotate-90" style={{ width: size, height: size }}>
        {/* Background circle */}
        <circle
          cx={center}
          cy={center}
          r={radius}
          fill="none"
          stroke="#FFFFFF1A"
          strokeWidth={8}
        />
        {/* Progress circle */}
        <circle
          cx={center}
          cy={center}
          r={radius}
          fill="none"
          stroke="#2E8B57"
          strokeWidth={8}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={dashOffset}
          className="transition-all duration-1000 ease-linear"
        />
      </svg>
      {/* Center text */}
      <div className="absolute inset-0 flex flex-col items-center justify-center gap-1">
        <span className="text-7xl font-bold text-white leading-none">{timeDisplay}</span>
        <span className="text-sm text-white-50">{totalDisplay}</span>
      </div>
    </div>
  );
}
