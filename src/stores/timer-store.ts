import { create } from 'zustand';
import { persist } from 'zustand/middleware';

type TimerStatus = 'idle' | 'running' | 'paused' | 'break' | 'completed';

interface TimerState {
  status: TimerStatus;
  sessionId: string | null;
  duration: number; // minutes
  timeLeft: number; // seconds
  currentSession: number; // 1-based
  sessionsPerCycle: number;
  phrase: string;
  audioUrl: string;
  breakDuration: number; // seconds for current break
  isLongBreak: boolean;
  breakTaken: boolean;

  cycleCompleted: boolean;
  pendingSessionsPerCycle: number | null;

  setSession: (data: {
    sessionId: string;
    duration: number;
    phrase: string;
    audioUrl: string;
  }) => void;
  setDuration: (minutes: number) => void;
  setStatus: (status: TimerStatus) => void;
  tick: () => void;
  setTimeLeft: (seconds: number) => void;
  nextSession: () => void;
  reset: () => void;
  resetCycle: () => void;
  completeCycle: () => void;
  configure: (sessions: number) => void;
  startBreak: (durationMinutes: number, isLong: boolean) => void;
  skipBreak: () => void;
}

export const useTimerStore = create<TimerState>()(
  persist(
    (set, get) => ({
      status: 'idle',
      sessionId: null,
      duration: 25,
      timeLeft: 25 * 60,
      currentSession: 1,
      sessionsPerCycle: 4,
      phrase: '',
      audioUrl: '',
      breakDuration: 0,
      isLongBreak: false,
      breakTaken: false,
      cycleCompleted: false,
      pendingSessionsPerCycle: null,

      setSession: (data) =>
        set({
          sessionId: data.sessionId,
          duration: data.duration,
          timeLeft: Math.round(data.duration * 60),
          phrase: data.phrase,
          audioUrl: data.audioUrl,
          status: 'running',
          cycleCompleted: false,
        }),

      setDuration: (minutes) =>
        set({ duration: minutes, timeLeft: Math.round(minutes * 60) }),

      setStatus: (status) => set({ status }),

      tick: () => {
        const { timeLeft } = get();
        if (timeLeft > 0) {
          set({ timeLeft: timeLeft - 1 });
        }
      },

      setTimeLeft: (seconds) => set({ timeLeft: seconds }),

      nextSession: () => {
        const { currentSession, sessionsPerCycle, pendingSessionsPerCycle } = get();
        if (currentSession < sessionsPerCycle) {
          set({ currentSession: currentSession + 1, status: 'idle', cycleCompleted: false, breakTaken: false });
        } else {
          const newSessions = pendingSessionsPerCycle ?? sessionsPerCycle;
          set({
            currentSession: 1,
            status: 'idle',
            cycleCompleted: false,
            breakTaken: false,
            sessionsPerCycle: newSessions,
            pendingSessionsPerCycle: null,
          });
        }
      },

      reset: () =>
        set({
          status: 'idle',
          sessionId: null,
          timeLeft: Math.round(get().duration * 60),
          phrase: '',
          audioUrl: '',
          cycleCompleted: false,
        }),

      resetCycle: () => {
        const { pendingSessionsPerCycle, sessionsPerCycle, duration } = get();
        const newSessions = pendingSessionsPerCycle ?? sessionsPerCycle;
        set({
          currentSession: 1,
          status: 'idle',
          sessionId: null,
          timeLeft: Math.round(duration * 60),
          phrase: '',
          audioUrl: '',
          breakTaken: false,
          cycleCompleted: false,
          sessionsPerCycle: newSessions,
          pendingSessionsPerCycle: null,
        });
      },

      completeCycle: () =>
        set({
          cycleCompleted: true,
          status: 'idle',
          sessionId: null,
          timeLeft: Math.round(get().duration * 60),
          phrase: '',
          audioUrl: '',
        }),

      configure: (sessions) => {
        const { currentSession, status, cycleCompleted, sessionsPerCycle } = get();
        if (sessions === sessionsPerCycle) {
          set({ pendingSessionsPerCycle: null });
          return;
        }
        const canApplyNow = cycleCompleted || (currentSession === 1 && status === 'idle' && !cycleCompleted);
        if (canApplyNow) {
          set({ sessionsPerCycle: sessions, pendingSessionsPerCycle: null });
        } else {
          set({ pendingSessionsPerCycle: sessions });
        }
      },

      startBreak: (durationMinutes, isLong) => {
        const seconds = Math.round(durationMinutes * 60);
        set({
          status: 'break',
          timeLeft: seconds,
          breakDuration: seconds,
          isLongBreak: isLong,
          breakTaken: true,
          sessionId: null,
          phrase: '',
          audioUrl: '',
        });
      },

      skipBreak: () => {
        set({
          status: 'idle',
          timeLeft: Math.round(get().duration * 60),
          breakDuration: 0,
          isLongBreak: false,
        });
      },
    }),
    {
      name: 'pf-timer',
      partialize: (state) => ({
        currentSession: state.currentSession,
        sessionsPerCycle: state.sessionsPerCycle,
        duration: state.duration,
        cycleCompleted: state.cycleCompleted,
        pendingSessionsPerCycle: state.pendingSessionsPerCycle,
        // Persist running state for offline recovery; break resets to idle
        status: state.status === 'running' ? 'running' : 'idle',
        sessionId: state.status === 'running' ? state.sessionId : null,
        timeLeft: state.status === 'running' ? state.timeLeft : Math.round(state.duration * 60),
      }),
    }
  )
);
