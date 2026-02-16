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
    <div className="max-w-md w-full bg-[#2E8B5733] border border-[#2E8B574D] rounded-[15px] backdrop-blur-[7px] px-5 py-4">
      <div className="flex items-center gap-3">
        <button
          onClick={onToggle}
          className="w-8 h-8 rounded-full bg-white-15 flex items-center justify-center cursor-pointer border-none hover:bg-white-27 transition-colors shrink-0"
        >
          <Icon
            name={isPlaying ? 'volume_up' : 'volume_off'}
            size={18}
            className="text-white"
          />
        </button>
        <span className="text-sm font-medium text-white">Sonido ambiental</span>
        <input
          type="range"
          min={0}
          max={1}
          step={0.01}
          value={volume}
          onChange={(e) => onVolumeChange(parseFloat(e.target.value))}
          className="flex-1 h-1 accent-primary appearance-none bg-white-20 rounded-full [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white"
        />
      </div>
    </div>
  );
}
