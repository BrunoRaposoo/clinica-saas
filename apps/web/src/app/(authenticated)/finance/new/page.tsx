'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useMutation, useQuery } from '@tanstack/react-query';
import { financeApi } from '@/lib/api/finance';
import { patientsApi } from '@/lib/api/patients';
import { appointmentsApi } from '@/lib/api/appointments';
import { PaymentMethod } from '@clinica-saas/contracts';

export default function NewChargePage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    description: '',
    amount: '',
    dueDate: '',
    patientId: '',
    appointmentId: '',
    notes: '',
  });

  const [patientSearch, setPatientSearch] = useState('');

  const { data: patientsData } = useQuery({
    queryKey: ['patients-search', patientSearch],
    queryFn: () => patientsApi.getPatients({ 
      search: patientSearch || undefined,
      limit: 50 
    }),
    enabled: true,
  });

  const { data: appointmentsData } = useQuery({
    queryKey: ['appointments-search', formData.patientId],
    queryFn: () => appointmentsApi.getAppointments({ 
      patientId: formData.patientId || undefined,
      limit: 50,
      status: 'scheduled',
    }),
    enabled: !!formData.patientId,
  });

  const createCharge = useMutation({
    mutationFn: (data: typeof formData) => financeApi.createCharge({
      description: data.description,
      amount: parseFloat(data.amount),
      dueDate: data.dueDate,
      patientId: data.patientId || undefined,
      appointmentId: data.appointmentId || undefined,
      notes: data.notes || undefined,
    }),
    onSuccess: () => {
      router.push('/finance');
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createCharge.mutate(formData);
  };

  const handlePatientChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const patientId = e.target.value;
    setFormData({ 
      ...formData, 
      patientId, 
      appointmentId: '' 
    });
    setPatientSearch('');
  };

  const handleAppointmentChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setFormData({ ...formData, appointmentId: e.target.value });
  };

  return (
    <div className="p-6 max-w-2xl">
      <h1 className="text-2xl font-bold mb-6">Nova Cobrança</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">Descrição *</label>
          <input
            type="text"
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            className="w-full px-3 py-2 border rounded"
            required
            minLength={3}
            maxLength={200}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Valor *</label>
            <input
              type="number"
              step="0.01"
              min="0.01"
              value={formData.amount}
              onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
              className="w-full px-3 py-2 border rounded"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Vencimento *</label>
            <input
              type="date"
              value={formData.dueDate}
              onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
              className="w-full px-3 py-2 border rounded"
              required
              min={new Date().toISOString().split('T')[0]}
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Vincular Paciente</label>
          <select
            value={formData.patientId}
            onChange={handlePatientChange}
            className="w-full px-3 py-2 border rounded"
          >
            <option value="">Selecione um paciente</option>
            {patientsData?.items?.map((patient: any) => (
              <option key={patient.id} value={patient.id}>
                {patient.name} {patient.document ? `(${patient.document})` : ''}
              </option>
            ))}
          </select>
          <input
            type="text"
            placeholder="Buscar paciente..."
            value={patientSearch}
            onChange={(e) => setPatientSearch(e.target.value)}
            className="w-full mt-2 px-3 py-2 border rounded text-sm"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Vincular Agendamento</label>
          <select
            value={formData.appointmentId}
            onChange={handleAppointmentChange}
            disabled={!formData.patientId}
            className="w-full px-3 py-2 border rounded disabled:opacity-50"
          >
            <option value="">Selecione um agendamento</option>
            {appointmentsData?.items?.map((apt: any) => (
              <option key={apt.id} value={apt.id}>
                {new Date(apt.startDate).toLocaleString('pt-BR')} - {apt.appointmentType?.name || 'Consulta'}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Observações</label>
          <textarea
            value={formData.notes}
            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
            className="w-full px-3 py-2 border rounded"
            rows={3}
            maxLength={1000}
          />
        </div>

        <div className="flex gap-4">
          <button
            type="submit"
            disabled={createCharge.isPending}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
          >
            {createCharge.isPending ? 'Salvando...' : 'Criar Cobrança'}
          </button>
          <button
            type="button"
            onClick={() => router.back()}
            className="px-4 py-2 border rounded hover:bg-gray-50"
          >
            Cancelar
          </button>
        </div>
      </form>
    </div>
  );
}