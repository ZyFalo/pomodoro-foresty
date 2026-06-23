'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { AuthCard } from '@/components/auth';
import { OTPInput } from '@/components/auth';
import { Button, GlassCard } from '@/components/ui';
import { useAuth } from '@/hooks/useAuth';

function VerifyEmailContent() {
  const { verifyEmail, resendCode } = useAuth();
  const searchParams = useSearchParams();
  const email = searchParams.get('email') ?? '';

  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [countdown, setCountdown] = useState(299); // 4:59

  useEffect(() => {
    if (countdown <= 0) return;
    const timer = setInterval(() => setCountdown((c) => c - 1), 1000);
    return () => clearInterval(timer);
  }, [countdown]);

  const minutes = Math.floor(countdown / 60);
  const seconds = countdown % 60;

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (code.length !== 6) {
      setError('Ingresa el código completo de 6 dígitos');
      return;
    }
    setError('');
    setLoading(true);
    try {
      // verifyEmail hace auto-login y redirige a la plataforma
      await verifyEmail(email, code);
      setSuccess('Email verificado correctamente. Redirigiendo...');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al verificar');
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    try {
      await resendCode(email);
      setCountdown(299);
      setSuccess('Código reenviado');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al reenviar');
    }
  };

  return (
    <AuthCard subtitle="Verifica tu cuenta para continuar" small>
      <GlassCard variant="light" width="420px">
        <h2 className="text-xl text-white text-center">Código de Verificación</h2>
        <p className="text-sm text-white-60 text-center">
          Ingresa el código de 6 dígitos enviado a tu correo electrónico
        </p>

        <form onSubmit={handleVerify} className="w-full flex flex-col items-center gap-5">
          <OTPInput value={code} onChange={setCode} />

          {error && <p className="text-sm text-danger text-center">{error}</p>}
          {success && <p className="text-sm text-success text-center">{success}</p>}

          <Button type="submit" icon="verified" loading={loading}>
            Verificar Código
          </Button>
        </form>

        <p className="text-[13px] text-white-50 text-center">
          ¿No recibiste el código?{' '}
          <button onClick={handleResend} className="text-accent-green font-medium cursor-pointer bg-transparent border-none">
            Reenviar
          </button>
        </p>

        {countdown > 0 && (
          <p className="text-xs text-white-40 text-center">
            El código expira en {minutes}:{seconds.toString().padStart(2, '0')}
          </p>
        )}
      </GlassCard>

      <Link href="/login" className="text-sm text-white-50 no-underline hover:text-white-80 transition-colors">
        ← Volver al inicio de sesión
      </Link>

      {/* Footer */}
      <div className="fixed bottom-0 left-0 w-full flex flex-col items-center gap-0.5 py-2">
        <span className="text-xs text-white-40">Pomodoro Forest © 2025</span>
        <span className="text-[11px] text-white-27">Verifica tu identidad para proteger tu cuenta</span>
      </div>
    </AuthCard>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense>
      <VerifyEmailContent />
    </Suspense>
  );
}
