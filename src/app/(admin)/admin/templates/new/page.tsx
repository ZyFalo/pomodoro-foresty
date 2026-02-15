'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/stores/auth-store';
import { Button, Icon } from '@/components/ui';
import { TREE_CATEGORIES } from '@/lib/utils/constants';
import { getRarityFromProbability } from '@/lib/utils/rarity';

export default function NewTemplatePage() {
  const router = useRouter();
  const { token } = useAuthStore();
  const [form, setForm] = useState({
    name: '',
    category: TREE_CATEGORIES[0] as string,
    description: '',
    image_url: '',
    probability: 15,
    is_active: true,
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const rarity = getRarityFromProbability(form.probability);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      const res = await fetch('/api/admin/templates', {
        method: 'POST',
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
      setError(err instanceof Error ? err.message : 'Error al crear');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="p-8 max-w-2xl">
      <button
        onClick={() => router.back()}
        className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 mb-4 border-none bg-transparent cursor-pointer"
      >
        <Icon name="arrow_back" size={18} /> Volver
      </button>
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Nueva plantilla</h1>

      <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 space-y-4">
        <div>
          <label className="text-sm font-medium text-gray-600 mb-1 block">Nombre</label>
          <input
            type="text"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm outline-none focus:border-primary"
            required
          />
        </div>

        <div>
          <label className="text-sm font-medium text-gray-600 mb-1 block">Categoría</label>
          <select
            value={form.category}
            onChange={(e) => setForm({ ...form, category: e.target.value })}
            className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm outline-none focus:border-primary bg-white"
          >
            {TREE_CATEGORIES.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="text-sm font-medium text-gray-600 mb-1 block">Descripción</label>
          <textarea
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm outline-none focus:border-primary resize-none"
            rows={3}
            required
          />
        </div>

        <div>
          <label className="text-sm font-medium text-gray-600 mb-1 block">URL de imagen</label>
          <input
            type="url"
            value={form.image_url}
            onChange={(e) => setForm({ ...form, image_url: e.target.value })}
            className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm outline-none focus:border-primary"
            required
          />
        </div>

        <div>
          <label className="text-sm font-medium text-gray-600 mb-1 block">
            Probabilidad: {form.probability} — <span style={{ color: rarity.color }}>{rarity.name}</span>
          </label>
          <input
            type="range"
            min={1}
            max={25}
            value={form.probability}
            onChange={(e) => setForm({ ...form, probability: parseInt(e.target.value) })}
            className="w-full accent-primary"
          />
          <div className="flex justify-between text-xs text-gray-400 mt-1">
            <span>1 (Legendario)</span>
            <span>25 (Común)</span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <label className="text-sm font-medium text-gray-600">Activo</label>
          <button
            type="button"
            onClick={() => setForm({ ...form, is_active: !form.is_active })}
            className={`relative w-11 h-6 rounded-full transition-colors cursor-pointer border-none ${
              form.is_active ? 'bg-primary' : 'bg-gray-300'
            }`}
          >
            <div className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform ${
              form.is_active ? 'translate-x-[22px]' : 'translate-x-0.5'
            }`} />
          </button>
        </div>

        {error && <p className="text-danger text-sm">{error}</p>}

        <Button type="submit" loading={saving} fullWidth={false}>
          Crear plantilla
        </Button>
      </form>
    </div>
  );
}
