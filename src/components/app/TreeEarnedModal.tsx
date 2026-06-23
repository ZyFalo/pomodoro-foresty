'use client';

import { useState, useCallback, useMemo } from 'react';
import { Modal, Icon, Button, Badge } from '@/components/ui';

interface TreeData {
  tree_name: string;
  image_url: string;
  description: string;
  probability: number;
  focus_minutes: number;
}

interface TreeEarnedModalProps {
  open: boolean;
  trees: TreeData[];
  onClose: () => void;
  onViewForest: () => void;
}

const CONFETTI_COLORS = ['#FFD700', '#2E8B57', '#9333EA', '#3B82F6', '#FF6B6B', '#F59E0B', '#22C55E'];

function generateConfettiPieces() {
  return Array.from({ length: 24 }, (_, i) => ({
    color: CONFETTI_COLORS[i % CONFETTI_COLORS.length],
    left: Math.random() * 100,
    delay: Math.random() * 2,
    duration: 2 + Math.random() * 2,
    size: 4 + Math.random() * 6,
    shape: Math.random() > 0.5 ? 'circle' : ('rect' as const),
    drift: (Math.random() - 0.5) * 60,
    rotation: Math.random() * 360,
  }));
}

export function TreeEarnedModal({ open, trees, onClose, onViewForest }: TreeEarnedModalProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [confettiKey, setConfettiKey] = useState(0);
  const [prevOpen, setPrevOpen] = useState(open);

  // Reset state when the modal transitions to open. Adjusting state during
  // render (React's recommended pattern) avoids the cascading re-render of
  // doing it inside an effect.
  if (open !== prevOpen) {
    setPrevOpen(open);
    if (open) {
      setCurrentIndex(0);
      setIsTransitioning(false);
      setConfettiKey((k) => k + 1);
    }
  }

  // confettiKey is an explicit regeneration trigger, not a value read inside the
  // factory, so the "unnecessary dependency" hint does not apply here.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const confettiPieces = useMemo(() => generateConfettiPieces(), [confettiKey]);

  const isMultiple = trees.length > 1;
  const isLastTree = currentIndex >= trees.length - 1;
  const currentTree = trees[currentIndex] ?? null;

  const handleNext = useCallback(() => {
    if (isLastTree || isTransitioning) return;
    setIsTransitioning(true);
    setTimeout(() => {
      setCurrentIndex((i) => i + 1);
      setConfettiKey((k) => k + 1);
      setIsTransitioning(false);
    }, 300);
  }, [isLastTree, isTransitioning]);

  // Block backdrop close when there are pending trees
  const handleClose = useCallback(() => {
    if (isMultiple && !isLastTree) return;
    onClose();
  }, [isMultiple, isLastTree, onClose]);

  const handleBackdropClick = useCallback(() => {
    if (isMultiple && !isLastTree) return;
    onClose();
  }, [isMultiple, isLastTree, onClose]);

  return (
    <Modal open={open} onClose={handleBackdropClick}>
      <div className="relative bg-[#0E1A12]/85 border border-white-15 rounded-[28px] backdrop-blur-[20px] p-8 max-w-sm w-full mx-4 overflow-hidden shadow-[0_24px_60px_rgba(0,0,0,0.5),inset_0_1px_0_rgba(255,255,255,0.07)] animate-scale-in">
        {/* Confetti animation styles */}
        {currentTree && (
          <style>{`
            @keyframes confettiFall {
              0% {
                transform: translateY(-20px) translateX(0px) rotate(0deg);
                opacity: 1;
              }
              25% {
                opacity: 1;
              }
              100% {
                transform: translateY(500px) translateX(var(--drift)) rotate(var(--rotation));
                opacity: 0;
              }
            }
          `}</style>
        )}

        {/* Confetti pieces */}
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

        {/* Close button (only on last tree or single tree) */}
        {(!isMultiple || isLastTree) && (
          <button
            onClick={handleClose}
            className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white-10 border border-white-15 flex items-center justify-center cursor-pointer hover:bg-white-20 hover:rotate-90 transition-all duration-200 z-10"
          >
            <Icon name="close" size={18} className="text-white-80" />
          </button>
        )}

        {currentTree ? (
          <div
            className="flex flex-col items-center gap-4 text-center relative z-10 transition-opacity duration-300"
            style={{ opacity: isTransitioning ? 0 : 1 }}
          >
            {/* Header */}
            <div className="flex items-center gap-2">
              <Icon name="emoji_events" size={28} className="text-gold drop-shadow-[0_0_10px_rgba(255,215,0,0.5)]" />
              <h2 className="font-display text-2xl font-semibold text-white">
                {isMultiple ? '¡Ciclo Completo!' : '¡Felicidades!'}
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
                    style={{
                      backgroundColor: i <= currentIndex ? '#FFD700' : 'rgba(255,255,255,0.2)',
                    }}
                  />
                ))}
              </div>
            )}

            {/* Tree image with glow */}
            <div className="relative w-[200px] h-[200px] flex items-center justify-center">
              {/* Pulsing halo */}
              <div
                className="absolute w-44 h-44 rounded-full blur-2xl animate-glow"
                style={{ background: 'radial-gradient(circle, rgba(255,215,0,0.30), transparent 70%)' }}
                aria-hidden
              />
              <div
                className="relative w-40 h-40 rounded-full flex items-center justify-center animate-float bg-forest-800 border-[3px] border-gold/40"
                style={{ boxShadow: '0 0 36px rgba(255,215,0,0.3), inset 0 0 24px rgba(0,0,0,0.4)' }}
              >
                {currentTree.image_url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={currentTree.image_url}
                    alt={currentTree.tree_name}
                    className="w-full h-full object-cover rounded-full"
                  />
                ) : (
                  <Icon name="park" size={64} className="text-accent-green" />
                )}
              </div>
            </div>

            {/* Tree name */}
            <h3 className="font-display text-2xl font-semibold text-white">{currentTree.tree_name}</h3>

            {/* Rarity badge */}
            <Badge probability={currentTree.probability} />

            {/* Description */}
            {currentTree.description && (
              <p className="text-sm text-white-60 max-w-[360px] leading-relaxed">
                {currentTree.description}
              </p>
            )}

            {/* XP Reward pill */}
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-pill bg-gold/15 border border-gold/40">
              <Icon name="timer" size={16} className="text-gold" />
              <span className="text-sm font-semibold text-gold">
                +{currentTree.focus_minutes} min enfocados
              </span>
            </div>

            {/* Success alert */}
            <div className="w-full flex items-center gap-2.5 px-4 py-3 rounded-xl bg-primary/15 border border-primary/30">
              <Icon name="check_circle" size={20} className="text-accent-green shrink-0" />
              <span className="text-sm font-medium text-white-80">¡Árbol agregado a tu colección!</span>
            </div>

            {/* Buttons */}
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
              No hay plantillas de árboles disponibles en este momento. Tu pomodoro fue completado
              exitosamente.
            </p>
            <Button onClick={onClose} className="mt-2" fullWidth>
              Continuar
            </Button>
          </div>
        )}
      </div>
    </Modal>
  );
}
