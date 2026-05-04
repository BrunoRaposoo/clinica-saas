'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import Link from 'next/link';
import { settingsApi } from '@/lib/api/settings';
import { useRole } from '@/hooks/use-role';

export default function SettingsUnitsPage() {
  const { canManageSettings } = useRole();
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [showActive, setShowActive] = useState<boolean | null>(null);

  if (!canManageSettings) {
    return (
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold mb-6">Unidades</h1>
        <p className="text-gray-500">Você não tem acesso a esta página.</p>
        <Link href="/settings" className="text-blue-600 hover:underline mt-4 block">
          ← Voltar para Configurações
        </Link>
      </div>
    );
  }

  const { data, isLoading } = useQuery({
    queryKey: ['units', { page, isActive: showActive }],
    queryFn: () => settingsApi.listUnits({ page, limit: 20, isActive: showActive ?? undefined }),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => settingsApi.deleteUnit(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['units'] }),
  });

  const units = data?.items || [];
  const pagination = data?.pagination;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <Link href="/settings" className="text-blue-600 hover:underline">
            ← Voltar para Configurações
          </Link>
        </div>
        <Link
          href="/settings/units/new"
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          + Nova Unidade
        </Link>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex gap-4">
          <select
            value={showActive === null ? '' : showActive.toString()}
            onChange={(e) => {
              setShowActive(e.target.value === '' ? null : e.target.value === 'true');
              setPage(1);
            }}
            className="px-4 py-2 border rounded"
          >
            <option value="">Todos</option>
            <option value="true">Ativos</option>
            <option value="false">Inativos</option>
          </select>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        {isLoading ? (
          <div className="p-8 text-center text-gray-500">Carregando...</div>
        ) : units.length === 0 ? (
          <div className="p-8 text-center text-gray-500">Nenhuma unidade encontrada.</div>
        ) : (
          <>
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Nome</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Endereço</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Telefone</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {units.map((unit) => (
                  <tr key={unit.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">{unit.name}</td>
                    <td className="px-6 py-4 text-gray-500">{unit.address ?? '-'}</td>
                    <td className="px-6 py-4 text-gray-500">{unit.phone ?? '-'}</td>
                    <td className="px-6 py-4">
                      <span
                        className={`px-2 py-1 rounded-full text-xs ${
                          unit.isActive
                            ? 'bg-green-100 text-green-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}
                      >
                        {unit.isActive ? 'Ativo' : 'Inativo'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <Link
                        href={`/settings/units/${unit.id}`}
                        className="text-blue-600 hover:underline mr-3"
                      >
                        Editar
                      </Link>
                      {unit.isActive && (
                        <button
                          onClick={() => deleteMutation.mutate(unit.id)}
                          className="text-red-600 hover:underline"
                          disabled={deleteMutation.isPending}
                        >
                          {deleteMutation.isPending ? 'Desativando...' : 'Desativar'}
                        </button>
                      )}
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