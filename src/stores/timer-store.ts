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

  setSession: (data: {
    sessionId: string;
    duration: number;
    phrase: string;
    audioUrl: string;
  }) => void;
  setStatus: (status: TimerStatus) => void;
  tick: () => void;
  setTimeLeft: (seconds: number) => void;
  nextSession: () => void;
  reset: () => void;
  configure: (sessions: number) => void;
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

      setSession: (data) =>
        set({
          sessionId: data.sessionId,
          duration: data.duration,
          timeLeft: data.duration * 60,
          phrase: data.phrase,
          audioUrl: data.audioUrl,
          status: 'running',
        }),

      setStatus: (status) => set({ status }),

      tick: () => {
        const { timeLeft } = get();
        if (timeLeft > 0) {
          set({ timeLeft: timeLeft - 1 });
        }
      },

      setTimeLeft: (seconds) => set({ timeLeft: seconds }),

      nextSession: () => {
        const { currentSession, sessionsPerCycle } = get();
        if (currentSession < sessionsPerCycle) {
          set({ currentSession: currentSession + 1, status: 'idle' });
        } else {
          set({ currentSession: 1, status: 'idle' });
        }
      },

      reset: () =>
        set({
          status: 'idle',
          sessionId: null,
          timeLeft: get().duration * 60,
          phrase: '',
          audioUrl: '',
        }),

      configure: (sessions) => set({ sessionsPerCycle: sessions }),
    }),
    {
      name: 'pf-timer',
      partialize: (state) => ({
        currentSession: state.currentSession,
        sessionsPerCycle: state.sessionsPerCycle,
        duration: state.duration,
        // Persist running state for offline recovery
        status: state.status === 'running' ? 'running' : 'idle',
        sessionId: state.status === 'running' ? state.sessionId : null,
        timeLeft: state.status === 'running' ? state.timeLeft : state.duration * 60,
      }),
    }
  )
);
