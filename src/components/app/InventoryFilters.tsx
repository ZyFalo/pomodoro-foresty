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
            className={`px-3.5 py-1.5 rounded-pill text-xs font-medium cursor-pointer transition-all duration-200 ${
              rarity === opt.value
                ? 'bg-gradient-to-br from-primary to-primary-dark text-white border border-primary/50 shadow-[0_4px_14px_rgba(46,139,87,0.35)]'
                : 'bg-white-5 text-white-60 border border-white-15 hover:bg-white-10 hover:text-white hover:border-white-27'
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
          className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-pill text-xs font-medium cursor-pointer transition-all duration-200 ${
            favorite
              ? 'bg-danger/20 text-danger border border-danger/40 shadow-[0_0_14px_rgba(239,68,68,0.25)]'
              : 'bg-white-5 text-white-60 border border-white-15 hover:bg-white-10 hover:text-white hover:border-white-27'
          }`}
        >
          <Icon name="favorite" size={14} filled={favorite} />
          Favoritos
        </button>

        {/* Search */}
        <div className="relative group">
          <Icon name="search" size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-white-40 transition-colors group-focus-within:text-accent-green" />
          <input
            type="text"
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Buscar..."
            className="pl-9 pr-3 py-1.5 text-xs bg-white-5 border border-white-15 rounded-pill outline-none focus:border-primary focus:ring-2 focus:ring-primary/25 text-white placeholder:text-white-40 w-36 transition-all duration-200"
          />
        </div>
      </div>
    </div>
  );
}
