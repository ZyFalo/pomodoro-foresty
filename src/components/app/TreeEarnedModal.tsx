'use client';

import { useMemo } from 'react';
import { Modal, Icon, Button, Badge } from '@/components/ui';

interface TreeEarnedModalProps {
  open: boolean;
  tree: {
    tree_name: string;
    image_url: string;
    description: string;
    probability: number;
    focus_minutes: number;
  } | null;
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
    shape: Math.random() > 0.5 ? 'circle' : 'rect' as const,
    drift: (Math.random() - 0.5) * 60,
    rotation: Math.random() * 360,
  }));
}

export function TreeEarnedModal({ open, tree, onClose, onViewForest }: TreeEarnedModalProps) {
  const confettiPieces = useMemo(() => generateConfettiPieces(), []);

  return (
    <Modal open={open} onClose={onClose}>
      <div className="relative bg-white-10 border border-white-20 rounded-3xl backdrop-blur-[15px] p-8 max-w-sm w-full mx-4 overflow-hidden">
        {/* Confetti animation styles */}
        {tree && (
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
        {tree && confettiPieces.map((piece, i) => (
          <div
            key={i}
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

        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white-15 flex items-center justify-center border-none cursor-pointer hover:bg-white-27 transition-colors z-10"
        >
          <Icon name="close" size={18} className="text-white-80" />
        </button>

        {tree ? (
          <div className="flex flex-col items-center gap-4 text-center relative z-10">
            {/* Header */}
            <div className="flex items-center gap-2">
              <Icon name="emoji_events" size={28} className="text-[#FFD700]" />
              <h2 className="text-2xl font-bold text-white">¡Felicidades!</h2>
            </div>

            {/* Tree image with glow */}
            <div className="w-[200px] h-[200px] flex items-center justify-center">
              <div
                className="w-40 h-40 rounded-full flex items-center justify-center"
                style={{
                  border: '3px solid #FFD70066',
                  boxShadow: '0 0 30px #FFD70044',
                }}
              >
                {tree.image_url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={tree.image_url}
                    alt={tree.tree_name}
                    className="w-full h-full object-cover rounded-full"
                  />
                ) : (
                  <Icon name="park" size={64} className="text-primary" />
                )}
              </div>
            </div>

            {/* Tree name */}
            <h3 className="text-2xl font-bold text-white">{tree.tree_name}</h3>

            {/* Rarity badge */}
            <Badge probability={tree.probability} />

            {/* Description */}
            {tree.description && (
              <p className="text-sm text-white-60 max-w-[360px] leading-relaxed">
                {tree.description}
              </p>
            )}

            {/* XP Reward pill */}
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-pill bg-[#FFD70022] border border-[#FFD70066]">
              <Icon name="timer" size={16} className="text-[#FFD700]" />
              <span className="text-sm font-medium text-[#FFD700]">+{tree.focus_minutes} min enfocados</span>
            </div>

            {/* Success alert */}
            <div className="w-full flex items-center gap-2 px-4 py-3 rounded-xl bg-[#2E8B5733]">
              <Icon name="check_circle" size={20} className="text-primary shrink-0" />
              <span className="text-sm text-white-80">Árbol agregado a tu colección!</span>
            </div>

            {/* Buttons */}
            <div className="w-full flex flex-col gap-2 mt-1">
              <Button icon="forest" onClick={onViewForest} fullWidth>
                Ver mi bosque
              </Button>
              <Button variant="outline" onClick={onClose} fullWidth>
                Cerrar
              </Button>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-4 text-center pt-4">
            <Icon name="warning" size={48} className="text-[#F59E0B]" />
            <h2 className="text-2xl font-bold text-white">Sin plantillas de árboles</h2>
            <p className="text-sm text-white-60">
              No hay plantillas de árboles disponibles en este momento.
              Tu pomodoro fue completado exitosamente.
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
