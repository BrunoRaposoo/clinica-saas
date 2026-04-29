'use client';

import { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { appointmentsApi } from '@/lib/api/appointments';
import type { AppointmentListParams } from '@clinica-saas/contracts';

interface AppointmentSelectProps {
  value?: string;
  onChange: (appointmentId: string | undefined) => void;
  patientId?: string;
  placeholder?: string;
}

export function AppointmentSelect({ value, onChange, patientId, placeholder = 'Buscar agendamento...' }: AppointmentSelectProps) {
  const [search, setSearch] = useState('');
  const [isOpen, setIsOpen] = useState(false);

  const queryParams: AppointmentListParams = {
    limit: 20,
    ...(patientId && { patientId }),
  };

  const { data, isLoading } = useQuery({
    queryKey: ['appointments', 'select', patientId],
    queryFn: () => appointmentsApi.getAppointments(queryParams),
    enabled: isOpen,
  });

  const selectedAppointment = useMemo(() => {
    if (!value || !data?.items) return null;
    return data.items.find(a => a.id === value);
  }, [value, data]);

  const formatDateTime = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleString('pt-BR', { 
      day: '2-digit', 
      month: '2-digit', 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  const handleSelect = (appointmentId: string) => {
    onChange(appointmentId);
    setIsOpen(false);
    setSearch('');
  };

  const filteredItems = useMemo(() => {
    if (!search || !data?.items) return data?.items || [];
    const lowerSearch = search.toLowerCase();
    return data.items.filter(a => 
      a.patient?.name?.toLowerCase().includes(lowerSearch)
    );
  }, [data?.items, search]);

  return (
    <div className="relative">
      <label className="block text-sm font-medium mb-1">Agendamento</label>
      <div className="relative">
        <input
          type="text"
          value={selectedAppointment ? formatDateTime(selectedAppointment.startDate) : search}
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
      {isOpen && (
        <div className="absolute z-10 w-full mt-1 bg-white border rounded-md shadow-lg max-h-60 overflow-auto">
          {isLoading ? (
            <div className="p-2 text-gray-500">Carregando...</div>
          ) : filteredItems.length === 0 ? (
            <div className="p-2 text-gray-500">Nenhum agendamento encontrado</div>
          ) : (
            filteredItems.map((appointment) => (
              <button
                key={appointment.id}
                type="button"
                onClick={() => handleSelect(appointment.id)}
                className="w-full text-left px-3 py-2 hover:bg-gray-100"
              >
                <div className="font-medium">{formatDateTime(appointment.startDate)}</div>
                <div className="text-sm text-gray-500">Paciente: {appointment.patient?.name}</div>
              </button>
            ))
          )}
        </div>
      )}
    </div>
  );
}