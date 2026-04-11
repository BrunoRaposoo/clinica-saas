# SPEC 006: Tarefas Internas

## 1. Contexto do Problema

O sistema de gestão de clínicas precisa gerenciar tarefas internas, pendências, follow-ups e ações administrativas da equipe. Com as fases anteriores implementadas (Auth, Pacientes, Agenda, Comunicações, Documentos), há necessidade de:

- Acompanhar pendências diarias da equipe
- Atribuir responsabilidades
- Controlar prazos de execução
- Kanban para visualização do fluxo de trabalho
- Comentários internos para comunicação de equipe
- Auditoria de alterações

O módulo atual não contempla gerenciamento de tarefas internas.

## 2. Objetivo do Módulo

Criar sistema de tarefas internas com:
- Kanban básico de 3 colunas (Pendente → Em Andamento → Concluído)
- Criação, edição, exclusão de tarefas
- Atribuição de responsável
- Prioridade (low, medium, high)
- Prazo de execução
- Comentários internos
- Vinculação opcional com paciente/agendamento
- Controle por organização e permissões
- Auditoria de alterações

## 3. Escopo da Feature

### Dentro do Escopo:
- [x] Kanban de 3 colunas
- [x] CRUD de tarefas
- [x] Atribuição de responsável
- [x] Prioridade (low, medium, high)
- [x] Prazo de execução (dueDate)
- [x] Comentários internos
- [x] Vinculação opcional com paciente
- [x] Vinculação opcional com agendamento
- [x] Controle de acesso por organization_id
- [x] Auditoria de operações sensíveis

### Fora do Escopo:
- [ ] Kanban avançado com dependências
- [ ] Sub-tarefas
- [ ] Recorrência sofisticada
- [ ] Automações de workflow
- [ ] Integrações externas
- [ ] Assinatura de tarefas
- [ ] Aprovação em múltiplos níveis

## 4. Personas e Papéis

| Role | Permissão |
|------|-----------|
| `super_admin` | Todas |
| `org_admin` | CRUD completo |
| `professional` | CRUD próprias tarefas |
| `receptionist` | Criar, editar, concluir |
| `support` | Apenas leitura |

## 5. Modelo de Dados

### Entidades do Prisma

```
Task
├── id (UUID, PK)
├── organizationId (UUID, FK)
├── patientId (UUID, FK, nullable)
├── appointmentId (UUID, FK, nullable)
├── title (string)
├── description (string, nullable)
├── status (enum: pending, in_progress, completed)
├── priority (enum: low, medium, high)
├── assignedTo (UUID, FK, nullable)
├── dueDate (datetime, nullable)
├── completedAt (datetime, nullable)
├── createdBy (UUID, FK)
├── createdAt (datetime)
└── updatedAt (datetime)

TaskComment
├── id (UUID, PK)
├── taskId (UUID, FK)
├── userId (UUID, FK)
├── content (string)
├── createdAt (datetime)

TaskAudit
├── id (UUID, PK)
├── taskId (UUID, FK)
├── action (enum: create, update, status_change, delete)
├── changes (json, nullable)
├── performedBy (UUID, FK)
└── performedAt (datetime)
```

### Relações
- Organization 1:N Task
- User createdBy → Task
- User assignedTo → Task
- Patient 1:N Task (optional)
- Appointment 1:N Task (optional)
- Task 1:N TaskComment
- Task 1:N TaskAudit

### Índices
- organizationId (filtro principal)
- assignedTo (busca por responsável)
- status (filtro de coluna)
- priority (ordenação)
- dueDate (ordenação)
- patientId (busca por paciente)
- appointmentId (busca por agendamento)

## 6. Contratos de API

### Request/Response Types

```typescript
// Task status
type TaskStatus = 'pending' | 'in_progress' | 'completed';
type TaskPriority = 'low' | 'medium' | 'high';

// List tasks query
interface ListTasksQuery {
  page?: number;
  limit?: number;
  status?: TaskStatus;
  priority?: TaskPriority;
  assignedTo?: string;
  patientId?: string;
  appointmentId?: string;
  dueDateFrom?: string;
  dueDateTo?: string;
  search?: string;
}

interface ListTasksResponse {
  items: Task[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

interface Task {
  id: string;
  organizationId: string;
  patientId?: string;
  appointmentId?: string;
  title: string;
  description?: string;
  status: TaskStatus;
  priority: TaskPriority;
  assignedTo?: { id: string; name: string } | null;
  dueDate?: string;
  completedAt?: string;
  createdBy: { id: string; name: string };
  createdAt: string;
  updatedAt: string;
  comments?: TaskComment[];
}

// Create task
interface CreateTaskDto {
  title: string;
  description?: string;
  patientId?: string;
  appointmentId?: string;
  priority?: TaskPriority;
  assignedTo?: string;
  dueDate?: string;
}

// Update task
interface UpdateTaskDto {
  title?: string;
  description?: string;
  priority?: TaskPriority;
  assignedTo?: string;
  dueDate?: string;
  status?: TaskStatus;
}

// Task comment
interface TaskComment {
  id: string;
  taskId: string;
  userId: string;
  user: { id: string; name: string };
  content: string;
  createdAt: string;
}

interface CreateTaskCommentDto {
  content: string;
}
```

