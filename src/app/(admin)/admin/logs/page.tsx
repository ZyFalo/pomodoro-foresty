'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAuthStore } from '@/stores/auth-store';
import { Icon } from '@/components/ui';

const EVENT_TYPES = [
  { value: '', label: 'Todos' },
  { value: 'login', label: 'Login' },
  { value: 'registro', label: 'Registro' },
  { value: 'pomodoro_completado', label: 'Pomodoro' },
  { value: 'arbol_ganado', label: 'Árbol ganado' },
  { value: 'contrasena_cambiada', label: 'Contraseña' },
  { value: 'usuario_desactivado', label: 'Desactivado' },
  { value: 'usuario_activado', label: 'Activado' },
  { value: 'rol_cambiado', label: 'Rol' },
  { value: 'template_creado', label: 'Plantilla creada' },
  { value: 'template_editado', label: 'Plantilla editada' },
  { value: 'template_eliminado', label: 'Plantilla eliminada' },
];

interface LogItem {
  id: string;
  eventType: string;
  detail: string;
  ipAddress: string;
  createdAt: string;
  user: { username: string } | null;
}

// Color del badge de evento (solo presentación; no altera datos)
function eventBadgeClass(eventType: string): string {
  if (eventType === 'login' || eventType === 'registro')
    return 'bg-blue/15 text-blue border-blue/30';
  if (eventType === 'pomodoro_completado')
    return 'bg-primary/15 text-primary-light border-primary/30';
  if (eventType === 'arbol_ganado')
    return 'bg-success/15 text-success border-success/30';
  if (eventType.startsWith('template_'))
    return 'bg-purple/15 text-purple border-purple/30';
  if (eventType === 'usuario_desactivado')
    return 'bg-danger/15 text-danger border-danger/30';
  if (eventType === 'usuario_activado')
    return 'bg-success/15 text-success border-success/30';
  if (eventType === 'rol_cambiado' || eventType === 'contrasena_cambiada')
    return 'bg-amber/15 text-amber border-amber/30';
  return 'bg-white-8 text-white-60 border-white-15';
}

export default function LogsPage() {
  const { token } = useAuthStore();
  const [logs, setLogs] = useState<LogItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [eventType, setEventType] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const fetchLogs = useCallback(async (p = 1) => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page: String(p), limit: '30' });
      if (eventType) params.set('event_type', eventType);
      const res = await fetch(`/api/admin/logs?${params}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (res.ok) {
        setLogs(data.logs);
        setTotalPages(data.pagination.pages);
        setPage(data.pagination.page);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [token, eventType]);

  useEffect(() => {
    if (token) fetchLogs();
  }, [token, fetchLogs]);

  return (
    <div className="animate-fade-up">
      <div className="mb-6">
        <h1 className="font-display text-3xl font-semibold text-white">Logs de actividad</h1>
        <p className="text-sm text-white-50 mt-1">Registro de eventos del sistema</p>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-1.5 mb-5">
        {EVENT_TYPES.map((t) => (
          <button
            key={t.value}
            onClick={() => setEventType(t.value)}
            className={`px-3.5 py-1.5 rounded-pill text-xs font-medium border cursor-pointer transition-all duration-200 ${
              eventType === t.value
                ? 'bg-primary text-white border-primary shadow-[0_4px_14px_rgba(46,139,87,0.3)]'
                : 'bg-white-5 text-white-60 border-white-10 hover:bg-white-10 hover:text-white'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div className="rounded-2xl bg-[#0E1A12]/80 border border-white-10 overflow-hidden backdrop-blur-[20px] shadow-[0_16px_40px_rgba(0,0,0,0.35),inset_0_1px_0_rgba(255,255,255,0.06)]">
        <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-white-10 bg-white-5">
              <th className="px-4 py-3.5 text-left text-xs font-semibold text-white-50 uppercase tracking-wide">Fecha</th>
              <th className="px-4 py-3.5 text-left text-xs font-semibold text-white-50 uppercase tracking-wide">Usuario</th>
              <th className="px-4 py-3.5 text-left text-xs font-semibold text-white-50 uppercase tracking-wide">Evento</th>
              <th className="px-4 py-3.5 text-left text-xs font-semibold text-white-50 uppercase tracking-wide">Detalle</th>
              <th className="px-4 py-3.5 text-left text-xs font-semibold text-white-50 uppercase tracking-wide">IP</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={5} className="px-4 py-10 text-center">
                  <span className="animate-spin inline-block h-6 w-6 border-2 border-primary border-t-transparent rounded-full" />
                </td>
              </tr>
            ) : logs.map((log) => (
              <tr key={log.id} className="border-b border-white-10 last:border-0 transition-colors hover:bg-white-5">
                <td className="px-4 py-3.5 text-xs text-white-50 whitespace-nowrap">
                  {new Date(log.createdAt).toLocaleString('es-ES', {
                    day: '2-digit', month: '2-digit', year: '2-digit',
                    hour: '2-digit', minute: '2-digit',
                  })}
                </td>
                <td className="px-4 py-3.5 text-sm text-white-80 whitespace-nowrap">
                  {log.user && typeof log.user === 'object' ? log.user.username : '—'}
                </td>
                <td className="px-4 py-3.5">
                  <span className={`inline-block text-xs font-medium px-2.5 py-1 rounded-pill border whitespace-nowrap ${eventBadgeClass(log.eventType)}`}>
                    {log.eventType}
                  </span>
                </td>
                <td className="px-4 py-3.5 text-sm text-white-60 max-w-xs truncate">{log.detail}</td>
                <td className="px-4 py-3.5 text-xs text-white-40 font-mono whitespace-nowrap">{log.ipAddress || '—'}</td>
              </tr>
            ))}
            {!loading && logs.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-12 text-center text-sm text-white-40">
                  <Icon name="history" size={28} className="text-white-20 mb-2 mx-auto" />
                  <p>No hay logs</p>
                </td>
              </tr>
            )}
          </tbody>
        </table>
        </div>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 mt-5">
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
            <button
              key={p}
              onClick={() => fetchLogs(p)}
              className={`w-9 h-9 rounded-xl text-sm font-medium border cursor-pointer transition-all duration-200 ${
                p === page
                  ? 'bg-primary text-white border-primary shadow-[0_4px_14px_rgba(46,139,87,0.35)]'
                  : 'bg-white-5 text-white-60 border-white-10 hover:bg-white-10 hover:text-white'
              }`}
            >
              {p}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
