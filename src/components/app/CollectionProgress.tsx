'use client';

interface CollectionProgressProps {
  unique: number;
  total: number;
  progress: number;
}

export function CollectionProgress({ unique, total, progress }: CollectionProgressProps) {
  return (
    <div className="bg-white rounded-xl px-4 py-3 shadow-sm border border-gray-100">
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-medium text-gray-700">Colección</span>
        <span className="text-sm text-gray-500">
          {unique}/{total} especies ({progress}%)
        </span>
      </div>
      <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-primary to-primary-light rounded-full transition-all duration-500"
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
}
