'use client';

import { Icon } from './Icon';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  icon?: string;
  variant?: 'primary' | 'glass' | 'outline' | 'secondary' | 'danger';
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
  const base =
    'group inline-flex items-center justify-center gap-2 font-semibold tracking-tight rounded-pill transition-all duration-200 cursor-pointer select-none active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 disabled:opacity-50 disabled:cursor-not-allowed disabled:pointer-events-none disabled:active:scale-100';

  const variants = {
    primary:
      'bg-gradient-to-br from-primary to-primary-dark text-white shadow-[0_4px_16px_rgba(46,139,87,0.35)] hover:shadow-[0_8px_28px_rgba(46,139,87,0.5)] hover:-translate-y-0.5',
    glass:
      'bg-white-8 border border-white-20 text-white-80 backdrop-blur-md hover:bg-white-15 hover:text-white hover:-translate-y-0.5',
    outline:
      'bg-transparent border border-white-20 text-white-80 hover:bg-white-5 hover:border-white-40 hover:text-white',
    secondary:
      'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 hover:border-gray-400',
    danger:
      'bg-danger text-white shadow-[0_4px_16px_rgba(239,68,68,0.30)] hover:shadow-[0_8px_28px_rgba(239,68,68,0.45)] hover:-translate-y-0.5',
  };

  const sizes = {
    default: 'h-12 px-6 text-[15px]',
    large: 'h-14 px-8 text-lg',
  };

  return (
    <button
      className={`${base} ${variants[variant]} ${sizes[size]} ${fullWidth ? 'w-full' : ''} ${className}`}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? (
        <span className="animate-spin h-5 w-5 border-2 border-current border-t-transparent rounded-full" />
      ) : icon ? (
        <Icon name={icon} size={20} className="transition-transform duration-200 group-hover:scale-110" />
      ) : null}
      {children}
    </button>
  );
}
