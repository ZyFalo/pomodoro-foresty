'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Icon } from '@/components/ui';
import { useAuth } from '@/hooks/useAuth';
import { useTimerStore } from '@/stores/timer-store';

const ITEMS = [
  { href: '/pomodoro', label: 'Enfoque', icon: 'timer' },
  { href: '/inventory', label: 'Mi Bosque', icon: 'forest' },
  { href: '/settings', label: 'Ajustes', icon: 'settings' },
];

export function Dock() {
  const pathname = usePathname();
  const { logout } = useAuth();
  const status = useTimerStore((s) => s.status);
  // Modo zen: durante la sesión activa el dock se difumina y vuelve al pasar el cursor
  const zen = status === 'running';

  return (
    <div
      className={`fixed bottom-5 left-1/2 -translate-x-1/2 z-40 transition-all duration-500 ${
        zen ? 'opacity-25 hover:opacity-100' : 'opacity-100'
      }`}
    >
      <nav className="flex items-center gap-1 p-1.5 rounded-pill bg-[#0C1610]/80 border border-white-10 backdrop-blur-xl shadow-[0_12px_40px_rgba(0,0,0,0.5)]">
        {ITEMS.map(({ href, label, icon }) => {
          const active = pathname === href;
          return (
            <Link
              key={href}
              href={href}
              aria-label={label}
              className={`group relative flex items-center justify-center w-12 h-12 rounded-full no-underline transition-all duration-200 ${
                active
                  ? 'bg-gradient-to-br from-primary to-primary-dark text-white shadow-[0_4px_14px_rgba(46,139,87,0.45)]'
                  : 'text-white-50 hover:text-white hover:bg-white-8'
              }`}
            >
              <Icon name={icon} size={22} filled={active} />
              <span className="absolute -top-9 px-2.5 py-1 rounded-lg bg-[#0C1610] border border-white-10 text-xs text-white whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity duration-200">
                {label}
              </span>
            </Link>
          );
        })}

        <div className="w-px h-7 bg-white-10 mx-1" />

        <button
          onClick={logout}
          aria-label="Cerrar sesión"
          className="group relative flex items-center justify-center w-12 h-12 rounded-full bg-transparent border-none cursor-pointer text-white-40 hover:text-danger hover:bg-danger/10 transition-all duration-200"
        >
          <Icon name="logout" size={20} />
          <span className="absolute -top-9 px-2.5 py-1 rounded-lg bg-[#0C1610] border border-white-10 text-xs text-white whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity duration-200">
            Salir
          </span>
        </button>
      </nav>
    </div>
  );
}
