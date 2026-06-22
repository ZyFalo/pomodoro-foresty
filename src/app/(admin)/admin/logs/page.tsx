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
];

interface LogItem {
  id: string;
  eventType: string;
  detail: string;
  ipAddress: string;
  createdAt: string;
  user: { username: string } | null;
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
    <div className="p-8">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Logs de actividad</h1>

      {/* Filters */}
      <div className="flex gap-1.5 mb-4">
        {EVENT_TYPES.map((t) => (
          <button
            key={t.value}
            onClick={() => setEventType(t.value)}
            className={`px-3 py-1.5 rounded-pill text-xs font-medium border-none cursor-pointer transition-colors ${
              eventType === t.value
                ? 'bg-primary text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-100 bg-gray-50">
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Fecha</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Usuario</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Evento</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Detalle</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">IP</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center">
                  <span className="animate-spin inline-block h-6 w-6 border-2 border-primary border-t-transparent rounded-full" />
                </td>
              </tr>
            ) : logs.map((log) => (
              <tr key={log.id} className="border-b border-gray-50 hover:bg-gray-50/50">
                <td className="px-4 py-3 text-xs text-gray-500 whitespace-nowrap">
                  {new Date(log.createdAt).toLocaleString('es-ES', {
                    day: '2-digit', month: '2-digit', year: '2-digit',
                    hour: '2-digit', minute: '2-digit',
                  })}
                </td>
                <td className="px-4 py-3 text-sm text-gray-700">
                  {log.user && typeof log.user === 'object' ? log.user.username : '—'}
                </td>
                <td className="px-4 py-3">
                  <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-gray-100 text-gray-600">
                    {log.eventType}
                  </span>
                </td>
                <td className="px-4 py-3 text-sm text-gray-600 max-w-xs truncate">{log.detail}</td>
                <td className="px-4 py-3 text-xs text-gray-400 font-mono">{log.ipAddress || '—'}</td>
              </tr>
            ))}
            {!loading && logs.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-sm text-gray-400">
                  <Icon name="history" size={24} className="text-gray-300 mb-2" />
                  <p>No hay logs</p>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 mt-4">
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
            <button
              key={p}
              onClick={() => fetchLogs(p)}
              className={`w-8 h-8 rounded-lg text-sm font-medium border-none cursor-pointer ${
                p === page ? 'bg-primary text-white' : 'bg-white text-gray-600 hover:bg-gray-100'
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
