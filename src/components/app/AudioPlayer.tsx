'use client';

import { Icon } from '@/components/ui';

interface AudioPlayerProps {
  isPlaying: boolean;
  volume: number;
  onToggle: () => void;
  onVolumeChange: (v: number) => void;
}

export function AudioPlayer({ isPlaying, volume, onToggle, onVolumeChange }: AudioPlayerProps) {
  return (
    <div className="max-w-md w-full bg-white-8 border border-white-15 rounded-2xl backdrop-blur-[14px] px-5 py-4 shadow-[0_8px_32px_rgba(0,0,0,0.28)] animate-fade-up">
      <div className="flex items-center gap-3.5">
        <button
          onClick={onToggle}
          aria-label={isPlaying ? 'Silenciar sonido' : 'Activar sonido'}
          className={`relative w-10 h-10 rounded-full flex items-center justify-center cursor-pointer border transition-all duration-200 shrink-0 ${
            isPlaying
              ? 'bg-primary/25 border-primary/50 text-accent-green shadow-[0_0_16px_rgba(46,139,87,0.35)]'
              : 'bg-white-10 border-white-15 text-white-60 hover:bg-white-15 hover:text-white'
          }`}
        >
          {isPlaying && (
            <span className="absolute inset-0 rounded-full bg-primary/20 animate-glow" aria-hidden />
          )}
          <Icon
            name={isPlaying ? 'volume_up' : 'volume_off'}
            size={18}
            className="relative z-10"
          />
        </button>
        <div className="flex flex-col gap-1.5 flex-1 min-w-0">
          <span className="text-sm font-medium text-white-80">Sonido ambiental</span>
          <input
            type="range"
            min={0}
            max={1}
            step={0.01}
            value={volume}
            onChange={(e) => onVolumeChange(parseFloat(e.target.value))}
            className="w-full h-1.5 accent-primary appearance-none bg-white-15 rounded-full cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3.5 [&::-webkit-slider-thumb]:h-3.5 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:shadow-[0_0_8px_rgba(46,139,87,0.5)] [&::-webkit-slider-thumb]:cursor-pointer"
          />
        </div>
      </div>
    </div>
  );
}
