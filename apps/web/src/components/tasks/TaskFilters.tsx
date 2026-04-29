'use client';

import { useState, useEffect } from 'react';
import { TaskListParams } from '@clinica-saas/contracts';

interface TaskFiltersProps {
  onFilterChange: (filters: TaskListParams) => void;
  initialValues?: TaskListParams;
}

export function TaskFilters({ onFilterChange, initialValues }: TaskFiltersProps) {
  const [filters, setFilters] = useState<TaskListParams>(initialValues || {});

  useEffect(() => {
    onFilterChange(filters);
  }, [filters, onFilterChange]);

  const handleChange = (key: keyof TaskListParams, value: string) => {
    const newFilters = { ...filters };
    if (value === '' || value === 'all') {
      delete newFilters[key];
    } else {
      (newFilters as any)[key] = value;
    }
    setFilters(newFilters);
  };

  return (
    <div className="flex flex-wrap gap-2 mb-4 p-3 bg-gray-50 rounded-lg">
      <select
        value={filters.status || ''}
        onChange={(e) => handleChange('status', e.target.value)}
        className="px-2 py-1 border rounded text-sm"
      >
        <option value="">Todos os status</option>
        <option value="pending">Pendente</option>
        <option value="in_progress">Em Andamento</option>
        <option value="completed">Concluído</option>
      </select>

      <select
        value={filters.priority || ''}
        onChange={(e) => handleChange('priority', e.target.value)}
        className="px-2 py-1 border rounded text-sm"
      >
        <option value="">Todas as prioridades</option>
        <option value="high">Alta</option>
        <option value="medium">Média</option>
        <option value="low">Baixa</option>
      </select>

      <input
        type="date"
        value={filters.dueDateFrom || ''}
        onChange={(e) => handleChange('dueDateFrom', e.target.value)}
        className="px-2 py-1 border rounded text-sm"
        placeholder="De"
      />

      <input
        type="date"
        value={filters.dueDateTo || ''}
        onChange={(e) => handleChange('dueDateTo', e.target.value)}
        className="px-2 py-1 border rounded text-sm"
        placeholder="Até"
      />

      <button
        onClick={() => setFilters({})}
        className="px-2 py-1 text-sm text-gray-600 hover:text-gray-900"
      >
        Limpar filtros
      </button>
    </div>
  );
}