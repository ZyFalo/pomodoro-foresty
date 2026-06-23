'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/stores/auth-store';
import { Sidebar } from '@/components/admin';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const { isAuthenticated, user, _hasHydrated } = useAuthStore();

  useEffect(() => {
    if (!_hasHydrated) return;
    if (!isAuthenticated) {
      router.replace('/login');
    } else if (user?.role !== 'admin') {
      router.replace('/pomodoro');
    }
  }, [_hasHydrated, isAuthenticated, user?.role, router]);

  if (!_hasHydrated) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-forest">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  if (!isAuthenticated || user?.role !== 'admin') return null;

  return (
    <div className="relative min-h-screen w-full font-sans">
      {/* Fondo atmosférico de bosque (fijo) */}
      <div className="fixed inset-0 bg-forest grain pointer-events-none" />
      <div className="fixed -top-40 -left-40 w-[34rem] h-[34rem] rounded-full bg-primary/12 blur-[150px] animate-float pointer-events-none" />
      <div className="fixed -bottom-52 -right-32 w-[40rem] h-[40rem] rounded-full bg-accent-green/8 blur-[160px] animate-float [animation-delay:3s] pointer-events-none" />

      {/* Shell */}
      <div className="relative z-10 flex min-h-screen">
        <Sidebar />
        <main className="flex-1 overflow-auto min-w-0">
          <div className="mx-auto w-full max-w-6xl px-6 py-8 sm:px-8 lg:px-10">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
