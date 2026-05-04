'use client';

import { forwardRef, type InputHTMLAttributes, useState, useCallback } from 'react';

interface AddressData {
  street: string;
  district: string;
  city: string;
  state: string;
}

interface CepInputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'onChange'> {
  value: string;
  onChange: (value: string) => void;
  onAddressFill?: (data: AddressData) => void;
  label?: string;
}

type ViaCepResponse = {
  logradouro?: string;
  bairro?: string;
  [key: string]: string | boolean | undefined;
};

function formatCep(value: string): string {
  const digits = value.replace(/\D/g, '');
  if (digits.length <= 5) return digits;
  return `${digits.slice(0, 5)}-${digits.slice(5, 8)}`;
}

export function extractDigits(value: string): string {
  return value.replace(/\D/g, '');
}

export const CepInput = forwardRef<HTMLInputElement, CepInputProps>(
  ({ value, onChange, onAddressFill, label, className, ...props }, ref) => {
    const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
    const [message, setMessage] = useState('');

    const handleBlur = useCallback(async () => {
      const digits = value.replace(/\D/g, '');
      
      if (digits.length !== 8) {
        setStatus('idle');
        setMessage('');
        return;
      }

      setStatus('loading');
      setMessage('Buscando endereço...');

      try {
        const res = await fetch(`https://viacep.com.br/ws/${digits}/json/`);
        const data: ViaCepResponse = await res.json();

        const erro = (data as Record<string, unknown>).erro;
        if (erro) {
          setStatus('error');
          setMessage('CEP não encontrado. Preencha o endereço manualmente.');
          return;
        }

        setStatus('success');
        setMessage('Endereço encontrado!');

        const locality = String(data.localidade || '');
        
        onAddressFill?.({
          street: String(data.logradouro || ''),
          district: String(data.bairro || ''),
          city: locality,
          state: String(data.uf || ''),
        });

        setTimeout(() => {
          setStatus('idle');
          setMessage('');
        }, 3000);
      } catch {
        setStatus('error');
        setMessage('Erro ao buscar CEP. Verifique sua conexão e preencha manualmente.');
      }
    }, [value, onAddressFill]);

    const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
      const formatted = formatCep(e.target.value);
      onChange(formatted);
      setStatus('idle');
      setMessage('');
    }, [onChange]);

    return (
      <div className={`space-y-1 ${className || ''}`}>
        {label && (
          <label className="block text-sm font-medium text-gray-700">{label}</label>
        )}
        <input
          ref={ref}
          type="text"
          value={value}
          onChange={handleChange}
          onBlur={handleBlur}
          placeholder="00000-000"
          maxLength={9}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          {...props}
        />
        {message && (
          <p
            className={`text-sm ${
              status === 'loading' ? 'text-blue-600' :
              status === 'success' ? 'text-green-600' :
              status === 'error' ? 'text-red-600' :
              'text-gray-600'
            }`}
          >
            {message}
          </p>
        )}
      </div>
    );
  }
);

CepInput.displayName = 'CepInput';