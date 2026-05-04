# AGENTS.md - Módulo de Tarefas (Frontend)

## Escopo

Módulo de tarefas do frontend Next.js com:
- Kanban com 3 colunas (Pendente, Em Andamento, Concluído)
- Modal de detalhes com edição inline (estilo Jira)
- Checklist para acompanhamento de subtarefas
- Comentários para colaboração da equipe

## Objetivo

Fornecer interface completa de gerenciamento de tarefas:
- Kanban visual para acompanhamento de fluxo
- **Modal de edição inline** - editar qualquer campo diretamente sem navegar para outra página
- Checklist opcional para quebrar tarefas em steps
- Sistema de comentários para discussão

## Estrutura de Pastas

```
apps/web/src/app/(authenticated)/tasks/
├── page.tsx                    # Kanban
├── new/
│   └── page.tsx               # Criar tarefa (com checklist opcional)
└── [id]/
    └── page.tsx               # Detalhes (redireciona para modal)

apps/web/src/components/tasks/
├── PatientSelect.tsx          # Selector de paciente
├── AppointmentSelect.tsx      # Selector de agendamento
├── UserSelect.tsx             # Selector de usuário
├── TaskFilters.tsx            # Filtros do Kanban
├── TaskModal.tsx              # Modal de detalhes com edição inline
├── TaskChecklist.tsx          # Componente de checklist
├── TaskComments.tsx           # Componente de comentários
└── index.ts                   # Barrel export
```

## Design do Modal (Edição Inline Estilo Jira)

O TaskModal deve permitir edição direta de todos os campos:

### Campos Editáveis
- **Título**: clique para editar, Enter ou blur para salvar
- **Descrição**: clique para editar, blur para salvar
- **Status**: dropdown (Pendente → Em Andamento → Concluído)
- **Prioridade**: dropdown (Baixa → Média → Alta)
- **Responsável**: dropdown com usuários da organização
- **Data de Vencimento**: date picker

### Layout Recomendado (Duas Colunas)
```
┌─────────────────────────────────────────┬────────────────────┐
│ COLUNA ESQUERDA                         │ COLUNA DIREITA     │
│                                         │                    │
│ [Título editável]                       │ CHECKLIST          │
│ Status: [dropdown]                       │ ☑ Item 1    [🗑]   │
│ Prioridade: [dropdown]                   │ ☐ Item 2    [🗑]   │
│ Responsável: [dropdown]                 │ + Adicionar        │
│ Vencimento: [date picker]                │                    │
│                                         │ COMENTÁRIOS        │
│ Descrição: [textarea editável]          │ [Lista]            │
│                                         │ [Input + Enviar]   │
└─────────────────────────────────────────┴────────────────────┘
```

### Comportamento
1. Usuário clica em qualquer campo → transforma em modo edição
2. Ao alterar valor → faz PATCH automático para API
3. Mostra feedback visual "Salvando..." durante request
4. Feedback de sucesso após salvar

## APIs Existentes

```typescript
// tasks.ts
tasksApi.list(params) → TaskListResponse
tasksApi.getById(id) → Task (inclui checklistItems e comments)
tasksApi.create(data) → Task
tasksApi.update(id, data) → Task
tasksApi.updateStatus(id, data) → Task
tasksApi.delete(id) → void
tasksApi.addComment(id, data) → TaskComment
tasksApi.updateComment(taskId, commentId, data) → TaskComment
tasksApi.deleteComment(taskId, commentId) → void
tasksApi.createChecklistItem(taskId, data) → TaskChecklistItem
tasksApi.updateChecklistItem(taskId, itemId, data) → TaskChecklistItem
tasksApi.toggleChecklistItem(taskId, itemId) → TaskChecklistItem
tasksApi.deleteChecklistItem(taskId, itemId) → void
```

## Componentes

### TaskModal (OBRIGATÓRIO - Edição Inline)
- Props: task: Task, onClose: () => void
- Comportamento: Todos os campos editáveis inline
- Usar mutations do TanStack Query para save automático

### TaskChecklist
- Props: taskId: string, items: TaskChecklistItem[], readOnly?: boolean
- Comportamento: toggle, adicionar, excluir itens
- Sempre visível (mesmo vazio) com botão "+ Add"

### TaskComments
- Props: taskId: string, comments: TaskComment[]
- Comportamento: listar, criar, editar (próprio), excluir (próprio)

### PatientSelect, AppointmentSelect, UserSelect
- Props: value, onChange, placeholder?
- Comportamento: search com debounce, dropdown com resultados

### TaskFilters
- Props: onFilterChange, initialValues
- Filtros: status, priority, assignedTo, dueDateFrom, dueDateTo

## Critérios de Desenvolvimento

1. **Edição inline** - todos os campos editáveis diretamente no modal (NÃO navegar para outra página)
2. Usar UI components de @clinica-saas/ui
3. Usar TanStack Query para fetching e mutations
4. Feedback visual durante save (loading state)
5. Layout responsivo
6. Tratar erros com mensagens claras
7. Seguir padrões existentes (hooks, components)

## SPECs de Referência

- SPEC Principal: docs/superpowers/specs/2026-04-29-task-modal-checklist-comments-design.md
- SPEC Original: docs/specs/006-tasks.md
- API: apps/web/src/lib/api/tasks.ts
- Contracts: packages/contracts/src/types/task.ts

---

**Contato**: docs/superpowers/specs/2026-04-29-task-modal-checklist-comments-design.md