'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/stores/auth-store';
import { Dock } from '@/components/app';

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const { isAuthenticated, _hasHydrated } = useAuthStore();

  useEffect(() => {
    if (_hasHydrated && !isAuthenticated) {
      router.replace('/login');
    }
  }, [_hasHydrated, isAuthenticated, router]);

  if (!_hasHydrated) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-forest">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  if (!isAuthenticated) return null;

  return (
    <div className="relative min-h-screen w-full font-sans">
      {/* Fondo atmosférico de bosque (fijo) */}
      <div className="fixed inset-0 bg-forest grain pointer-events-none" />
      <div className="fixed -top-40 -left-40 w-[34rem] h-[34rem] rounded-full bg-primary/12 blur-[150px] animate-float pointer-events-none" />
      <div className="fixed -bottom-52 -right-32 w-[40rem] h-[40rem] rounded-full bg-accent-green/8 blur-[160px] animate-float [animation-delay:3s] pointer-events-none" />

      {/* Content (a pantalla completa; el dock flota encima) */}
      <div className="relative z-10 min-h-screen flex flex-col">
        <main className="flex-1 flex flex-col pb-28">
          {children}
        </main>
      </div>

      {/* Dock flotante de navegación */}
      <Dock />
    </div>
  );
}
