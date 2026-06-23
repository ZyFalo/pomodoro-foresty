'use client';

import { useState, useEffect } from 'react';
import { useAuthStore } from '@/stores/auth-store';
import { Icon } from '@/components/ui';
import { RARITY_CONFIG } from '@/lib/utils/constants';

interface DashboardData {
  total_users: number;
  active_users: number;
  total_templates: number;
  total_trees: number;
  total_sessions: number;
  by_rarity: Record<string, number>;
  recent_activity: Array<{
    id: string;
    eventType: string;
    detail: string;
    createdAt: string;
    user: { username: string } | null;
  }>;
}

export default function AdminDashboard() {
  const { token } = useAuthStore();
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch('/api/admin/dashboard', {
          headers: { Authorization: `Bearer ${token}` },
        });
        const json = await res.json();
        if (res.ok) setData(json);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    if (token) load();
  }, [token]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <span className="animate-spin h-8 w-8 border-3 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!data) return <p className="text-white-50">Error al cargar datos</p>;

  const statCards = [
    { icon: 'group', label: 'Usuarios', value: data.total_users, color: 'text-blue', glow: 'rgba(59,130,246,0.18)' },
    { icon: 'timer', label: 'Sesiones', value: data.total_sessions, color: 'text-primary-light', glow: 'rgba(46,139,87,0.20)' },
    { icon: 'park', label: 'Árboles', value: data.total_trees, color: 'text-success', glow: 'rgba(34,197,94,0.18)' },
    { icon: 'category', label: 'Plantillas', value: data.total_templates, color: 'text-purple', glow: 'rgba(147,51,234,0.18)' },
  ];

  return (
    <div className="animate-fade-up">
      <div className="mb-8">
        <h1 className="font-display text-3xl font-semibold text-white">Dashboard</h1>
        <p className="text-sm text-white-50 mt-1">Visión general de Pomodoro Forest</p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8 stagger">
        {statCards.map((s) => (
          <div
            key={s.label}
            className="group relative overflow-hidden rounded-2xl bg-[#0E1A12]/80 border border-white-10 p-5 backdrop-blur-[20px] shadow-[0_16px_40px_rgba(0,0,0,0.35),inset_0_1px_0_rgba(255,255,255,0.06)] transition-all duration-200 hover:-translate-y-0.5 hover:border-white-20"
          >
            <div
              className="absolute -top-10 -right-10 w-28 h-28 rounded-full blur-2xl opacity-60 transition-opacity group-hover:opacity-100"
              style={{ backgroundColor: s.glow }}
            />
            <div className="relative">
              <div className="w-11 h-11 rounded-2xl bg-white-5 border border-white-10 flex items-center justify-center mb-4">
                <Icon name={s.icon} size={22} className={s.color} />
              </div>
              <p className="font-display text-3xl font-semibold text-white leading-none">{s.value}</p>
              <p className="text-sm text-white-50 mt-1.5">{s.label}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Rarity distribution */}
        <div className="rounded-2xl bg-[#0E1A12]/80 border border-white-10 p-6 backdrop-blur-[20px] shadow-[0_16px_40px_rgba(0,0,0,0.35),inset_0_1px_0_rgba(255,255,255,0.06)] animate-fade-up [animation-delay:120ms]">
          <h2 className="font-display text-lg font-semibold text-white mb-5">Distribución por rareza</h2>
          <div className="space-y-3.5">
            {RARITY_CONFIG.map((r) => {
              const count = data.by_rarity[r.name] || 0;
              const maxCount = Math.max(...Object.values(data.by_rarity), 1);
              const width = (count / maxCount) * 100;
              return (
                <div key={r.name} className="flex items-center gap-3">
                  <span className="text-xs font-medium text-white-60 w-24 truncate">{r.name}</span>
                  <div className="flex-1 h-6 bg-white-5 border border-white-10 rounded-pill overflow-hidden">
                    <div
                      className="h-full rounded-pill transition-all duration-500"
                      style={{ width: `${width}%`, backgroundColor: r.color, boxShadow: `0 0 12px ${r.color}66` }}
                    />
                  </div>
                  <span className="text-sm font-semibold text-white-80 w-8 text-right tabular-nums">{count}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Recent activity */}
        <div className="rounded-2xl bg-[#0E1A12]/80 border border-white-10 p-6 backdrop-blur-[20px] shadow-[0_16px_40px_rgba(0,0,0,0.35),inset_0_1px_0_rgba(255,255,255,0.06)] animate-fade-up [animation-delay:200ms]">
          <h2 className="font-display text-lg font-semibold text-white mb-5">Actividad reciente</h2>
          <div className="space-y-1">
            {data.recent_activity.map((log) => (
              <div key={log.id} className="flex items-start gap-3 py-2.5 border-b border-white-10 last:border-0">
                <div className="w-8 h-8 rounded-full bg-white-5 border border-white-10 flex items-center justify-center shrink-0 mt-0.5">
                  <Icon name="history" size={14} className="text-white-50" />
                </div>
                <div className="min-w-0">
                  <p className="text-sm text-white-80 truncate">{log.detail}</p>
                  <p className="text-xs text-white-40 mt-0.5">
                    {log.user && typeof log.user === 'object' ? log.user.username : '—'} ·{' '}
                    {new Date(log.createdAt).toLocaleString('es-ES', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
              </div>
            ))}
            {data.recent_activity.length === 0 && (
              <p className="text-sm text-white-40 text-center py-8">Sin actividad reciente</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
