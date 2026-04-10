'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery, useMutation } from '@tanstack/react-query';
import Link from 'next/link';
import { appointmentsApi, professionalsApi } from '@/lib/api/appointments';
import { patientsApi } from '@/lib/api/patients';

export default function NewAppointmentPage() {
  const router = useRouter();
  const [form, setForm] = useState({
    patientId: '',
    professionalId: '',
    startDate: '',
    notes: '',
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const { data: professionals } = useQuery({
    queryKey: ['professionals'],
    queryFn: () => professionalsApi.getProfessionals(),
  });

  const { data: patientsData } = useQuery({
    queryKey: ['patients'],
    queryFn: () => patientsApi.getPatients({ limit: 100 }),
    enabled: true,
  });

  const createMutation = useMutation({
    mutationFn: (data: Parameters<typeof appointmentsApi.createAppointment>[0]) =>
      appointmentsApi.createAppointment(data),
    onSuccess: () => {
      setSuccess('Agendamento criado com sucesso!');
      setTimeout(() => router.push('/appointments'), 1500);
    },
    onError: (err: Error) => setError(err.message),
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!form.patientId || !form.professionalId || !form.startDate) {
      setError('Por favor, preencha todos os campos obrigatórios.');
      return;
    }

    createMutation.mutate({
      patientId: form.patientId,
      professionalId: form.professionalId,
      startDate: new Date(form.startDate).toISOString(),
      notes: form.notes || undefined,
    });
  };

  const patients = patientsData?.items || [];

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <Link href="/appointments" className="text-blue-600 hover:underline">
          ← Voltar para Agendamentos
        </Link>
      </div>

      <div className="bg-white rounded-lg shadow p-8">
        <h2 className="text-2xl font-bold mb-6">Novo Agendamento</h2>

        <form onSubmit={handleSubmit}>
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium mb-2">Paciente *</label>
              <select
                required
                value={form.patientId}
                onChange={(e) => setForm({ ...form, patientId: e.target.value })}
                className="w-full px-4 py-2 border rounded"
              >
                <option value="">Selecione um paciente</option>
                {patients.map((patient) => (
                  <option key={patient.id} value={patient.id}>
                    {patient.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Profissional *</label>
              <select
                required
                value={form.professionalId}
                onChange={(e) => setForm({ ...form, professionalId: e.target.value })}
                className="w-full px-4 py-2 border rounded"
              >
                <option value="">Selecione um profissional</option>
                {professionals?.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.user?.name || p.id}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Data e Hora *</label>
              <input
                type="datetime-local"
                required
                value={form.startDate}
                onChange={(e) => setForm({ ...form, startDate: e.target.value })}
                className="w-full px-4 py-2 border rounded"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Observações</label>
              <textarea
                value={form.notes}
                onChange={(e) => setForm({ ...form, notes: e.target.value })}
                rows={3}
                className="w-full px-4 py-2 border rounded"
                placeholder="Observações adicionais..."
              />
            </div>
          </div>

          <div className="flex gap-4 mt-6">
            <button
              type="submit"
              disabled={createMutation.isPending}
              className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
            >
              {createMutation.isPending ? 'Criando...' : 'Criar Agendamento'}
            </button>
            <Link href="/appointments" className="px-6 py-2 border rounded">
              Cancelar
            </Link>
          </div>

          {error && (
            <div className="mt-4 p-4 bg-red-100 text-red-700 rounded">{error}</div>
          )}
          {success && (
            <div className="mt-4 p-4 bg-green-100 text-green-700 rounded">{success}</div>
          )}
        </form>
      </div>
    </div>
  );
}