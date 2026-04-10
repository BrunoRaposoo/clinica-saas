'use client';

import { useState } from 'react';
import { useParams } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { tasksApi } from '@/lib/api/tasks';
import { TaskStatus, TaskPriority } from '@clinica-saas/contracts';
import Link from 'next/link';

export default function TaskDetailPage() {
  const params = useParams();
  const taskId = params.id as string;
  const queryClient = useQueryClient();
  const [newComment, setNewComment] = useState('');

  const { data: task, isLoading } = useQuery({
    queryKey: ['task', taskId],
    queryFn: () => tasksApi.getById(taskId),
  });

  const updateStatus = useMutation({
    mutationFn: (status: TaskStatus) => tasksApi.updateStatus(taskId, { status }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['task', taskId] });
    },
  });

  const addComment = useMutation({
    mutationFn: (content: string) => tasksApi.addComment(taskId, { content }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['task', taskId] });
      setNewComment('');
    },
  });

  if (isLoading) return <div className="p-6">Carregando...</div>;
  if (!task) return <div className="p-6">Tarefa não encontrada</div>;

  const priorityColor = (priority: TaskPriority) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const statusOptions: TaskStatus[] = ['pending', 'in_progress', 'completed'];

  return (
    <div className="p-6 max-w-3xl">
      <Link href="/tasks" className="text-blue-600 hover:underline mb-4 block">
        ← Voltar para Tarefas
      </Link>

      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex justify-between items-start mb-4">
          <h1 className="text-2xl font-bold">{task.title}</h1>
          <span className={`px-3 py-1 rounded ${priorityColor(task.priority)}`}>
            {task.priority}
          </span>
        </div>

        {task.description && (
          <p className="text-gray-700 mb-4">{task.description}</p>
        )}

        <div className="grid grid-cols-2 gap-4 mb-6">
          <div>
            <label className="block text-sm text-gray-500">Status</label>
            <select
              value={task.status}
              onChange={(e) => updateStatus.mutate(e.target.value as TaskStatus)}
              className="mt-1 px-3 py-2 border rounded"
            >
              {statusOptions.map((s) => (
                <option key={s} value={s}>
                  {s === 'pending' ? 'Pendente' : s === 'in_progress' ? 'Em Andamento' : 'Concluído'}
                </option>
              ))}
            </select>
          </div>

          {task.dueDate && (
            <div>
              <label className="block text-sm text-gray-500">Prazo</label>
              <p className="mt-1">
                {new Date(task.dueDate).toLocaleDateString('pt-BR')}
              </p>
            </div>
          )}

          <div>
            <label className="block text-sm text-gray-500">Responsável</label>
            <p className="mt-1">{task.assignedTo?.name || 'Não atribuído'}</p>
          </div>

          <div>
            <label className="block text-sm text-gray-500">Criado por</label>
            <p className="mt-1">{task.createdBy.name}</p>
          </div>
        </div>

        {task.patientId && (
          <div className="mb-4">
            <Link
              href={`/patients/${task.patientId}`}
              className="text-blue-600 hover:underline"
            >
              Ver paciente →
            </Link>
          </div>
        )}

        {task.appointmentId && (
          <div className="mb-4">
            <Link
              href={`/appointments/${task.appointmentId}`}
              className="text-blue-600 hover:underline"
            >
              Ver agendamento →
            </Link>
          </div>
        )}
      </div>

      <div className="mt-6">
        <h2 className="text-lg font-semibold mb-4">Comentários</h2>

        <div className="space-y-3 mb-4">
          {(task as any).comments?.map((comment: any) => (
            <div key={comment.id} className="bg-gray-50 rounded p-3">
              <div className="flex justify-between text-sm text-gray-500 mb-1">
                <span>{comment.user.name}</span>
                <span>{new Date(comment.createdAt).toLocaleString('pt-BR')}</span>
              </div>
              <p>{comment.content}</p>
            </div>
          ))}
        </div>

        <div className="flex gap-2">
          <input
            type="text"
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="Adicionar comentário..."
            className="flex-1 px-3 py-2 border rounded"
            onKeyDown={(e) => {
              if (e.key === 'Enter' && newComment.trim()) {
                addComment.mutate(newComment.trim());
              }
            }}
          />
          <button
            onClick={() => newComment.trim() && addComment.mutate(newComment.trim())}
            disabled={addComment.isPending || !newComment.trim()}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
          >
            Enviar
          </button>
        </div>
      </div>
    </div>
  );
}