'use client';

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

function getStarsForProbability(probability: number): number {
  if (probability <= 2) return 5;  // Legendario
  if (probability <= 5) return 4;  // Épico
  if (probability <= 10) return 3; // Raro
  if (probability <= 15) return 2; // Poco común
  return 1;                        // Común
}

interface ConfettiPiece {
  color: string;
  size: number;
  top?: string;
  bottom?: string;
  left?: string;
  right?: string;
  delay: string;
  shape: 'rect' | 'circle';
}

const CONFETTI_PIECES: ConfettiPiece[] = [
  { color: '#FFD700', size: 8, top: '8%', left: '10%', delay: '0s', shape: 'rect' },
  { color: '#2E8B57', size: 6, top: '12%', right: '12%', delay: '0.2s', shape: 'circle' },
  { color: '#9333EA', size: 7, bottom: '15%', left: '8%', delay: '0.4s', shape: 'rect' },
  { color: '#3B82F6', size: 5, top: '20%', left: '85%', delay: '0.1s', shape: 'circle' },
  { color: '#FF6B6B', size: 6, bottom: '20%', right: '10%', delay: '0.3s', shape: 'rect' },
  { color: '#FFD700', size: 5, top: '5%', left: '50%', delay: '0.5s', shape: 'circle' },
  { color: '#22C55E', size: 7, bottom: '8%', left: '40%', delay: '0.15s', shape: 'rect' },
  { color: '#F59E0B', size: 6, top: '15%', right: '30%', delay: '0.35s', shape: 'circle' },
];

export function TreeEarnedModal({ open, tree, onClose, onViewForest }: TreeEarnedModalProps) {
  return (
    <Modal open={open} onClose={onClose}>
      <div className="relative bg-white-10 border border-white-20 rounded-3xl backdrop-blur-[15px] p-8 max-w-sm w-full mx-4">
        {/* Confetti */}
        {tree && CONFETTI_PIECES.map((piece, i) => (
          <div
            key={i}
            className="absolute animate-pulse"
            style={{
              width: piece.size,
              height: piece.size,
              backgroundColor: piece.color,
              borderRadius: piece.shape === 'circle' ? '50%' : '2px',
              top: piece.top,
              bottom: piece.bottom,
              left: piece.left,
              right: piece.right,
              animationDelay: piece.delay,
              opacity: 0.7,
            }}
          />
        ))}

        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white-15 flex items-center justify-center border-none cursor-pointer hover:bg-white-27 transition-colors"
        >
          <Icon name="close" size={18} className="text-white-80" />
        </button>

        {tree ? (
          <div className="flex flex-col items-center gap-4 text-center">
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
                    className="w-32 h-32 object-contain"
                  />
                ) : (
                  <Icon name="park" size={64} className="text-primary" />
                )}
              </div>
            </div>

            {/* Tree name */}
            <h3 className="text-2xl font-bold text-white">{tree.tree_name}</h3>

            {/* Stars */}
            <div className="flex gap-1">
              {Array.from({ length: 5 }, (_, i) => (
                <Icon
                  key={i}
                  name="star"
                  size={20}
                  className={i < getStarsForProbability(tree.probability) ? 'text-[#FFD700]' : 'text-white-20'}
                />
              ))}
            </div>

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
