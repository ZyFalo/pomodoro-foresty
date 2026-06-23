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

// Etiqueta amable para una fecha de cosecha (estilo Forest: Hoy / Ayer / fecha)
function dayLabel(iso: string): string {
  const d = new Date(iso);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const that = new Date(d);
  that.setHours(0, 0, 0, 0);
  const diff = Math.round((today.getTime() - that.getTime()) / 86400000);
  if (diff <= 0) return 'Hoy';
  if (diff === 1) return 'Ayer';
  return d.toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long' });
}

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

  // Agrupar por día (parcelas); trees ya viene ordenado por earnedAt desc
  const dayEntries = Object.entries(
    trees.reduce((acc, t) => {
      const key = new Date(t.earnedAt).toDateString();
      (acc[key] ??= []).push(t);
      return acc;
    }, {} as Record<string, typeof trees>)
  );

  return (
    <div className="flex-1 px-4 sm:px-8 py-10 max-w-6xl mx-auto w-full">
      {/* Header */}
      <div className="text-center mb-8 animate-fade-up">
        <h1 className="font-display text-4xl font-semibold text-white mb-2 tracking-tight">Mi Bosque</h1>
        <p className="text-base text-white-60">
          Observa cómo crece tu bosque con cada sesión Pomodoro completada
        </p>
      </div>

      {/* Stats */}
      {stats && (
        <div className="space-y-4 mb-6 animate-fade-up [animation-delay:80ms]">
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
      <div className="relative overflow-hidden bg-gradient-to-br from-primary/20 to-primary-dark/10 backdrop-blur-[14px] rounded-2xl border border-primary/30 px-6 py-5 mb-6 flex items-center gap-4 shadow-[0_8px_32px_rgba(0,0,0,0.2)] animate-fade-up [animation-delay:160ms]">
        <div className="w-12 h-12 rounded-2xl bg-amber/15 border border-amber/30 flex items-center justify-center shrink-0">
          <Icon name="lightbulb" size={24} className="text-amber-soft" filled />
        </div>
        <div>
          <h3 className="font-display text-base font-semibold text-white mb-0.5">¡Cultiva tu bosque!</h3>
          <p className="text-sm text-white-60 leading-relaxed">
            Cada sesión Pomodoro completada te acerca a descubrir especies únicas. Mantén tu racha para desbloquear árboles legendarios.
          </p>
        </div>
      </div>

      {/* Collection Section */}
      <div className="bg-white-8 backdrop-blur-[14px] rounded-[20px] border border-white-15 p-6 shadow-[0_8px_32px_rgba(0,0,0,0.24)] animate-fade-up [animation-delay:240ms]">
        {/* Collection Header */}
        <div className="flex items-center justify-between gap-3 mb-5 flex-wrap">
          <div className="flex items-center gap-3">
            <h2 className="font-display text-xl font-semibold text-white">Mi Colección</h2>
            {stats && (
              <span className="bg-white-10 border border-white-15 text-white-80 text-xs font-semibold px-2.5 py-1 rounded-full tabular-nums">
                {stats.total_trees}
              </span>
            )}
          </div>
          <Link
            href="/pomodoro"
            className="group flex items-center gap-1.5 px-4 py-2.5 bg-gradient-to-br from-primary to-primary-dark text-white text-sm font-semibold rounded-pill shadow-[0_4px_16px_rgba(46,139,87,0.35)] hover:shadow-[0_8px_28px_rgba(46,139,87,0.5)] hover:-translate-y-0.5 transition-all duration-200 no-underline"
          >
            <Icon name="add" size={18} className="transition-transform duration-200 group-hover:scale-110" />
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
            <div className="space-y-7">
              {dayEntries.map(([dateStr, dayTrees]) => (
                <section key={dateStr}>
                  {/* Cabecera del día */}
                  <div className="flex items-center gap-2.5 mb-3">
                    <Icon name="eco" size={16} className="text-accent-green" filled />
                    <h3 className="font-display text-base font-semibold text-white capitalize">
                      {dayLabel(dayTrees[0].earnedAt)}
                    </h3>
                    <span className="text-xs text-white-40 tabular-nums">
                      · {dayTrees.length} {dayTrees.length === 1 ? 'árbol' : 'árboles'}
                    </span>
                    <div className="flex-1 h-px bg-gradient-to-r from-white-15 to-transparent ml-1" />
                  </div>
                  {/* Parcela: los árboles plantados ese día */}
                  <div className="relative rounded-2xl bg-gradient-to-b from-white-5 to-primary/5 border border-white-8 px-4 pt-4 pb-5">
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                      {dayTrees.map((tree) => (
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
                    {/* Línea de suelo */}
                    <div className="mt-4 h-px bg-gradient-to-r from-transparent via-primary/40 to-transparent" />
                  </div>
                </section>
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
