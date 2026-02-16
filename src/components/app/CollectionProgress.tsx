'use client';

interface CollectionProgressProps {
  unique: number;
  total: number;
  progress: number;
}

export function CollectionProgress({ unique, total, progress }: CollectionProgressProps) {
  return (
    <div className="bg-white/10 backdrop-blur-md rounded-2xl px-5 py-4 border border-white/20">
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-medium text-white">Progreso de colección</span>
        <span className="text-sm text-white/70">
          {unique}/{total} especies ({progress}%)
        </span>
      </div>
      <div className="w-full h-2.5 bg-white/10 rounded-full overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-primary to-primary-light rounded-full transition-all duration-500"
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
}
