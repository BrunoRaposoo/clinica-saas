'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { financeApi } from '@/lib/api/finance';
import { ChargeStatus, PaymentMethod } from '@clinica-saas/contracts';
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

export default function ChargeDetailPage() {
  const params = useParams();
  const router = useRouter();
  const chargeId = params.id as string;
  const queryClient = useQueryClient();
  const [showPayment, setShowPayment] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('cash');

  const { data: charge, isLoading } = useQuery({
    queryKey: ['charge', chargeId],
    queryFn: () => financeApi.getCharge(chargeId),
  });

  const processPayment = useMutation({
    mutationFn: () => financeApi.processPayment(chargeId, { paymentMethod }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['charge', chargeId] });
      queryClient.invalidateQueries({ queryKey: ['finance-dashboard'] });
      setShowPayment(false);
    },
  });

  const cancelCharge = useMutation({
    mutationFn: () => financeApi.deleteCharge(chargeId),
    onSuccess: () => {
      router.push('/finance');
    },
  });

  if (isLoading) return <div className="p-6">Carregando...</div>;
  if (!charge) return <div className="p-6">Cobrança não encontrada</div>;

  const formatCurrency = (value: number) => 
    new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);

  return (
    <div className="p-6 max-w-3xl">
      <Link href="/finance" className="text-blue-600 hover:underline mb-4 block">
        ← Voltar para Financeiro
      </Link>

      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex justify-between items-start mb-4">
          <h1 className="text-2xl font-bold">{charge.description}</h1>
          <span className={`px-3 py-1 rounded ${statusColors[charge.status]}`}>
            {statusLabels[charge.status]}
          </span>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-6">
          <div>
            <label className="block text-sm text-gray-500">Valor</label>
            <p className="text-2xl font-bold">{formatCurrency(charge.amount)}</p>
          </div>
          <div>
            <label className="block text-sm text-gray-500">Vencimento</label>
            <p className="text-lg">{new Date(charge.dueDate).toLocaleDateString('pt-BR')}</p>
          </div>
          <div>
            <label className="block text-sm text-gray-500">Criado por</label>
            <p className="text-lg">{charge.createdBy.name}</p>
          </div>
          <div>
            <label className="block text-sm text-gray-500">Criado em</label>
            <p className="text-lg">{new Date(charge.createdAt).toLocaleString('pt-BR')}</p>
          </div>
        </div>

        {charge.notes && (
          <div className="mb-4">
            <label className="block text-sm text-gray-500">Observações</label>
            <p className="text-gray-700">{charge.notes}</p>
          </div>
        )}

        {/* Payment Info */}
        {charge.status === 'paid' && (
          <div className="bg-green-50 p-4 rounded-lg mb-4">
            <h3 className="font-semibold text-green-800">Pagamento Registrado</h3>
            <p className="text-sm text-green-700">
              Método: {charge.paymentMethod} | Data: {new Date(charge.paidAt!).toLocaleString('pt-BR')}
            </p>
          </div>
        )}

        {/* Actions */}
        {charge.status === 'pending' && (
          <div className="flex gap-4 mt-6">
            <button
              onClick={() => setShowPayment(!showPayment)}
              className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
            >
              Registrar Pagamento
            </button>
            <button
              onClick={() => cancelCharge.mutate()}
              disabled={cancelCharge.isPending}
              className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 disabled:opacity-50"
            >
              {cancelCharge.isPending ? 'Cancelando...' : 'Cancelar'}
            </button>
          </div>
        )}

        {/* Payment Form */}
        {showPayment && (
          <div className="mt-4 p-4 border rounded-lg">
            <h3 className="font-semibold mb-3">Confirmar Pagamento</h3>
            <div className="mb-3">
              <label className="block text-sm font-medium mb-1">Forma de Pagamento</label>
              <select
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value as PaymentMethod)}
                className="w-full px-3 py-2 border rounded"
              >
                <option value="cash">Dinheiro</option>
                <option value="credit">Cartão de Crédito</option>
                <option value="debit">Cartão de Débito</option>
                <option value="pix">PIX</option>
                <option value="transfer">Transferência</option>
              </select>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => processPayment.mutate()}
                disabled={processPayment.isPending}
                className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50"
              >
                {processPayment.isPending ? 'Processando...' : 'Confirmar'}
              </button>
              <button
                onClick={() => setShowPayment(false)}
                className="px-4 py-2 border rounded"
              >
                Cancelar
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}