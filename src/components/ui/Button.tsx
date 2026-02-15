'use client';

import { Icon } from './Icon';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  icon?: string;
  variant?: 'primary' | 'glass' | 'outline';
  size?: 'default' | 'large';
  fullWidth?: boolean;
  loading?: boolean;
}

export function Button({
  children,
  icon,
  variant = 'primary',
  size = 'default',
  fullWidth = true,
  loading = false,
  className = '',
  disabled,
  ...props
}: ButtonProps) {
  const base = 'flex items-center justify-center gap-2 font-semibold transition-all duration-200 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed';

  const variants = {
    primary: 'bg-gradient-to-br from-primary to-primary-dark text-white rounded-pill hover:opacity-90',
    glass: 'bg-white-8 border border-white-20 text-white-80 rounded-pill hover:bg-white-10',
    outline: 'bg-transparent border border-white-20 text-white-80 rounded-pill hover:bg-white-5',
  };

  const sizes = {
    default: 'h-12 px-6 text-base',
    large: 'h-14 px-8 text-lg',
  };

  return (
    <button
      className={`${base} ${variants[variant]} ${sizes[size]} ${fullWidth ? 'w-full' : ''} ${className}`}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? (
        <span className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full" />
      ) : icon ? (
        <Icon name={icon} size={20} />
      ) : null}
      {children}
    </button>
  );
}
