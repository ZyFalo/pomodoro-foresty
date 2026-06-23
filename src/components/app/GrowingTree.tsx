'use client';

interface GrowingTreeProps {
  /** Progreso de la sesión 0..1 — el árbol crece de semilla a adulto */
  progress: number;
  size?: number;
  /** Azul para descanso, verde para trabajo */
  variant?: 'work' | 'break';
}

const clamp = (n: number) => Math.max(0, Math.min(1, n));

/**
 * Árbol que crece según el progreso de la sesión (estilo Forest).
 * Etapas suaves: semilla (0) → brote → arbolito → adulto (1).
 * Genérico a propósito: no revela la especie/rareza, que se descubre al final.
 */
export function GrowingTree({ progress, size = 120, variant = 'work' }: GrowingTreeProps) {
  const p = clamp(progress);

  // Cada parte aparece y crece en su ventana de progreso
  const trunkScale = clamp(p / 0.45);
  const canopyScale = clamp((p - 0.18) / 0.82);
  const sproutScale = clamp((p - 0.08) / 0.25) * (p < 0.5 ? 1 : Math.max(0, 1 - (p - 0.5) / 0.2));
  const seedOpacity = p < 0.1 ? 1 : 0;

  const leaf = variant === 'break' ? '#3B82F6' : '#3CA76A';
  const leafDark = variant === 'break' ? '#1E40AF' : '#1B5E20';
  const leafLight = variant === 'break' ? '#60A5FA' : '#4CAF50';

  const grow = (scale: number) => ({
    transform: `scale(${scale})`,
    transformOrigin: 'center bottom',
    transformBox: 'fill-box' as const,
    transition: 'transform 1.1s cubic-bezier(0.22,1,0.36,1)',
  });

  return (
    <svg viewBox="0 0 120 120" style={{ width: size, height: size }} aria-hidden>
      <defs>
        <radialGradient id="gt-canopy" cx="40%" cy="35%" r="75%">
          <stop offset="0%" stopColor={leafLight} />
          <stop offset="60%" stopColor={leaf} />
          <stop offset="100%" stopColor={leafDark} />
        </radialGradient>
      </defs>

      {/* Montículo de tierra / suelo */}
      <ellipse cx="60" cy="104" rx="26" ry="6" fill="rgba(0,0,0,0.28)" />
      <path d="M40 104 Q60 92 80 104 Z" fill="#3A2A1C" opacity="0.9" />

      {/* Semilla (solo al inicio) */}
      <circle cx="60" cy="99" r="3.5" fill={leafLight} opacity={seedOpacity} style={{ transition: 'opacity 0.6s' }} />

      {/* Brote inicial (dos hojitas) */}
      <g style={{ ...grow(sproutScale), opacity: sproutScale }}>
        <path d="M60 100 q-9 -4 -11 -12 q9 0 11 8 Z" fill={leafLight} />
        <path d="M60 100 q9 -4 11 -12 q-9 0 -11 8 Z" fill={leaf} />
      </g>

      {/* Tronco */}
      <g style={grow(trunkScale)}>
        <rect x="56.5" y="62" width="7" height="42" rx="3.5" fill="#7A5A3C" />
        <rect x="56.5" y="62" width="3" height="42" rx="1.5" fill="#8C6B49" />
      </g>

      {/* Copa (3 lóbulos redondeados, estilo Forest) */}
      <g style={grow(canopyScale)}>
        <circle cx="60" cy="44" r="26" fill="url(#gt-canopy)" />
        <circle cx="42" cy="56" r="17" fill="url(#gt-canopy)" />
        <circle cx="78" cy="56" r="17" fill="url(#gt-canopy)" />
        {/* Brillo superior */}
        <circle cx="52" cy="36" r="8" fill={leafLight} opacity="0.45" />
      </g>
    </svg>
  );
}
