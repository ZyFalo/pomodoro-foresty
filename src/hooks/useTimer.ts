'use client';

import { useEffect, useRef, useCallback } from 'react';
import { useTimerStore } from '@/stores/timer-store';
import { useAuthStore } from '@/stores/auth-store';

export function useTimer() {
  const store = useTimerStore();
  const { token } = useAuthStore();
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // Tick every second when running
  useEffect(() => {
    if (store.status === 'running') {
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
        body: JSON.stringify({ session_id: store.sessionId }),
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

  // Format time
  const minutes = Math.floor(store.timeLeft / 60);
  const seconds = store.timeLeft % 60;
  const timeDisplay = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;

  // Progress (0 to 1)
  const totalSeconds = store.duration * 60;
  const progress = totalSeconds > 0 ? 1 - store.timeLeft / totalSeconds : 0;

  return {
    ...store,
    timeDisplay,
    progress,
    startPomodoro,
    completePomodoro,
    stopPomodoro,
  };
}
