'use client';

import { useEffect, useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Task, TaskStatus, TaskPriority, TaskUpdateRequest } from '@clinica-saas/contracts';
import { tasksApi } from '@/lib/api/tasks';
import { TaskChecklist } from './TaskChecklist';
import { TaskComments } from './TaskComments';
import { UserSelect } from './UserSelect';
import Link from 'next/link';

interface TaskModalProps {
  task: Task;
  onClose: () => void;
}

const priorityLabels: Record<TaskPriority, string> = {
  low: 'Baixa',
  medium: 'Média',
  high: 'Alta',
};

const statusLabels: Record<TaskStatus, string> = {
  pending: 'Pendente',
  in_progress: 'Em Andamento',
  completed: 'Concluído',
};

const priorityColors: Record<TaskPriority, string> = {
  low: 'bg-green-100 text-green-800',
  medium: 'bg-yellow-100 text-yellow-800',
  high: 'bg-red-100 text-red-800',
};

const statusColors: Record<TaskStatus, string> = {
  pending: 'bg-yellow-100 text-yellow-800',
  in_progress: 'bg-blue-100 text-blue-800',
  completed: 'bg-green-100 text-green-800',
};

export function TaskModal({ task, onClose }: TaskModalProps) {
  const queryClient = useQueryClient();
  const [isOpen, setIsOpen] = useState(false);
  
  // Edit states
  const [editingTitle, setEditingTitle] = useState(false);
  const [titleValue, setTitleValue] = useState(task.title);
  const [editingDesc, setEditingDesc] = useState(false);
  const [descValue, setDescValue] = useState(task.description || '');
  const [saving, setSaving] = useState(false);

  const updateTaskMutation = useMutation({
    mutationFn: (data: TaskUpdateRequest) => tasksApi.update(task.id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      setSaving(false);
    },
    onError: () => {
      setSaving(false);
    },
  });

  const handleSaveTitle = () => {
    if (titleValue.trim() && titleValue !== task.title) {
      setSaving(true);
      updateTaskMutation.mutate({ title: titleValue.trim() });
    }
    setEditingTitle(false);
  };

  const handleSaveDesc = () => {
    if (descValue !== task.description) {
      setSaving(true);
      updateTaskMutation.mutate({ description: descValue || undefined });
    }
    setEditingDesc(false);
  };

  const handleFieldChange = (field: string, value: any) => {
    setSaving(true);
    const data: TaskUpdateRequest = {};
    if (field === 'assignedTo') {
      data.assignedTo = value || undefined;
    } else if (field === 'dueDate') {
      data.dueDate = value || undefined;
    } else {
      (data as any)[field] = value;
    }
    updateTaskMutation.mutate(data);
  };

  useEffect(() => {
    setIsOpen(true);
  }, []);

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      setIsOpen(false);
      setTimeout(onClose, 200);
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return '';
    return new Date(dateString).toISOString().split('T')[0];
  };

  return (
    <div
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
      onClick={handleBackdropClick}
    >
      <div
        className={`bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto transition-opacity duration-200 ${isOpen ? 'opacity-100' : 'opacity-0'}`}
      >
        <div className="sticky top-0 bg-white border-b px-6 py-3 flex justify-between items-center rounded-t-lg">
          <div className="flex items-center gap-2">
            <span className={`w-2 h-2 rounded-full ${saving ? 'bg-yellow-500 animate-pulse' : 'bg-green-500'}`}></span>
            <span className="text-xs text-gray-500">{saving ? 'Salvando...' : 'Salvo'}</span>
          </div>
          <button
            type="button"
            onClick={() => { setIsOpen(false); setTimeout(onClose, 200); }}
            className="text-gray-400 hover:text-gray-600 p-1"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* COLUNA ESQUERDA - Campos Editáveis */}
            <div className="md:col-span-2 space-y-4">
              {/* Título Editável */}
              <div>
                {editingTitle ? (
                  <input
                    type="text"
                    value={titleValue}
                    onChange={(e) => setTitleValue(e.target.value)}
                    onBlur={handleSaveTitle}
                    onKeyDown={(e) => e.key === 'Enter' && handleSaveTitle()}
                    className="text-xl font-bold w-full px-2 py-1 border-2 border-blue-500 rounded focus:outline-none"
                    autoFocus
                  />
                ) : (
                  <h2 
                    className="text-xl font-bold text-gray-800 cursor-pointer hover:bg-gray-50 px-2 py-1 rounded"
                    onClick={() => setEditingTitle(true)}
                  >
                    {task.title}
                  </h2>
                )}
              </div>

              {/* Status e Prioridade em linha */}
              <div className="flex flex-wrap gap-3">
                <div>
                  <label className="text-xs text-gray-500 block mb-1">Status</label>
                  <select
                    value={task.status}
                    onChange={(e) => handleFieldChange('status', e.target.value)}
                    className={`px-3 py-1.5 rounded text-sm font-medium border ${statusColors[task.status as TaskStatus]} cursor-pointer`}
                  >
                    <option value="pending">Pendente</option>
                    <option value="in_progress">Em Andamento</option>
                    <option value="completed">Concluído</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs text-gray-500 block mb-1">Prioridade</label>
                  <select
                    value={task.priority}
                    onChange={(e) => handleFieldChange('priority', e.target.value)}
                    className={`px-3 py-1.5 rounded text-sm font-medium border cursor-pointer ${priorityColors[task.priority as TaskPriority]}`}
                  >
                    <option value="low">Baixa</option>
                    <option value="medium">Média</option>
                    <option value="high">Alta</option>
                  </select>
                </div>
              </div>

              {/* Responsável */}
              <div>
                <label className="text-xs text-gray-500 block mb-1">Responsável</label>
                <div className="w-full max-w-xs">
                  <UserSelect
                    value={task.assignedTo?.id}
                    onChange={(userId) => handleFieldChange('assignedTo', userId || null)}
                    placeholder="Selecione responsável"
                  />
                </div>
              </div>

              {/* Data de Vencimento */}
              <div>
                <label className="text-xs text-gray-500 block mb-1">Vencimento</label>
                <input
                  type="date"
                  value={formatDate(task.dueDate)}
                  onChange={(e) => handleFieldChange('dueDate', e.target.value || null)}
                  className="px-3 py-2 border rounded text-sm"
                />
              </div>

              {/* Descrição Editável */}
              <div>
                <label className="text-xs text-gray-500 block mb-1">Descrição</label>
                {editingDesc ? (
                  <textarea
                    value={descValue}
                    onChange={(e) => setDescValue(e.target.value)}
                    onBlur={handleSaveDesc}
                    className="w-full px-3 py-2 border-2 border-blue-500 rounded min-h-[100px] focus:outline-none"
                    autoFocus
                  />
                ) : (
                  <div 
                    className="w-full px-3 py-2 min-h-[80px] border rounded bg-gray-50 cursor-pointer hover:bg-gray-100"
                    onClick={() => setEditingDesc(true)}
                  >
                    {task.description ? (
                      <p className="text-sm text-gray-700 whitespace-pre-wrap">{task.description}</p>
                    ) : (
                      <p className="text-sm text-gray-400 italic">Clique para adicionar descrição...</p>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* COLUNA DIREITA - Checklist e Comentários */}
            <div className="space-y-4">
              {/* Checklist */}
              <TaskChecklist taskId={task.id} items={task.checklistItems || []} />

              {/* Comentários */}
              <TaskComments taskId={task.id} comments={task.comments || []} />
            </div>
          </div>
        </div>

        <div className="border-t px-6 py-4 flex justify-between items-center">
          <div className="text-xs text-gray-400">
            Criado por {task.createdBy.name} • {new Date(task.createdAt).toLocaleDateString('pt-BR')}
          </div>
          <Link
            href={`/tasks/${task.id}/edit`}
            className="px-4 py-2 text-blue-600 hover:bg-blue-50 rounded text-sm font-medium"
          >
            Ver detalhes completos
          </Link>
        </div>
      </div>
    </div>
  );
}