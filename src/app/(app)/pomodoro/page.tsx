'use client';

import { useState, useEffect, useCallback } from 'react';
import { useTimer } from '@/hooks/useTimer';
import { useAudio } from '@/hooks/useAudio';
import { TimerRing, SessionDots, AudioPlayer, MotivationalQuote } from '@/components/app';
import { Button, Modal } from '@/components/ui';
import { POMODORO_DURATIONS } from '@/lib/utils/constants';

export default function PomodoroPage() {
  const timer = useTimer();
  const audio = useAudio();
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showTreeModal, setShowTreeModal] = useState(false);
  const [earnedTree, setEarnedTree] = useState<{
    tree_name: string;
    rarity: string;
    image_url: string;
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
          tree_name: data.tree.template?.name || data.tree.custom_name,
          rarity: data.tree.rarity,
          image_url: data.tree.template?.image_url || '',
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

  const totalDisplay = `${timer.duration}:00 min`;

  return (
    <div className="flex-1 flex flex-col items-center justify-center gap-8 px-4 py-8">
      {/* Session dots */}
      <SessionDots
        current={timer.currentSession - 1}
        total={timer.sessionsPerCycle}
      />

      {/* Timer ring */}
      <TimerRing
        progress={timer.progress}
        timeDisplay={timer.timeDisplay}
        totalDisplay={totalDisplay}
        size={280}
      />

      {/* Motivational phrase */}
      {timer.status === 'running' && timer.phrase && (
        <MotivationalQuote phrase={timer.phrase} />
      )}

      {/* Controls */}
      <div className="flex flex-col items-center gap-4">
        {timer.status === 'idle' && (
          <>
            {/* Duration selector */}
            <div className="flex items-center gap-2 mb-2">
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
            <Button
              onClick={() => handleStart(timer.duration)}
              loading={loading}
              size="large"
              className="min-w-[200px]"
            >
              Iniciar Pomodoro
            </Button>
          </>
        )}

        {timer.status === 'running' && (
          <div className="flex items-center gap-3">
            <Button variant="glass" onClick={handleStop}>
              Detener
            </Button>
            <AudioPlayer
              isPlaying={audio.isPlaying}
              volume={audio.volume}
              onToggle={() => audio.isPlaying ? audio.pause() : audio.play(timer.audioUrl)}
              onVolumeChange={audio.setVolume}
            />
          </div>
        )}

        {timer.status === 'completed' && !showTreeModal && (
          <div className="flex flex-col items-center gap-3">
            <p className="text-white text-lg font-medium">Pomodoro completado</p>
            <Button onClick={() => timer.nextSession()}>
              Siguiente sesión
            </Button>
          </div>
        )}
      </div>

      {/* Error message */}
      {error && (
        <p className="text-danger text-sm bg-danger/10 px-4 py-2 rounded-lg">{error}</p>
      )}

      {/* Tree earned modal */}
      <Modal open={showTreeModal} onClose={handleCloseModal}>
        <div className="flex flex-col items-center gap-4 p-6 text-center">
          {earnedTree ? (
            <>
              <span className="text-5xl">🌳</span>
              <h2 className="text-2xl font-bold text-gray-800">¡Árbol obtenido!</h2>
              {earnedTree.image_url && (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={earnedTree.image_url}
                  alt={earnedTree.tree_name}
                  className="w-32 h-32 object-contain"
                />
              )}
              <p className="text-lg font-semibold text-gray-700">{earnedTree.tree_name}</p>
              <span className="text-sm font-medium px-3 py-1 rounded-pill bg-primary/10 text-primary">
                {earnedTree.rarity}
              </span>
            </>
          ) : (
            <>
              <span className="text-5xl">⚠️</span>
              <h2 className="text-2xl font-bold text-gray-800">Sin plantillas de árboles</h2>
              <p className="text-gray-600">
                No hay plantillas de árboles disponibles en este momento.
                Tu pomodoro fue completado exitosamente.
              </p>
            </>
          )}
          <Button onClick={handleCloseModal} className="mt-2">
            Continuar
          </Button>
        </div>
      </Modal>
    </div>
  );
}
