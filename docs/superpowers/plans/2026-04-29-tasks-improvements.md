# Melhorias do Módulo de Tarefas - Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Melhorar o módulo de tarefas com navegação no menu, selectors com busca, página de edição e filtros no Kanban

**Architecture:** Frontend Next.js com TanStack Query. Criar componentes reutilizáveis de selector (PatientSelect, AppointmentSelect, UserSelect) e página de edição. Filtros pasan API via query params.

**Tech Stack:** Next.js 14, React, TanStack Query, Tailwind CSS, @clinica-saas/ui, @clinica-saas/contracts

---

## File Structure

### Arquivos a Criar
```
apps/web/src/components/tasks/
├── PatientSelect.tsx       # Selector de paciente com busca
├── AppointmentSelect.tsx   # Selector de agendamento com busca
├── UserSelect.tsx          # Selector de usuário
├── TaskFilters.tsx         # Filtros do Kanban
└── index.ts                # Barrel export

apps/web/src/app/(authenticated)/tasks/[id]/
└── edit/
    └── page.tsx            # Página de edição de tarefa
```

### Arquivos a Modificar
```
apps/web/src/app/(authenticated)/layout.tsx    # Adicionar item Tarefas ao menu
apps/web/src/app/(authenticated)/tasks/page.tsx         # Adicionar filtros ao Kanban
apps/web/src/app/(authenticated)/tasks/new/page.tsx    # Usar selectors
apps/web/src/app/(authenticated)/tasks/[id]/page.tsx   # Adicionar link Editar
```

---

## Task 1: Adicionar "Tarefas" ao Menu Sidebar

**Files:**
- Modify: `apps/web/src/app/(authenticated)/layout.tsx:9-14`

**Arquivo atual (linhas 9-14):**
```typescript
const navItemsBase = [
  { href: '/dashboard', label: 'Dashboard', icon: '📊', allowedRoles: ['super_admin', 'org_admin', 'receptionist', 'professional', 'support'] },
  { href: '/patients', label: 'Pacientes', icon: '👥', allowedRoles: ['super_admin', 'org_admin', 'receptionist', 'professional', 'support'] },
  { href: '/schedule', label: 'Agenda', icon: '📅', allowedRoles: ['super_admin', 'org_admin', 'receptionist', 'professional', 'support'] },
  { href: '/appointments', label: 'Agendamentos', icon: '🗓️', allowedRoles: ['super_admin', 'org_admin', 'receptionist', 'professional', 'support'] },
];
```

- [ ] **Step 1: Adicionar item "Tarefas" ao array navItemsBase**

Adicionar após a linha de appointments:
```typescript
  { href: '/tasks', label: 'Tarefas', icon: '📋', allowedRoles: ['super_admin', 'org_admin', 'receptionist', 'professional', 'support'] },
```

- [ ] **Step 2: Verificar que o menu está funcionando**
- Acessar qualquer página autenticada
- Verificar que "Tarefas" aparece no menu
- Clicar e verificar que navega para /tasks

- [ ] **Step 3: Commit**
```
git add apps/web/src/app/(authenticated)/layout.tsx
git commit -m "feat(tasks): add Tarefas to sidebar navigation"
```

---

## Task 2: Criar PatientSelect Component

**Files:**
- Create: `apps/web/src/components/tasks/PatientSelect.tsx`

