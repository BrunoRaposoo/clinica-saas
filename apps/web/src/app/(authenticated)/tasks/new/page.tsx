'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useMutation } from '@tanstack/react-query';
import { tasksApi } from '@/lib/api/tasks';
import { TaskPriority } from '@clinica-saas/contracts';
import { PatientSelect, AppointmentSelect, UserSelect } from '@/components/tasks';

export default function NewTaskPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    priority: 'medium' as TaskPriority,
    dueDate: '',
    patientId: undefined as string | undefined,
    appointmentId: undefined as string | undefined,
    assignedTo: undefined as string | undefined,
  });
  const [checklistItems, setChecklistItems] = useState<{ content: string }[]>([]);
  const [newItem, setNewItem] = useState('');

  const createTask = useMutation({
    mutationFn: (data: typeof formData) => tasksApi.create({
      title: data.title,
      description: data.description || undefined,
      priority: data.priority,
      dueDate: data.dueDate || undefined,
      patientId: data.patientId,
      appointmentId: data.appointmentId,
      assignedTo: data.assignedTo,
      checklistItems: checklistItems.length > 0 ? checklistItems : undefined,
    }),
    onSuccess: () => {
      router.push('/tasks');
    },
    onError: (error: Error) => {
      alert(error.message || 'Erro ao criar tarefa');
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createTask.mutate(formData);
  };

  const handleAddItem = () => {
    if (newItem.trim()) {
      setChecklistItems([...checklistItems, { content: newItem.trim() }]);
      setNewItem('');
    }
  };

  return (
    <div className="p-6 max-w-2xl">
      <h1 className="text-2xl font-bold mb-6">Nova Tarefa</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">Título *</label>
          <input
            type="text"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            className="w-full px-3 py-2 border rounded"
            required
            minLength={3}
            maxLength={200}
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Descrição</label>
          <textarea
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            className="w-full px-3 py-2 border rounded"
            rows={4}
            maxLength={2000}
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Prioridade</label>
          <select
            value={formData.priority}
            onChange={(e) => setFormData({ ...formData, priority: e.target.value as TaskPriority })}
            className="w-full px-3 py-2 border rounded"
          >
            <option value="low">Baixa</option>
            <option value="medium">Média</option>
            <option value="high">Alta</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Prazo</label>
          <input
            type="date"
            value={formData.dueDate}
            onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
            className="w-full px-3 py-2 border rounded"
          />
        </div>

        <PatientSelect
          value={formData.patientId}
          onChange={(patientId) => setFormData({ ...formData, patientId })}
        />

        <AppointmentSelect
          value={formData.appointmentId}
          onChange={(appointmentId) => setFormData({ ...formData, appointmentId })}
        />

        <UserSelect
          value={formData.assignedTo}
          onChange={(assignedTo) => setFormData({ ...formData, assignedTo })}
        />

        <div className="border rounded-lg p-4">
          <label className="block text-sm font-medium mb-2">Checklist (opcional)</label>
          <div className="space-y-2 mb-3">
            {checklistItems.map((item, index) => (
              <div key={index} className="flex items-center gap-2">
                <span className="text-sm flex-1">{item.content}</span>
                <button
                  type="button"
                  onClick={() => setChecklistItems(items => items.filter((_, i) => i !== index))}
                  className="text-red-500 hover:text-red-700"
                >
                  ×
                </button>
              </div>
            ))}
          </div>
          <div className="flex gap-2">
            <input
              type="text"
              value={newItem}
              onChange={(e) => setNewItem(e.target.value)}
              placeholder="Adicionar item..."
              className="flex-1 px-3 py-2 text-sm border rounded"
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleAddItem();
                }
              }}
            />
            <button
              type="button"
              onClick={handleAddItem}
              className="px-3 py-2 bg-gray-100 text-gray-700 rounded hover:bg-gray-200 text-sm"
            >
              Add
            </button>
          </div>
        </div>

        <div className="flex gap-4">
          <button
            type="submit"
            disabled={createTask.isPending}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
          >
            {createTask.isPending ? 'Salvando...' : 'Criar Tarefa'}
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