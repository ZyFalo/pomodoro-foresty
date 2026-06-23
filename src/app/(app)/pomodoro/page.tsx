'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useTimer } from '@/hooks/useTimer';
import { useAudio } from '@/hooks/useAudio';
import { useAuthStore } from '@/stores/auth-store';
import { TimerRing, SessionDots, AudioPlayer, MotivationalQuote, TreeEarnedModal } from '@/components/app';
import { Button, Icon, Modal } from '@/components/ui';
import { POMODORO_DURATIONS, NOTIFICATION_SOUND_URL, getDurationBonusTrees } from '@/lib/utils/constants';
import type { UserTree, Template } from '@/types';

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
    // Must fire only when the timer reaches 0; handlers are intentionally excluded.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [timer.timeLeft, timer.status]);

  // Auto-complete break when it hits 0
  useEffect(() => {
    if (timer.status === 'break' && timer.timeLeft <= 0) {
      playNotification();
      timer.skipBreak();
    }
    // Must fire only when the break reaches 0; timer object is intentionally excluded.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [timer.timeLeft, timer.status]);

  // Sync ambient_sound setting with audio volume
  useEffect(() => {
    if (!ambientSound && audio.volume > 0) {
      audio.setVolume(0);
    }
    // React only to the ambientSound setting; audio object is intentionally excluded.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ambientSound]);

  // Play audio when session starts
  useEffect(() => {
    if (timer.status === 'running' && timer.audioUrl) {
      audio.play(timer.audioUrl);
    } else if (timer.status !== 'running') {
      audio.stop();
    }
    // React only to session status/audioUrl; audio object is intentionally excluded.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [timer.status, timer.audioUrl]);

  const handleStart = useCallback(async (duration?: number) => {
    setError('');
    setLoading(true);
    try {
      await timer.startPomodoro(duration);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al iniciar el pomodoro');
    } finally {
      setLoading(false);
    }
  }, [timer]);

  const handleComplete = useCallback(async () => {
    try {
      const data = await timer.completePomodoro();
      if (data?.trees && data.trees.length > 0) {
        setEarnedTrees(
          data.trees.map((item: { tree: UserTree & { template: Template }; template: Template }) => ({
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
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al completar el pomodoro');
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
    <div className="flex-1 flex flex-col items-center gap-8 px-4 py-10">
      {/* Page header */}
      <div className="text-center animate-fade-up">
        <h1 className="font-display text-5xl font-semibold text-white mb-2 tracking-tight">Pomodoro Timer</h1>
        <p className="text-base text-white-60">Mejora tu concentración, cultiva tu bosque</p>
      </div>

      {/* Timer card glass */}
      <div className="bg-[#0E1A12]/70 border border-white-15 rounded-[28px] backdrop-blur-[20px] py-9 px-10 max-w-md w-full flex flex-col items-center gap-6 shadow-[0_24px_60px_rgba(0,0,0,0.45),inset_0_1px_0_rgba(255,255,255,0.06)] animate-fade-up [animation-delay:80ms]">
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
          <p className="text-xs text-white-50 flex items-center gap-1.5">
            <Icon name="schedule" size={14} />
            Próximo ciclo: {timer.pendingSessionsPerCycle} sesiones
          </p>
        )}

        {/* Duration display + selector (idle only) */}
        {timer.status === 'idle' && (
          timer.cycleCompleted ? (
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-pill bg-gold/15 border border-gold/40 shadow-[0_0_18px_rgba(255,215,0,0.2)]">
              <Icon name="emoji_events" size={16} className="text-gold" />
              <span className="text-xs font-semibold text-white tracking-wide">Ciclo Completado</span>
            </div>
          ) : (
            <>
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-pill bg-primary/15 border border-primary/40">
                <Icon name="self_improvement" size={16} className="text-accent-green" />
                <span className="text-xs font-semibold text-white tracking-wide">Modo Trabajo</span>
              </div>
              <select
                value={timer.duration}
                onChange={(e) => timer.setDuration(Number(e.target.value))}
                disabled={loading}
                className="bg-white-8 text-white border border-white-15 rounded-pill px-4 py-2 text-sm font-medium cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary/40 hover:bg-white-10 transition-colors disabled:opacity-50"
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
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-pill bg-blue/15 border border-blue/40">
              <Icon name="coffee" size={16} className="text-blue" />
              <span className="text-xs font-semibold text-white tracking-wide">Modo Descanso</span>
            </div>
            <p className="text-white-60 text-sm text-center">
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
                  className="text-sm text-white-50 hover:text-white transition-colors bg-transparent border-none cursor-pointer"
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
                    className="flex items-center gap-2 px-5 py-2.5 rounded-pill border border-blue/40 bg-blue/5 text-blue text-sm font-medium cursor-pointer transition-all duration-200 hover:bg-blue/15 hover:-translate-y-0.5"
                  >
                    <Icon name="coffee" size={16} className="text-blue" />
                    Tomar Descanso
                  </button>
                )}
                {timer.currentSession > 1 && (
                  <button
                    onClick={() => setShowResetConfirm(true)}
                    className="flex items-center gap-1.5 text-sm text-white-50 hover:text-white transition-colors bg-transparent border-none cursor-pointer"
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
            className="flex items-center gap-2 px-5 py-2.5 rounded-pill border border-white-15 bg-white-5 text-white-80 text-sm font-medium cursor-pointer transition-all duration-200 hover:bg-white-10 hover:text-white hover:-translate-y-0.5"
          >
            <Icon name="skip_next" size={16} className="text-white-80" />
            Saltar descanso
          </button>
        )}

        {/* Stop button */}
        {timer.status === 'running' && (
          <button
            onClick={handleStop}
            className="group w-full max-w-[300px] h-12 flex items-center justify-center gap-2 rounded-pill border border-danger/40 bg-danger/15 text-danger cursor-pointer font-semibold transition-all duration-200 hover:bg-danger/25 hover:-translate-y-0.5"
          >
            <Icon name="stop" size={20} className="transition-transform duration-200 group-hover:scale-110" />
            Detener
          </button>
        )}

        {/* Completed (no modal) */}
        {timer.status === 'completed' && !showTreeModal && (
          <div className="flex flex-col items-center gap-3">
            <p className="font-display text-white text-lg font-medium">Pomodoro completado</p>
            <Button onClick={() => timer.nextSession()}>
              Siguiente sesión
            </Button>
          </div>
        )}
      </div>

      {/* Reward info cards (idle only) */}
      {timer.status === 'idle' && !timer.cycleCompleted && (
        <div className="grid sm:grid-cols-2 gap-4 max-w-md w-full stagger">
          {/* Time bonus */}
          <div className="group bg-white-8 border border-white-15 rounded-2xl backdrop-blur-[14px] py-4 px-5 transition-all duration-200 hover:border-white-20 hover:bg-white-10">
            <div className="flex items-center gap-2 mb-2">
              <span className="w-7 h-7 rounded-lg bg-primary/15 border border-primary/25 flex items-center justify-center shrink-0">
                <Icon name="park" size={16} className="text-accent-green" />
              </span>
              <span className="text-sm font-semibold text-white">Recompensas por tiempo</span>
            </div>
            <p className="text-xs text-white-50 leading-relaxed">
              {(() => {
                const bonus = getDurationBonusTrees(timer.duration);
                const total = 1 + bonus;
                return bonus > 0
                  ? `Con ${timer.duration} min obtendrás ${total} ${total === 1 ? 'árbol' : 'árboles'}. ¡Sesiones más largas dan más árboles!`
                  : `Con ${timer.duration} min obtendrás 1 árbol. Elige 25 min o más para ganar árboles bonus.`;
              })()}
            </p>
          </div>

          {/* Cycle bonus */}
          <div className="group bg-white-8 border border-white-15 rounded-2xl backdrop-blur-[14px] py-4 px-5 transition-all duration-200 hover:border-white-20 hover:bg-white-10">
            <div className="flex items-center gap-2 mb-2">
              <span className="w-7 h-7 rounded-lg bg-gold/15 border border-gold/25 flex items-center justify-center shrink-0">
                <Icon name="emoji_events" size={16} className="text-gold" />
              </span>
              <span className="text-sm font-semibold text-white">Recompensas por sesión</span>
            </div>
            <p className="text-xs text-white-50 leading-relaxed">
              {timer.currentSession === timer.sessionsPerCycle
                ? `¡Esta es la última sesión! Al completarla obtendrás ${timer.sessionsPerCycle - 1} árboles bonus.`
                : `Vas en la sesión ${timer.currentSession} de ${timer.sessionsPerCycle}. Al completar la última sesión obtendrás ${timer.sessionsPerCycle - 1} árboles bonus.`
              }
            </p>
          </div>
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
        <p className="flex items-center gap-2 text-danger text-sm bg-danger/10 border border-danger/30 px-4 py-2.5 rounded-xl animate-fade-up">
          <Icon name="error" size={16} />
          {error}
        </p>
      )}

      {/* Reset cycle confirmation modal */}
      <Modal open={showResetConfirm} onClose={() => setShowResetConfirm(false)}>
        <div className="bg-[#0E1A12]/85 backdrop-blur-[20px] border border-white-15 rounded-[28px] p-7 max-w-sm mx-4 text-center shadow-[0_24px_60px_rgba(0,0,0,0.5),inset_0_1px_0_rgba(255,255,255,0.07)] animate-scale-in">
          <div className="w-14 h-14 rounded-2xl bg-white-8 border border-white-15 flex items-center justify-center mx-auto mb-4">
            <Icon name="restart_alt" size={28} className="text-white-80" />
          </div>
          <h3 className="font-display text-xl font-semibold text-white mb-2">Reiniciar ciclo</h3>
          <p className="text-sm text-white-60 mb-6 leading-relaxed">
            Volverás a la sesión 1{timer.pendingSessionsPerCycle !== null
              ? ` y se aplicarán ${timer.pendingSessionsPerCycle} sesiones por ciclo`
              : ''}. El progreso del ciclo actual se perderá.
          </p>
          <div className="flex gap-3">
            <button
              onClick={() => setShowResetConfirm(false)}
              className="flex-1 py-2.5 rounded-pill border border-white-15 bg-white-5 text-white-80 text-sm font-medium cursor-pointer hover:bg-white-10 hover:text-white transition-all duration-200"
            >
              Cancelar
            </button>
            <button
              onClick={() => { timer.resetCycle(); setShowResetConfirm(false); }}
              className="flex-1 py-2.5 rounded-pill border-none bg-gradient-to-br from-primary to-primary-dark text-white text-sm font-semibold cursor-pointer shadow-[0_4px_16px_rgba(46,139,87,0.35)] hover:shadow-[0_8px_28px_rgba(46,139,87,0.5)] hover:-translate-y-0.5 transition-all duration-200"
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
