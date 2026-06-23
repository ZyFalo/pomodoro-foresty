'use client';

import { useState } from 'react';
import { Icon, Badge, ConfirmModal } from '@/components/ui';
import type { Rarity } from '@/types';

interface TreeCardProps {
  id: string;
  name: string;
  customName?: string;
  imageUrl: string;
  rarity: Rarity;
  isFavorite: boolean;
  earnedAt: string;
  onToggleFavorite: (id: string) => void;
  onRename: (id: string, name: string) => void;
  onDelete: (id: string) => void;
}

export function TreeCard({
  id,
  name,
  customName,
  imageUrl,
  rarity,
  isFavorite,
  earnedAt,
  onToggleFavorite,
  onRename,
  onDelete,
}: TreeCardProps) {
  const [editing, setEditing] = useState(false);
  const [editName, setEditName] = useState(customName || name);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const displayName = customName || name;
  const date = new Date(earnedAt).toLocaleDateString('es-ES', {
    day: 'numeric',
    month: 'short',
  });

  const handleRename = () => {
    if (editName.trim()) {
      onRename(id, editName.trim());
      setEditing(false);
    }
  };

  return (
    <div className="group relative bg-white-8 border border-white-15 rounded-2xl backdrop-blur-[14px] overflow-hidden shadow-[0_8px_28px_rgba(0,0,0,0.28)] transition-all duration-300 hover:-translate-y-1 hover:border-white-27 hover:shadow-[0_20px_44px_rgba(0,0,0,0.4)]">
      {/* Image */}
      <div className="relative h-[180px] w-full overflow-hidden">
        {imageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={imageUrl}
            alt={displayName}
            className="w-full h-full object-cover transition-transform duration-500 ease-out group-hover:scale-110"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-forest-800">
            <Icon name="park" size={48} className="text-white-20" />
          </div>
        )}
        {/* Gradient scrim for depth + legibility */}
        <div className="absolute inset-0 bg-gradient-to-t from-forest-950/70 via-transparent to-transparent pointer-events-none" />
      </div>

      {/* Favorite button */}
      <button
        onClick={() => onToggleFavorite(id)}
        aria-label={isFavorite ? 'Quitar de favoritos' : 'Marcar como favorito'}
        className={`absolute top-2.5 right-2.5 w-9 h-9 rounded-full backdrop-blur-md flex items-center justify-center border cursor-pointer transition-all duration-200 hover:scale-110 ${
          isFavorite
            ? 'bg-danger/20 border-danger/40 shadow-[0_0_14px_rgba(239,68,68,0.35)]'
            : 'bg-forest-950/40 border-white-15 hover:bg-forest-950/60'
        }`}
      >
        <Icon
          name="favorite"
          size={18}
          filled={isFavorite}
          className={isFavorite ? 'text-danger' : 'text-white-60'}
        />
      </button>

      {/* Content */}
      <div className="p-4">
        {editing ? (
          <div className="flex gap-1 mb-2">
            <input
              type="text"
              value={editName}
              onChange={(e) => setEditName(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleRename()}
              className="flex-1 text-sm px-2.5 py-1.5 bg-white-10 border border-white-20 rounded-lg outline-none focus:border-primary focus:ring-2 focus:ring-primary/30 text-white"
              maxLength={50}
              autoFocus
            />
            <button onClick={handleRename} aria-label="Guardar nombre" className="w-8 flex items-center justify-center text-accent-green cursor-pointer border-none bg-transparent hover:scale-110 transition-transform">
              <Icon name="check" size={18} />
            </button>
            <button onClick={() => setEditing(false)} aria-label="Cancelar" className="w-8 flex items-center justify-center text-white-50 cursor-pointer border-none bg-transparent hover:text-white transition-colors">
              <Icon name="close" size={18} />
            </button>
          </div>
        ) : (
          <h3 className="font-display text-lg font-semibold text-white truncate mb-1.5">{displayName}</h3>
        )}

        <div className="flex items-center justify-between mb-3.5">
          <Badge rarity={rarity} />
          <span className="flex items-center gap-1 text-xs text-white-40">
            <Icon name="schedule" size={12} />
            {date}
          </span>
        </div>

        {/* Action buttons */}
        <div className="flex gap-2">
          <button
            onClick={() => { setEditing(true); setEditName(customName || name); }}
            className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-white-8 border border-white-15 text-white-80 text-xs font-medium cursor-pointer hover:bg-white-15 hover:text-white transition-all duration-200"
          >
            <Icon name="edit" size={14} />
            Personalizar
          </button>
          <button
            onClick={() => setShowDeleteConfirm(true)}
            aria-label="Eliminar árbol"
            className="flex items-center justify-center px-3 py-2 rounded-xl bg-white-8 border border-white-15 text-danger/80 text-xs font-medium cursor-pointer hover:bg-danger/15 hover:border-danger/40 hover:text-danger transition-all duration-200"
          >
            <Icon name="delete" size={14} />
          </button>
        </div>
      </div>

      <ConfirmModal
        open={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        onConfirm={() => { onDelete(id); setShowDeleteConfirm(false); }}
        title="Eliminar árbol"
        message={`¿Estás seguro de que deseas eliminar **${displayName}**? Esta acción no se puede deshacer.`}
        confirmLabel="Eliminar"
      />
    </div>
  );
}
