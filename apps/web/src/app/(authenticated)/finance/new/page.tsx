'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useMutation } from '@tanstack/react-query';
import { financeApi } from '@/lib/api/finance';
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
          <label className="block text-sm font-medium mb-1">Vincular Paciente (ID)</label>
          <input
            type="text"
            value={formData.patientId}
            onChange={(e) => setFormData({ ...formData, patientId: e.target.value })}
            className="w-full px-3 py-2 border rounded"
            placeholder="uuid"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Vincular Agendamento (ID)</label>
          <input
            type="text"
            value={formData.appointmentId}
            onChange={(e) => setFormData({ ...formData, appointmentId: e.target.value })}
            className="w-full px-3 py-2 border rounded"
            placeholder="uuid"
          />
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