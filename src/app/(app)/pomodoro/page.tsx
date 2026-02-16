'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useTimer } from '@/hooks/useTimer';
import { useAudio } from '@/hooks/useAudio';
import { TimerRing, SessionDots, AudioPlayer, MotivationalQuote, TreeEarnedModal } from '@/components/app';
import { Button, Icon } from '@/components/ui';
import { POMODORO_DURATIONS } from '@/lib/utils/constants';

export default function PomodoroPage() {
  const router = useRouter();
  const timer = useTimer();
  const audio = useAudio();
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showTreeModal, setShowTreeModal] = useState(false);
  const [earnedTree, setEarnedTree] = useState<{
    tree_name: string;
    image_url: string;
    description: string;
    probability: number;
    focus_minutes: number;
  } | null>(null);

  // Auto-complete when timer hits 0
  useEffect(() => {
    if (timer.status === 'running' && timer.timeLeft <= 0) {
      handleComplete();
    }
  }, [timer.timeLeft, timer.status]);

  // Play audio when session starts
  useEffect(() => {
    if (timer.status === 'running' && timer.audioUrl) {
      audio.play(timer.audioUrl);
    } else if (timer.status !== 'running') {
      audio.stop();
    }
  }, [timer.status, timer.audioUrl]);

  const handleStart = useCallback(async (duration?: number) => {
    setError('');
    setLoading(true);
    try {
      await timer.startPomodoro(duration);
    } catch (err: any) {
      setError(err.message || 'Error al iniciar el pomodoro');
    } finally {
      setLoading(false);
    }
  }, [timer]);

  const handleComplete = useCallback(async () => {
    try {
      const data = await timer.completePomodoro();
      if (data?.tree) {
        setEarnedTree({
          tree_name: data.tree.template?.name || data.tree.customName,
          image_url: data.tree.template?.imageUrl || '',
          description: data.tree.template?.description || data.template?.description || '',
          probability: data.template?.probability ?? 25,
          focus_minutes: timer.duration,
        });
      } else {
        setEarnedTree(null);
      }
      setShowTreeModal(true);
    } catch (err: any) {
      setError(err.message || 'Error al completar el pomodoro');
    }
  }, [timer]);

  const handleStop = useCallback(() => {
    audio.stop();
    timer.stopPomodoro();
    setError('');
  }, [audio, timer]);

  const handleCloseModal = useCallback(() => {
    setShowTreeModal(false);
    setEarnedTree(null);
    timer.nextSession();
  }, [timer]);

  const handleViewForest = useCallback(() => {
    setShowTreeModal(false);
    setEarnedTree(null);
    router.push('/inventory');
  }, [router]);

  const totalDisplay = `de ${timer.duration}:00`;

  return (
    <div className="flex-1 flex flex-col items-center gap-8 px-4 py-8">
      {/* Page header */}
      <div className="text-center">
        <h1 className="text-5xl font-bold text-white mb-2">Pomodoro Timer</h1>
        <p className="text-base text-white-80">Mejora tu concentración, cultiva tu bosque</p>
      </div>

      {/* Timer card glass */}
      <div className="bg-white-10 border border-white-20 rounded-3xl backdrop-blur-[7px] py-8 px-10 max-w-md w-full flex flex-col items-center gap-6">
        {/* Timer ring */}
        <TimerRing
          progress={timer.progress}
          timeDisplay={timer.timeDisplay}
          totalDisplay={totalDisplay}
        />

        {/* Session dots */}
        <SessionDots
          current={timer.currentSession - 1}
          total={timer.sessionsPerCycle}
        />

        {/* Duration display + selector (idle only) */}
        {timer.status === 'idle' && (
          <>
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-pill bg-[#2E8B5733] border border-[#2E8B5766]">
              <Icon name="self_improvement" size={16} className="text-primary" />
              <span className="text-xs font-bold text-white">Modo Trabajo</span>
            </div>
            <div className="flex items-center gap-2">
              {POMODORO_DURATIONS.map((d) => (
                <button
                  key={d}
                  onClick={() => timer.setDuration(d)}
                  disabled={loading}
                  className={`px-4 py-2 rounded-pill text-sm font-medium border-none cursor-pointer transition-colors ${
                    d === timer.duration
                      ? 'bg-primary text-white'
                      : 'bg-white-15 text-white-80 hover:bg-white-27'
                  }`}
                >
                  {d} min
                </button>
              ))}
            </div>
          </>
        )}

        {/* Start button */}
        {timer.status === 'idle' && (
          <Button
            icon="play_arrow"
            onClick={() => handleStart(timer.duration)}
            loading={loading}
            size="large"
            className="max-w-[300px]"
          >
            Iniciar Pomodoro
          </Button>
        )}

        {/* Stop button */}
        {timer.status === 'running' && (
          <button
            onClick={handleStop}
            className="w-full max-w-[300px] h-12 flex items-center justify-center gap-2 rounded-pill border-none cursor-pointer font-semibold text-white transition-opacity hover:opacity-80"
            style={{
              background: 'linear-gradient(135deg, #FF6B6B, #e74c3c)',
            }}
          >
            <Icon name="stop" size={20} className="text-white" />
            Detener
          </button>
        )}

        {/* Completed (no modal) */}
        {timer.status === 'completed' && !showTreeModal && (
          <div className="flex flex-col items-center gap-3">
            <p className="text-white text-lg font-medium">Pomodoro completado</p>
            <Button onClick={() => timer.nextSession()}>
              Siguiente sesión
            </Button>
          </div>
        )}
      </div>

      {/* Audio section (running) */}
      {timer.status === 'running' && (
        <AudioPlayer
          isPlaying={audio.isPlaying}
          volume={audio.volume}
          onToggle={() => audio.isPlaying ? audio.pause() : audio.play(timer.audioUrl)}
          onVolumeChange={audio.setVolume}
        />
      )}

      {/* Motivational quote (running) */}
      {timer.status === 'running' && timer.phrase && (
        <MotivationalQuote phrase={timer.phrase} />
      )}

      {/* Error message */}
      {error && (
        <p className="text-danger text-sm bg-danger/10 px-4 py-2 rounded-lg">{error}</p>
      )}

      {/* Tree earned modal */}
      <TreeEarnedModal
        open={showTreeModal}
        tree={earnedTree}
        onClose={handleCloseModal}
        onViewForest={handleViewForest}
      />
    </div>
  );
}
