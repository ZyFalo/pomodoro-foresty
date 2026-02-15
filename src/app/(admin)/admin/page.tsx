'use client';

import { useState, useEffect } from 'react';
import { useAuthStore } from '@/stores/auth-store';
import { Icon } from '@/components/ui';
import { RARITY_RANGES } from '@/lib/utils/constants';

interface DashboardData {
  total_users: number;
  active_users: number;
  total_templates: number;
  total_trees: number;
  total_sessions: number;
  by_rarity: Record<string, number>;
  recent_activity: Array<{
    _id: string;
    event_type: string;
    detail: string;
    created_at: string;
    user_id: { username: string } | null;
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

  if (!data) return <p className="p-8 text-gray-500">Error al cargar datos</p>;

  const statCards = [
    { icon: 'group', label: 'Usuarios', value: data.total_users, color: 'text-blue' },
    { icon: 'timer', label: 'Sesiones', value: data.total_sessions, color: 'text-primary' },
    { icon: 'park', label: 'Árboles', value: data.total_trees, color: 'text-success' },
    { icon: 'category', label: 'Plantillas', value: data.total_templates, color: 'text-purple' },
  ];

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Dashboard</h1>

      {/* Stat cards */}
      <div className="grid grid-cols-4 gap-4 mb-8">
        {statCards.map((s) => (
          <div key={s.label} className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between mb-3">
              <Icon name={s.icon} size={24} className={s.color} />
            </div>
            <p className="text-2xl font-bold text-gray-800">{s.value}</p>
            <p className="text-sm text-gray-500">{s.label}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-6">
        {/* Rarity distribution */}
        <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Distribución por rareza</h2>
          <div className="space-y-3">
            {RARITY_RANGES.map((r) => {
              const count = data.by_rarity[r.name] || 0;
              const maxCount = Math.max(...Object.values(data.by_rarity), 1);
              const width = (count / maxCount) * 100;
              return (
                <div key={r.name} className="flex items-center gap-3">
                  <span className="text-xs font-medium text-gray-600 w-24">{r.name}</span>
                  <div className="flex-1 h-6 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all"
                      style={{ width: `${width}%`, backgroundColor: r.color }}
                    />
                  </div>
                  <span className="text-sm font-medium text-gray-700 w-8 text-right">{count}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Recent activity */}
        <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Actividad reciente</h2>
          <div className="space-y-2">
            {data.recent_activity.map((log) => (
              <div key={log._id} className="flex items-start gap-3 py-2 border-b border-gray-50 last:border-0">
                <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center shrink-0 mt-0.5">
                  <Icon name="history" size={14} className="text-gray-500" />
                </div>
                <div className="min-w-0">
                  <p className="text-sm text-gray-700 truncate">{log.detail}</p>
                  <p className="text-xs text-gray-400">
                    {log.user_id && typeof log.user_id === 'object' ? log.user_id.username : '—'} ·{' '}
                    {new Date(log.created_at).toLocaleString('es-ES', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
              </div>
            ))}
            {data.recent_activity.length === 0 && (
              <p className="text-sm text-gray-400 text-center py-4">Sin actividad reciente</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
