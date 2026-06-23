'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { AuthCard } from '@/components/auth';
import { Button, GlassCard, Input } from '@/components/ui';
import { useAuth } from '@/hooks/useAuth';

export default function ForgotPasswordPage() {
  const { forgotPassword } = useAuth();
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await forgotPassword(email);
      setSuccess('Si el email está registrado, recibirás un código.');
      setTimeout(() => {
        router.push(`/reset-password?email=${encodeURIComponent(email)}`);
      }, 2000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al enviar el código');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthCard subtitle="Recupera el acceso a tu cuenta" small>
      <GlassCard variant="dark" width="440px" compact>
        <h2 className="font-display text-2xl font-semibold text-white text-center">Recuperar Contraseña</h2>
        <p className="text-sm text-white-60 text-center">
          Ingresa tu email y te enviaremos un código para restablecer tu contraseña
        </p>

        <form onSubmit={handleSubmit} className="w-full flex flex-col gap-5">
          <Input
            label="Correo electrónico"
            labelSize="small"
            icon="mail"
            type="email"
            placeholder="tu@email.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          {error && <p className="text-sm text-danger text-center">{error}</p>}
          {success && <p className="text-sm text-success text-center">{success}</p>}

          <Button type="submit" icon="send" loading={loading}>
            Enviar código
          </Button>
        </form>
      </GlassCard>

      <Link href="/login" className="text-sm text-white-50 no-underline hover:text-white-80 transition-colors">
        ← Volver al inicio de sesión
      </Link>

      {/* Footer */}
      <div className="fixed bottom-0 left-0 w-full flex flex-col items-center gap-0.5 py-2">
        <span className="text-xs text-white-40">Pomodoro Forest © 2025</span>
        <span className="text-[11px] text-white-27">Recupera el acceso a tu cuenta de forma segura</span>
      </div>
    </AuthCard>
  );
}
