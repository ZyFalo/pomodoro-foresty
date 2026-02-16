'use client';

import Link from 'next/link';
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
    if (min < 60) return `${min}`;
    const h = Math.floor(min / 60);
    const m = min % 60;
    return m > 0 ? `${h}h ${m}` : `${h}h`;
  };

  return (
    <div className="flex-1 px-8 py-8 max-w-6xl mx-auto w-full">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold text-white mb-2">Mi Bosque</h1>
        <p className="text-base text-white/70">
          Observa cómo crece tu bosque con cada sesión Pomodoro completada
        </p>
      </div>

      {/* Stats */}
      {stats && (
        <div className="space-y-4 mb-6">
          <StatsRow
            stats={[
              { icon: 'park', label: 'Árboles Coleccionados', value: stats.total_trees },
              { icon: 'timer', label: 'Pomodoros Completados', value: stats.pomodoros_completed },
              { icon: 'schedule', label: 'Minutos Enfocados', value: formatMinutes(stats.total_focus_minutes) },
            ]}
          />
          <CollectionProgress
            unique={stats.collection.unique}
            total={stats.collection.total}
            progress={stats.collection.progress}
          />
        </div>
      )}

      {/* Motivational Banner */}
      <div className="bg-primary/20 backdrop-blur-md rounded-2xl border border-primary/30 px-6 py-5 mb-6 flex items-center gap-4">
        <div className="w-12 h-12 rounded-full bg-primary/30 flex items-center justify-center shrink-0">
          <Icon name="lightbulb" size={24} className="text-yellow-300" />
        </div>
        <div>
          <h3 className="text-base font-semibold text-white mb-0.5">Cultiva tu bosque!</h3>
          <p className="text-sm text-white/70">
            Cada sesión Pomodoro completada te acerca a descubrir especies únicas. Mantén tu racha para desbloquear árboles legendarios.
          </p>
        </div>
      </div>

      {/* Collection Section */}
      <div className="bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 p-6">
        {/* Collection Header */}
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-3">
            <h2 className="text-xl font-bold text-white">Mi Colección</h2>
            {stats && (
              <span className="bg-white/15 text-white/80 text-xs font-medium px-2.5 py-1 rounded-full">
                {stats.total_trees}
              </span>
            )}
          </div>
          <Link
            href="/pomodoro"
            className="flex items-center gap-1.5 px-4 py-2 bg-primary hover:bg-primary-dark text-white text-sm font-medium rounded-xl transition-colors no-underline"
          >
            <Icon name="add" size={18} />
            Ganar más árboles
          </Link>
        </div>

        {/* Filters */}
        <div className="mb-5">
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
          search || rarity || favorite ? (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <div className="w-20 h-20 rounded-full bg-white/10 flex items-center justify-center mb-4">
                <Icon name="park" size={40} className="text-white/40" />
              </div>
              <h2 className="text-lg font-semibold text-white mb-1">Sin resultados</h2>
              <p className="text-sm text-white/50 max-w-xs">Intenta con otros filtros</p>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              {/* Icon + Title + Description */}
              <div className="w-20 h-20 rounded-full bg-white/10 flex items-center justify-center mb-4">
                <Icon name="park" size={40} className="text-white/40" />
              </div>
              <h2 className="text-lg font-semibold text-white mb-1">Tu bosque está vacío</h2>
              <p className="text-sm text-white/50 max-w-xs mb-6">
                Completa sesiones de Pomodoro para ganar árboles y comenzar tu colección
              </p>

              {/* Progress pill */}
              <div className="bg-[#2E8B5722] border border-[#2E8B5744] rounded-full px-4 py-2 flex items-center gap-2 mb-8">
                <Icon name="target" size={18} className="text-[#4CAF50]" />
                <span className="text-white font-bold text-sm">
                  {stats?.total_trees ?? 0}/1 primer árbol
                </span>
              </div>

              {/* How it works section */}
              <div className="w-full max-w-lg">
                <h3 className="text-base font-bold text-white mb-4">¿Cómo funciona?</h3>
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { step: 1, icon: 'timer', text: 'Configura tu timer y enfócate' },
                    { step: 2, icon: 'check_circle', text: 'Completa la sesión Pomodoro' },
                    { step: 3, icon: 'park', text: 'Gana un árbol aleatorio para tu bosque!' },
                  ].map(({ step, icon, text }) => (
                    <div
                      key={step}
                      className="bg-white/5 border border-white/10 rounded-xl p-4 flex flex-col items-center gap-2.5"
                    >
                      <div className="w-9 h-9 rounded-full bg-primary flex items-center justify-center">
                        <span className="text-white font-bold text-sm">{step}</span>
                      </div>
                      <Icon name={icon} size={24} className="text-white/60" />
                      <p className="text-xs text-white/80 text-center m-0">{text}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* CTA Button */}
              <Link
                href="/pomodoro"
                className="mt-8 inline-flex items-center gap-2 px-8 py-3 bg-gradient-to-r from-[#2E8B57] to-[#1B5E20] text-white font-semibold rounded-full no-underline hover:opacity-90 transition-opacity"
              >
                <Icon name="schedule" size={20} />
                Iniciar Pomodoro
              </Link>
            </div>
          )
        ) : (
          <>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {trees.map((tree) => (
                <TreeCard
                  key={tree.id}
                  id={tree.id}
                  name={tree.template.name}
                  customName={tree.customName}
                  imageUrl={tree.template.imageUrl}
                  probability={tree.template.probability}
                  isFavorite={tree.isFavorite}
                  earnedAt={tree.earnedAt}
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
                  className="w-9 h-9 rounded-lg bg-white/10 flex items-center justify-center border border-white/20 disabled:opacity-40 cursor-pointer disabled:cursor-not-allowed text-white hover:bg-white/20 transition-colors"
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
                        : 'bg-white/10 text-white/70 border border-white/20 hover:bg-white/20'
                    }`}
                  >
                    {p}
                  </button>
                ))}
                <button
                  onClick={() => fetchTrees(pagination.page + 1)}
                  disabled={pagination.page >= pagination.pages}
                  className="w-9 h-9 rounded-lg bg-white/10 flex items-center justify-center border border-white/20 disabled:opacity-40 cursor-pointer disabled:cursor-not-allowed text-white hover:bg-white/20 transition-colors"
                >
                  <Icon name="chevron_right" size={18} />
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
