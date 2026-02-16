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

  const styles = {
    success: {
      bg: 'bg-emerald-50 border-emerald-200',
      text: 'text-emerald-800',
      icon: 'check_circle' as const,
      iconColor: 'text-emerald-500',
    },
    error: {
      bg: 'bg-red-50 border-red-200',
      text: 'text-red-800',
      icon: 'error' as const,
      iconColor: 'text-red-500',
    },
  }[variant];

  return (
    <div className="fixed top-4 left-1/2 -translate-x-1/2 z-[60] animate-slide-down">
      <div className={`flex items-center gap-2 px-4 py-3 rounded-xl border shadow-lg ${styles.bg}`}>
        <Icon name={styles.icon} size={20} className={styles.iconColor} />
        <span className={`text-sm font-medium ${styles.text}`}>{message}</span>
        <button
          onClick={onClose}
          className={`ml-2 border-none bg-transparent cursor-pointer ${styles.text} opacity-60 hover:opacity-100`}
        >
          <Icon name="close" size={16} />
        </button>
      </div>
    </div>
  );
}
