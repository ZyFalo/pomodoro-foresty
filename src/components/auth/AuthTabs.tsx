'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Icon } from '@/components/ui';

export function AuthTabs() {
  const pathname = usePathname();
  const isLogin = pathname === '/login';

  return (
    <div className="w-full relative flex p-1 bg-white-8 rounded-pill h-12 items-center overflow-hidden">
      {/* Sliding pill indicator */}
      <div
        key={pathname}
        className={`absolute top-1 bottom-1 w-[calc(50%-4px)] bg-primary rounded-pill ${
          isLogin ? 'left-1 animate-tab-left' : 'right-1 animate-tab-right'
        }`}
      />

      <Link
        href="/login"
        className={`flex-1 relative z-10 flex items-center justify-center gap-1.5 h-10 rounded-pill text-sm no-underline transition-colors duration-200 cursor-pointer ${
          isLogin ? 'text-white font-semibold' : 'text-[#FFFFFFAA] hover:text-white font-medium'
        }`}
      >
        <Icon name="login" size={18} />
        Iniciar Sesión
      </Link>

      <Link
        href="/register"
        className={`flex-1 relative z-10 flex items-center justify-center gap-1.5 h-10 rounded-pill text-sm no-underline transition-colors duration-200 cursor-pointer ${
          !isLogin ? 'text-white font-semibold' : 'text-[#FFFFFFAA] hover:text-white font-medium'
        }`}
      >
        <Icon name="person_add" size={18} />
        Registrarse
      </Link>
    </div>
  );
}
