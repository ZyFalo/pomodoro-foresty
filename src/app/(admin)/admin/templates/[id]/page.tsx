'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useAuthStore } from '@/stores/auth-store';
import { Button, Icon } from '@/components/ui';
import { ImageUpload } from '@/components/admin';
import { TREE_CATEGORIES, RARITY_CONFIG } from '@/lib/utils/constants';

export default function EditTemplatePage() {
  const router = useRouter();
  const params = useParams();
  const { token } = useAuthStore();
  const [form, setForm] = useState({
    name: '',
    category: '',
    description: '',
    image_url: '',
    rarity: 'poco_comun' as string,
    is_active: true,
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch(`/api/admin/templates/${params.id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        if (res.ok) {
          setForm({
            name: data.name,
            category: data.category,
            description: data.description,
            image_url: data.imageUrl ?? data.image_url ?? '',
            rarity: data.rarity ?? 'poco_comun',
            is_active: data.isActive ?? data.is_active ?? true,
          });
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    if (token && params.id) load();
  }, [token, params.id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      const res = await fetch(`/api/admin/templates/${params.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      router.push('/admin/templates');
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Error al guardar');
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

  return (
    <div className="max-w-2xl animate-fade-up">
      <button
        onClick={() => router.back()}
        className="group flex items-center gap-1.5 text-sm text-white-50 hover:text-white mb-5 border-none bg-transparent cursor-pointer transition-colors"
      >
        <Icon name="arrow_back" size={18} className="transition-transform duration-200 group-hover:-translate-x-0.5" /> Volver
      </button>
      <h1 className="font-display text-3xl font-semibold text-white mb-6">Editar plantilla</h1>

      <form onSubmit={handleSubmit} className="rounded-2xl bg-[#0E1A12]/80 border border-white-10 p-6 space-y-5 backdrop-blur-[20px] shadow-[0_16px_40px_rgba(0,0,0,0.35),inset_0_1px_0_rgba(255,255,255,0.06)]">
        <div>
          <label className="text-sm font-medium text-white-73 mb-1.5 block">Nombre</label>
          <input
            type="text"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            className="w-full px-4 h-11 bg-white-8 border border-white-20 rounded-2xl text-sm text-white placeholder:text-white-40 outline-none transition-colors focus:border-primary focus:bg-white-10"
            required
          />
        </div>

        <div>
          <label className="text-sm font-medium text-white-73 mb-1.5 block">Categoría</label>
          <select
            value={form.category}
            onChange={(e) => setForm({ ...form, category: e.target.value })}
            className="w-full px-4 h-11 bg-white-8 border border-white-20 rounded-2xl text-sm text-white outline-none transition-colors focus:border-primary focus:bg-white-10 [&>option]:bg-forest-900 [&>option]:text-white"
          >
            {TREE_CATEGORIES.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="text-sm font-medium text-white-73 mb-1.5 block">Descripción</label>
          <textarea
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            className="w-full px-4 py-2.5 bg-white-8 border border-white-20 rounded-2xl text-sm text-white placeholder:text-white-40 outline-none transition-colors focus:border-primary focus:bg-white-10 resize-none"
            rows={3}
            required
          />
        </div>

        <ImageUpload
          value={form.image_url}
          onChange={(url) => setForm({ ...form, image_url: url })}
          token={token}
        />

        <div>
          <label className="text-sm font-medium text-white-73 mb-2 block">Rareza</label>
          <div className="flex flex-wrap gap-2">
            {RARITY_CONFIG.map((r) => {
              const selected = form.rarity === r.key;
              return (
                <button
                  type="button"
                  key={r.key}
                  onClick={() => setForm({ ...form, rarity: r.key })}
                  className={`flex items-center gap-2 px-3.5 py-2 rounded-pill border text-sm font-medium transition-all duration-200 cursor-pointer ${
                    selected ? 'text-white' : 'text-white-60 border-white-15 bg-white-5 hover:bg-white-10 hover:text-white'
                  }`}
                  style={selected ? { borderColor: r.color, backgroundColor: `${r.color}26`, boxShadow: `0 0 14px ${r.color}40` } : undefined}
                >
                  <span className="w-2.5 h-2.5 rounded-full" style={{ background: r.color }} />
                  {r.name}
                  <span className="text-xs text-white-40">{r.weight}%</span>
                </button>
              );
            })}
          </div>
          <p className="text-xs text-white-40 mt-2">El porcentaje es la probabilidad de que salga esta rareza al ganar un árbol.</p>
        </div>

        <div className="flex items-center gap-3">
          <label className="text-sm font-medium text-white-73">Activo</label>
          <button
            type="button"
            onClick={() => setForm({ ...form, is_active: !form.is_active })}
            className={`relative w-11 h-6 rounded-pill transition-colors cursor-pointer border ${
              form.is_active ? 'bg-primary border-primary' : 'bg-white-10 border-white-20'
            }`}
          >
            <div className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform ${
              form.is_active ? 'translate-x-[22px]' : 'translate-x-0.5'
            }`} />
          </button>
        </div>

        {error && <p className="text-danger text-sm">{error}</p>}

        <Button type="submit" loading={saving} fullWidth={false}>
          Guardar cambios
        </Button>
      </form>
    </div>
  );
}
