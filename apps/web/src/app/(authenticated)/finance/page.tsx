'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { financeApi } from '@/lib/api/finance';
import { ChargeStatus } from '@clinica-saas/contracts';
import Link from 'next/link';

const statusColors: Record<ChargeStatus, string> = {
  pending: 'bg-yellow-100 text-yellow-800',
  paid: 'bg-green-100 text-green-800',
  overdue: 'bg-red-100 text-red-800',
  cancelled: 'bg-gray-100 text-gray-800',
};

const statusLabels: Record<ChargeStatus, string> = {
  pending: 'Pendente',
  paid: 'Pago',
  overdue: 'Vencido',
  cancelled: 'Cancelado',
};

export default function FinancePage() {
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [search, setSearch] = useState('');

  const { data: dashboard, isLoading: loadingDashboard } = useQuery({
    queryKey: ['finance-dashboard'],
    queryFn: () => financeApi.getDashboard(),
  });

  const { data: charges, isLoading: loadingCharges } = useQuery({
    queryKey: ['charges', statusFilter, search],
    queryFn: () => financeApi.listCharges({
      status: statusFilter as ChargeStatus || undefined,
      search: search || undefined,
    }),
  });

  const formatCurrency = (value: number) => 
    new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);

  if (loadingDashboard) return <div className="p-6">Carregando...</div>;

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Financeiro</h1>
        <Link
          href="/finance/new"
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Nova Cobrança
        </Link>
      </div>

      {/* Dashboard Cards */}
      <div className="grid grid-cols-4 gap-4 mb-8">
        <div className="bg-white p-4 rounded-lg shadow">
          <p className="text-sm text-gray-500">Total Pendente</p>
          <p className="text-2xl font-bold text-yellow-600">
            {formatCurrency(dashboard?.totalPending || 0)}
          </p>
          <p className="text-xs text-gray-400">{dashboard?.pendingCount} cobranças</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <p className="text-sm text-gray-500">Total Recebido</p>
          <p className="text-2xl font-bold text-green-600">
            {formatCurrency(dashboard?.totalPaid || 0)}
          </p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <p className="text-sm text-gray-500">Total Vencido</p>
          <p className="text-2xl font-bold text-red-600">
            {formatCurrency(dashboard?.totalOverdue || 0)}
          </p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <p className="text-sm text-gray-500">Total Geral</p>
          <p className="text-2xl font-bold">
            {formatCurrency(
              (dashboard?.totalPending || 0) + 
              (dashboard?.totalPaid || 0) + 
              (dashboard?.totalOverdue || 0)
            )}
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-4 mb-4">
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-3 py-2 border rounded"
        >
          <option value="">Todos os status</option>
          <option value="pending">Pendente</option>
          <option value="paid">Pago</option>
          <option value="overdue">Vencido</option>
          <option value="cancelled">Cancelado</option>
        </select>
        <input
          type="text"
          placeholder="Buscar..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="px-3 py-2 border rounded max-w-xs"
        />
      </div>

      {/* Charges Table */}
      {loadingCharges ? (
        <div>Carregando cobranças...</div>
      ) : (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">Descrição</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">Valor</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">Vencimento</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">Status</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">Pagamento</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">Ações</th>
              </tr>
            </thead>
            <tbody>
              {charges?.items.map((charge) => (
                <tr key={charge.id} className="border-t hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <Link href={`/finance/${charge.id}`} className="hover:text-blue-600">
                      {charge.description}
                    </Link>
                  </td>
                  <td className="px-4 py-3 font-medium">{formatCurrency(charge.amount)}</td>
                  <td className="px-4 py-3">
                    {new Date(charge.dueDate).toLocaleDateString('pt-BR')}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-1 rounded text-xs ${statusColors[charge.status]}`}>
                      {statusLabels[charge.status]}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-500">
                    {charge.paidAt 
                      ? `${charge.paymentMethod} - ${new Date(charge.paidAt).toLocaleDateString('pt-BR')}`
                      : '-'}
                  </td>
                  <td className="px-4 py-3">
                    <Link href={`/finance/${charge.id}`} className="text-blue-600 hover:underline text-sm">
                      Ver
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {charges?.items.length === 0 && (
            <div className="p-8 text-center text-gray-500">Nenhuma cobrança encontrada</div>
          )}
        </div>
      )}

      {/* Pagination */}
      {charges && charges.pagination.totalPages > 1 && (
        <div className="mt-4 flex justify-center gap-2">
          {Array.from({ length: charges.pagination.totalPages }, (_, i) => (
            <button
              key={i}
              onClick={() => {}}
              className="px-3 py-1 border rounded"
            >
              {i + 1}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}