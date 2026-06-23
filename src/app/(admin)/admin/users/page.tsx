'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useAuthStore } from '@/stores/auth-store';
import { Icon } from '@/components/ui';

interface UserItem {
  id: string;
  username: string;
  email: string;
  role: string;
  isActive: boolean;
  pomodorosCompleted: number;
  totalTrees: number;
  createdAt: string;
}

export default function UsersPage() {
  const { token } = useAuthStore();
  const [users, setUsers] = useState<UserItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const fetchUsers = useCallback(async (p = 1) => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page: String(p), limit: '20' });
      if (search) params.set('search', search);
      const res = await fetch(`/api/admin/users?${params}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (res.ok) {
        setUsers(data.users);
        setTotalPages(data.pagination.pages);
        setPage(data.pagination.page);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [token, search]);

  useEffect(() => {
    if (token) fetchUsers();
  }, [token, fetchUsers]);

  return (
    <div className="animate-fade-up">
      <div className="mb-6">
        <h1 className="font-display text-3xl font-semibold text-white">Usuarios</h1>
        <p className="text-sm text-white-50 mt-1">Gestiona las cuentas registradas</p>
      </div>

      {/* Search */}
      <div className="mb-5">
        <div className="relative max-w-xs">
          <Icon name="search" size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white-40" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar usuario..."
            className="w-full pl-11 pr-4 h-11 bg-white-8 border border-white-20 rounded-2xl text-sm text-white placeholder:text-white-40 outline-none transition-colors focus:border-primary focus:bg-white-10"
          />
        </div>
      </div>

      <div className="rounded-2xl bg-[#0E1A12]/80 border border-white-10 overflow-hidden backdrop-blur-[20px] shadow-[0_16px_40px_rgba(0,0,0,0.35),inset_0_1px_0_rgba(255,255,255,0.06)]">
        <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-white-10 bg-white-5">
              <th className="px-4 py-3.5 text-left text-xs font-semibold text-white-50 uppercase tracking-wide">Usuario</th>
              <th className="px-4 py-3.5 text-left text-xs font-semibold text-white-50 uppercase tracking-wide">Email</th>
              <th className="px-4 py-3.5 text-left text-xs font-semibold text-white-50 uppercase tracking-wide">Rol</th>
              <th className="px-4 py-3.5 text-left text-xs font-semibold text-white-50 uppercase tracking-wide">Estado</th>
              <th className="px-4 py-3.5 text-right text-xs font-semibold text-white-50 uppercase tracking-wide">Pomodoros</th>
              <th className="px-4 py-3.5 text-right text-xs font-semibold text-white-50 uppercase tracking-wide">Árboles</th>
              <th className="px-4 py-3.5 text-right text-xs font-semibold text-white-50 uppercase tracking-wide">Registro</th>
              <th className="px-4 py-3.5"></th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={8} className="px-4 py-10 text-center">
                  <span className="animate-spin inline-block h-6 w-6 border-2 border-primary border-t-transparent rounded-full" />
                </td>
              </tr>
            ) : users.map((u) => (
              <tr key={u.id} className="border-b border-white-10 last:border-0 transition-colors hover:bg-white-5">
                <td className="px-4 py-3.5 text-sm font-medium text-white whitespace-nowrap">{u.username}</td>
                <td className="px-4 py-3.5 text-sm text-white-60">{u.email}</td>
                <td className="px-4 py-3.5">
                  <span className={`inline-block text-xs font-medium px-2.5 py-1 rounded-pill border ${
                    u.role === 'admin' ? 'bg-purple/15 text-purple border-purple/30' : 'bg-white-8 text-white-60 border-white-15'
                  }`}>
                    {u.role}
                  </span>
                </td>
                <td className="px-4 py-3.5">
                  <span className={`inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-pill border ${
                    u.isActive ? 'bg-success/15 text-success border-success/30' : 'bg-danger/15 text-danger border-danger/30'
                  }`}>
                    <span className={`h-1.5 w-1.5 rounded-full ${u.isActive ? 'bg-success' : 'bg-danger'}`} />
                    {u.isActive ? 'Activo' : 'Inactivo'}
                  </span>
                </td>
                <td className="px-4 py-3.5 text-sm text-white-80 text-right tabular-nums">{u.pomodorosCompleted}</td>
                <td className="px-4 py-3.5 text-sm text-white-80 text-right tabular-nums">{u.totalTrees}</td>
                <td className="px-4 py-3.5 text-sm text-white-40 text-right whitespace-nowrap">
                  {new Date(u.createdAt).toLocaleDateString('es-ES')}
                </td>
                <td className="px-4 py-3.5 text-right">
                  <Link
                    href={`/admin/users/${u.id}`}
                    className="w-9 h-9 rounded-xl bg-white-5 border border-white-10 hover:bg-white-10 hover:border-white-20 transition-colors flex items-center justify-center inline-flex"
                  >
                    <Icon name="visibility" size={16} className="text-white-60" />
                  </Link>
                </td>
              </tr>
            ))}
            {!loading && users.length === 0 && (
              <tr>
                <td colSpan={8} className="px-4 py-10 text-center text-sm text-white-40">
                  No se encontraron usuarios
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
              onClick={() => fetchUsers(p)}
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
