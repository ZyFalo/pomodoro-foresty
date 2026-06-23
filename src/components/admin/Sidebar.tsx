'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Icon } from '@/components/ui';
import { useAuth } from '@/hooks/useAuth';

const NAV_ITEMS = [
  { href: '/admin', icon: 'dashboard', label: 'Dashboard' },
  { href: '/admin/templates', icon: 'park', label: 'Plantillas' },
  { href: '/admin/users', icon: 'group', label: 'Usuarios' },
  { href: '/admin/logs', icon: 'history', label: 'Actividad' },
];

export function Sidebar() {
  const pathname = usePathname();
  const { logout } = useAuth();

  return (
    <aside className="w-64 h-screen sticky top-0 shrink-0 flex flex-col bg-[#0C1610]/70 backdrop-blur-xl border-r border-white-10">
      {/* Brand */}
      <div className="px-5 py-6 flex items-center gap-3 border-b border-white-10">
        <div className="w-10 h-10 rounded-[12px] bg-gradient-to-br from-primary-light to-primary-dark flex items-center justify-center shadow-[0_4px_14px_rgba(46,139,87,0.4)]">
          <Icon name="park" size={20} className="text-white" filled />
        </div>
        <div className="min-w-0">
          <p className="font-display text-base font-semibold text-white leading-tight truncate">Pomodoro Forest</p>
          <p className="text-xs text-white-40 leading-tight">Panel Admin</p>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 py-5 px-3 space-y-1">
        {NAV_ITEMS.map(({ href, icon, label }) => {
          const isActive = href === '/admin'
            ? pathname === '/admin'
            : pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              className={`group flex items-center gap-3 px-3.5 h-11 rounded-2xl text-sm font-medium no-underline transition-all duration-200 ${
                isActive
                  ? 'bg-primary/20 text-white border border-primary/30 shadow-[inset_0_1px_0_rgba(255,255,255,0.08)]'
                  : 'text-white-50 border border-transparent hover:bg-white-5 hover:text-white'
              }`}
            >
              <Icon
                name={icon}
                size={20}
                filled={isActive}
                className={`transition-transform duration-200 group-hover:scale-110 ${isActive ? 'text-primary-light' : ''}`}
              />
              {label}
              {isActive && (
                <span className="ml-auto h-1.5 w-1.5 rounded-full bg-primary-light shadow-[0_0_8px_rgba(46,139,87,0.8)]" />
              )}
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="px-3 py-4 border-t border-white-10">
        <button
          onClick={logout}
          className="group flex items-center gap-3 px-3.5 h-11 rounded-2xl text-sm font-medium text-white-50 hover:bg-white-5 hover:text-white transition-all duration-200 w-full border border-transparent bg-transparent cursor-pointer"
        >
          <Icon name="logout" size={20} className="transition-transform duration-200 group-hover:scale-110" />
          Cerrar sesión
        </button>
      </div>
    </aside>
  );
}