```typescript
'use client';

import { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { patientsApi } from '@/lib/api/patients';

interface PatientSelectProps {
  value?: string;
  onChange: (patientId: string | undefined) => void;
  placeholder?: string;
}

export function PatientSelect({ value, onChange, placeholder = 'Buscar paciente...' }: PatientSelectProps) {
  const [search, setSearch] = useState('');
  const [isOpen, setIsOpen] = useState(false);

  const { data, isLoading } = useQuery({
    queryKey: ['patients', 'select', search],
    queryFn: () => patientsApi.getPatients({ search: search || undefined, limit: 20 }),
    enabled: isOpen && search.length > 0,
  });

  const selectedPatient = useMemo(() => {
    if (!value || !data?.items) return null;
    return data.items.find(p => p.id === value);
  }, [value, data]);

  const handleSelect = (patientId: string) => {
    onChange(patientId);
    setIsOpen(false);
    setSearch('');
  };

  return (
    <div className="relative">
      <label className="block text-sm font-medium mb-1">Paciente</label>
      <div className="relative">
        <input
          type="text"
          value={selectedPatient ? `${selectedPatient.name} (${selectedPatient.document})` : search}
          onChange={(e) => {
            setSearch(e.target.value);
            setIsOpen(true);
            if (value) onChange(undefined);
          }}
          onFocus={() => setIsOpen(true)}
          placeholder={placeholder}
          className="w-full px-3 py-2 border rounded"
        />
        {value && (
          <button
            type="button"
            onClick={() => onChange(undefined)}
            className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 hover:text-red-600"
          >
            ✕
          </button>
        )}
      </div>
      {isOpen && search.length > 0 && (
        <div className="absolute z-10 w-full mt-1 bg-white border rounded-md shadow-lg max-h-60 overflow-auto">
          {isLoading ? (
            <div className="p-2 text-gray-500">Carregando...</div>
          ) : data?.items?.length === 0 ? (
            <div className="p-2 text-gray-500">Nenhum paciente encontrado</div>
          ) : (
            data?.items?.map((patient) => (
              <button
                key={patient.id}
                type="button"
                onClick={() => handleSelect(patient.id)}
                className="w-full text-left px-3 py-2 hover:bg-gray-100"
              >
                <div className="font-medium">{patient.name}</div>
                <div className="text-sm text-gray-500">CPF: {patient.document}</div>
              </button>
            ))
          )}
        </div>
      )}
    </div>
  );
}
```

- [ ] **Step 1: Criar arquivo PatientSelect.tsx**
Copiar o código acima para `apps/web/src/components/tasks/PatientSelect.tsx`

- [ ] **Step 2: Criar arquivo index.ts para exportar**
Criar `apps/web/src/components/tasks/index.ts`:
```typescript
export { PatientSelect } from './PatientSelect';
export { AppointmentSelect } from './AppointmentSelect';
export { UserSelect } from './UserSelect';
export { TaskFilters } from './TaskFilters';
```

- [ ] **Step 3: Commit**
```
git add apps/web/src/components/tasks/
git commit -m "feat(tasks): add PatientSelect component with search"
```

---

## Task 3: Criar AppointmentSelect Component

**Files:**
- Create: `apps/web/src/components/tasks/AppointmentSelect.tsx`

```typescript
'use client';

import { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { appointmentsApi } from '@/lib/api/appointments';

interface AppointmentSelectProps {
  value?: string;
  onChange: (appointmentId: string | undefined) => void;
  patientId?: string;
  placeholder?: string;
}

export function AppointmentSelect({ value, onChange, patientId, placeholder = 'Buscar agendamento...' }: AppointmentSelectProps) {
  const [search, setSearch] = useState('');
  const [isOpen, setIsOpen] = useState(false);

  const { data, isLoading } = useQuery({
    queryKey: ['appointments', 'select', search, patientId],
    queryFn: () => appointmentsApi.getAppointments({ 
      search: search || undefined, 
      patientId,
      limit: 20 
    }),
    enabled: isOpen && search.length > 0,
  });

  const selectedAppointment = useMemo(() => {
    if (!value || !data?.items) return null;
    return data.items.find(a => a.id === value);
  }, [value, data]);

  const formatDateTime = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleString('pt-BR', { 
      day: '2-digit', 
      month: '2-digit', 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  const handleSelect = (appointmentId: string) => {
    onChange(appointmentId);
    setIsOpen(false);
    setSearch('');
  };

  return (
    <div className="relative">
      <label className="block text-sm font-medium mb-1">Agendamento</label>
      <div className="relative">
        <input
          type="text"
          value={selectedAppointment ? formatDateTime(selectedAppointment.dateTime) : search}
          onChange={(e) => {
            setSearch(e.target.value);
            setIsOpen(true);
            if (value) onChange(undefined);
          }}
          onFocus={() => setIsOpen(true)}
          placeholder={placeholder}
          className="w-full px-3 py-2 border rounded"
        />
        {value && (
          <button
            type="button"
            onClick={() => onChange(undefined)}
            className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 hover:text-red-600"
          >
            ✕
          </button>
        )}
      </div>
      {isOpen && search.length > 0 && (
        <div className="absolute z-10 w-full mt-1 bg-white border rounded-md shadow-lg max-h-60 overflow-auto">
          {isLoading ? (
            <div className="p-2 text-gray-500">Carregando...</div>
          ) : data?.items?.length === 0 ? (
            <div className="p-2 text-gray-500">Nenhum agendamento encontrado</div>
          ) : (
            data?.items?.map((appointment) => (
              <button
                key={appointment.id}
                type="button"
                onClick={() => handleSelect(appointment.id)}
                className="w-full text-left px-3 py-2 hover:bg-gray-100"
              >
                <div className="font-medium">{formatDateTime(appointment.dateTime)}</div>
                <div className="text-sm text-gray-500">Paciente: {appointment.patientName}</div>
              </button>
            ))
          )}
        </div>
      )}
    </div>
  );
}
```

