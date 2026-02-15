'use client';

import { useState, useEffect } from 'react';
import { useAuthStore } from '@/stores/auth-store';
import { Button, Icon } from '@/components/ui';
import { POMODORO_DURATIONS } from '@/lib/utils/constants';

export default function SettingsPage() {
  const { token, user, updateSettings } = useAuthStore();
  const [settings, setSettings] = useState(user?.settings ?? {
    pomodoro_duration: 25,
    break_duration: 5,
    sessions_per_cycle: 4,
    ambient_sound: true,
    notifications: true,
    auto_start_break: false,
  });
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  // Password change
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [changingPassword, setChangingPassword] = useState(false);

  useEffect(() => {
    if (user?.settings) setSettings(user.settings);
  }, [user?.settings]);

  const headers = {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${token}`,
  };

  const handleSaveSettings = async () => {
    setSaving(true);
    setError('');
    setSuccess('');
    try {
      const res = await fetch('/api/users/me/settings', {
        method: 'PUT',
        headers,
        body: JSON.stringify(settings),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      updateSettings(data.settings);
      setSuccess('Ajustes guardados');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Error al guardar');
    } finally {
      setSaving(false);
    }
  };

  const handleChangePassword = async () => {
    if (newPassword !== confirmPassword) {
      setError('Las contraseñas no coinciden');
      return;
    }
    setChangingPassword(true);
    setError('');
    setSuccess('');
    try {
      const res = await fetch('/api/users/me/password', {
        method: 'PUT',
        headers,
        body: JSON.stringify({ current_password: currentPassword, new_password: newPassword }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setSuccess('Contraseña actualizada');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Error al cambiar contraseña');
    } finally {
      setChangingPassword(false);
    }
  };

  const toggleSetting = (key: 'ambient_sound' | 'notifications' | 'auto_start_break') => {
    setSettings((prev) => ({ ...prev, [key]: !prev[key] }));
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
            <label className="text-sm font-medium text-gray-600 mb-2 block">Duración Pomodoro</label>
            <div className="flex gap-2">
              {POMODORO_DURATIONS.map((d) => (
                <button
                  key={d}
                  onClick={() => setSettings((s) => ({ ...s, pomodoro_duration: d }))}
                  className={`px-4 py-2 rounded-lg text-sm font-medium border-none cursor-pointer transition-colors ${
                    settings.pomodoro_duration === d
                      ? 'bg-primary text-white'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {d} min
                </button>
              ))}
            </div>
          </div>

          {/* Break duration */}
          <div>
            <label className="text-sm font-medium text-gray-600 mb-2 block">Duración Descanso</label>
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

          {/* Sessions per cycle */}
          <div>
            <label className="text-sm font-medium text-gray-600 mb-2 block">Sesiones por ciclo</label>
            <div className="flex items-center gap-3">
              <input
                type="range"
                min={1}
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
            { key: 'ambient_sound' as const, label: 'Sonido ambiental', desc: 'Sonidos de bosque durante el pomodoro' },
            { key: 'notifications' as const, label: 'Notificaciones', desc: 'Avisar cuando termine el pomodoro' },
            { key: 'auto_start_break' as const, label: 'Auto-iniciar descanso', desc: 'Iniciar descanso automáticamente' },
          ].map(({ key, label, desc }) => (
            <div key={key} className="flex items-center justify-between py-2">
              <div>
                <p className="text-sm font-medium text-gray-700">{label}</p>
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

      {/* Feedback messages */}
      {success && (
        <p className="text-success text-sm bg-success/10 px-4 py-2 rounded-lg mb-4">{success}</p>
      )}
      {error && (
        <p className="text-danger text-sm bg-danger/10 px-4 py-2 rounded-lg mb-4">{error}</p>
      )}
    </div>
  );
}
