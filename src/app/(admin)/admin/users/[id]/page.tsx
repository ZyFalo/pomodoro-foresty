'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useAuthStore } from '@/stores/auth-store';
import { Button, Icon } from '@/components/ui';

interface UserDetail {
  id: string;
  username: string;
  email: string;
  role: string;
  isActive: boolean;
  emailVerified: boolean;
  pomodorosCompleted: number;
  totalFocusMinutes: number;
  totalTrees: number;
  createdAt: string;
}

export default function UserDetailPage() {
  const router = useRouter();
  const params = useParams();
  const { token } = useAuthStore();
  const [user, setUser] = useState<UserDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch(`/api/admin/users/${params.id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        if (res.ok) setUser(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    if (token && params.id) load();
  }, [token, params.id]);

  const updateUser = async (update: Record<string, unknown>) => {
    setSaving(true);
    try {
      const res = await fetch(`/api/admin/users/${params.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(update),
      });
      const data = await res.json();
      if (res.ok) setUser(data);
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <span className="animate-spin h-8 w-8 border-3 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!user) return <p className="text-white-50">Usuario no encontrado</p>;

  const initial = user.username.charAt(0).toUpperCase();

  return (
    <div className="max-w-2xl animate-fade-up">
      <button
        onClick={() => router.back()}
        className="group flex items-center gap-1.5 text-sm text-white-50 hover:text-white mb-5 border-none bg-transparent cursor-pointer transition-colors"
      >
        <Icon name="arrow_back" size={18} className="transition-transform duration-200 group-hover:-translate-x-0.5" /> Volver
      </button>

      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <span className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary-light to-primary-dark flex items-center justify-center text-white text-xl font-semibold shadow-[0_4px_14px_rgba(46,139,87,0.4)]">
          {initial}
        </span>
        <div>
          <h1 className="font-display text-3xl font-semibold text-white leading-tight">{user.username}</h1>
          <p className="text-sm text-white-50">{user.email}</p>
        </div>
      </div>

      <div className="rounded-2xl bg-[#0E1A12]/80 border border-white-10 p-6 space-y-5 backdrop-blur-[20px] shadow-[0_16px_40px_rgba(0,0,0,0.35),inset_0_1px_0_rgba(255,255,255,0.06)]">
        <div className="grid grid-cols-2 gap-x-4 gap-y-5">
          <div>
            <p className="text-xs text-white-40 mb-1">Email</p>
            <p className="text-sm text-white-80 break-all">{user.email}</p>
          </div>
          <div>
            <p className="text-xs text-white-40 mb-1">Registrado</p>
            <p className="text-sm text-white-80">{new Date(user.createdAt).toLocaleDateString('es-ES')}</p>
          </div>
          <div>
            <p className="text-xs text-white-40 mb-1">Pomodoros completados</p>
            <p className="text-base font-semibold text-white tabular-nums">{user.pomodorosCompleted}</p>
          </div>
          <div>
            <p className="text-xs text-white-40 mb-1">Minutos de enfoque</p>
            <p className="text-base font-semibold text-white tabular-nums">{user.totalFocusMinutes}</p>
          </div>
          <div>
            <p className="text-xs text-white-40 mb-1">Árboles</p>
            <p className="text-base font-semibold text-white tabular-nums">{user.totalTrees}</p>
          </div>
          <div>
            <p className="text-xs text-white-40 mb-1">Email verificado</p>
            <span className={`inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-pill border ${
              user.emailVerified ? 'bg-success/15 text-success border-success/30' : 'bg-white-8 text-white-60 border-white-15'
            }`}>
              {user.emailVerified ? 'Sí' : 'No'}
            </span>
          </div>
        </div>

        <hr className="border-white-10" />

        {/* Role toggle */}
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-sm font-medium text-white-90">Rol</p>
            <p className="text-xs text-white-40">
              Actual: <span className="font-medium text-white-73">{user.role}</span>
            </p>
          </div>
          <Button
            onClick={() => updateUser({ role: user.role === 'admin' ? 'user' : 'admin' })}
            variant="glass"
            fullWidth={false}
            loading={saving}
          >
            Cambiar a {user.role === 'admin' ? 'usuario' : 'admin'}
          </Button>
        </div>

        {/* Status toggle */}
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-sm font-medium text-white-90">Estado</p>
            <p className="text-xs">
              <span className={user.isActive ? 'text-success' : 'text-danger'}>
                {user.isActive ? 'Activo' : 'Inactivo'}
              </span>
            </p>
          </div>
          <Button
            onClick={() => updateUser({ is_active: !user.isActive })}
            variant={user.isActive ? 'danger' : 'primary'}
            fullWidth={false}
            loading={saving}
          >
            {user.isActive ? 'Desactivar' : 'Activar'}
          </Button>
        </div>
      </div>
    </div>
  );
}
