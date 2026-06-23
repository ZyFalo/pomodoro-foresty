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
      ? 'text-[13px] font-medium text-white-80'
      : 'text-sm font-medium text-white-90';

    return (
      <div className="w-full flex flex-col gap-1.5">
        {label && <label className={labelClasses}>{label}</label>}
        <div className="relative group">
          {icon && (
            <span className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none">
              <Icon name={icon} size={18} className="text-white-40 transition-colors group-focus-within:text-accent-green" />
            </span>
          )}
          <input
            ref={ref}
            type={inputType}
            className={`w-full h-11 px-4 bg-white-8 border border-white-20 rounded-2xl font-sans text-sm text-white placeholder:text-white-40 outline-none transition-all duration-200 hover:border-white-27 focus:border-primary focus:bg-white-10 focus:shadow-[0_0_0_3px_rgba(46,139,87,0.16)] ${icon ? 'pl-11' : ''} ${isPassword ? 'pr-11' : ''} ${error ? 'border-danger focus:border-danger focus:shadow-[0_0_0_3px_rgba(239,68,68,0.16)]' : ''} ${className}`}
            {...props}
          />
          {isPassword && (
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 cursor-pointer text-white-40 hover:text-white-80 transition-colors"
              tabIndex={-1}
            >
              <Icon name={showPassword ? 'visibility' : 'visibility_off'} size={18} />
            </button>
          )}
        </div>
        {error && <span className="text-xs text-danger flex items-center gap-1"><Icon name="error" size={13} />{error}</span>}
      </div>
    );
  }
);

Input.displayName = 'Input';
