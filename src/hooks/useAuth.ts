'use client';

import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/stores/auth-store';
import { useTimerStore } from '@/stores/timer-store';
import { useCallback } from 'react';

const API_BASE = '/api/auth';

async function fetchAPI<T>(url: string, options?: RequestInit): Promise<T> {
  const res = await fetch(url, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Error en la solicitud');
  return data as T;
}

export function useAuth() {
  const router = useRouter();
  const { setAuth, logout: storeLogout, token, user, isAuthenticated } = useAuthStore();

  const login = useCallback(async (username: string, password: string) => {
    const data = await fetchAPI<{ token: string; user: any }>(`${API_BASE}/login`, {
      method: 'POST',
      body: JSON.stringify({ username, password }),
    });
    setAuth(data.token, data.user);

    if (!data.user.email_verified) {
      router.push('/verify-email');
    } else if (data.user.role === 'admin') {
      router.push('/admin');
    } else {
      router.push('/pomodoro');
    }
    return data;
  }, [setAuth, router]);

  const register = useCallback(async (username: string, email: string, password: string) => {
    const data = await fetchAPI<{ message: string; email: string }>(`${API_BASE}/register`, {
      method: 'POST',
      body: JSON.stringify({ username, email, password }),
    });
    return data;
  }, []);

  const verifyEmail = useCallback(async (email: string, code: string) => {
    const data = await fetchAPI<{ message: string }>(`${API_BASE}/verify-email`, {
      method: 'POST',
      body: JSON.stringify({ email, code }),
    });
    return data;
  }, []);

  const resendCode = useCallback(async (email: string) => {
    const data = await fetchAPI<{ message: string }>(`${API_BASE}/resend-code`, {
      method: 'POST',
      body: JSON.stringify({ email }),
    });
    return data;
  }, []);

  const forgotPassword = useCallback(async (email: string) => {
    const data = await fetchAPI<{ message: string }>(`${API_BASE}/forgot-password`, {
      method: 'POST',
      body: JSON.stringify({ email }),
    });
    return data;
  }, []);

  const resetPassword = useCallback(async (email: string, code: string, new_password: string) => {
    const data = await fetchAPI<{ message: string }>(`${API_BASE}/reset-password`, {
      method: 'POST',
      body: JSON.stringify({ email, code, new_password }),
    });
    return data;
  }, []);

  const logout = useCallback(() => {
    useTimerStore.getState().reset();
    storeLogout();
    router.push('/login');
  }, [storeLogout, router]);

  return {
    token,
    user,
    isAuthenticated,
    login,
    register,
    verifyEmail,
    resendCode,
    forgotPassword,
    resetPassword,
    logout,
  };
}
