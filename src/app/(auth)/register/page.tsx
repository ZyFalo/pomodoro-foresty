'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { AuthCard, AuthTabs } from '@/components/auth';
import { Button, Input, GlassCard } from '@/components/ui';
import { useAuth } from '@/hooks/useAuth';

export default function RegisterPage() {
  const { register } = useAuth();
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError('Las contraseñas no coinciden');
      return;
    }

    if (!acceptTerms) {
      setError('Debes aceptar los términos de servicio');
      return;
    }

    setLoading(true);
    try {
      await register(username, email, password);
      // Redirect to verify email with the email in search params
      router.push(`/verify-email?email=${encodeURIComponent(email)}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al registrarse');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthCard subtitle="Mejora tu productividad mientras cultivas tu bosque">
      <GlassCard variant="dark" compact>
        <AuthTabs />

        <form key="register" onSubmit={handleSubmit} className="w-full flex flex-col gap-3.5 stagger">
          <Input
            label="Usuario"
            type="text"
            placeholder="Ingresa tu usuario"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />

          <Input
            label="Correo electrónico"
            type="email"
            placeholder="tu@email.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <Input
            label="Contraseña"
            type="password"
            placeholder="Crea una contraseña"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          <span className="text-[11px] text-white-60">
            Mínimo 6 caracteres
          </span>

          <Input
            label="Confirmar contraseña"
            type="password"
            placeholder="Repite tu contraseña"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
          />

          {/* Terms checkbox */}
          <label className="w-full flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={acceptTerms}
              onChange={(e) => setAcceptTerms(e.target.checked)}
              className="w-[18px] h-[18px] rounded border-2 border-[#FFFFFF55] accent-primary"
            />
            <span className="text-xs text-[#FFFFFFAA]">
              Acepto los términos de servicio y política de privacidad
            </span>
          </label>

          {error && (
            <p className="text-sm text-danger text-center">{error}</p>
          )}

          <Button type="submit" loading={loading}>
            Crear Cuenta
          </Button>
        </form>

        {/* Already have account */}
        <div className="flex items-center justify-center gap-1">
          <span className="text-[13px] text-[#FFFFFFAA]">¿Ya tienes una cuenta?</span>
          <Link href="/login" className="text-[13px] font-semibold text-accent-green no-underline hover:underline">
            Inicia sesión
          </Link>
        </div>
      </GlassCard>
    </AuthCard>
  );
}
