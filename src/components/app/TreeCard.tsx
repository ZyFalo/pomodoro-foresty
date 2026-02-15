'use client';

import { useState } from 'react';
import { Icon, Badge } from '@/components/ui';

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
  const [showMenu, setShowMenu] = useState(false);
  const [editing, setEditing] = useState(false);
  const [editName, setEditName] = useState(customName || name);

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
    <div className="group relative bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
      {/* Image */}
      <div className="aspect-square bg-gray-50 flex items-center justify-center p-4">
        {imageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={imageUrl} alt={displayName} className="w-full h-full object-contain" />
        ) : (
          <Icon name="park" size={48} className="text-primary/30" />
        )}
      </div>

      {/* Favorite button */}
      <button
        onClick={() => onToggleFavorite(id)}
        className="absolute top-2 right-2 w-8 h-8 rounded-full bg-white/80 backdrop-blur-sm flex items-center justify-center border-none cursor-pointer hover:bg-white transition-colors"
      >
        <Icon
          name="favorite"
          size={18}
          filled={isFavorite}
          className={isFavorite ? 'text-danger' : 'text-gray-400'}
        />
      </button>

      {/* Info */}
      <div className="p-3">
        {editing ? (
          <div className="flex gap-1">
            <input
              type="text"
              value={editName}
              onChange={(e) => setEditName(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleRename()}
              className="flex-1 text-sm px-2 py-1 border border-gray-300 rounded-md outline-none focus:border-primary"
              maxLength={50}
              autoFocus
            />
            <button onClick={handleRename} className="text-primary cursor-pointer border-none bg-transparent">
              <Icon name="check" size={18} />
            </button>
            <button onClick={() => setEditing(false)} className="text-gray-400 cursor-pointer border-none bg-transparent">
              <Icon name="close" size={18} />
            </button>
          </div>
        ) : (
          <h3 className="text-sm font-semibold text-gray-800 truncate">{displayName}</h3>
        )}

        <div className="flex items-center justify-between mt-1.5">
          <Badge probability={probability} />
          <span className="text-xs text-gray-400">{date}</span>
        </div>
      </div>

      {/* More menu */}
      <div className="absolute top-2 left-2 opacity-0 group-hover:opacity-100 transition-opacity">
        <button
          onClick={() => setShowMenu(!showMenu)}
          className="w-7 h-7 rounded-full bg-white/80 backdrop-blur-sm flex items-center justify-center border-none cursor-pointer hover:bg-white"
        >
          <Icon name="more_vert" size={16} className="text-gray-600" />
        </button>
        {showMenu && (
          <div className="absolute top-8 left-0 bg-white rounded-lg shadow-lg border border-gray-200 py-1 min-w-[120px] z-10">
            <button
              onClick={() => { setEditing(true); setShowMenu(false); }}
              className="w-full px-3 py-1.5 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2 border-none bg-transparent cursor-pointer"
            >
              <Icon name="edit" size={14} /> Renombrar
            </button>
            <button
              onClick={() => { onDelete(id); setShowMenu(false); }}
              className="w-full px-3 py-1.5 text-left text-sm text-danger hover:bg-red-50 flex items-center gap-2 border-none bg-transparent cursor-pointer"
            >
              <Icon name="delete" size={14} /> Eliminar
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
