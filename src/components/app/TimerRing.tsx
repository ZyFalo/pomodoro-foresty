'use client';

import { useId, useRef, useCallback } from 'react';

interface DialConfig {
  value: number;
  durations: readonly number[];
  onChange: (v: number) => void;
  disabled?: boolean;
}

interface TimerRingProps {
  progress: number; // 0 to 1
  timeDisplay: string;
  totalDisplay: string;
  size?: number;
  variant?: 'work' | 'break';
  /** Contenido central sobre el número (p. ej. el árbol que crece) */
  children?: React.ReactNode;
  /** Si se pasa, el anillo se vuelve un dial interactivo para elegir la duración */
  dial?: DialConfig;
}

export function TimerRing({
  progress,
  timeDisplay,
  totalDisplay,
  size = 260,
  variant = 'work',
  children,
  dial,
}: TimerRingProps) {
  const gradientId = useId();
  const containerRef = useRef<HTMLDivElement>(null);
  const center = size / 2;
  const radius = center - 12;
  const circumference = 2 * Math.PI * radius;

  const dialMin = dial ? dial.durations[0] : 0;
  const dialMax = dial ? dial.durations[dial.durations.length - 1] : 1;
  // En modo dial el arco representa la duración elegida; si no, el progreso del tiempo
  const ringProgress = dial ? (dial.value - dialMin) / (dialMax - dialMin) : progress;
  const dashOffset = circumference * (1 - ringProgress);

  const isBreak = variant === 'break';
  const accentSoft = isBreak ? 'rgba(59,130,246,0.30)' : 'rgba(46,139,87,0.30)';

  // Posición del handle (overlay HTML): progreso 0 = arriba, sentido horario
  const handleAngle = ringProgress * 2 * Math.PI - Math.PI / 2;
  const handleX = center + radius * Math.cos(handleAngle);
  const handleY = center + radius * Math.sin(handleAngle);

  const dialActive = !!dial && !dial.disabled;

  const applyFromPointer = useCallback(
    (clientX: number, clientY: number) => {
      if (!dial || dial.disabled || !containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;
      const angle = Math.atan2(clientY - cy, clientX - cx); // 0 = derecha
      let prog = (angle + Math.PI / 2) / (2 * Math.PI); // 0 = arriba
      if (prog < 0) prog += 1;
      const raw = dialMin + prog * (dialMax - dialMin);
      let nearest = dial.durations[0];
      for (const d of dial.durations) {
        if (Math.abs(d - raw) < Math.abs(nearest - raw)) nearest = d;
      }
      if (nearest !== dial.value) dial.onChange(nearest);
    },
    [dial, dialMin, dialMax]
  );

  const onPointerDown = (e: React.PointerEvent) => {
    if (!dialActive) return;
    (e.currentTarget as Element).setPointerCapture?.(e.pointerId);
    applyFromPointer(e.clientX, e.clientY);
  };
  const onPointerMove = (e: React.PointerEvent) => {
    if (!dialActive || e.buttons !== 1) return;
    applyFromPointer(e.clientX, e.clientY);
  };

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (!dial) return;
    const i = dial.durations.indexOf(dial.value);
    if (e.key === 'ArrowRight' || e.key === 'ArrowUp') {
      e.preventDefault();
      dial.onChange(dial.durations[Math.min(i + 1, dial.durations.length - 1)]);
    } else if (e.key === 'ArrowLeft' || e.key === 'ArrowDown') {
      e.preventDefault();
      dial.onChange(dial.durations[Math.max(i - 1, 0)]);
    }
  };

  return (
    <div
      ref={containerRef}
      className={`relative animate-scale-in ${dialActive ? 'cursor-pointer touch-none select-none' : ''}`}
      style={{ width: size, height: size }}
      onPointerDown={dialActive ? onPointerDown : undefined}
      onPointerMove={dialActive ? onPointerMove : undefined}
    >
      {/* Ambient glow halo behind the ring */}
      <div
        className="absolute inset-0 rounded-full blur-2xl animate-glow"
        style={{ background: `radial-gradient(circle at 50% 50%, ${accentSoft}, transparent 70%)` }}
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
        <circle cx={center} cy={center} r={radius} fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth={10} />
        {/* Progress / dial arc */}
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
          className={dial ? 'transition-all duration-300 ease-out' : 'transition-all duration-1000 ease-linear'}
        />
      </svg>

      {/* Center: árbol (opcional) + tiempo */}
      <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
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

      {/* Handle del dial (solo en modo selección) */}
      {dialActive && (
        <div
          role="slider"
          tabIndex={0}
          aria-label="Duración de la sesión en minutos"
          aria-valuemin={dialMin}
          aria-valuemax={dialMax}
          aria-valuenow={dial.value}
          onKeyDown={onKeyDown}
          className="absolute w-7 h-7 rounded-full bg-amber border-[3px] border-[#0C1610] shadow-[0_0_16px_rgba(232,176,75,0.7)] cursor-grab active:cursor-grabbing -translate-x-1/2 -translate-y-1/2 touch-none focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-soft transition-[box-shadow] hover:shadow-[0_0_22px_rgba(232,176,75,0.9)]"
          style={{ left: handleX, top: handleY }}
        />
      )}
    </div>
  );
}
