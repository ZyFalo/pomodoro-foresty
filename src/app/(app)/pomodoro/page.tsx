'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useTimer } from '@/hooks/useTimer';
import { useAudio } from '@/hooks/useAudio';
import { useAuthStore } from '@/stores/auth-store';
import { TimerRing, GrowingTree, SessionDots, AudioPlayer, MotivationalQuote, TreeEarnedModal } from '@/components/app';
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

  // Crecimiento del árbol: semilla en reposo, crece con la sesión, adulto al completar
  const growth = timer.status === 'completed' ? 1 : timer.status === 'idle' ? 0 : timer.progress;
  const treeVariant = timer.status === 'break' ? 'break' : 'work';
  const bonusTrees = getDurationBonusTrees(timer.duration);

  return (
    <div className="flex-1 flex flex-col items-center justify-center gap-6 px-4 py-10">
      {/* Anillo + árbol que crece (protagonista) */}
      <div className="flex flex-col items-center gap-5 animate-scale-in">
        <TimerRing
          progress={timer.progress}
          timeDisplay={timer.timeDisplay}
          totalDisplay={totalDisplay}
          variant={treeVariant}
          dial={
            timer.status === 'idle' && !timer.cycleCompleted
              ? {
                  value: timer.duration,
                  durations: POMODORO_DURATIONS,
                  onChange: (v) => timer.setDuration(v),
                  disabled: loading,
                }
              : undefined
          }
        >
          <GrowingTree progress={growth} size={76} variant={treeVariant} />
        </TimerRing>

        {/* Indicador de ciclo (sutil) */}
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

        {timer.pendingSessionsPerCycle !== null && (
          <p className="text-xs text-white-50 flex items-center gap-1.5">
            <Icon name="schedule" size={14} />
            Próximo ciclo: {timer.pendingSessionsPerCycle} sesiones
          </p>
        )}
      </div>

      {/* Frase motivacional durante la sesión (sobre el árbol) */}
      {timer.status === 'running' && timer.phrase && (
        <MotivationalQuote phrase={timer.phrase} />
      )}

      {/* Estado de descanso */}
      {timer.status === 'break' && (
        <div className="flex flex-col items-center gap-1.5 animate-fade-up">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-pill bg-blue/15 border border-blue/40">
            <Icon name="coffee" size={16} className="text-blue" />
            <span className="text-xs font-semibold text-white tracking-wide">Descanso</span>
          </div>
          <p className="text-white-60 text-sm text-center">
            {timer.isLongBreak ? 'Descanso largo — ¡buen trabajo!' : 'Respira un momento'}
          </p>
        </div>
      )}

      {/* Mensaje + affordance del dial (idle, no ciclo completo) */}
      {timer.status === 'idle' && !timer.cycleCompleted && (
        <div className="flex flex-col items-center gap-2 animate-fade-up">
          <p className="text-white-60 text-[15px] text-center">
            Planta un árbol y concéntrate. Tu bosque crece contigo. 🌱
          </p>
          <p className="flex items-center gap-1.5 text-xs text-white-40">
            <Icon name="open_with" size={14} className="text-amber" />
            Arrastra el punto dorado para ajustar el tiempo
          </p>
        </div>
      )}

      {/* Ciclo completado */}
      {timer.status === 'idle' && timer.cycleCompleted && (
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-pill bg-gold/15 border border-gold/40 shadow-[0_0_18px_rgba(255,215,0,0.2)] animate-fade-up">
          <Icon name="emoji_events" size={16} className="text-gold" />
          <span className="text-xs font-semibold text-white tracking-wide">¡Ciclo completado!</span>
        </div>
      )}

      {/* Acción primaria + secundarias */}
      {timer.status === 'idle' && (
        <div className="flex flex-col items-center gap-3 w-full max-w-[300px]">
          {timer.cycleCompleted ? (
            <>
              <Button icon="coffee" onClick={() => { timer.nextSession(); timer.startBreak(true); }} size="large">
                Tomar descanso largo
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
              <Button icon="park" onClick={() => handleStart(timer.duration)} loading={loading} size="large">
                Plantar
              </Button>
              <div className="flex items-center gap-4">
                {timer.currentSession > 1 && !timer.breakTaken && (
                  <button
                    onClick={() => timer.startBreak(false)}
                    className="flex items-center gap-1.5 text-sm text-blue hover:text-blue/80 transition-colors bg-transparent border-none cursor-pointer"
                  >
                    <Icon name="coffee" size={16} />
                    Descanso
                  </button>
                )}
                {timer.currentSession > 1 && (
                  <button
                    onClick={() => setShowResetConfirm(true)}
                    className="flex items-center gap-1.5 text-sm text-white-40 hover:text-white transition-colors bg-transparent border-none cursor-pointer"
                  >
                    <Icon name="restart_alt" size={16} />
                    Reiniciar
                  </button>
                )}
              </div>
            </>
          )}
        </div>
      )}

      {/* Saltar descanso */}
      {timer.status === 'break' && (
        <button
          onClick={() => timer.skipBreak()}
          className="flex items-center gap-2 px-5 py-2.5 rounded-pill border border-white-15 bg-white-5 text-white-80 text-sm font-medium cursor-pointer transition-all duration-200 hover:bg-white-10 hover:text-white hover:-translate-y-0.5"
        >
          <Icon name="skip_next" size={16} className="text-white-80" />
          Saltar descanso
        </button>
      )}

      {/* Detener (sesión activa) */}
      {timer.status === 'running' && (
        <button
          onClick={handleStop}
          className="group flex items-center justify-center gap-2 px-7 h-12 rounded-pill border border-danger/40 bg-danger/15 text-danger cursor-pointer font-semibold transition-all duration-200 hover:bg-danger/25 hover:-translate-y-0.5"
        >
          <Icon name="stop" size={20} className="transition-transform duration-200 group-hover:scale-110" />
          Detener
        </button>
      )}

      {/* Completado (sin modal) */}
      {timer.status === 'completed' && !showTreeModal && (
        <div className="flex flex-col items-center gap-3 animate-fade-up">
          <p className="font-display text-white text-lg font-medium">¡Pomodoro completado!</p>
          <Button onClick={() => timer.nextSession()} fullWidth={false}>
            Siguiente sesión
          </Button>
        </div>
      )}

      {/* Audio ambiental (sesión activa) */}
      {timer.status === 'running' && (
        <AudioPlayer
          isPlaying={audio.isPlaying}
          volume={audio.volume}
          onToggle={() => audio.isPlaying ? audio.pause() : audio.play(timer.audioUrl)}
          onVolumeChange={audio.setVolume}
        />
      )}

      {/* Recompensa: una sola línea discreta (idle) */}
      {timer.status === 'idle' && !timer.cycleCompleted && (
        <p className="text-xs text-white-40 text-center max-w-sm leading-relaxed">
          {timer.duration} min → {1 + bonusTrees} {1 + bonusTrees === 1 ? 'árbol' : 'árboles'}
          {' · '}completa el ciclo ({timer.sessionsPerCycle}) para +{timer.sessionsPerCycle - 1} bonus
        </p>
      )}

      {/* Error */}
      {error && (
        <p className="flex items-center gap-2 text-danger text-sm bg-danger/10 border border-danger/30 px-4 py-2.5 rounded-xl animate-fade-up">
          <Icon name="error" size={16} />
          {error}
        </p>
      )}

      {/* Reset cycle confirmation modal */}
      <Modal open={showResetConfirm} onClose={() => setShowResetConfirm(false)}>
        <div className="bg-[#0E1A12]/90 backdrop-blur-[20px] border border-white-15 rounded-[28px] p-7 max-w-sm mx-4 text-center shadow-[0_24px_60px_rgba(0,0,0,0.5),inset_0_1px_0_rgba(255,255,255,0.07)]">
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
