'use client';

import { useState } from 'react';
import { Icon, Badge, ConfirmModal } from '@/components/ui';

interface TreeCardProps {
  id: string;
  name: string;
  customName?: string;
  imageUrl: string;
  probability: number;
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
  probability,
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
    <div className="relative bg-white/15 backdrop-blur-md rounded-2xl border border-white/20 overflow-hidden hover:bg-white/20 transition-colors">
      {/* Image */}
      <div className="h-[180px] w-full overflow-hidden">
        {imageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={imageUrl} alt={displayName} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-white/5">
            <Icon name="park" size={48} className="text-white/30" />
          </div>
        )}
      </div>

      {/* Favorite button */}
      <button
        onClick={() => onToggleFavorite(id)}
        className="absolute top-2 right-2 w-8 h-8 rounded-full bg-black/30 backdrop-blur-sm flex items-center justify-center border-none cursor-pointer hover:bg-black/50 transition-colors"
      >
        <Icon
          name="favorite"
          size={18}
          filled={isFavorite}
          className={isFavorite ? 'text-danger' : 'text-white/70'}
        />
      </button>

      {/* Content */}
      <div className="p-4 bg-black/10">
        {editing ? (
          <div className="flex gap-1 mb-2">
            <input
              type="text"
              value={editName}
              onChange={(e) => setEditName(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleRename()}
              className="flex-1 text-sm px-2 py-1 bg-white/10 border border-white/30 rounded-lg outline-none focus:border-primary text-white"
              maxLength={50}
              autoFocus
            />
            <button onClick={handleRename} className="text-primary cursor-pointer border-none bg-transparent">
              <Icon name="check" size={18} />
            </button>
            <button onClick={() => setEditing(false)} className="text-white/50 cursor-pointer border-none bg-transparent">
              <Icon name="close" size={18} />
            </button>
          </div>
        ) : (
          <h3 className="text-lg font-bold text-white truncate mb-1">{displayName}</h3>
        )}

        <div className="flex items-center justify-between mb-3">
          <Badge probability={probability} />
          <span className="text-xs text-white/50">{date}</span>
        </div>

        {/* Action buttons */}
        <div className="flex gap-2">
          <button
            onClick={() => { setEditing(true); setEditName(customName || name); }}
            className="flex-1 flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/10 border border-white/20 text-white/80 text-xs font-medium cursor-pointer hover:bg-white/20 transition-colors"
          >
            <Icon name="edit" size={14} />
            Personalizar
          </button>
          <button
            onClick={() => setShowDeleteConfirm(true)}
            className="flex items-center justify-center px-3 py-1.5 rounded-lg bg-white/10 border border-white/20 text-danger/80 text-xs font-medium cursor-pointer hover:bg-danger/10 hover:border-danger/30 transition-colors"
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
