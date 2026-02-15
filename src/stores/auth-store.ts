import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { IUserSettings } from '@/types';

interface AuthUser {
  id: string;
  username: string;
  email: string;
  role: 'user' | 'admin';
  email_verified: boolean;
  settings: IUserSettings;
}

interface AuthState {
  token: string | null;
  user: AuthUser | null;
  isAuthenticated: boolean;
  setAuth: (token: string, user: AuthUser) => void;
  updateUser: (data: Partial<AuthUser>) => void;
  updateSettings: (settings: Partial<IUserSettings>) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      token: null,
      user: null,
      isAuthenticated: false,
      setAuth: (token, user) => set({ token, user, isAuthenticated: true }),
      updateUser: (data) => set((state) => ({
        user: state.user ? { ...state.user, ...data } : null,
      })),
      updateSettings: (settings) => set((state) => ({
        user: state.user ? { ...state.user, settings: { ...state.user.settings, ...settings } } : null,
      })),
      logout: () => set({ token: null, user: null, isAuthenticated: false }),
    }),
    {
      name: 'pf-auth',
    }
  )
);
