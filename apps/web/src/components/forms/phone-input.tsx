'use client';

import { forwardRef, type InputHTMLAttributes, useState, useCallback } from 'react';

interface PhoneInputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'onChange'> {
  value: string;
  onChange: (value: string) => void;
  label?: string;
  error?: string;
}

function formatPhone(value: string): string {
  const digits = value.replace(/\D/g, '');
  
  if (digits.length <= 2) return `(${digits}`;
  if (digits.length <= 7) return `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
  return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7, 11)}`;
}

function extractDigits(value: string): string {
  return value.replace(/\D/g, '');
}

export const PhoneInput = forwardRef<HTMLInputElement, PhoneInputProps>(
  ({ value, onChange, label, error, className, ...props }, ref) => {
    const [isFocused, setIsFocused] = useState(false);

    const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
      const formatted = formatPhone(e.target.value);
      onChange(formatted);
    }, [onChange]);

    const handleBlur = useCallback(() => {
      setIsFocused(false);
    }, []);

    const handleFocus = useCallback(() => {
      setIsFocused(true);
    }, []);

    const displayValue = value || (isFocused ? '' : '(11) 1');

    return (
      <div className={`space-y-1 ${className || ''}`}>
        {label && (
          <label className="block text-sm font-medium text-gray-700">{label}</label>
        )}
        <input
          ref={ref}
          type="tel"
          value={displayValue}
          onChange={handleChange}
          onBlur={handleBlur}
          onFocus={handleFocus}
          placeholder="(00) 00000-0000"
          maxLength={15}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          {...props}
        />
        {error && <p className="text-sm text-red-600">{error}</p>}
      </div>
    );
  }
);

PhoneInput.displayName = 'PhoneInput';