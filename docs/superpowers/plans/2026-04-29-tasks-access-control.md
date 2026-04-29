# Controle de Acesso em Tarefas - Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implementar controle de acesso granular em tarefas - profissional vê apenas tarefas criadas por ele ou atribuídas a ele

**Architecture:** Backend NestJS - modificar TasksService para filtrar tarefas por role do usuário. Controller passa roleName para o service.

**Tech Stack:** NestJS, Prisma, TypeScript

---

## File Structure

### Arquivos a Modificar
```
apps/api/src/modules/tasks/
├── tasks.service.ts    # Adicionar lógica de filtro por role
└── tasks.controller.ts # Passar roleName para o service
```

---

## Task 1: Atualizar TasksService.findAll()

**Files:**
- Modify: `apps/api/src/modules/tasks/tasks.service.ts:56-100`

A função atual:
```typescript
async findAll(
  params: TaskListParams,
  organizationId: string,
): Promise<TaskListResponse>
```

Precisa ser alterada para:
```typescript
async findAll(
  params: TaskListParams,
  organizationId: string,
  userId: string,
  roleName: string,
): Promise<TaskListResponse>
```

- [ ] **Step 1: Atualizar assinatura do método findAll**

Modificar a função para aceitar `userId` e `roleName`:

```typescript
async findAll(
  params: TaskListParams,
  organizationId: string,
  userId: string,
  roleName: string,
): Promise<TaskListResponse> {
  const { page = 1, limit = 20, status, priority, assignedTo, patientId, appointmentId, dueDateFrom, dueDateTo, search } = params;
  const skip = (page - 1) * limit;

  const where: any = { organizationId };

  // Para professional: filtrar tarefas próprias ou atribuídas
  if (roleName === 'professional') {
    where.OR = [
      { createdBy: userId },
      { assignedTo: userId }
    ];
  }

  // ... resto do código permanece igual
}
```

- [ ] **Step 2: Verificar que o código compila**

```bash
cd apps/api && npm run build
```

- [ ] **Step 3: Commit**
```
git add apps/api/src/modules/tasks/tasks.service.ts
git commit -m "feat(tasks): add role-based filtering in findAll"
```

---

## Task 2: Atualizar TasksService.findById()

**Files:**
- Modify: `apps/api/src/modules/tasks/tasks.service.ts:102-120`

A função atual:
```typescript
async findById(id: string, organizationId: string): Promise<Task>
```

Precisa ser alterada para:
```typescript
async findById(id: string, organizationId: string, userId: string, roleName: string): Promise<Task>
```

- [ ] **Step 1: Atualizar assinatura e lógica do findById**

```typescript
async findById(
  id: string,
  organizationId: string,
  userId: string,
  roleName: string,
): Promise<Task> {
  const task = await this.prisma.task.findFirst({
    where: { id, organizationId },
    include: {
      assignedToUser: { select: { id: true, name: true } },
      createdByUser: { select: { id: true, name: true } },
      comments: {
        include: { user: { select: { id: true, name: true } } },
        orderBy: { createdAt: 'asc' },
      },
    },
  });

  if (!task) {
    throw new NotFoundException('Tarefa não encontrada');
  }

  // Para professional: verificar se tem acesso
  if (roleName === 'professional' && 
      task.createdBy !== userId && 
      task.assignedTo !== userId) {
    throw new NotFoundException('Tarefa não encontrada');
  }

  return this.mapTaskWithComments(task);
}
```

- [ ] **Step 2: Commit**
```
git add apps/api/src/modules/tasks/tasks.service.ts
git commit -m "feat(tasks): add access validation in findById"
```

---

## Task 3: Atualizar TasksController

**Files:**
- Modify: `apps/api/src/modules/tasks/tasks.controller.ts`

Atualizar todas as chamadas para passar `user.sub` (já está sendo passado) e `user.roleName`.

- [ ] **Step 1: Atualizar findAll() no controller**

```typescript
@Get()
@ApiOperation({ summary: 'Listar tarefas' })
async findAll(
  @Query() query: ListTasksQueryDto,
  @CurrentUser() user: any,
): Promise<TaskListResponse> {
  return this.tasksService.findAll(query, user.organizationId!, user.sub, user.roleName);
}
```

- [ ] **Step 2: Atualizar findById() no controller**

