'use client';

import { useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { AuthCard, OTPInput } from '@/components/auth';
import { Button, GlassCard, Input } from '@/components/ui';
import { useAuth } from '@/hooks/useAuth';

function ResetPasswordContent() {
  const { resetPassword } = useAuth();
  const searchParams = useSearchParams();
  const email = searchParams.get('email') ?? '';

  const [code, setCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (code.length !== 6) {
      setError('Ingresa el código completo de 6 dígitos');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('Las contraseñas no coinciden');
      return;
    }

    if (newPassword.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres');
      return;
    }

    setLoading(true);
    try {
      // resetPassword hace auto-login y redirige a la plataforma
      await resetPassword(email, code, newPassword);
      setSuccess('Contraseña restablecida correctamente. Redirigiendo...');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al restablecer');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthCard subtitle="Restablece tu contraseña" small>
      <GlassCard variant="dark" width="440px" compact>
        <h2 className="font-display text-2xl font-semibold text-white text-center">Restablecer Contraseña</h2>
        <p className="text-[13px] text-white-60 text-center">
          Ingresa el código enviado a tu email y tu nueva contraseña
        </p>

        <form onSubmit={handleSubmit} className="w-full flex flex-col gap-3.5">
          {/* OTP Section */}
          <div className="w-full flex flex-col gap-1.5">
            <label className="text-[13px] font-medium text-white-80">Código de verificación</label>
            <OTPInput value={code} onChange={setCode} small />
          </div>

          {/* Password fields */}
          <div className="w-full flex flex-col gap-3">
            <Input
              label="Nueva contraseña"
              labelSize="small"
              icon="lock"
              type="password"
              placeholder="Mínimo 6 caracteres"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
            />
            <span className="text-[11px] text-white-50">
              Debe contener mayúsculas, minúsculas y números
            </span>

            <Input
              label="Confirmar contraseña"
              labelSize="small"
              icon="lock"
              type="password"
              placeholder="Repite tu nueva contraseña"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />
          </div>

          {error && <p className="text-sm text-danger text-center">{error}</p>}
          {success && <p className="text-sm text-success text-center">{success}</p>}

          <Button type="submit" icon="lock_reset" loading={loading}>
            Restablecer contraseña
          </Button>
        </form>
      </GlassCard>

      <Link href="/login" className="text-sm text-white-50 no-underline hover:text-white-80 transition-colors">
        ← Volver al inicio de sesión
      </Link>

      {/* Footer */}
      <div className="fixed bottom-0 left-0 w-full flex flex-col items-center gap-0.5 py-2">
        <span className="text-xs text-white-40">Pomodoro Forest © 2025</span>
        <span className="text-[11px] text-white-27">Tu nueva contraseña debe ser segura y única</span>
      </div>
    </AuthCard>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense>
      <ResetPasswordContent />
    </Suspense>
  );
}
