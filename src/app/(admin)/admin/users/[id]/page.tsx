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

  if (!user) return <p className="p-8 text-gray-500">Usuario no encontrado</p>;

  return (
    <div className="p-8 max-w-2xl">
      <button
        onClick={() => router.back()}
        className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 mb-4 border-none bg-transparent cursor-pointer"
      >
        <Icon name="arrow_back" size={18} /> Volver
      </button>

      <h1 className="text-2xl font-bold text-gray-800 mb-6">{user.username}</h1>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-xs text-gray-400 mb-1">Email</p>
            <p className="text-sm text-gray-700">{user.email}</p>
          </div>
          <div>
            <p className="text-xs text-gray-400 mb-1">Registrado</p>
            <p className="text-sm text-gray-700">{new Date(user.createdAt).toLocaleDateString('es-ES')}</p>
          </div>
          <div>
            <p className="text-xs text-gray-400 mb-1">Pomodoros completados</p>
            <p className="text-sm font-semibold text-gray-800">{user.pomodorosCompleted}</p>
          </div>
          <div>
            <p className="text-xs text-gray-400 mb-1">Minutos de enfoque</p>
            <p className="text-sm font-semibold text-gray-800">{user.totalFocusMinutes}</p>
          </div>
          <div>
            <p className="text-xs text-gray-400 mb-1">Árboles</p>
            <p className="text-sm font-semibold text-gray-800">{user.totalTrees}</p>
          </div>
          <div>
            <p className="text-xs text-gray-400 mb-1">Email verificado</p>
            <p className="text-sm text-gray-700">{user.emailVerified ? 'Sí' : 'No'}</p>
          </div>
        </div>

        <hr className="border-gray-100" />

        {/* Role toggle */}
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-700">Rol</p>
            <p className="text-xs text-gray-400">
              Actual: <span className="font-medium">{user.role}</span>
            </p>
          </div>
          <Button
            onClick={() => updateUser({ role: user.role === 'admin' ? 'user' : 'admin' })}
            variant="secondary"
            fullWidth={false}
            loading={saving}
          >
            Cambiar a {user.role === 'admin' ? 'usuario' : 'admin'}
          </Button>
        </div>

        {/* Status toggle */}
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-700">Estado</p>
            <p className="text-xs text-gray-400">
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
