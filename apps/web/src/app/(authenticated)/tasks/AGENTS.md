# AGENTS.md - Módulo de Tarefas (Frontend)

## Escopo

Melhorias no módulo de tarefas do frontend Next.js:
- Navegação no menu sidebar
- Componentes de selector (paciente, agendamento, usuário)
- Página de edição
- Filtros no Kanban

## Objetivo

Melhorar UX/UI do módulo de tarefas:
- Adicionar "Tarefas" ao menu
- Substituir inputs de texto por dropdowns com busca
- Adicionar página de edição
- Adicionar filtros no Kanban

## Estrutura de Pastas

```
apps/web/src/app/(authenticated)/tasks/
├── page.tsx                    # Kanban
├── new/
│   └── page.tsx               # Criar tarefa
├── [id]/
│   ├── page.tsx               # Detalhes
│   └── edit/
│       └── page.tsx           # Editar tarefa (NOVO)

apps/web/src/components/tasks/  # (NOVO)
├── PatientSelect.tsx          # Selector de paciente
├── AppointmentSelect.tsx      # Selector de agendamento
├── UserSelect.tsx             # Selector de usuário
├── TaskFilters.tsx            # Filtros do Kanban
└── index.ts                   # Barrel export
```

## Responsabilidades

### O que fazer
- Adicionar item ao menu em layout.tsx
- Criar componentes de selector com busca
- Criar página de edição
- Adicionar filtros ao Kanban

### O que não fazer
- Modificar estrutura de dados
- Adicionar funcionalidades fora do escopo (sub-tarefas, etc)

## Arquivos de Referência

- SPEC: docs/superpowers/specs/2026-04-29-tasks-improvements-design.md
- SPEC Original: docs/specs/006-tasks.md
- API: apps/web/src/lib/api/tasks.ts
- Contracts: packages/contracts/src/types/task.ts
- Layout Menu: apps/web/src/app/(authenticated)/layout.tsx

## APIs Existentes

```typescript
// patients.ts
patientsApi.getPatients(params) → PatientListResponse

// appointments.ts
appointmentsApi.getAppointments(params) → AppointmentListResponse

// users.ts
usersApi.listUsers(params) → { items: User[], pagination }

// tasks.ts
tasksApi.list(params) → TaskListResponse
tasksApi.getById(id) → Task
tasksApi.create(data) → Task
tasksApi.update(id, data) → Task
tasksApi.updateStatus(id, data) → Task
```

## Componentes a Criar

### PatientSelect
- Props: value, onChange, placeholder
- Comportamento: search com debounce, dropdown com nome+documento

### AppointmentSelect
- Props: value, onChange, patientId?, placeholder
- Comportamento: search com debounce, mostra data/hora+paciente+profissional

### UserSelect
- Props: value, onChange, placeholder
- Comportamento: lista usuários da org, mostra nome+role

### TaskFilters
- Props: onFilterChange, initialValues
- Filtros: status, priority, assignedTo, dueDateFrom, dueDateTo, search

## Critérios de Desenvolvimento

1. Usar UI components de @clinica-saas/ui
2. Usar TanStack Query para fetching
3. Seguir padrões existentes (hooks, components)
4. Testar em mobile (responsividade)
5. Tratar erros com mensagens claras

---

**Contato**: docs/superpowers/specs/2026-04-29-tasks-improvements-design.md