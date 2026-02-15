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
    <aside className="w-60 h-screen bg-gray-900 flex flex-col shrink-0 sticky top-0">
      {/* Brand */}
      <div className="px-5 py-5 flex items-center gap-2.5 border-b border-white/10">
        <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-primary to-primary-dark flex items-center justify-center">
          <Icon name="park" size={18} className="text-white" />
        </div>
        <div>
          <p className="text-sm font-semibold text-white leading-tight">Pomodoro Forest</p>
          <p className="text-xs text-gray-500">Panel Admin</p>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 py-4 px-3">
        {NAV_ITEMS.map(({ href, icon, label }) => {
          const isActive = href === '/admin'
            ? pathname === '/admin'
            : pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg mb-1 text-sm font-medium no-underline transition-colors ${
                isActive
                  ? 'bg-primary/20 text-primary-light'
                  : 'text-gray-400 hover:bg-white/5 hover:text-white'
              }`}
            >
              <Icon name={icon} size={20} />
              {label}
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="px-3 py-4 border-t border-white/10">
        <button
          onClick={logout}
          className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-gray-400 hover:bg-white/5 hover:text-white transition-colors w-full border-none bg-transparent cursor-pointer"
        >
          <Icon name="logout" size={20} />
          Cerrar sesión
        </button>
      </div>
    </aside>
  );
}