### Rotas API

| Método | Rota | Descrição | Auth |
|--------|------|-----------|------|
| GET | /tasks | Listar tarefas | Jwt |
| GET | /tasks/:id | Detalhar tarefa | Jwt |
| POST | /tasks | Criar tarefa | Jwt |
| PATCH | /tasks/:id | Editar tarefa | Jwt |
| DELETE | /tasks/:id | Excluir tarefa | Jwt |
| PATCH | /tasks/:id/status | Atualizar status | Jwt |
| POST | /tasks/:id/comments | Adicionar comentário | Jwt |
| GET | /tasks/patient/:patientId | Tarefas do paciente | Jwt |
| GET | /tasks/appointment/:appointmentId | Tarefas do agendamento | Jwt |

## 7. Validações e Regras de Negócio

### Criação
- title: obrigatório, 3-200 caracteres
- description: opcional, max 2000
- status: padrão "pending"
- priority: padrão "medium"
- assignedTo: deve ser usuário da organização
- dueDate: opcional, deve ser data futura

### Atualização de Status
- Status change registra auditoria
- completedAt automático quando completed
- Only assignedTo ou createdBy pode alterar

### Acesso
- Isolamento por organization_id
- createdBy pode editar/excluir
- assignedTo pode atualizar status

## 8. Fluxos Principais

### Fluxo 1: Criar tarefa
```
1. Usuário autentica
2. Preenche formulário
3. Backend valida
4. Salva no banco
5. Cria auditoria
6. Retorna tarefa criada
```

### Fluxo 2: Kanban - mover tarefa
```
1. Usuário arrasta tarefa
2. Atualiza status via API
3. Registra auditoria
4. Retorna tarefa atualizada
5. Frontend atualiza UI
```

### Fluxo 3: Adicionar comentário
```
1. Usuário escreve comentário
2. Backend valida
3. Salva comment
4. Retorna comentário
```

## 9. Frontend - Telas

### Rotas
| Rota | Descrição |
|------|-----------|
| /tasks | Kanban 3 colunas |
| /tasks/new | Criar tarefa |
| /tasks/:id | Detalhes + comentários |
| /patients/:id/tasks | Tarefas do paciente |
| /appointments/:id/tasks | Tarefas do agendamento |

### Componentes
- `<TaskKanban />` - Board com colunas
- `<TaskCard />` - Card da tarefa no board
- `<TaskForm />` - Formulário criar/editar
- `<TaskDetail />` - Detalhes com comentários
- `<TaskFilters />` - Filtros de busca

## 10. Estrutura de Pastas

### Backend
```
apps/api/src/modules/tasks/
├── tasks.module.ts
├── tasks.service.ts
├── tasks.controller.ts
├── dto/task.dto.ts
└── AGENTS.md
```

### Frontend
```
apps/web/src/lib/api/
├── tasks.ts
apps/web/src/app/(authenticated)/tasks/
├── page.tsx (Kanban)
├── new/
│   └── page.tsx
└── [id]/
    └── page.tsx
```

### Contracts
```
packages/contracts/src/types/
├── task.ts
└── index.ts
```

## 11. Critérios de Aceite

### Funcional
- [ ] Criar tarefa com todos campos
- [ ] Editar tarefa
- [ ] Excluir tarefa
- [ ] Kanban move entre colunas
- [ ] Atribuir responsável
- [ ] Prioridade funciona
- [ ] Prazo configurável
- [ ] Vincular paciente
- [ ] Vincular agendamento
- [ ] Comentários adicionados
- [ ] Filtros funcionam

### Não Funcional
- [ ] Build compila
- [ ] API inicia
- [ ] Tempo resp < 200ms
- [ ] Isolamento org funciona

### Segurança
- [ ] Permissões respeitadas
- [ ] Auditoria registra

---

**Versão**: 1.0.1
**Data**: 2026-04-10
**Status**: Implementado