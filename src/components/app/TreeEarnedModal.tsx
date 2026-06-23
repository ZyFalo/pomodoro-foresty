'use client';

import { useState, useCallback, useMemo } from 'react';
import { Modal, Icon, Button, Badge } from '@/components/ui';
import { getRarityColor } from '@/lib/utils/rarity';
import type { Rarity } from '@/types';

interface TreeData {
  tree_name: string;
  image_url: string;
  description: string;
  rarity: Rarity;
  focus_minutes: number;
}

interface TreeEarnedModalProps {
  open: boolean;
  trees: TreeData[];
  onClose: () => void;
  onViewForest: () => void;
}

// Nivel de "drama" del reveal según la rareza
const RARITY_DRAMA: Record<string, { confetti: number; rays: boolean; intense: boolean }> = {
  'Común':       { confetti: 12, rays: false, intense: false },
  'Poco común':  { confetti: 20, rays: false, intense: false },
  'Raro':        { confetti: 30, rays: true,  intense: false },
  'Épico':       { confetti: 44, rays: true,  intense: true },
  'Legendario':  { confetti: 70, rays: true,  intense: true },
};

function generateConfettiPieces(count: number, colors: string[]) {
  return Array.from({ length: count }, (_, i) => ({
    color: colors[i % colors.length],
    left: Math.random() * 100,
    delay: Math.random() * 1.8,
    duration: 2 + Math.random() * 2.2,
    size: 4 + Math.random() * 7,
    shape: Math.random() > 0.5 ? 'circle' : ('rect' as const),
    drift: (Math.random() - 0.5) * 80,
    rotation: Math.random() * 360,
  }));
}

