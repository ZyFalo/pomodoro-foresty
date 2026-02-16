'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/stores/auth-store';
import { Button, Icon, Toast } from '@/components/ui';
import { POMODORO_DURATIONS, DEFAULT_USER_SETTINGS, MIN_LONG_BREAK_DURATION, MIN_SESSIONS_PER_CYCLE, NOTIFICATION_SOUND_URL } from '@/lib/utils/constants';
import type { IUserSettings } from '@/types';

// Merge user settings with defaults, filtering out undefined values from cache
function mergeWithDefaults(userSettings?: Partial<IUserSettings>): IUserSettings {
  if (!userSettings) return { ...DEFAULT_USER_SETTINGS };
  const defined = Object.fromEntries(
    Object.entries(userSettings).filter(([, v]) => v !== undefined && v !== null)
  );
  return { ...DEFAULT_USER_SETTINGS, ...defined } as IUserSettings;
}

export default function SettingsPage() {
  const router = useRouter();
  const { token, user, updateSettings } = useAuthStore();
  const [settings, setSettings] = useState(() => mergeWithDefaults(user?.settings));
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<{ message: string; variant: 'success' | 'error' } | null>(null);
  const closeToast = useCallback(() => setToast(null), []);

  // Password change
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [changingPassword, setChangingPassword] = useState(false);

  useEffect(() => {
    if (user?.settings) setSettings(mergeWithDefaults(user.settings));
  }, [user?.settings]);

  const headers = {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${token}`,
  };

  const handleSaveSettings = async () => {
    setSaving(true);
    setToast(null);
    try {
      const res = await fetch('/api/users/me/settings', {
        method: 'PUT',
        headers,
        body: JSON.stringify(settings),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      updateSettings(data.settings);
      router.push('/pomodoro');
    } catch (err: unknown) {
      setToast({ message: err instanceof Error ? err.message : 'Error al guardar', variant: 'error' });
    } finally {
      setSaving(false);
    }
  };

  const handleChangePassword = async () => {
    if (newPassword !== confirmPassword) {
      setToast({ message: 'Las contraseñas no coinciden', variant: 'error' });
      return;
    }
    setChangingPassword(true);
    setToast(null);
    try {
      const res = await fetch('/api/users/me/password', {
        method: 'PUT',
        headers,
        body: JSON.stringify({ current_password: currentPassword, new_password: newPassword }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setToast({ message: 'Contraseña actualizada', variant: 'success' });
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err: unknown) {
      setToast({ message: err instanceof Error ? err.message : 'Error al cambiar contraseña', variant: 'error' });
    } finally {
      setChangingPassword(false);
    }
  };

  const toggleSetting = (key: 'ambient_sound' | 'notifications' | 'auto_start_break') => {
    setSettings((prev) => ({ ...prev, [key]: !prev[key] }));
    if (key === 'notifications') {
      try {
        const sound = new Audio(NOTIFICATION_SOUND_URL);
        sound.volume = 0.7;
        sound.play().catch(() => {});
      } catch {}
    }
  };

  return (
    <div className="flex-1 px-8 py-6 max-w-2xl mx-auto w-full">
      <h1 className="text-2xl font-bold text-white mb-6">Ajustes</h1>

      {/* Timer settings */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-4">
        <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
          <Icon name="timer" size={20} className="text-primary" />
          Temporizador
        </h2>

        <div className="space-y-4">
          {/* Pomodoro duration */}
          <div>
            <div className="flex items-center gap-1.5 mb-2">
              <label className="text-sm font-medium text-gray-600">Duración Pomodoro</label>
              <div className="relative group">
                <Icon name="info" size={16} className="text-gray-400 cursor-help" />
                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1.5 px-3 py-2 bg-gray-800 text-white text-xs rounded-lg whitespace-nowrap opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity z-10">
                  Tiempo de enfoque por sesión. Sesiones de 25 min o más otorgan árboles bonus.
                  <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-gray-800" />
                </div>
              </div>
            </div>
            <select
              value={settings.pomodoro_duration}
              onChange={(e) => setSettings((s) => ({ ...s, pomodoro_duration: Number(e.target.value) }))}
              className="bg-gray-100 text-gray-700 border border-gray-200 rounded-lg px-4 py-2 text-sm font-medium cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary"
            >
              {POMODORO_DURATIONS.map((d) => (
                <option key={d} value={d}>{d} min</option>
              ))}
            </select>
          </div>

          {/* Break duration */}
          <div>
            <div className="flex items-center gap-1.5 mb-2">
              <label className="text-sm font-medium text-gray-600">Duración Descanso Corto</label>
              <div className="relative group">
                <Icon name="info" size={16} className="text-gray-400 cursor-help" />
                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1.5 px-3 py-2 bg-gray-800 text-white text-xs rounded-lg whitespace-nowrap opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity z-10">
                  Pausa entre sesiones para descansar antes de la siguiente.
                  <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-gray-800" />
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <input
                type="range"
                min={1}
                max={30}
                value={settings.break_duration}
                onChange={(e) => setSettings((s) => ({ ...s, break_duration: parseInt(e.target.value) }))}
                className="flex-1 accent-primary"
              />
              <span className="text-sm font-medium text-gray-700 w-14 text-right">{settings.break_duration} min</span>
            </div>
          </div>

          {/* Long break duration */}
          <div>
            <div className="flex items-center gap-1.5 mb-2">
              <label className="text-sm font-medium text-gray-600">Duración Descanso Largo</label>
              <div className="relative group">
                <Icon name="info" size={16} className="text-gray-400 cursor-help" />
                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1.5 px-3 py-2 bg-gray-800 text-white text-xs rounded-lg whitespace-nowrap opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity z-10">
                  Descanso extendido al completar todas las sesiones de un ciclo.
                  <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-gray-800" />
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <input
                type="range"
                min={MIN_LONG_BREAK_DURATION}
                max={60}
                value={settings.long_break_duration}
                onChange={(e) => setSettings((s) => ({ ...s, long_break_duration: parseInt(e.target.value) }))}
                className="flex-1 accent-primary"
              />
              <span className="text-sm font-medium text-gray-700 w-14 text-right">{settings.long_break_duration} min</span>
            </div>
          </div>

          {/* Sessions per cycle */}
          <div>
            <div className="flex items-center gap-1.5 mb-2">
              <label className="text-sm font-medium text-gray-600">Sesiones por ciclo</label>
              <div className="relative group">
                <Icon name="info" size={16} className="text-gray-400 cursor-help" />
                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1.5 px-3 py-2 bg-gray-800 text-white text-xs rounded-lg whitespace-nowrap opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity z-10">
                  Si cambias este valor a mitad de un ciclo, se aplicará en el siguiente.
                  <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-gray-800" />
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <input
                type="range"
                min={MIN_SESSIONS_PER_CYCLE}
                max={10}
                value={settings.sessions_per_cycle}
                onChange={(e) => setSettings((s) => ({ ...s, sessions_per_cycle: parseInt(e.target.value) }))}
                className="flex-1 accent-primary"
              />
              <span className="text-sm font-medium text-gray-700 w-14 text-right">{settings.sessions_per_cycle}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Preferences */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-4">
        <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
          <Icon name="tune" size={20} className="text-primary" />
          Preferencias
        </h2>

        <div className="space-y-3">
          {[
            { key: 'ambient_sound' as const, label: 'Sonido ambiental', desc: 'Sonidos de bosque durante el pomodoro', tooltip: 'Reproduce sonidos relajantes de naturaleza mientras trabajas.' },
            { key: 'notifications' as const, label: 'Notificaciones', desc: 'Avisar cuando termine el pomodoro', tooltip: 'Emite un sonido al finalizar la sesión o el descanso.' },
            { key: 'auto_start_break' as const, label: 'Auto-iniciar descanso', desc: 'Iniciar descanso automáticamente', tooltip: 'El descanso comienza sin necesidad de pulsar un botón.' },
          ].map(({ key, label, desc, tooltip }) => (
            <div key={key} className="flex items-center justify-between py-2">
              <div>
                <div className="flex items-center gap-1.5">
                  <p className="text-sm font-medium text-gray-700">{label}</p>
                  <div className="relative group">
                    <Icon name="info" size={16} className="text-gray-400 cursor-help" />
                    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1.5 px-3 py-2 bg-gray-800 text-white text-xs rounded-lg whitespace-nowrap opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity z-10">
                      {tooltip}
                      <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-gray-800" />
                    </div>
                  </div>
                </div>
                <p className="text-xs text-gray-400">{desc}</p>
              </div>
              <button
                onClick={() => toggleSetting(key)}
                className={`relative w-11 h-6 rounded-full transition-colors cursor-pointer border-none ${
                  settings[key] ? 'bg-primary' : 'bg-gray-300'
                }`}
              >
                <div
                  className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform ${
                    settings[key] ? 'translate-x-[22px]' : 'translate-x-0.5'
                  }`}
                />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Save settings */}
      <div className="mb-6">
        <Button onClick={handleSaveSettings} loading={saving} fullWidth={false}>
          Guardar ajustes
        </Button>
      </div>

      {/* Change password */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-4">
        <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
          <Icon name="lock" size={20} className="text-primary" />
          Cambiar contraseña
        </h2>

        <div className="space-y-3">
          <input
            type="password"
            placeholder="Contraseña actual"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm outline-none focus:border-primary"
          />
          <input
            type="password"
            placeholder="Nueva contraseña"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm outline-none focus:border-primary"
          />
          <input
            type="password"
            placeholder="Confirmar nueva contraseña"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm outline-none focus:border-primary"
          />
          <Button
            onClick={handleChangePassword}
            loading={changingPassword}
            variant="outline"
            fullWidth={false}
          >
            Cambiar contraseña
          </Button>
        </div>
      </div>

      <Toast
        open={toast !== null}
        message={toast?.message ?? ''}
        variant={toast?.variant ?? 'success'}
        onClose={closeToast}
      />
    </div>
  );
}
