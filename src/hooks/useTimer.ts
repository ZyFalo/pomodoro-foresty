'use client';

import { useEffect, useRef, useCallback } from 'react';
import { useTimerStore } from '@/stores/timer-store';
import { useAuthStore } from '@/stores/auth-store';

export function useTimer() {
  const store = useTimerStore();
  const { token, user } = useAuthStore();
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // User settings
  const breakDurationSetting = user?.settings?.break_duration ?? 5;
  const longBreakDurationSetting = user?.settings?.long_break_duration ?? 15;
  const autoStartBreak = user?.settings?.auto_start_break ?? false;
  const pomodoroDurationSetting = user?.settings?.pomodoro_duration ?? 25;
  const sessionsPerCycleSetting = user?.settings?.sessions_per_cycle ?? 4;

  // Sync user settings → timer store
  useEffect(() => {
    if (store.status === 'idle') {
      if (store.duration !== pomodoroDurationSetting) {
        store.setDuration(pomodoroDurationSetting);
      }
    }
    if (store.sessionsPerCycle !== sessionsPerCycleSetting || store.pendingSessionsPerCycle !== null) {
      store.configure(sessionsPerCycleSetting);
    }
  }, [pomodoroDurationSetting, sessionsPerCycleSetting, store.sessionsPerCycle, store.pendingSessionsPerCycle]);

  // Tick every second when running or on break
  useEffect(() => {
    if (store.status === 'running' || store.status === 'break') {
      intervalRef.current = setInterval(() => {
        store.tick();
      }, 1000);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [store.status]);

  const startPomodoro = useCallback(async (duration?: number) => {
    try {
      const res = await fetch('/api/pomodoro/start', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ duration }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      store.setSession({
        sessionId: data.session_id,
        duration: data.duration,
        phrase: data.phrase,
        audioUrl: data.audio_url,
      });

      return data;
    } catch (error) {
      throw error;
    }
  }, [token, store]);

  const completePomodoro = useCallback(async () => {
    if (!store.sessionId) return null;

    try {
      const res = await fetch('/api/pomodoro/complete', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          session_id: store.sessionId,
          session_number: store.currentSession,
          sessions_per_cycle: store.sessionsPerCycle,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      store.setStatus('completed');
      return data;
    } catch (error) {
      throw error;
    }
  }, [token, store]);

  const stopPomodoro = useCallback(() => {
    store.reset();
  }, [store]);

  const startBreak = useCallback((isLong?: boolean) => {
    const isCycleComplete = isLong ?? (store.currentSession >= store.sessionsPerCycle);
    const duration = isCycleComplete ? longBreakDurationSetting : breakDurationSetting;
    store.startBreak(duration, isCycleComplete);
  }, [store, breakDurationSetting, longBreakDurationSetting]);

  const skipBreak = useCallback(() => {
    store.skipBreak();
  }, [store]);

  // Format time
  const minutes = Math.floor(store.timeLeft / 60);
  const seconds = Math.round(store.timeLeft % 60);
  const timeDisplay = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;

  // Progress (0 to 1)
  const totalSeconds = store.status === 'break' ? store.breakDuration : store.duration * 60;
  const progress = totalSeconds > 0 ? 1 - store.timeLeft / totalSeconds : 0;

  return {
    ...store,
    timeDisplay,
    progress,
    startPomodoro,
    completePomodoro,
    stopPomodoro,
    startBreak,
    skipBreak,
    autoStartBreak,
  };
}