export function TreeEarnedModal({ open, trees, onClose, onViewForest }: TreeEarnedModalProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [confettiKey, setConfettiKey] = useState(0);
  const [prevOpen, setPrevOpen] = useState(open);

  // Reset al abrir (ajuste de estado durante el render, patrón recomendado de React)
  if (open !== prevOpen) {
    setPrevOpen(open);
    if (open) {
      setCurrentIndex(0);
      setIsTransitioning(false);
      setConfettiKey((k) => k + 1);
    }
  }

  const isMultiple = trees.length > 1;
  const isLastTree = currentIndex >= trees.length - 1;
  const currentTree = trees[currentIndex] ?? null;

  // Color y nivel de drama según la rareza del árbol actual
  const drama = currentTree ? RARITY_DRAMA[currentTree.rarity] ?? RARITY_DRAMA['Común'] : RARITY_DRAMA['Común'];
  const rColor = currentTree ? getRarityColor(currentTree.rarity) : '#6B7280';

  // Posiciones/colores según la rareza; el re-montaje por confettiKey (en las
  // keys del map) reinicia la animación al abrir o pasar de árbol.
  const confettiPieces = useMemo(
    () => generateConfettiPieces(drama.confetti, [rColor, '#FFD700', '#F5D78E', '#FFFFFF', rColor]),
    [drama.confetti, rColor]
  );

  const handleNext = useCallback(() => {
    if (isLastTree || isTransitioning) return;
    setIsTransitioning(true);
    setTimeout(() => {
      setCurrentIndex((i) => i + 1);
      setConfettiKey((k) => k + 1);
      setIsTransitioning(false);
    }, 300);
  }, [isLastTree, isTransitioning]);

  const handleClose = useCallback(() => {
    if (isMultiple && !isLastTree) return;
    onClose();
  }, [isMultiple, isLastTree, onClose]);

  return (
    <Modal open={open} onClose={handleClose}>
      <div className="relative bg-[#0E1A12]/90 border border-white-15 rounded-[28px] backdrop-blur-[20px] max-w-sm w-full mx-4 max-h-[90vh] overflow-hidden shadow-[0_24px_60px_rgba(0,0,0,0.5),inset_0_1px_0_rgba(255,255,255,0.07)] animate-scale-in">
        {/* Tinte de rareza en el borde superior */}
        <div
          className="absolute inset-x-0 top-0 h-1.5 pointer-events-none"
          style={{ background: `linear-gradient(90deg, transparent, ${rColor}, transparent)` }}
          aria-hidden
        />

        {/* Confetti keyframes */}
        {currentTree && (
          <style>{`
            @keyframes confettiFall {
              0% { transform: translateY(-20px) translateX(0px) rotate(0deg); opacity: 1; }
              25% { opacity: 1; }
              100% { transform: translateY(520px) translateX(var(--drift)) rotate(var(--rotation)); opacity: 0; }
            }
          `}</style>
        )}

        {/* Confetti */}
        {currentTree &&
          confettiPieces.map((piece, i) => (
            <div
              key={`${confettiKey}-${i}`}
              className="absolute pointer-events-none"
              style={{
                width: piece.size,
                height: piece.shape === 'rect' ? piece.size * 0.6 : piece.size,
                backgroundColor: piece.color,
                borderRadius: piece.shape === 'circle' ? '50%' : '2px',
                left: `${piece.left}%`,
                top: -10,
                ['--drift' as string]: `${piece.drift}px`,
                ['--rotation' as string]: `${piece.rotation}deg`,
                animation: `confettiFall ${piece.duration}s ease-in ${piece.delay}s both`,
              }}
            />
          ))}

        {/* Close (solo en último/único árbol) */}
        {(!isMultiple || isLastTree) && (
          <button
            onClick={handleClose}
            className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white-10 border border-white-15 flex items-center justify-center cursor-pointer hover:bg-white-20 hover:rotate-90 transition-all duration-200 z-10"
          >
            <Icon name="close" size={18} className="text-white-80" />
          </button>
        )}

        <div className="overflow-y-auto overflow-x-hidden max-h-[90vh] p-7">
        {currentTree ? (
          <div
            className="flex flex-col items-center gap-3.5 text-center relative z-10 transition-opacity duration-300"
            style={{ opacity: isTransitioning ? 0 : 1 }}
          >
            {/* Header */}
            <div className="flex items-center gap-2">
              <Icon name="celebration" size={26} className="text-gold drop-shadow-[0_0_10px_rgba(255,215,0,0.5)]" />
              <h2 className="font-display text-2xl font-semibold text-white">
                {isMultiple ? '¡Ciclo completo!' : '¡Felicidades!'}
              </h2>
            </div>

            {/* Progress dots */}
            {isMultiple && (
              <div className="flex items-center gap-1.5">
                <span className="text-xs text-white-60 mr-1">
                  Árbol {currentIndex + 1} de {trees.length}
                </span>
                {trees.map((_, i) => (
                  <div
                    key={i}
                    className="w-2 h-2 rounded-full transition-colors duration-200"
                    style={{ backgroundColor: i <= currentIndex ? rColor : 'rgba(255,255,255,0.2)' }}
                  />
                ))}
              </div>
            )}

            {/* Árbol con reveal escalado por rareza */}
            <div key={currentIndex} className="relative w-[196px] h-[196px] flex items-center justify-center animate-scale-in">
              {/* Rayos de luz giratorios (raro+) */}
              {drama.rays && (
                <div
                  className="absolute inset-[-18%] rounded-full opacity-60 pointer-events-none animate-[spin_16s_linear_infinite]"
                  style={{
                    background: `repeating-conic-gradient(from 0deg, ${rColor}00 0deg, ${rColor}40 5deg, ${rColor}00 11deg, ${rColor}00 30deg)`,
                  }}
                  aria-hidden
                />
              )}
              {/* Halo pulsante */}
              <div
                className="absolute rounded-full blur-2xl animate-glow pointer-events-none"
                style={{
                  width: drama.intense ? 200 : 168,
                  height: drama.intense ? 200 : 168,
                  background: `radial-gradient(circle, ${rColor}${drama.intense ? '66' : '38'}, transparent 70%)`,
                }}
                aria-hidden
              />
              {/* Disco del árbol */}
              <div
                className="relative w-40 h-40 rounded-full flex items-center justify-center animate-float bg-forest-800 border-[3px] overflow-hidden"
                style={{
                  borderColor: `${rColor}80`,
                  boxShadow: `0 0 ${drama.intense ? 48 : 30}px ${rColor}${drama.intense ? '66' : '44'}, inset 0 0 24px rgba(0,0,0,0.45)`,
                }}
              >
                {currentTree.image_url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={currentTree.image_url} alt={currentTree.tree_name} className="w-full h-full object-cover" />
                ) : (
                  <Icon name="park" size={64} className="text-accent-green" />
                )}
              </div>
            </div>

            {/* Nombre (coloreado por rareza en tiers altos) */}
            <h3
              className="font-display text-2xl font-semibold"
              style={drama.intense ? { color: rColor, textShadow: `0 0 18px ${rColor}66` } : { color: '#fff' }}
            >
              {currentTree.tree_name}
            </h3>

            {/* Badge de rareza */}
            <Badge rarity={currentTree.rarity} />

            {/* Descripción */}
            {currentTree.description && (
              <p className="text-sm text-white-60 max-w-[360px] leading-relaxed line-clamp-2">{currentTree.description}</p>
            )}

            {/* Recompensa */}
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-pill bg-gold/15 border border-gold/40">
              <Icon name="timer" size={16} className="text-gold" />
              <span className="text-sm font-semibold text-gold">+{currentTree.focus_minutes} min enfocados</span>
            </div>

            {/* Botones */}
            <div className="w-full flex flex-col gap-2 mt-1">
              {!isLastTree ? (
                <Button icon="arrow_forward" onClick={handleNext} fullWidth>
                  Siguiente árbol ({currentIndex + 2} de {trees.length})
                </Button>
              ) : (
                <>
                  <Button icon="forest" onClick={onViewForest} fullWidth>
                    Ver mi bosque
                  </Button>
                  <Button variant="outline" onClick={handleClose} fullWidth>
                    Cerrar
                  </Button>
                </>
              )}
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-4 text-center pt-4">
            <Icon name="warning" size={48} className="text-amber" />
            <h2 className="font-display text-2xl font-semibold text-white">Sin plantillas de árboles</h2>
            <p className="text-sm text-white-60">
              No hay plantillas de árboles disponibles en este momento. Tu pomodoro fue completado exitosamente.
            </p>
            <Button onClick={onClose} className="mt-2" fullWidth>
              Continuar
            </Button>
          </div>
        )}
        </div>
      </div>
    </Modal>
  );
}
