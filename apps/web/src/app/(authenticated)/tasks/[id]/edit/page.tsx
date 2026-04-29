'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { tasksApi } from '@/lib/api/tasks';
import { TaskPriority, TaskStatus } from '@clinica-saas/contracts';

interface TaskUpdateData {
  title: string;
  description?: string;
  priority: TaskPriority;
  status: TaskStatus;
  dueDate?: string;
  assignedTo?: string;
}

export default function EditTaskPage() {
  const params = useParams();
  const router = useRouter();
  const queryClient = useQueryClient();
  const taskId = params.id as string;

  const [formData, setFormData] = useState<TaskUpdateData>({
    title: '',
    description: '',
    priority: 'medium',
    status: 'pending',
    dueDate: '',
    assignedTo: undefined,
  });
  const [isInitialized, setIsInitialized] = useState(false);

  const { data: task, isLoading: isLoadingTask } = useQuery({
    queryKey: ['task', taskId],
    queryFn: () => tasksApi.getById(taskId),
  });

  useEffect(() => {
    if (task && !isInitialized) {
      setFormData({
        title: task.title,
        description: task.description || '',
        priority: task.priority,
        status: task.status,
        dueDate: task.dueDate ? task.dueDate.split('T')[0] : '',
        assignedTo: task.assignedTo?.id,
      });
      setIsInitialized(true);
    }
  }, [task, isInitialized]);

  const updateTask = useMutation({
    mutationFn: (data: TaskUpdateData) => tasksApi.update(taskId, {
      title: data.title,
      description: data.description || undefined,
      priority: data.priority,
      status: data.status,
      dueDate: data.dueDate || undefined,
      assignedTo: data.assignedTo,
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['task', taskId] });
      router.push(`/tasks/${taskId}`);
    },
    onError: (error: Error) => {
      alert(error.message || 'Erro ao atualizar tarefa');
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateTask.mutate(formData);
  };

  if (isLoadingTask) return <div className="p-6">Carregando...</div>;
  if (!task) return <div className="p-6">Tarefa não encontrada</div>;

  return (
    <div className="p-6 max-w-2xl">
      <h1 className="text-2xl font-bold mb-6">Editar Tarefa</h1>
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

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Status</label>
            <select
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value as TaskStatus })}
              className="w-full px-3 py-2 border rounded"
            >
              <option value="pending">Pendente</option>
              <option value="in_progress">Em Andamento</option>
              <option value="completed">Concluído</option>
            </select>
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

        <div className="p-3 bg-gray-50 rounded text-sm text-gray-600">
          <p>Para alterar paciente, agendamento ou responsável, exclua esta tarefa e crie uma nova.</p>
          {task.patientId && <p className="mt-1">Paciente ID: {task.patientId}</p>}
          {task.appointmentId && <p>Agendamento ID: {task.appointmentId}</p>}
          {task.assignedTo && <p>Responsável: {task.assignedTo.name}</p>}
        </div>

        <div className="flex gap-4">
          <button
            type="submit"
            disabled={updateTask.isPending}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
          >
            {updateTask.isPending ? 'Salvando...' : 'Salvar'}
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