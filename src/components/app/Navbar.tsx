'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Icon } from '@/components/ui';
import { useAuth } from '@/hooks/useAuth';

export function Navbar() {
  const pathname = usePathname();
  const { user, logout } = useAuth();

  const links = [
    { href: '/pomodoro', label: 'Pomodoro', icon: 'timer' },
    { href: '/inventory', label: 'Mi Bosque', icon: 'forest' },
  ];

  const initial = user?.username?.charAt(0).toUpperCase() ?? 'U';

  return (
    <nav className="w-full h-16 px-4 sm:px-8 bg-[#0C1610]/70 backdrop-blur-xl border-b border-white-10 flex items-center justify-between z-30 sticky top-0">
      {/* Brand */}
      <Link href="/pomodoro" className="flex items-center gap-2.5 group no-underline shrink-0">
        <div className="w-10 h-10 rounded-[12px] bg-gradient-to-br from-primary-light to-primary-dark flex items-center justify-center shadow-[0_4px_14px_rgba(46,139,87,0.4)] transition-transform duration-200 group-hover:scale-105">
          <Icon name="forest" size={20} className="text-white" filled />
        </div>
        <span className="font-display text-lg font-semibold text-white hidden sm:block">Pomodoro Forest</span>
      </Link>

      {/* Navigation links — pill */}
      <div className="flex items-center gap-1 p-1 bg-white-5 border border-white-10 rounded-pill">
        {links.map(({ href, label, icon }) => {
          const active = pathname === href;
          return (
            <Link
              key={href}
              href={href}
              className={`flex items-center gap-1.5 px-3.5 h-9 rounded-pill text-sm font-medium no-underline transition-all duration-200 ${
                active
                  ? 'bg-white-10 text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.08)]'
                  : 'text-white-50 hover:text-white hover:bg-white-5'
              }`}
            >
              <Icon name={icon} size={17} />
              <span className="hidden sm:block">{label}</span>
            </Link>
          );
        })}
      </div>

      {/* User */}
      <div className="flex items-center gap-2 shrink-0">
        <Link
          href="/settings"
          className="flex items-center gap-2 pl-1 pr-1 sm:pr-3 py-1 rounded-pill bg-white-5 border border-white-10 no-underline hover:bg-white-10 transition-colors"
        >
          <span className="w-7 h-7 rounded-full bg-gradient-to-br from-primary-light to-primary-dark flex items-center justify-center text-white text-xs font-semibold">
            {initial}
          </span>
          <span className="text-sm font-medium text-white-80 hidden sm:block">{user?.username ?? 'Usuario'}</span>
        </Link>
        <button
          onClick={logout}
          className="w-9 h-9 rounded-full bg-white-5 border border-white-10 flex items-center justify-center cursor-pointer text-white-50 hover:text-white hover:bg-white-10 transition-colors"
          aria-label="Cerrar sesión"
        >
          <Icon name="logout" size={17} />
        </button>
      </div>
    </nav>
  );
}
