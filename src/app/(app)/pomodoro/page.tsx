'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useTimer } from '@/hooks/useTimer';
import { useAudio } from '@/hooks/useAudio';
import { useAuthStore } from '@/stores/auth-store';
import { TimerRing, SessionDots, AudioPlayer, MotivationalQuote, TreeEarnedModal } from '@/components/app';
import { Button, Icon, Modal } from '@/components/ui';
import { POMODORO_DURATIONS, NOTIFICATION_SOUND_URL, getDurationBonusTrees } from '@/lib/utils/constants';

export default function PomodoroPage() {
  const router = useRouter();
  const timer = useTimer();
  const { user } = useAuthStore();
  const ambientSound = user?.settings?.ambient_sound ?? true;
  const notifications = user?.settings?.notifications ?? true;
  const audio = useAudio(!ambientSound);
  const notificationAudioRef = useRef<HTMLAudioElement | null>(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showTreeModal, setShowTreeModal] = useState(false);
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [earnedTrees, setEarnedTrees] = useState<Array<{
    tree_name: string;
    image_url: string;
    description: string;
    probability: number;
    focus_minutes: number;
  }>>([]);

  // Play notification sound
  const playNotification = useCallback(() => {
    if (!notifications) return;
    try {
      const sound = new Audio(NOTIFICATION_SOUND_URL);
      sound.volume = 0.7;
      sound.play().catch(() => {});
      notificationAudioRef.current = sound;
    } catch {}
  }, [notifications]);

  // Auto-complete when timer hits 0
  useEffect(() => {
    if (timer.status === 'running' && timer.timeLeft <= 0) {
      playNotification();
      handleComplete();
    }
  }, [timer.timeLeft, timer.status]);

  // Auto-complete break when it hits 0
  useEffect(() => {
    if (timer.status === 'break' && timer.timeLeft <= 0) {
      playNotification();
      timer.skipBreak();
    }
  }, [timer.timeLeft, timer.status]);

  // Sync ambient_sound setting with audio volume
  useEffect(() => {
    if (!ambientSound && audio.volume > 0) {
      audio.setVolume(0);
    }
  }, [ambientSound]);

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
      if (data?.trees && data.trees.length > 0) {
        setEarnedTrees(
          data.trees.map((item: { tree: any; template: any }) => ({
            tree_name: item.tree.template?.name || item.tree.customName || item.template?.name || '',
            image_url: item.tree.template?.imageUrl || item.template?.imageUrl || '',
            description: item.tree.template?.description || item.template?.description || '',
            probability: item.template?.probability ?? 25,
            focus_minutes: timer.duration,
          }))
        );
      } else {
        setEarnedTrees([]);
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
    setEarnedTrees([]);
    const isCycleComplete = timer.currentSession >= timer.sessionsPerCycle;
    if (isCycleComplete) {
      if (timer.autoStartBreak) {
        timer.nextSession();
        timer.startBreak(true);
      } else {
        timer.completeCycle();
      }
    } else {
      timer.nextSession();
      if (timer.autoStartBreak) {
        timer.startBreak(false);
      }
    }
  }, [timer]);

  const handleViewForest = useCallback(() => {
    setShowTreeModal(false);
    setEarnedTrees([]);
    const isCycleComplete = timer.currentSession >= timer.sessionsPerCycle;
    if (isCycleComplete) {
      timer.completeCycle();
    } else {
      timer.nextSession();
    }
    router.push('/inventory');
  }, [router, timer]);

  const breakMinutes = Math.ceil(timer.breakDuration / 60);
  const totalDisplay = timer.status === 'break'
    ? `de ${breakMinutes}:00`
    : `de ${timer.duration}:00`;

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
          variant={timer.status === 'break' ? 'break' : 'work'}
        />

        {/* Session dots */}
        <SessionDots
          current={
            (timer.status === 'idle' || timer.status === 'break')
              ? (timer.cycleCompleted
                  ? timer.sessionsPerCycle
                  : timer.currentSession - 1)
              : timer.currentSession
          }
          total={timer.sessionsPerCycle}
        />

        {/* Pending sessions per cycle indicator */}
        {timer.pendingSessionsPerCycle !== null && (
          <p className="text-xs text-white/60 flex items-center gap-1">
            <Icon name="schedule" size={14} />
            Próximo ciclo: {timer.pendingSessionsPerCycle} sesiones
          </p>
        )}

        {/* Duration display + selector (idle only) */}
        {timer.status === 'idle' && (
          timer.cycleCompleted ? (
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-pill bg-[#FFD70033] border border-[#FFD70066]">
              <Icon name="emoji_events" size={16} className="text-[#FFD700]" />
              <span className="text-xs font-bold text-white">Ciclo Completado</span>
            </div>
          ) : (
            <>
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-pill bg-[#2E8B5733] border border-[#2E8B5766]">
                <Icon name="self_improvement" size={16} className="text-primary" />
                <span className="text-xs font-bold text-white">Modo Trabajo</span>
              </div>
              <select
                value={timer.duration}
                onChange={(e) => timer.setDuration(Number(e.target.value))}
                disabled={loading}
                className="bg-white-15 text-white border border-white-20 rounded-pill px-4 py-2 text-sm font-medium cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary"
              >
                {POMODORO_DURATIONS.map((d) => (
                  <option key={d} value={d}>{d} min</option>
                ))}
              </select>
            </>
          )
        )}

        {/* Break mode pill + info */}
        {timer.status === 'break' && (
          <>
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-pill bg-[#3B82F633] border border-[#3B82F666]">
              <Icon name="coffee" size={16} className="text-[#3B82F6]" />
              <span className="text-xs font-bold text-white">Modo Descanso</span>
            </div>
            <p className="text-white-80 text-sm text-center">
              {timer.isLongBreak ? 'Descanso largo — ¡Ciclo completado!' : 'Descanso corto'}
            </p>
          </>
        )}

        {/* Start button */}
        {timer.status === 'idle' && (
          <div className="flex flex-col items-center gap-3 w-full">
            {timer.cycleCompleted ? (
              <>
                <Button
                  icon="coffee"
                  onClick={() => { timer.nextSession(); timer.startBreak(true); }}
                  size="large"
                  className="max-w-[300px]"
                >
                  Tomar Descanso Largo
                </Button>
                <button
                  onClick={() => timer.nextSession()}
                  className="text-sm text-white/60 hover:text-white transition-colors bg-transparent border-none cursor-pointer"
                >
                  Comenzar nuevo ciclo
                </button>
              </>
            ) : (
              <>
                <Button
                  icon="play_arrow"
                  onClick={() => handleStart(timer.duration)}
                  loading={loading}
                  size="large"
                  className="max-w-[300px]"
                >
                  Iniciar Pomodoro
                </Button>
                {timer.currentSession > 1 && !timer.breakTaken && (
                  <button
                    onClick={() => timer.startBreak(false)}
                    className="flex items-center gap-2 px-5 py-2.5 rounded-pill border border-[#3B82F666] bg-transparent text-[#3B82F6] text-sm font-medium cursor-pointer transition-colors hover:bg-[#3B82F61A]"
                  >
                    <Icon name="coffee" size={16} className="text-[#3B82F6]" />
                    Tomar Descanso
                  </button>
                )}
                {timer.currentSession > 1 && (
                  <button
                    onClick={() => setShowResetConfirm(true)}
                    className="flex items-center gap-1 text-sm text-white/60 hover:text-white transition-colors bg-transparent border-none cursor-pointer"
                  >
                    <Icon name="restart_alt" size={16} />
                    Reiniciar ciclo
                  </button>
                )}
              </>
            )}
          </div>
        )}

        {/* Skip break button */}
        {timer.status === 'break' && (
          <button
            onClick={() => timer.skipBreak()}
            className="flex items-center gap-2 px-5 py-2.5 rounded-pill border border-white-20 bg-transparent text-white-80 text-sm font-medium cursor-pointer transition-colors hover:bg-white-10"
          >
            <Icon name="skip_next" size={16} className="text-white-80" />
            Saltar descanso
          </button>
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

      {/* Time bonus info (idle only) */}
      {timer.status === 'idle' && !timer.cycleCompleted && (
        <div className="bg-white-10 border border-white-20 rounded-2xl backdrop-blur-[7px] py-4 px-6 max-w-md w-full">
          <div className="flex items-center gap-2 mb-2">
            <Icon name="park" size={18} className="text-primary" />
            <span className="text-sm font-semibold text-white">Recompensas por tiempo</span>
          </div>
          <p className="text-xs text-white/70 leading-relaxed">
            {(() => {
              const bonus = getDurationBonusTrees(timer.duration);
              const total = 1 + bonus;
              return bonus > 0
                ? `Con ${timer.duration} min obtendrás ${total} ${total === 1 ? 'árbol' : 'árboles'}. ¡Sesiones más largas dan más árboles!`
                : `Con ${timer.duration} min obtendrás 1 árbol. Elige 25 min o más para ganar árboles bonus.`;
            })()}
          </p>
        </div>
      )}

      {/* Cycle bonus info (idle only) */}
      {timer.status === 'idle' && !timer.cycleCompleted && (
        <div className="bg-white-10 border border-white-20 rounded-2xl backdrop-blur-[7px] py-4 px-6 max-w-md w-full">
          <div className="flex items-center gap-2 mb-2">
            <Icon name="emoji_events" size={18} className="text-[#FFD700]" />
            <span className="text-sm font-semibold text-white">Recompensas por sesión</span>
          </div>
          <p className="text-xs text-white/70 leading-relaxed">
            {timer.currentSession === timer.sessionsPerCycle
              ? `¡Esta es la última sesión! Al completarla obtendrás ${timer.sessionsPerCycle - 1} árboles bonus.`
              : `Vas en la sesión ${timer.currentSession} de ${timer.sessionsPerCycle}. Al completar la última sesión obtendrás ${timer.sessionsPerCycle - 1} árboles bonus.`
            }
          </p>
        </div>
      )}

      {/* Audio section (running only, not during break) */}
      {timer.status === 'running' && (
        <AudioPlayer
          isPlaying={audio.isPlaying}
          volume={audio.volume}
          onToggle={() => audio.isPlaying ? audio.pause() : audio.play(timer.audioUrl)}
          onVolumeChange={audio.setVolume}
        />
      )}

      {/* Motivational quote (running only, not during break) */}
      {timer.status === 'running' && timer.phrase && (
        <MotivationalQuote phrase={timer.phrase} />
      )}

      {/* Error message */}
      {error && (
        <p className="text-danger text-sm bg-danger/10 px-4 py-2 rounded-lg">{error}</p>
      )}

      {/* Reset cycle confirmation modal */}
      <Modal open={showResetConfirm} onClose={() => setShowResetConfirm(false)}>
        <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-6 max-w-sm mx-4 text-center">
          <Icon name="restart_alt" size={40} className="text-white/80 mx-auto mb-3" />
          <h3 className="text-lg font-semibold text-white mb-2">Reiniciar ciclo</h3>
          <p className="text-sm text-white/70 mb-5">
            Volverás a la sesión 1{timer.pendingSessionsPerCycle !== null
              ? ` y se aplicarán ${timer.pendingSessionsPerCycle} sesiones por ciclo`
              : ''}. El progreso del ciclo actual se perderá.
          </p>
          <div className="flex gap-3">
            <button
              onClick={() => setShowResetConfirm(false)}
              className="flex-1 py-2.5 rounded-xl border border-white/20 bg-transparent text-white/80 text-sm font-medium cursor-pointer hover:bg-white/10 transition-colors"
            >
              Cancelar
            </button>
            <button
              onClick={() => { timer.resetCycle(); setShowResetConfirm(false); }}
              className="flex-1 py-2.5 rounded-xl border-none bg-primary text-white text-sm font-semibold cursor-pointer hover:opacity-90 transition-opacity"
            >
              Reiniciar
            </button>
          </div>
        </div>
      </Modal>

      {/* Tree earned modal */}
      <TreeEarnedModal
        open={showTreeModal}
        trees={earnedTrees}
        onClose={handleCloseModal}
        onViewForest={handleViewForest}
      />
    </div>
  );
}
