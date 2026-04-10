'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import { appointmentsApi, professionalsApi } from '@/lib/api/appointments';
import { AppointmentStatus } from '@clinica-saas/contracts';

const statusLabels: Record<AppointmentStatus, string> = {
  scheduled: 'Agendado',
  confirmed: 'Confirmado',
  in_progress: 'Em andamento',
  completed: 'Concluído',
  cancelled: 'Cancelado',
  no_show: 'Não compareceu',
};

const statusColors: Record<AppointmentStatus, string> = {
  scheduled: 'bg-blue-100 text-blue-800',
  confirmed: 'bg-green-100 text-green-800',
  in_progress: 'bg-yellow-100 text-yellow-800',
  completed: 'bg-gray-100 text-gray-800',
  cancelled: 'bg-red-100 text-red-800',
  no_show: 'bg-orange-100 text-orange-800',
};

export default function AppointmentsPage() {
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState<AppointmentStatus>('' as AppointmentStatus);
  const [professionalId, setProfessionalId] = useState('');

  const { data, isLoading } = useQuery({
    queryKey: ['appointments', { page, status, professionalId }],
    queryFn: () =>
      appointmentsApi.getAppointments({
        page,
        limit: 20,
        status: status || undefined,
        professionalId: professionalId || undefined,
      }),
  });

  const { data: professionals } = useQuery({
    queryKey: ['professionals'],
    queryFn: () => professionalsApi.getProfessionals(),
  });

  const appointments = data?.items || [];
  const pagination = data?.pagination;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Agendamentos</h1>
        <Link
          href="/appointments/new"
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          + Novo Agendamento
        </Link>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex gap-4">
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value as AppointmentStatus)}
            className="px-4 py-2 border rounded"
          >
            <option value="">Todos os status</option>
            <option value="scheduled">Agendado</option>
            <option value="confirmed">Confirmado</option>
            <option value="in_progress">Em andamento</option>
            <option value="completed">Concluído</option>
            <option value="cancelled">Cancelado</option>
            <option value="no_show">Não compareceu</option>
          </select>
          <select
            value={professionalId}
            onChange={(e) => setProfessionalId(e.target.value)}
            className="px-4 py-2 border rounded"
          >
            <option value="">Todos os profissionais</option>
            {professionals?.map((p) => (
              <option key={p.id} value={p.id}>
                {p.user?.name || p.id}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        {isLoading ? (
          <div className="p-8 text-center text-gray-500">Carregando...</div>
        ) : appointments.length === 0 ? (
          <div className="p-8 text-center text-gray-500">Nenhum agendamento encontrado.</div>
        ) : (
          <>
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Data/Hora</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Paciente</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Profissional</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {appointments.map((apt) => (
                  <tr key={apt.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="text-sm">{new Date(apt.startDate).toLocaleDateString('pt-BR')}</div>
                      <div className="text-xs text-gray-500">
                        {new Date(apt.startDate).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </td>
                    <td className="px-6 py-4">{apt.patient?.name ?? '-'}</td>
                    <td className="px-6 py-4">{apt.professional?.name ?? '-'}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded-full text-xs ${statusColors[apt.status]}`}>
                        {statusLabels[apt.status]}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <Link href={`/schedule?appointment=${apt.id}`} className="text-blue-600 hover:underline">
                        Ver
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {pagination && (
              <div className="px-6 py-4 border-t flex justify-between items-center">
                <div className="text-sm text-gray-500">
                  Página {pagination.page} de {pagination.totalPages} ({pagination.total} total)
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={pagination.page <= 1}
                    className="px-3 py-1 border rounded disabled:opacity-50"
                  >
                    Anterior
                  </button>
                  <button
                    onClick={() => setPage((p) => p + 1)}
                    disabled={pagination.page >= pagination.totalPages}
                    className="px-3 py-1 border rounded disabled:opacity-50"
                  >
                    Próximo
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}