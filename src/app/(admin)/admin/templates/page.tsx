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
    <div className="animate-fade-up">
      <div className="flex items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="font-display text-3xl font-semibold text-white">Plantillas de árboles</h1>
          <p className="text-sm text-white-50 mt-1">Catálogo de árboles coleccionables</p>
        </div>
        <Link href="/admin/templates/new" className="shrink-0 no-underline">
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
        <div className="rounded-2xl bg-[#0E1A12]/80 border border-white-10 overflow-hidden backdrop-blur-[20px] shadow-[0_16px_40px_rgba(0,0,0,0.35),inset_0_1px_0_rgba(255,255,255,0.06)]">
          <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white-10 bg-white-5">
                <th className="px-4 py-3.5 text-left text-xs font-semibold text-white-50 uppercase tracking-wide">Imagen</th>
                <th className="px-4 py-3.5 text-left text-xs font-semibold text-white-50 uppercase tracking-wide">Nombre</th>
                <th className="px-4 py-3.5 text-left text-xs font-semibold text-white-50 uppercase tracking-wide">Categoría</th>
                <th className="px-4 py-3.5 text-left text-xs font-semibold text-white-50 uppercase tracking-wide">Rareza</th>
                <th className="px-4 py-3.5 text-left text-xs font-semibold text-white-50 uppercase tracking-wide">Estado</th>
                <th className="px-4 py-3.5 text-right text-xs font-semibold text-white-50 uppercase tracking-wide">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {templates.map((t) => (
                <tr key={t.id} className="border-b border-white-10 last:border-0 transition-colors hover:bg-white-5">
                  <td className="px-4 py-3.5">
                    {t.imageUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={t.imageUrl} alt={t.name} className="w-11 h-11 object-contain rounded-xl bg-white-5 border border-white-10 p-1" />
                    ) : (
                      <div className="w-11 h-11 bg-white-5 border border-white-10 rounded-xl flex items-center justify-center">
                        <Icon name="park" size={18} className="text-white-40" />
                      </div>
                    )}
                  </td>
                  <td className="px-4 py-3.5 text-sm font-medium text-white whitespace-nowrap">{t.name}</td>
                  <td className="px-4 py-3.5 text-sm text-white-60">{t.category}</td>
                  <td className="px-4 py-3.5"><Badge probability={t.probability} /></td>
                  <td className="px-4 py-3.5">
                    <span className={`inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-pill border ${
                      t.isActive ? 'bg-success/15 text-success border-success/30' : 'bg-white-8 text-white-60 border-white-15'
                    }`}>
                      <span className={`h-1.5 w-1.5 rounded-full ${t.isActive ? 'bg-success' : 'bg-white-40'}`} />
                      {t.isActive ? 'Activo' : 'Inactivo'}
                    </span>
                  </td>
                  <td className="px-4 py-3.5 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <Link
                        href={`/admin/templates/${t.id}`}
                        className="w-9 h-9 rounded-xl bg-white-5 border border-white-10 hover:bg-white-10 hover:border-white-20 transition-colors flex items-center justify-center"
                      >
                        <Icon name="edit" size={16} className="text-white-60" />
                      </Link>
                      <button
                        onClick={() => handleDelete(t.id)}
                        className="w-9 h-9 rounded-xl bg-white-5 border border-white-10 hover:bg-danger/15 hover:border-danger/30 transition-colors flex items-center justify-center cursor-pointer"
                      >
                        <Icon name="delete" size={16} className="text-danger" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {templates.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-4 py-10 text-center text-sm text-white-40">
                    No hay plantillas creadas
                  </td>
                </tr>
              )}
            </tbody>
          </table>
          </div>
        </div>
      )}
    </div>
  );
}
