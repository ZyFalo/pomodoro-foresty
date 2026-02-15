'use client';

import { useTrees } from '@/hooks/useTrees';
import {
  TreeCard,
  InventoryFilters,
  StatsRow,
  CollectionProgress,
} from '@/components/app';
import { Icon } from '@/components/ui';

export default function InventoryPage() {
  const {
    trees,
    pagination,
    stats,
    loading,
    rarity,
    favorite,
    search,
    setRarity,
    setFavorite,
    setSearch,
    fetchTrees,
    toggleFavorite,
    renameTree,
    deleteTree,
  } = useTrees();

  const formatMinutes = (min: number) => {
    if (min < 60) return `${min}m`;
    const h = Math.floor(min / 60);
    const m = min % 60;
    return m > 0 ? `${h}h ${m}m` : `${h}h`;
  };

  return (
    <div className="flex-1 px-8 py-6 max-w-6xl mx-auto w-full">
      {/* Header */}
      <h1 className="text-2xl font-bold text-white mb-6">Mi Bosque</h1>

      {/* Stats */}
      {stats && (
        <div className="space-y-3 mb-6">
          <StatsRow
            stats={[
              { icon: 'timer', label: 'Pomodoros', value: stats.pomodoros_completed },
              { icon: 'schedule', label: 'Tiempo total', value: formatMinutes(stats.total_focus_minutes) },
              { icon: 'park', label: 'Árboles', value: stats.total_trees },
              { icon: 'emoji_events', label: 'Legendarios', value: stats.by_rarity['Legendario'] || 0 },
            ]}
          />
          <CollectionProgress
            unique={stats.collection.unique}
            total={stats.collection.total}
            progress={stats.collection.progress}
          />
        </div>
      )}

      {/* Filters */}
      <div className="bg-white rounded-xl px-4 py-3 shadow-sm border border-gray-100 mb-6">
        <InventoryFilters
          rarity={rarity}
          favorite={favorite}
          search={search}
          onRarityChange={setRarity}
          onFavoriteChange={setFavorite}
          onSearchChange={setSearch}
        />
      </div>

      {/* Tree grid */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <span className="animate-spin h-8 w-8 border-3 border-white border-t-transparent rounded-full" />
        </div>
      ) : trees.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="w-20 h-20 rounded-full bg-white-10 flex items-center justify-center mb-4">
            <Icon name="park" size={40} className="text-white-40" />
          </div>
          <h2 className="text-lg font-semibold text-white mb-1">
            {search || rarity || favorite ? 'Sin resultados' : 'Tu bosque está vacío'}
          </h2>
          <p className="text-sm text-white-50 max-w-xs">
            {search || rarity || favorite
              ? 'Intenta con otros filtros'
              : 'Completa sesiones de Pomodoro para ganar árboles y comenzar tu colección'}
          </p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {trees.map((tree) => (
              <TreeCard
                key={tree._id}
                id={tree._id}
                name={tree.template.name}
                customName={tree.custom_name}
                imageUrl={tree.template.image_url}
                probability={tree.template.probability}
                isFavorite={tree.is_favorite}
                earnedAt={tree.earned_at}
                onToggleFavorite={toggleFavorite}
                onRename={renameTree}
                onDelete={deleteTree}
              />
            ))}
          </div>

          {/* Pagination */}
          {pagination.pages > 1 && (
            <div className="flex items-center justify-center gap-2 mt-8">
              <button
                onClick={() => fetchTrees(pagination.page - 1)}
                disabled={pagination.page <= 1}
                className="w-9 h-9 rounded-lg bg-white flex items-center justify-center border border-gray-200 disabled:opacity-40 cursor-pointer disabled:cursor-not-allowed"
              >
                <Icon name="chevron_left" size={18} />
              </button>
              {Array.from({ length: pagination.pages }, (_, i) => i + 1).map((p) => (
                <button
                  key={p}
                  onClick={() => fetchTrees(p)}
                  className={`w-9 h-9 rounded-lg flex items-center justify-center text-sm font-medium border-none cursor-pointer transition-colors ${
                    p === pagination.page
                      ? 'bg-primary text-white'
                      : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
                  }`}
                >
                  {p}
                </button>
              ))}
              <button
                onClick={() => fetchTrees(pagination.page + 1)}
                disabled={pagination.page >= pagination.pages}
                className="w-9 h-9 rounded-lg bg-white flex items-center justify-center border border-gray-200 disabled:opacity-40 cursor-pointer disabled:cursor-not-allowed"
              >
                <Icon name="chevron_right" size={18} />
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
