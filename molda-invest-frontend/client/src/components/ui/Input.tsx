import React, { InputHTMLAttributes, forwardRef } from 'react';
import { FieldError } from 'react-hook-form';
import { cn } from '@/lib/utils';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: FieldError;
  icon?: React.ReactNode;
  mask?: (value: string) => string;
  variant?: 'outlined' | 'filled';
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    {
      label,
      error,
      icon,
      mask,
      variant = 'outlined',
      className,
      onChange,
      ...props
    },
    ref
  ) => {
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      if (mask) {
        const masked = mask(e.target.value);
        e.target.value = masked;
      }
      onChange?.(e);
    };

    return (
      <div className="w-full">
        {label && (
          <label className="block text-sm font-medium text-foreground mb-2">
            {label}
            {props.required && <span className="text-red-500 ml-1">*</span>}
          </label>
        )}
        <div className="relative">
          {icon && (
            <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground">
              {icon}
            </div>
          )}
          <input
            ref={ref}
            onChange={handleChange}
            className={cn(
              'w-full px-3 py-2 rounded-md border transition-colors',
              'focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2',
              'disabled:bg-muted disabled:text-muted-foreground disabled:cursor-not-allowed',
              icon && 'pl-10',
              error && 'border-red-500 focus:ring-red-500',
              variant === 'outlined' && 'border-input bg-background',
              variant === 'filled' && 'border-0 bg-muted',
              className
            )}
            {...props}
          />
        </div>
        {error && (
          <p className="text-sm text-red-500 mt-1">{error.message}</p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';
