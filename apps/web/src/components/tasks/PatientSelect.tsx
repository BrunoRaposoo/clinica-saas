'use client';

import { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { patientsApi } from '@/lib/api/patients';

interface PatientSelectProps {
  value?: string;
  onChange: (patientId: string | undefined) => void;
  placeholder?: string;
}

export function PatientSelect({ value, onChange, placeholder = 'Buscar paciente...' }: PatientSelectProps) {
  const [search, setSearch] = useState('');
  const [isOpen, setIsOpen] = useState(false);

  const { data, isLoading } = useQuery({
    queryKey: ['patients', 'select', search],
    queryFn: () => patientsApi.getPatients({ search: search || undefined, limit: 20 }),
    enabled: isOpen && search.length > 0,
  });

  const selectedPatient = useMemo(() => {
    if (!value || !data?.items) return null;
    return data.items.find(p => p.id === value);
  }, [value, data]);

  const handleSelect = (patientId: string) => {
    onChange(patientId);
    setIsOpen(false);
    setSearch('');
  };

  return (
    <div className="relative">
      <label className="block text-sm font-medium mb-1">Paciente</label>
      <div className="relative">
        <input
          type="text"
          value={selectedPatient ? `${selectedPatient.name} (${selectedPatient.document})` : search}
          onChange={(e) => {
            setSearch(e.target.value);
            setIsOpen(true);
            if (value) onChange(undefined);
          }}
          onFocus={() => setIsOpen(true)}
          placeholder={placeholder}
          className="w-full px-3 py-2 border rounded"
        />
        {value && (
          <button
            type="button"
            onClick={() => onChange(undefined)}
            className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 hover:text-red-600"
          >
            ✕
          </button>
        )}
      </div>
      {isOpen && search.length > 0 && (
        <div className="absolute z-10 w-full mt-1 bg-white border rounded-md shadow-lg max-h-60 overflow-auto">
          {isLoading ? (
            <div className="p-2 text-gray-500">Carregando...</div>
          ) : data?.items?.length === 0 ? (
            <div className="p-2 text-gray-500">Nenhum paciente encontrado</div>
          ) : (
            data?.items?.map((patient) => (
              <button
                key={patient.id}
                type="button"
                onClick={() => handleSelect(patient.id)}
                className="w-full text-left px-3 py-2 hover:bg-gray-100"
              >
                <div className="font-medium">{patient.name}</div>
                <div className="text-sm text-gray-500">CPF: {patient.document}</div>
              </button>
            ))
          )}
        </div>
      )}
    </div>
  );
}