'use client';

import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { tasksApi } from '@/lib/api/tasks';
import { TaskChecklistItem } from '@clinica-saas/contracts';

interface TaskChecklistProps {
  taskId: string;
  items: TaskChecklistItem[];
  readOnly?: boolean;
}

export function TaskChecklist({ taskId, items, readOnly = false }: TaskChecklistProps) {
  const queryClient = useQueryClient();
  const [newItem, setNewItem] = useState('');
  const [isAdding, setIsAdding] = useState(false);

  const toggleMutation = useMutation({
    mutationFn: (itemId: string) => tasksApi.toggleChecklistItem(taskId, itemId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      queryClient.invalidateQueries({ queryKey: ['task', taskId] });
    },
  });

  const createMutation = useMutation({
    mutationFn: (data: { content: string; isCompleted?: boolean }) => tasksApi.createChecklistItem(taskId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      queryClient.invalidateQueries({ queryKey: ['task', taskId] });
      setNewItem('');
      setIsAdding(false);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (itemId: string) => tasksApi.deleteChecklistItem(taskId, itemId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      queryClient.invalidateQueries({ queryKey: ['task', taskId] });
    },
  });

  const handleToggle = (itemId: string) => {
    toggleMutation.mutate(itemId);
  };

  const handleAdd = () => {
    if (newItem.trim()) {
      createMutation.mutate({ content: newItem.trim() });
    }
  };

  const handleDelete = (itemId: string) => {
    if (confirm('Excluir este item?')) {
      deleteMutation.mutate(itemId);
    }
  };

  const completedCount = items.filter(i => i.isCompleted).length;

  return (
    <div className="bg-green-50 rounded-lg p-3 sm:p-4">
      <div className="flex justify-between items-center mb-3">
        <h3 className="text-sm font-semibold text-green-800">CHECKLIST {items.length > 0 && `(${completedCount}/${items.length})`}</h3>
        {!readOnly && (
          <button
            type="button"
            onClick={() => setIsAdding(true)}
            className="text-xs text-green-600 hover:text-green-700 font-medium"
          >
            + Add
          </button>
        )}
      </div>

      {isAdding && (
        <div className="flex flex-col gap-2 mb-3">
          <input
            type="text"
            value={newItem}
            onChange={(e) => setNewItem(e.target.value)}
            placeholder="Novo item..."
            className="w-full px-3 py-2 text-sm border rounded focus:outline-none focus:ring-2 focus:ring-green-500"
            onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
            autoFocus
          />
          <div className="flex gap-2">
            <button
              type="button"
              onClick={handleAdd}
              className="flex-1 px-3 py-2 bg-green-600 text-white text-sm rounded hover:bg-green-700"
            >
              Add
            </button>
            <button
              type="button"
              onClick={() => { setIsAdding(false); setNewItem(''); }}
              className="flex-1 px-3 py-2 text-gray-600 text-sm rounded hover:bg-gray-100"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      <div className="max-h-48 overflow-y-auto space-y-2">
        {items.map((item) => (
          <div key={item.id} className="flex items-center gap-2 group">
            <input
              type="checkbox"
              checked={item.isCompleted}
              onChange={() => handleToggle(item.id)}
              disabled={readOnly}
              className="w-4 h-4 rounded border-gray-300 text-green-600 focus:ring-green-500"
            />
            <span className={`flex-1 text-sm ${item.isCompleted ? 'line-through text-gray-400' : 'text-gray-700'}`}>
              {item.content}
            </span>
            {!readOnly && (
              <button
                type="button"
                onClick={() => handleDelete(item.id)}
                className="opacity-0 group-hover:opacity-100 text-red-500 hover:text-red-700 p-1"
                title="Excluir"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
            )}
          </div>
        ))}
        {items.length === 0 && !isAdding && (
          <p className="text-sm text-gray-400 italic">Nenhum item adicionado</p>
        )}
      </div>
    </div>
  );
}