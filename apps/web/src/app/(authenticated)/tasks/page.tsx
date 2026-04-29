'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { tasksApi } from '@/lib/api/tasks';
import { TaskStatus, TaskPriority, Task, TaskListParams } from '@clinica-saas/contracts';
import Link from 'next/link';
import { TaskFilters } from '@/components/tasks';

const COLUMNS: { status: TaskStatus; title: string; color: string }[] = [
  { status: 'pending', title: 'Pendente', color: 'border-yellow-500' },
  { status: 'in_progress', title: 'Em Andamento', color: 'border-blue-500' },
  { status: 'completed', title: 'Concluído', color: 'border-green-500' },
];

const isOverdue = (task: Task): boolean => {
  if (!task.dueDate || task.status === 'completed') return false;
  const dueDate = new Date(task.dueDate);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return dueDate < today;
};

export default function TasksPage() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [filters, setFilters] = useState<TaskListParams>({});

  const { data, isLoading } = useQuery({
    queryKey: ['tasks', filters, search],
    queryFn: () => tasksApi.list({ ...filters, search: search || undefined }),
  });

  const updateStatus = useMutation({
    mutationFn: ({ id, status }: { id: string; status: TaskStatus }) =>
      tasksApi.updateStatus(id, { status }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
    },
  });

  const handleDragStart = (e: React.DragEvent, taskId: string) => {
    e.dataTransfer.setData('taskId', taskId);
  };

  const handleDrop = (e: React.DragEvent, newStatus: TaskStatus) => {
    const taskId = e.dataTransfer.getData('taskId');
    if (taskId) {
      updateStatus.mutate({ id: taskId, status: newStatus });
    }
  };

  const tasksByStatus = (status: TaskStatus) =>
    data?.items.filter((t) => t.status === status) || [];

  const priorityColor = (priority: TaskPriority) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (isLoading) return <div className="p-6">Carregando...</div>;

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Tarefas</h1>
        <Link
          href="/tasks/new"
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Nova Tarefa
        </Link>
      </div>

      <div className="mb-4">
        <input
          type="text"
          placeholder="Buscar tarefas..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full max-w-md px-3 py-2 border rounded"
        />
      </div>

      <TaskFilters onFilterChange={setFilters} initialValues={filters} />

      <div className="grid grid-cols-3 gap-4">
        {COLUMNS.map((column) => (
          <div
            key={column.status}
            className="bg-gray-50 rounded-lg p-4 min-h-[400px]"
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => handleDrop(e, column.status)}
          >
            <h2 className={`font-semibold mb-4 pb-2 border-b-2 ${column.color}`}>
              {column.title} ({tasksByStatus(column.status).length})
            </h2>
            <div className="space-y-3">
              {tasksByStatus(column.status).map((task) => (
                <div
                  key={task.id}
                  draggable
                  onDragStart={(e) => handleDragStart(e, task.id)}
                  className={`bg-white p-3 rounded shadow cursor-move hover:shadow-md ${
                    isOverdue(task) ? 'border-2 border-red-500' : ''
                  }`}
                >
                  {isOverdue(task) && (
                    <span className="text-xs text-red-600 font-medium">⚠️ Atrasada</span>
                  )}
                  <Link href={`/tasks/${task.id}`}>
                    <h3 className="font-medium">{task.title}</h3>
                  </Link>
                  {task.description && (
                    <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                      {task.description}
                    </p>
                  )}
                  <div className="flex justify-between items-center mt-2">
                    <span className={`text-xs px-2 py-1 rounded ${priorityColor(task.priority)}`}>
                      {task.priority}
                    </span>
                    {task.dueDate && (
                      <span className={`text-xs ${isOverdue(task) ? 'text-red-600' : 'text-gray-500'}`}>
                        {new Date(task.dueDate).toLocaleDateString('pt-BR')}
                      </span>
                    )}
                  </div>
                  {task.assignedTo && (
                    <div className="mt-2 text-xs text-gray-500">
                      Responsável: {task.assignedTo.name}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}