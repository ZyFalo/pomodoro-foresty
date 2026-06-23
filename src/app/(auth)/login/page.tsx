'use client';

import { useState } from 'react';
import Link from 'next/link';
import { AuthCard, AuthTabs } from '@/components/auth';
import { Button, Input, GlassCard, Icon } from '@/components/ui';
import { useAuth } from '@/hooks/useAuth';

export default function LoginPage() {
  const { login } = useAuth();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(username, password);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al iniciar sesión');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthCard subtitle="Mejora tu productividad mientras cultivas tu bosque">
      <GlassCard variant="dark">
        <AuthTabs />

        <form key="login" onSubmit={handleSubmit} className="w-full flex flex-col gap-4 stagger">
          <Input
            label="Usuario"
            type="text"
            placeholder="Ingresa tu usuario"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />

          <Input
            label="Contraseña"
            type="password"
            placeholder="Ingresa tu contraseña"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          <Link
            href="/forgot-password"
            className="text-[13px] font-medium text-accent-green text-right no-underline hover:underline"
          >
            ¿Olvidaste tu contraseña?
          </Link>

          {error && (
            <p className="text-sm text-danger text-center">{error}</p>
          )}

          <Button type="submit" icon="login" loading={loading}>
            Iniciar Sesión
          </Button>

          {/* Divider */}
          <div className="w-full flex items-center gap-3">
            <div className="flex-1 h-px bg-gradient-to-r from-transparent to-white-20" />
            <span className="text-[13px] font-medium text-white-40">o</span>
            <div className="flex-1 h-px bg-gradient-to-l from-transparent to-white-20" />
          </div>

          {/* Google button — próximamente (deshabilitado) */}
          <div className="relative">
            <Button variant="glass" icon="public" type="button" disabled>
              Continuar con Google
            </Button>
            <span className="absolute top-1/2 right-3 -translate-y-1/2 px-2 py-0.5 rounded-pill bg-accent-green/20 border border-accent-green/40 text-[10px] font-semibold text-accent-green">
              Próximamente
            </span>
          </div>
        </form>
      </GlassCard>

      {/* Trust badges */}
      <div className="flex items-center justify-center gap-2.5 flex-wrap animate-fade-up [animation-delay:200ms]">
        {[
          { icon: 'verified_user', text: 'Datos seguros' },
          { icon: 'group', text: '500+ usuarios' },
          { icon: 'eco', text: '100% gratuito' },
        ].map(({ icon, text }) => (
          <div key={icon} className="flex items-center gap-1.5 px-3 py-1.5 rounded-pill bg-white-5 border border-white-10">
            <Icon name={icon} size={15} className="text-accent-green" />
            <span className="text-xs text-white-60">{text}</span>
          </div>
        ))}
      </div>
    </AuthCard>
  );
}
