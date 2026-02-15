'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Icon } from '@/components/ui';
import { useAuth } from '@/hooks/useAuth';

export function Navbar() {
  const pathname = usePathname();
  const { user, logout } = useAuth();

  const links = [
    { href: '/pomodoro', label: 'Pomodoro' },
    { href: '/inventory', label: 'Mi Bosque' },
  ];

  return (
    <nav className="w-full h-16 px-8 bg-white/95 backdrop-blur-[10px] flex items-center justify-between z-10 sticky top-0">
      {/* Brand */}
      <div className="flex items-center gap-2.5">
        <div className="w-10 h-10 rounded-[10px] bg-gradient-to-br from-primary to-primary-dark flex items-center justify-center">
          <Icon name="park" size={20} className="text-white" />
        </div>
        <span className="text-lg font-semibold text-primary">Pomodoro Forest</span>
      </div>

      {/* Navigation links */}
      <div className="flex items-center gap-6">
        {links.map(({ href, label }) => (
          <Link
            key={href}
            href={href}
            className={`text-sm font-medium no-underline transition-colors ${
              pathname === href
                ? 'text-primary font-semibold'
                : 'text-gray-600 hover:text-primary'
            }`}
          >
            {label}
          </Link>
        ))}
      </div>

      {/* User */}
      <div className="flex items-center gap-3">
        <Link
          href="/settings"
          className="flex items-center gap-2 px-4 py-1.5 bg-gray-100 rounded-pill no-underline hover:bg-gray-200 transition-colors"
        >
          <Icon name="person" size={18} className="text-primary" />
          <span className="text-sm font-medium text-gray-800">{user?.username ?? 'Usuario'}</span>
        </Link>
        <button
          onClick={logout}
          className="w-[38px] h-[38px] rounded-full bg-gray-100 flex items-center justify-center cursor-pointer border-none hover:bg-gray-200 transition-colors"
        >
          <Icon name="logout" size={18} className="text-gray-600" />
        </button>
      </div>
    </nav>
  );
}
