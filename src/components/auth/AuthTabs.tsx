'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Icon } from '@/components/ui';

export function AuthTabs() {
  const pathname = usePathname();
  const isLogin = pathname === '/login';
  const isRegister = pathname === '/register';

  const baseTab = 'flex-1 flex items-center justify-center gap-1.5 h-10 px-5 rounded-pill text-sm font-medium transition-all cursor-pointer';
  const activeTab = 'bg-primary text-white font-semibold';
  const inactiveTab = 'text-[#FFFFFFAA] hover:text-white';

  return (
    <div className="w-full flex gap-2 p-1 bg-white-8 rounded-pill h-12 items-center">
      {isLogin ? (
        <div className={`${baseTab} ${activeTab}`}>
          <Icon name="login" size={18} />
          Iniciar Sesión
        </div>
      ) : (
        <Link href="/login" className={`${baseTab} ${inactiveTab} no-underline`}>
          <Icon name="login" size={18} />
          Iniciar Sesión
        </Link>
      )}
      {isRegister ? (
        <div className={`${baseTab} ${activeTab}`}>
          <Icon name="person_add" size={18} />
          Registrarse
        </div>
      ) : (
        <Link href="/register" className={`${baseTab} ${inactiveTab} no-underline`}>
          <Icon name="person_add" size={18} />
          Registrarse
        </Link>
      )}
    </div>
  );
}
