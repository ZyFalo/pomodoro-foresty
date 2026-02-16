'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/stores/auth-store';
import { Navbar } from '@/components/app';

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
      <div className="flex items-center justify-center min-h-screen">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-green-500 border-t-transparent" />
      </div>
    );
  }

  if (!isAuthenticated) return null;

  return (
    <div className="relative min-h-screen w-full font-sans">
      {/* Background image */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        className="fixed inset-0 w-full h-full object-cover"
        src="https://images.unsplash.com/photo-1597146333334-9956865bc7f5?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w4NDM0ODN8MHwxfHJhbmRvbXx8fHx8fHx8fDE3NzAxMjYzNDJ8&ixlib=rb-4.1.0&q=80&w=1920"
        alt="Forest background"
      />

      {/* Dark overlay */}
      <div className="fixed inset-0 bg-black/50" />

      {/* Content */}
      <div className="relative z-10 min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-1 flex flex-col">
          {children}
        </main>
      </div>
    </div>
  );
}
