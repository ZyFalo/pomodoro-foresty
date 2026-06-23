'use client';

import { useEffect } from 'react';
import { Icon } from './Icon';

interface ToastProps {
  open: boolean;
  message: string;
  variant: 'success' | 'error';
  onClose: () => void;
}

export function Toast({ open, message, variant, onClose }: ToastProps) {
  useEffect(() => {
    if (!open) return;
    const timer = setTimeout(onClose, 3000);
    return () => clearTimeout(timer);
  }, [open, onClose]);

  if (!open) return null;

  const config = {
    success: { icon: 'check_circle' as const, accent: 'text-success' },
    error: { icon: 'error' as const, accent: 'text-danger' },
  }[variant];

  return (
    <div className="fixed top-5 left-1/2 -translate-x-1/2 z-[60] animate-slide-down">
      <div className="flex items-center gap-2.5 pl-4 pr-3 py-3 rounded-2xl bg-[#0E1A12]/90 border border-white-15 backdrop-blur-xl shadow-[0_16px_40px_rgba(0,0,0,0.4)]">
        <Icon name={config.icon} size={20} className={config.accent} />
        <span className="text-sm font-medium text-white-90">{message}</span>
        <button
          onClick={onClose}
          className="ml-1 border-none bg-transparent cursor-pointer text-white-40 hover:text-white transition-colors"
          aria-label="Cerrar"
        >
          <Icon name="close" size={16} />
        </button>
      </div>
    </div>
  );
}
