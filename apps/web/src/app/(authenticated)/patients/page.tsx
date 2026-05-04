'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import { patientsApi } from '@/lib/api/patients';
import { Patient } from '@clinica-saas/contracts';
import { useRole } from '@/hooks/use-role';

export default function PatientsPage() {
  const { canManagePatients } = useRole();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [document, setDocument] = useState('');
  const [phone, setPhone] = useState('');

  const { data, isLoading, error } = useQuery({
    queryKey: ['patients', { page, search, document, phone }],
    queryFn: () => patientsApi.getPatients({ page, limit: 20, search, document, phone }),
  });

  const patients = data?.items || [];
  const pagination = data?.pagination;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Pacientes</h1>
        {canManagePatients && (
          <Link
            href="/patients/new"
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            + Novo Paciente
          </Link>
        )}
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex gap-4 flex-wrap">
          <input
            type="text"
            placeholder="Buscar por nome..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="flex-1 min-w-[200px] px-4 py-2 border rounded"
          />
          <input
            type="text"
            placeholder="CPF"
            value={document}
            onChange={(e) => setDocument(e.target.value)}
            className="w-32 px-4 py-2 border rounded"
          />
          <input
            type="text"
            placeholder="Telefone"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className="w-32 px-4 py-2 border rounded"
          />
          <button
            onClick={() => setPage(1)}
            className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700"
          >
            Buscar
          </button>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        {isLoading ? (
          <div className="p-8 text-center text-gray-500">Carregando...</div>
        ) : error ? (
          <div className="p-8 text-center text-red-500">Erro ao carregar pacientes</div>
        ) : patients.length === 0 ? (
          <div className="p-8 text-center text-gray-500">Nenhum paciente encontrado.</div>
        ) : (
          <>
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Nome</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Telefone</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">CPF</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {patients.map((patient) => (
                  <tr key={patient.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <Link
                        href={`/patients/${patient.id}`}
                        className="text-blue-600 hover:underline"
                      >
                        {patient.name}
                      </Link>
                    </td>
                    <td className="px-6 py-4 text-gray-500">{patient.email ?? '-'}</td>
                    <td className="px-6 py-4 text-gray-500">{patient.phone ?? '-'}</td>
                    <td className="px-6 py-4 text-gray-500">{patient.document ?? '-'}</td>
                    <td className="px-6 py-4">
                      <span
                        className={`px-2 py-1 rounded-full text-xs ${
                          patient.isActive
                            ? 'bg-green-100 text-green-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}
                      >
                        {patient.isActive ? 'Ativo' : 'Inativo'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <Link
                        href={`/patients/${patient.id}`}
                        className="text-blue-600 hover:underline mr-3"
                      >
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