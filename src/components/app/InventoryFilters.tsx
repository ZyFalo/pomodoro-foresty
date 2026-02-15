'use client';

import { Icon } from '@/components/ui';

const RARITY_OPTIONS = [
  { label: 'Todos', value: '' },
  { label: 'Común', value: 'Común' },
  { label: 'Poco común', value: 'Poco común' },
  { label: 'Raro', value: 'Raro' },
  { label: 'Épico', value: 'Épico' },
  { label: 'Legendario', value: 'Legendario' },
] as const;

interface InventoryFiltersProps {
  rarity: string;
  favorite: boolean;
  search: string;
  onRarityChange: (rarity: string) => void;
  onFavoriteChange: (favorite: boolean) => void;
  onSearchChange: (search: string) => void;
}

export function InventoryFilters({
  rarity,
  favorite,
  search,
  onRarityChange,
  onFavoriteChange,
  onSearchChange,
}: InventoryFiltersProps) {
  return (
    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
      {/* Rarity pills */}
      <div className="flex flex-wrap gap-1.5">
        {RARITY_OPTIONS.map((opt) => (
          <button
            key={opt.value}
            onClick={() => onRarityChange(opt.value)}
            className={`px-3 py-1.5 rounded-pill text-xs font-medium border-none cursor-pointer transition-colors ${
              rarity === opt.value
                ? 'bg-primary text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            {opt.label}
          </button>
        ))}
      </div>

      <div className="flex items-center gap-2 ml-auto">
        {/* Favorite toggle */}
        <button
          onClick={() => onFavoriteChange(!favorite)}
          className={`flex items-center gap-1 px-3 py-1.5 rounded-pill text-xs font-medium border-none cursor-pointer transition-colors ${
            favorite
              ? 'bg-danger/10 text-danger'
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
        >
          <Icon name="favorite" size={14} filled={favorite} />
          Favoritos
        </button>

        {/* Search */}
        <div className="relative">
          <Icon name="search" size={16} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Buscar..."
            className="pl-8 pr-3 py-1.5 text-xs border border-gray-200 rounded-pill outline-none focus:border-primary w-36"
          />
        </div>
      </div>
    </div>
  );
}
