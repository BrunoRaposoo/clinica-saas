'use client';

import { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { usersApi } from '@/lib/api/users';

interface UserSelectProps {
  value?: string;
  onChange: (userId: string | undefined) => void;
  placeholder?: string;
}

export function UserSelect({ value, onChange, placeholder = 'Selecionar responsável...' }: UserSelectProps) {
  const [isOpen, setIsOpen] = useState(false);

  const { data, isLoading } = useQuery({
    queryKey: ['users', 'select', 'all'],
    queryFn: () => usersApi.listUsers({ limit: 100 }),
    enabled: isOpen,
  });

  const selectedUser = useMemo(() => {
    if (!value || !data?.items) return null;
    return data.items.find(u => u.id === value);
  }, [value, data]);

  const handleSelect = (userId: string) => {
    onChange(userId);
    setIsOpen(false);
  };

  return (
    <div className="relative">
      <label className="block text-sm font-medium mb-1">Responsável</label>
      <div className="relative">
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="w-full text-left px-3 py-2 border rounded bg-white hover:bg-gray-50"
        >
          {selectedUser ? (
            <span>{selectedUser.name} <span className="text-gray-500">({selectedUser.roleName})</span></span>
          ) : (
            <span className="text-gray-500">{placeholder}</span>
          )}
        </button>
        {value && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onChange(undefined);
            }}
            className="absolute right-8 top-1/2 -translate-y-1/2 text-gray-500 hover:text-red-600"
          >
            ✕
          </button>
        )}
      </div>
      {isOpen && (
        <div className="absolute z-10 w-full mt-1 bg-white border rounded-md shadow-lg max-h-60 overflow-auto">
          {isLoading ? (
            <div className="p-2 text-gray-500">Carregando...</div>
          ) : data?.items?.length === 0 ? (
            <div className="p-2 text-gray-500">Nenhum usuário encontrado</div>
          ) : (
            <>
              <button
                type="button"
                onClick={() => {
                  onChange(undefined);
                  setIsOpen(false);
                }}
                className="w-full text-left px-3 py-2 hover:bg-gray-100 text-gray-500"
              >
                Não atribuído
              </button>
              {data?.items?.map((user) => (
                <button
                  key={user.id}
                  type="button"
                  onClick={() => handleSelect(user.id)}
                  className="w-full text-left px-3 py-2 hover:bg-gray-100"
                >
                  <div className="font-medium">{user.name}</div>
                  <div className="text-sm text-gray-500">{user.roleName}</div>
                </button>
              ))}
            </>
          )}
        </div>
      )}
    </div>
  );
}