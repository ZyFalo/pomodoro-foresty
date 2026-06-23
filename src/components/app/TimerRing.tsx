'use client';

import { useId } from 'react';

interface TimerRingProps {
  progress: number; // 0 to 1
  timeDisplay: string;
  totalDisplay: string;
  size?: number;
  variant?: 'work' | 'break';
  /** Contenido central sobre el número (p. ej. el árbol que crece) */
  children?: React.ReactNode;
}

export function TimerRing({
  progress,
  timeDisplay,
  totalDisplay,
  size = 260,
  variant = 'work',
  children,
}: TimerRingProps) {
  const gradientId = useId();
  const center = size / 2;
  const radius = center - 12;
  const circumference = 2 * Math.PI * radius;
  const dashOffset = circumference * (1 - progress);

  const isBreak = variant === 'break';
  const accentSoft = isBreak ? 'rgba(59,130,246,0.30)' : 'rgba(46,139,87,0.30)';

  return (
    <div
      className="relative animate-scale-in"
      style={{ width: size, height: size }}
    >
      {/* Ambient glow halo behind the ring */}
      <div
        className="absolute inset-0 rounded-full blur-2xl animate-glow"
        style={{
          background: `radial-gradient(circle at 50% 50%, ${accentSoft}, transparent 70%)`,
        }}
        aria-hidden
      />

      <svg
        viewBox={`0 0 ${size} ${size}`}
        className="absolute inset-0 -rotate-90"
        style={{ width: size, height: size }}
      >
        <defs>
          <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor={isBreak ? '#60A5FA' : '#4CAF50'} />
            <stop offset="55%" stopColor={isBreak ? '#3B82F6' : '#2E8B57'} />
            <stop offset="100%" stopColor={isBreak ? '#1E40AF' : '#1B5E20'} />
          </linearGradient>
        </defs>
        {/* Background track */}
        <circle
          cx={center}
          cy={center}
          r={radius}
          fill="none"
          stroke="rgba(255,255,255,0.08)"
          strokeWidth={10}
        />
        {/* Progress circle */}
        <circle
          cx={center}
          cy={center}
          r={radius}
          fill="none"
          stroke={`url(#${gradientId})`}
          strokeWidth={10}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={dashOffset}
          className="transition-all duration-1000 ease-linear"
        />
      </svg>
      {/* Center: árbol (opcional) + tiempo */}
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        {children && <div className="flex items-end justify-center -mb-1">{children}</div>}
        <span
          className={`font-display ${children ? 'text-[3.5rem]' : 'text-[5.5rem]'} font-semibold text-white leading-none tracking-tight tabular-nums drop-shadow-[0_2px_12px_rgba(0,0,0,0.4)]`}
        >
          {timeDisplay}
        </span>
        <span className="text-xs font-medium text-white-50 tracking-wide tabular-nums mt-1.5">
          {totalDisplay}
        </span>
      </div>
    </div>
  );
}