```typescript
@Get(':id')
@ApiOperation({ summary: 'Detalhar tarefa' })
async findOne(
  @Param('id', ParseUUIDPipe) id: string,
  @CurrentUser() user: any,
): Promise<Task> {
  return this.tasksService.findById(id, user.organizationId!, user.sub, user.roleName);
}
```

- [ ] **Step 3: Atualizar findByPatient() no controller**

```typescript
@Get('patient/:patientId')
@ApiOperation({ summary: 'Listar tarefas do paciente' })
async findByPatient(
  @Param('patientId', ParseUUIDPipe) patientId: string,
  @CurrentUser() user: any,
): Promise<Task[]> {
  return this.tasksService.findByPatient(patientId, user.organizationId!, user.sub, user.roleName);
}
```

- [ ] **Step 4: Atualizar findByAppointment() no controller**

```typescript
@Get('appointment/:appointmentId')
@ApiOperation({ summary: 'Listar tarefas do agendamento' })
async findByAppointment(
  @Param('appointmentId', ParseUUIDPipe) appointmentId: string,
  @CurrentUser() user: any,
): Promise<Task[]> {
  return this.tasksService.findByAppointment(appointmentId, user.organizationId!, user.sub, user.roleName);
}
```

- [ ] **Step 5: Commit**
```
git add apps/api/src/modules/tasks/tasks.controller.ts
git commit -m "feat(tasks): pass roleName to service methods"
```

---

## Task 4: Atualizar Métodos findByPatient e findByAppointment

**Files:**
- Modify: `apps/api/src/modules/tasks/tasks.service.ts`

- [ ] **Step 1: Atualizar findByPatient()**

```typescript
async findByPatient(
  patientId: string,
  organizationId: string,
  userId: string,
  roleName: string,
): Promise<Task[]> {
  const where: any = { patientId, organizationId };

  // Para professional: filtrar tarefas próprias ou atribuídas
  if (roleName === 'professional') {
    where.OR = [
      { createdBy: userId },
      { assignedTo: userId }
    ];
  }

  const tasks = await this.prisma.task.findMany({
    where,
    orderBy: [{ createdAt: 'desc' }],
    include: {
      assignedToUser: { select: { id: true, name: true } },
      createdByUser: { select: { id: true, name: true } },
    },
  });
  return tasks.map(this.mapTask.bind(this));
}
```

- [ ] **Step 2: Atualizar findByAppointment()**

```typescript
async findByAppointment(
  appointmentId: string,
  organizationId: string,
  userId: string,
  roleName: string,
): Promise<Task[]> {
  const where: any = { appointmentId, organizationId };

  // Para professional: filtrar tarefas próprias ou atribuídas
  if (roleName === 'professional') {
    where.OR = [
      { createdBy: userId },
      { assignedTo: userId }
    ];
  }

  const tasks = await this.prisma.task.findMany({
    where,
    orderBy: [{ createdAt: 'desc' }],
    include: {
      assignedToUser: { select: { id: true, name: true } },
      createdByUser: { select: { id: true, name: true } },
    },
  });
  return tasks.map(this.mapTask.bind(this));
}
```

- [ ] **Step 3: Commit**
```
git add apps/api/src/modules/tasks/tasks.service.ts
git commit -m "feat(tasks): add role filtering to findByPatient and findByAppointment"
```

---

## Task 5: Verificação Final

- [ ] **Step 1: Build do backend**

```bash
cd apps/api && npm run build
```

- [ ] **Step 2: Commit final**
```
git add -A
git commit -m "feat(tasks): implement role-based access control"
```

---

## Checklist de Revisão

- [ ] org_admin vê todas as tarefas da organização
- [ ] receptionist vê todas as tarefas da organização
- [ ] professional vê apenas tarefas criadas por ele
- [ ] professional vê apenas tarefas atribuídas a ele
- [ ] professional não consegue acessar detalhes de outras tarefas (retorna 404)
- [ ] professional não consegue editar/excluir tarefas de outros
- [ ] Build compila sem erros

---

## Histórico

| Versão | Data | Descrição |
|--------|------|-----------|
| 1.0.0 | 2026-04-29 | Initial plan - Controle de acesso em tarefas |

---

**Contato**: docs/superpowers/specs/2026-04-29-tasks-access-control-design.md