- [ ] **Step 1: Criar arquivo AppointmentSelect.tsx**
Copiar o código acima para `apps/web/src/components/tasks/AppointmentSelect.tsx`

- [ ] **Step 2: Commit**
```
git add apps/web/src/components/tasks/AppointmentSelect.tsx
git commit -m "feat(tasks): add AppointmentSelect component with search"
```

---

## Task 4: Criar UserSelect Component

**Files:**
- Create: `apps/web/src/components/tasks/UserSelect.tsx`

```typescript
'use client';

import { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { usersApi } from '@/lib/api/users';

interface UserSelectProps {
  value?: string;
  onChange: (userId: string | undefined) => void;
  placeholder?: string;
}

export function UserSelect({ value, onChange, placeholder = 'Selecionar responsável...' }: UserSelectProps) {
  const [isOpen, setIsOpen] = useState(false);

  const { data, isLoading } = useQuery({
    queryKey: ['users', 'select', 'all'],
    queryFn: () => usersApi.listUsers({ limit: 100 }),
    enabled: isOpen,
  });

  const selectedUser = useMemo(() => {
    if (!value || !data?.items) return null;
    return data.items.find(u => u.id === value);
  }, [value, data]);

  const handleSelect = (userId: string) => {
    onChange(userId);
    setIsOpen(false);
  };

  return (
    <div className="relative">
      <label className="block text-sm font-medium mb-1">Responsável</label>
      <div className="relative">
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="w-full text-left px-3 py-2 border rounded bg-white hover:bg-gray-50"
        >
          {selectedUser ? (
            <span>{selectedUser.name} <span className="text-gray-500">({selectedUser.roleName})</span></span>
          ) : (
            <span className="text-gray-500">{placeholder}</span>
          )}
        </button>
        {value && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onChange(undefined);
            }}
            className="absolute right-8 top-1/2 -translate-y-1/2 text-gray-500 hover:text-red-600"
          >
            ✕
          </button>
        )}
      </div>
      {isOpen && (
        <div className="absolute z-10 w-full mt-1 bg-white border rounded-md shadow-lg max-h-60 overflow-auto">
          {isLoading ? (
            <div className="p-2 text-gray-500">Carregando...</div>
          ) : data?.items?.length === 0 ? (
            <div className="p-2 text-gray-500">Nenhum usuário encontrado</div>
          ) : (
            <>
              <button
                type="button"
                onClick={() => {
                  onChange(undefined);
                  setIsOpen(false);
                }}
                className="w-full text-left px-3 py-2 hover:bg-gray-100 text-gray-500"
              >
                Não atribuído
              </button>
              {data?.items?.map((user) => (
                <button
                  key={user.id}
                  type="button"
                  onClick={() => handleSelect(user.id)}
                  className="w-full text-left px-3 py-2 hover:bg-gray-100"
                >
                  <div className="font-medium">{user.name}</div>
                  <div className="text-sm text-gray-500">{user.roleName}</div>
                </button>
              ))}
            </>
          )}
        </div>
      )}
    </div>
  );
}
```

- [ ] **Step 1: Criar arquivo UserSelect.tsx**
Copiar o código acima para `apps/web/src/components/tasks/UserSelect.tsx`

- [ ] **Step 2: Commit**
```
git add apps/web/src/components/tasks/UserSelect.tsx
git commit -m "feat(tasks): add UserSelect component"
```

---

## Task 5: Atualizar Página de Criação (NewTaskPage)

