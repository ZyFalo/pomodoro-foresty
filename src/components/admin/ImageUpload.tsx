'use client';

import { useRef, useState } from 'react';
import { Icon } from '@/components/ui';

interface ImageUploadProps {
  value: string;
  onChange: (url: string) => void;
  token: string | null;
}

// Campo de imagen para el formulario de plantillas: permite pegar una URL o subir
// un archivo a Cloudinary (vía /api/upload), con vista previa.
export function ImageUpload({ value, onChange, token }: ImageUploadProps) {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setError('');
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      const res = await fetch('/api/upload', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Error al subir la imagen');
      onChange(data.url);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al subir la imagen');
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  return (
    <div>
      <label className="text-sm font-medium text-white-73 mb-1.5 block">Imagen</label>
      <div className="flex items-start gap-3">
        {/* Vista previa */}
        <div className="w-20 h-20 shrink-0 rounded-2xl border border-white-15 bg-white-5 flex items-center justify-center overflow-hidden p-1.5">
          {value ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={value} alt="Vista previa" className="w-full h-full object-contain" />
          ) : (
            <Icon name="park" size={28} className="text-white-20" />
          )}
        </div>

        <div className="flex-1 space-y-2">
          {/* Sigue permitiendo pegar una URL manualmente */}
          <input
            type="url"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder="https://… o sube un archivo"
            className="w-full px-4 h-11 bg-white-8 border border-white-20 rounded-2xl text-sm text-white placeholder:text-white-40 outline-none transition-colors focus:border-primary focus:bg-white-10"
            required
          />
          <input
            ref={fileInputRef}
            type="file"
            accept="image/png,image/jpeg,image/webp"
            onChange={handleFile}
            className="hidden"
          />
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading || !token}
            className="flex items-center gap-1.5 px-3.5 h-10 rounded-2xl border border-white-20 bg-white-8 text-sm text-white-80 cursor-pointer hover:bg-white-15 hover:text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Icon
              name={uploading ? 'progress_activity' : 'upload'}
              size={16}
              className={uploading ? 'animate-spin' : ''}
            />
            {uploading ? 'Subiendo…' : 'Subir imagen'}
          </button>
          {error && <p className="text-danger text-xs">{error}</p>}
        </div>
      </div>
    </div>
  );
}
