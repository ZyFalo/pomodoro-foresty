'use client';

import { forwardRef, useState } from 'react';
import { Icon } from './Icon';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  icon?: string;
  labelSize?: 'default' | 'small';
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, icon, labelSize = 'default', type, className = '', ...props }, ref) => {
    const [showPassword, setShowPassword] = useState(false);
    const isPassword = type === 'password';
    const inputType = isPassword ? (showPassword ? 'text' : 'password') : type;

    const labelClasses = labelSize === 'small'
      ? 'text-[13px] text-white-80'
      : 'text-sm font-medium text-white';

    return (
      <div className="w-full flex flex-col gap-1.5">
        {label && <label className={labelClasses}>{label}</label>}
        <div className="relative">
          {icon && (
            <span className="absolute left-3.5 top-1/2 -translate-y-1/2">
              <Icon name={icon} size={18} className="text-white-40" />
            </span>
          )}
          <input
            ref={ref}
            type={inputType}
            className={`w-full h-10 px-4 bg-[#FFFFFF22] border border-[#FFFFFF55] rounded-full font-sans text-sm text-white placeholder:text-white-73 outline-none focus:border-accent-green transition-colors ${icon ? 'pl-10' : ''} ${isPassword ? 'pr-10' : ''} ${error ? 'border-danger' : ''} ${className}`}
            {...props}
          />
          {isPassword && (
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 cursor-pointer"
              tabIndex={-1}
            >
              <Icon name={showPassword ? 'visibility' : 'visibility_off'} size={18} className="text-white-27" />
            </button>
          )}
        </div>
        {error && <span className="text-xs text-danger">{error}</span>}
      </div>
    );
  }
);

Input.displayName = 'Input';