**Files:**
- Modify: `apps/web/src/app/(authenticated)/tasks/new/page.tsx`

Substituir a página inteira para usar os selectors:

```typescript
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

  const createTask = useMutation({
    mutationFn: (data: typeof formData) => tasksApi.create({
      title: data.title,
      description: data.description || undefined,
      priority: data.priority,
      dueDate: data.dueDate || undefined,
      patientId: data.patientId,
      appointmentId: data.appointmentId,
      assignedTo: data.assignedTo,
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
```

- [ ] **Step 1: Substituir o conteúdo da página new/page.tsx**
Copiar o código acima para `apps/web/src/app/(authenticated)/tasks/new/page.tsx`

- [ ] **Step 2: Testar criando uma tarefa**
- Acessar /tasks/new
- Preencher os campos
- Selecionar paciente, agendamento, responsável
- Criar tarefa
- Verificar que aparece no Kanban

- [ ] **Step 3: Commit**
```
git add apps/web/src/app/(authenticated)/tasks/new/page.tsx
git commit -m "feat(tasks): update NewTaskPage with selectors"
```

---

## Task 6: Criar Página de Edição de Tarefa

**Files:**
- Create: `apps/web/src/app/(authenticated)/tasks/[id]/edit/page.tsx`

```typescript
'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { tasksApi } from '@/lib/api/tasks';
import { TaskPriority, TaskStatus } from '@clinica-saas/contracts';
import { PatientSelect, AppointmentSelect, UserSelect } from '@/components/tasks';

export default function EditTaskPage() {
  const params = useParams();
  const router = useRouter();
  const queryClient = useQueryClient();
  const taskId = params.id as string;

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    priority: 'medium' as TaskPriority,
    status: 'pending' as TaskStatus,
    dueDate: '',
    patientId: undefined as string | undefined,
    appointmentId: undefined as string | undefined,
    assignedTo: undefined as string | undefined,
  });
  const [isInitialized, setIsInitialized] = useState(false);

  const { data: task, isLoading: isLoadingTask } = useQuery({
    queryKey: ['task', taskId],
    queryFn: () => tasksApi.getById(taskId),
    onSuccess: (data) => {
      if (!isInitialized) {
        setFormData({
          title: data.title,
          description: data.description || '',
          priority: data.priority,
          status: data.status,
          dueDate: data.dueDate ? data.dueDate.split('T')[0] : '',
          patientId: data.patientId,
          appointmentId: data.appointmentId,
          assignedTo: data.assignedTo?.id,
        });
        setIsInitialized(true);
      }
    },
  });

  const updateTask = useMutation({
    mutationFn: (data: typeof formData) => tasksApi.update(taskId, {
      title: data.title,
      description: data.description || undefined,
      priority: data.priority,
      status: data.status,
      dueDate: data.dueDate || undefined,
      patientId: data.patientId,
      appointmentId: data.appointmentId,
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
```

- [ ] **Step 1: Criar diretório edit e página**
Criar `apps/web/src/app/(authenticated)/tasks/[id]/edit/page.tsx` com o código acima

- [ ] **Step 2: Adicionar link para editar na página de detalhes**
Modificar `apps/web/src/app/(authenticated)/tasks/[id]/page.tsx`:
Adicionar botão "Editar" no header da página:
```typescript
<div className="flex justify-between items-start mb-4">
  <h1 className="text-2xl font-bold">{task.title}</h1>
  <div className="flex gap-2">
    <Link
      href={`/tasks/${taskId}/edit`}
      className="px-3 py-1 border rounded hover:bg-gray-50"
    >
      Editar
    </Link>
  </div>
</div>
```

- [ ] **Step 3: Testar editando uma tarefa**
- Acessar /tasks/[id]
- Clicar em "Editar"
- Alterar campos
- Salvar
- Verificar alterações

- [ ] **Step 4: Commit**
```
git add apps/web/src/app/(authenticated)/tasks/\[id\]/
git commit -m "feat(tasks): add edit page for tasks"
```

---

## Task 7: Adicionar Filtros ao Kanban

**Files:**
- Create: `apps/web/src/components/tasks/TaskFilters.tsx`
- Modify: `apps/web/src/app/(authenticated)/tasks/page.tsx`

Criar TaskFilters.tsx:

```typescript
'use client';

import { useState, useEffect } from 'react';
import { TaskListParams, TaskStatus, TaskPriority } from '@clinica-saas/contracts';

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
```

- [ ] **Step 1: Criar TaskFilters.tsx**
Copiar o código acima para `apps/web/src/components/tasks/TaskFilters.tsx`

- [ ] **Step 2: Atualizar página do Kanban**
Modificar `apps/web/src/app/(authenticated)/tasks/page.tsx`:
1. Importar TaskFilters
2. Adicionar estado de filtros
3. Adicionar o componente antes do Kanban

```typescript
// No topo do arquivo, adicionar:
import { TaskFilters } from '@/components/tasks';

// No componente, adicionar estado de filtros:
const [filters, setFilters] = useState<any>({});

// Na query, incluir os filtros:
const { data, isLoading } = useQuery({
  queryKey: ['tasks', filters, search],
  queryFn: () => tasksApi.list({ ...filters, search: search || undefined }),
});

// Adicionar o componente antes do grid:
<TaskFilters onFilterChange={setFilters} initialValues={filters} />
```

- [ ] **Step 3: Testar filtros**
- Acessar /tasks
- Aplicar filtro de status
- Aplicar filtro de prioridade
- Aplicar filtro de data
- Verificar que o Kanban atualiza

- [ ] **Step 4: Commit**
```
git add apps/web/src/components/tasks/TaskFilters.tsx
git add apps/web/src/app/(authenticated)/tasks/page.tsx
git commit -m "feat(tasks): add filters to Kanban"
```

---

## Task 8: Melhorar UI do Kanban (Contadores e Overdue)

**Files:**
- Modify: `apps/web/src/app/(authenticated)/tasks/page.tsx`

Adicionar indicadores visuais para contadores e tarefas overdue:

- [ ] **Step 1: Adicionar função de verificação de overdue**
No arquivo page.tsx, adicionar:

```typescript
const isOverdue = (task: Task) => {
  if (!task.dueDate || task.status === 'completed') return false;
  const dueDate = new Date(task.dueDate);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return dueDate < today;
};
```

- [ ] **Step 2: Atualizar estilo do card para overdue**
Modificar o card da tarefa para mostrar destaque visual:
```typescript
// No div do card, adicionar condicional:
className={`bg-white p-3 rounded shadow cursor-move hover:shadow-md ${
  isOverdue(task) ? 'border-2 border-red-500' : ''
}`}
```

Adicionar indicador de overdue:
```typescript
{isOverdue(task) && (
  <span className="text-xs text-red-600 font-medium">⚠️ Atrasada</span>
)}
```

- [ ] **Step 3: Atualizar contador da coluna**
Os contadores já existem no formato: `(tasksByStatus(column.status).length)`
Manter como está, já mostra o número de tarefas.

- [ ] **Step 4: Commit**
```
git add apps/web/src/app/(authenticated)/tasks/page.tsx
git commit -m "feat(tasks): add overdue indicators to Kanban"
```

---

## Task 9: Verificação Final e Build

**Files:**
- Verificar todos os arquivos criados/modificados

- [ ] **Step 1: Rodar typecheck**
```bash
cd apps/web && npm run typecheck
```

- [ ] **Step 2: Rodar lint**
```bash
cd apps/web && npm run lint
```

- [ ] **Step 3: Rodar build**
```bash
cd apps/web && npm run build
```

- [ ] **Step 4: Commit final**
```
git add -A
git commit -m "feat(tasks): complete tasks improvements - navigation, selectors, edit page, filters, overdue"
```

---

## Checklist de Revisão

- [ ] Menu mostra "Tarefas" no sidebar
- [ ] NewTaskPage tem selectors funcionando
- [ ] Edit page (/tasks/[id]/edit) funciona
- [ ] Detalhes (/tasks/[id]) tem link para editar
- [ ] Kanban tem filtros por status, prioridade, data
- [ ] Tarefas overdue têm indicador visual
- [ ] Typecheck passa
- [ ] Build compila

---

## Histórico

| Versão | Data | Descrição |
|--------|------|-----------|
| 1.0.0 | 2026-04-29 | Initial plan - Melhorias do módulo de tarefas |

---

**Contato**: docs/superpowers/specs/2026-04-29-tasks-improvements-design.md