'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useAuthStore } from '@/stores/auth-store';
import { Icon, Badge, Button } from '@/components/ui';

interface TemplateItem {
  id: string;
  name: string;
  category: string;
  probability: number;
  isActive: boolean;
  imageUrl: string;
  createdAt: string;
}

export default function TemplatesPage() {
  const { token } = useAuthStore();
  const [templates, setTemplates] = useState<TemplateItem[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchTemplates = useCallback(async () => {
    try {
      const res = await fetch('/api/admin/templates', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (res.ok) setTemplates(data.templates);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    if (token) fetchTemplates();
  }, [token, fetchTemplates]);

  const handleDelete = async (id: string) => {
    if (!confirm('¿Eliminar esta plantilla?')) return;
    try {
      await fetch(`/api/admin/templates/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      setTemplates((prev) => prev.filter((t) => t.id !== id));
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Plantillas de árboles</h1>
        <Link href="/admin/templates/new">
          <Button fullWidth={false} icon="add">
            Nueva plantilla
          </Button>
        </Link>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-40">
          <span className="animate-spin h-8 w-8 border-3 border-primary border-t-transparent rounded-full" />
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50">
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Imagen</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Nombre</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Categoría</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Rareza</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Estado</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {templates.map((t) => (
                <tr key={t.id} className="border-b border-gray-50 hover:bg-gray-50/50">
                  <td className="px-4 py-3">
                    {t.imageUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={t.imageUrl} alt={t.name} className="w-10 h-10 object-contain rounded" />
                    ) : (
                      <div className="w-10 h-10 bg-gray-100 rounded flex items-center justify-center">
                        <Icon name="park" size={18} className="text-gray-400" />
                      </div>
                    )}
                  </td>
                  <td className="px-4 py-3 text-sm font-medium text-gray-800">{t.name}</td>
                  <td className="px-4 py-3 text-sm text-gray-600">{t.category}</td>
                  <td className="px-4 py-3"><Badge probability={t.probability} /></td>
                  <td className="px-4 py-3">
                    <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                      t.isActive ? 'bg-success/10 text-success' : 'bg-gray-100 text-gray-500'
                    }`}>
                      {t.isActive ? 'Activo' : 'Inactivo'}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <Link
                        href={`/admin/templates/${t.id}`}
                        className="w-8 h-8 rounded-lg hover:bg-gray-100 flex items-center justify-center"
                      >
                        <Icon name="edit" size={16} className="text-gray-500" />
                      </Link>
                      <button
                        onClick={() => handleDelete(t.id)}
                        className="w-8 h-8 rounded-lg hover:bg-red-50 flex items-center justify-center border-none bg-transparent cursor-pointer"
                      >
                        <Icon name="delete" size={16} className="text-danger" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {templates.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-sm text-gray-400">
                    No hay plantillas creadas
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
