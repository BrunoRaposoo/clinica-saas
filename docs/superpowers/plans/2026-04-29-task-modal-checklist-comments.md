# Task Modal com Checklist e Comentários - Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Criar modal de detalhes da tarefa com checklist opcional e sistema de comentários para colaboração.

**Architecture:** Backend com novo modelo TaskChecklistItem, endpoints REST para checklist e comentários, frontend com modal React e componentes de checklist/comentários.

**Tech Stack:** NestJS (backend), Next.js (frontend), Prisma (ORM), React Query (data fetching), Tailwind CSS (estilo).

---

## Estrutura de Arquivos

### Backend - Arquivos a Modificar/Criar
- Criar: `apps/api/prisma/schema.prisma` (adicionar TaskChecklistItem)
- Modificar: `apps/api/src/modules/tasks/tasks.service.ts` (lógica de checklist/comentários)
- Modificar: `apps/api/src/modules/tasks/tasks.controller.ts` (novos endpoints)
- Modificar: `apps/api/src/modules/tasks/dto/task.dto.ts` (novos DTOs)

### Contracts - Arquivos a Modificar
- Modificar: `packages/contracts/src/types/task.ts` (novos tipos)
- Modificar: `packages/contracts/src/types/index.ts` (exports)

### Frontend - Arquivos a Criar/Modificar
- Criar: `apps/web/src/components/tasks/TaskModal.tsx`
- Criar: `apps/web/src/components/tasks/TaskChecklist.tsx`
- Criar: `apps/web/src/components/tasks/TaskComments.tsx`
- Modificar: `apps/web/src/app/(authenticated)/tasks/page.tsx` (abrir modal ao clicar)
- Modificar: `apps/web/src/app/(authenticated)/tasks/new/page.tsx` (checklist na criação)
- Modificar: `apps/web/src/lib/api/tasks.ts` (novas funções API)

---

## Task 1: Adicionar Modelo TaskChecklistItem no Prisma

**Files:**
- Modificar: `apps/api/prisma/schema.prisma:514-547` (adicionar após TaskAudit)

- [ ] **Step 1: Adicionar modelo TaskChecklistItem ao schema**

```prisma
model TaskChecklistItem {
  id          String   @id @default(uuid())
  taskId      String
  content     String
  isCompleted Boolean  @default(false)
  order       Int      @default(0)
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  task Task  @relation(fields: [taskId], references: [id], onDelete: Cascade)

  @@index([taskId])
  @@map("task_checklist_items")
}
```

- [ ] **Step 2: Adicionar relação em Task**

No modelo Task (linha ~536), adicionar:
```prisma
checklistItems TaskChecklistItem[]
```

- [ ] **Step 3: Executar migrations**

Run: `cd /home/bruno/projects/clinica-saas/apps/api && npx prisma generate`
Run: `cd /home/bruno/projects/clinica-saas/apps/api && npx prisma migrate dev --name add_task_checklist_item`
Expected: Migration criada com sucesso

- [ ] **Step 4: Commit**

```bash
git add apps/api/prisma/schema.prisma
git commit -m "feat: add TaskChecklistItem model"
```

---

## Task 2: Atualizar Contracts com Novos Tipos

**Files:**
- Modificar: `packages/contracts/src/types/task.ts`
- Modificar: `packages/contracts/src/types/index.ts`

- [ ] **Step 1: Adicionar tipos de Checklist no arquivo task.ts**

Adicionar ao final do arquivo:

```typescript
export interface TaskChecklistItem {
  id: string;
  taskId: string;
  content: string;
  isCompleted: boolean;
  order: number;
  createdAt: string;
  updatedAt: string;
}

export interface TaskChecklistItemCreateRequest {
  content: string;
  isCompleted?: boolean;
}

export interface TaskChecklistItemUpdateRequest {
  content?: string;
  isCompleted?: boolean;
}

export interface TaskChecklistItemToggleRequest {
  isCompleted: boolean;
}
```

- [ ] **Step 2: Adicionar campos checklistItems na interface Task**

Modificar interface Task (linha ~5-20):

```typescript
export interface Task {
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
  checklistItems?: TaskChecklistItem[];  // NOVO
  comments?: TaskComment[];              // JÁ EXISTE
}
```

- [ ] **Step 3: Atualizar TaskCreateRequest e TaskUpdateRequest**

```typescript
export interface TaskCreateRequest {
  title: string;
  description?: string;
  patientId?: string;
  appointmentId?: string;
  priority?: TaskPriority;
  assignedTo?: string;
  dueDate?: string;
  checklistItems?: TaskChecklistItemCreateRequest[];  // NOVO
}

export interface TaskUpdateRequest {
  title?: string;
  description?: string;
  priority?: TaskPriority;
  assignedTo?: string;
  dueDate?: string;
  status?: TaskStatus;
  checklistItems?: TaskChecklistItemCreateRequest[];  // NOVO
}
```

- [ ] **Step 4: Adicionar exports no index.ts**

Modificar `packages/contracts/src/types/index.ts` para exportar os novos tipos.

- [ ] **Step 5: Build dos contracts**

Run: `cd /home/bruno/projects/clinica-saas && npm run build -w @clinica-saas/contracts`
Expected: Build successful

- [ ] **Step 6: Commit**

```bash
git add packages/contracts/src/types/task.ts packages/contracts/src/types/index.ts
git commit -m "feat: add TaskChecklistItem types to contracts"
```

---

## Task 3: Backend - Novos DTOs

**Files:**
- Modificar: `apps/api/src/modules/tasks/dto/task.dto.ts`

- [ ] **Step 1: Ler arquivo atual de DTOs**

Read: `apps/api/src/modules/tasks/dto/task.dto.ts`

- [ ] **Step 2: Adicionar novos DTOs para Checklist**

```typescript
import { IsString, IsBoolean, IsOptional, IsArray, ValidateNested, IsUUID, MinLength, MaxLength } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateTaskChecklistItemDto {
  @ApiProperty({ example: 'Realizar anamnese' })
  @IsString()
  @MinLength(1)
  @MaxLength(200)
  content: string;

  @ApiPropertyOptional({ example: false })
  @IsOptional()
  @IsBoolean()
  isCompleted?: boolean;
}

export class UpdateTaskChecklistItemDto {
  @ApiPropertyOptional({ example: 'Realizar anamnese' })
  @IsOptional()
  @IsString()
  @MinLength(1)
  @MaxLength(200)
  content?: string;

  @ApiPropertyOptional({ example: true })
  @IsOptional()
  @IsBoolean()
  isCompleted?: boolean;
}

export class UpdateTaskCommentDto {
  @ApiProperty({ example: 'Novo conteúdo do comentário' })
  @IsString()
  @MinLength(1)
  @MaxLength(1000)
  content: string;
}
```

- [ ] **Step 3: Commit**

```bash
git add apps/api/src/modules/tasks/dto/task.dto.ts
git commit -m "feat: add checklist and comment DTOs"
```

---

## Task 4: Backend - TasksService (Lógica de Checklist)

**Files:**
- Modificar: `apps/api/src/modules/tasks/tasks.service.ts`

- [ ] **Step 1: Ler tasks.service.ts atual para entender estrutura**

Read: `apps/api/src/modules/tasks/tasks.service.ts`

- [ ] **Step 2: Adicionar métodos de checklist no service**

Adicionar novos métodos:

```typescript
async createChecklistItem(taskId: string, dto: CreateTaskChecklistItemDto, organizationId: string, userId: string): Promise<TaskChecklistItem> {
  const task = await this.prisma.task.findFirst({
    where: { id: taskId, organizationId },
  });
  if (!task) throw new NotFoundException('Tarefa não encontrada');

  const lastItem = await this.prisma.taskChecklistItem.findFirst({
    where: { taskId },
    orderBy: { order: 'desc' },
  });

  const item = await this.prisma.taskChecklistItem.create({
    data: {
      taskId,
      content: dto.content,
      isCompleted: dto.isCompleted ?? false,
      order: (lastItem?.order ?? -1) + 1,
    },
    include: { task: false },
  });

  return this.mapChecklistItem(item);
}

async updateChecklistItem(taskId: string, itemId: string, dto: UpdateTaskChecklistItemDto, organizationId: string): Promise<TaskChecklistItem> {
  const task = await this.prisma.task.findFirst({
    where: { id: taskId, organizationId },
  });
  if (!task) throw new NotFoundException('Tarefa não encontrada');

  const item = await this.prisma.taskChecklistItem.update({
    where: { id: itemId },
    data: {
      ...(dto.content !== undefined && { content: dto.content }),
      ...(dto.isCompleted !== undefined && { isCompleted: dto.isCompleted }),
    },
  });

  return this.mapChecklistItem(item);
}

async toggleChecklistItem(taskId: string, itemId: string, organizationId: string): Promise<TaskChecklistItem> {
  const task = await this.prisma.task.findFirst({
    where: { id: taskId, organizationId },
  });
  if (!task) throw new NotFoundException('Tarefa não encontrada');

  const item = await this.prisma.taskChecklistItem.findUnique({
    where: { id: itemId },
  });
  if (!item || item.taskId !== taskId) throw new NotFoundException('Item não encontrado');

  const updated = await this.prisma.taskChecklistItem.update({
    where: { id: itemId },
    data: { isCompleted: !item.isCompleted },
  });

  return this.mapChecklistItem(updated);
}

async deleteChecklistItem(taskId: string, itemId: string, organizationId: string): Promise<void> {
  const task = await this.prisma.task.findFirst({
    where: { id: taskId, organizationId },
  });
  if (!task) throw new NotFoundException('Tarefa não encontrada');

  await this.prisma.taskChecklistItem.delete({ where: { id: itemId } });
}

private mapChecklistItem(item: any): TaskChecklistItem {
  return {
    id: item.id,
    taskId: item.taskId,
    content: item.content,
    isCompleted: item.isCompleted,
    order: item.order,
    createdAt: item.createdAt.toISOString(),
    updatedAt: item.updatedAt.toISOString(),
  };
}
```

- [ ] **Step 3: Modificar método findById para incluir checklistItems**

Modificar `findById` para incluir `checklistItems` no include:

```typescript
const task = await this.prisma.task.findUnique({
  where: { id },
  include: {
    assignedToUser: true,
    createdByUser: true,
    patient: { select: { id: true, name: true } },
    appointment: { select: { id: true } },
    comments: {
      include: { user: { select: { id: true, name: true } } },
      orderBy: { createdAt: 'desc' },
    },
    checklistItems: {  // NOVO
      orderBy: { order: 'asc' },
    },
  },
});
```

- [ ] **Step 4: Modificar mapTask para incluir checklistItems**

Atualizar método `mapTask` para mapear checklistItems:

```typescript
private mapTask(task: any): Task {
  return {
    id: task.id,
    organizationId: task.organizationId,
    patientId: task.patientId,
    appointmentId: task.appointmentId,
    title: task.title,
    description: task.description,
    status: task.status as TaskStatus,
    priority: task.priority as TaskPriority,
    assignedTo: task.assignedToUser ? { id: task.assignedToUser.id, name: task.assignedToUser.name } : null,
    dueDate: task.dueDate?.toISOString(),
    completedAt: task.completedAt?.toISOString(),
    createdBy: { id: task.createdByUser.id, name: task.createdByUser.name },
    createdAt: task.createdAt.toISOString(),
    updatedAt: task.updatedAt.toISOString(),
    checklistItems: task.checklistItems?.map((item: any) => ({
      id: item.id,
      taskId: item.taskId,
      content: item.content,
      isCompleted: item.isCompleted,
      order: item.order,
      createdAt: item.createdAt.toISOString(),
      updatedAt: item.updatedAt.toISOString(),
    })),
    comments: task.comments?.map((c: any) => ({
      id: c.id,
      taskId: c.taskId,
      userId: c.userId,
      user: { id: c.user.id, name: c.user.name },
      content: c.content,
      createdAt: c.createdAt.toISOString(),
    })),
  };
}
```

- [ ] **Step 5: Modificar create para aceitar checklistItems opcionais**

No método `create`, adicionar lógica para criar checklistItems:

```typescript
async create(dto: CreateTaskDto, organizationId: string, userId: string): Promise<Task> {
  // ... código existente ...

  const task = await this.prisma.task.create({
    data: {
      organizationId,
      title: dto.title,
      description: dto.description,
      patientId: dto.patientId,
      appointmentId: dto.appointmentId,
      priority: dto.priority ?? 'medium',
      status: 'pending',
      assignedTo: dto.assignedTo,
      dueDate: dto.dueDate ? new Date(dto.dueDate) : null,
      createdBy: userId,
      // NOVO: criar checklist items se fornecidos
      ...(dto.checklistItems && dto.checklistItems.length > 0 && {
        checklistItems: {
          create: dto.checklistItems.map((item, index) => ({
            content: item.content,
            isCompleted: item.isCompleted ?? false,
            order: index,
          })),
        },
      }),
    },
    include: {
      assignedToUser: true,
      createdByUser: true,
      patient: { select: { id: true, name: true } },
      appointment: { select: { id: true } },
      checklistItems: true,  // NOVO
      comments: true,
    },
  });

  return this.mapTask(task);
}
```

- [ ] **Step 6: Modificar update para aceitar checklistItems**

No método `update`, adicionar lógica para atualizar checklistItems:

```typescript
async update(id: string, dto: UpdateTaskDto, organizationId: string, userId: string): Promise<Task> {
  // ... código existente ...

  // NOVO: atualizar checklistItems se fornecidos
  if (dto.checklistItems) {
    // Remover itens existentes
    await this.prisma.taskChecklistItem.deleteMany({ where: { taskId: id } });
    // Criar novos itens
    if (dto.checklistItems.length > 0) {
      await this.prisma.taskChecklistItem.createMany({
        data: dto.checklistItems.map((item, index) => ({
          taskId: id,
          content: item.content,
          isCompleted: item.isCompleted ?? false,
          order: index,
        })),
      });
    }
  }
  // ... resto do código ...
}
```

- [ ] **Step 7: Adicionar método updateComment no service**

```typescript
async updateComment(taskId: string, commentId: string, dto: UpdateTaskCommentDto, organizationId: string, userId: string): Promise<TaskComment> {
  const task = await this.prisma.task.findFirst({
    where: { id: taskId, organizationId },
  });
  if (!task) throw new NotFoundException('Tarefa não encontrada');

  const comment = await this.prisma.taskComment.findUnique({
    where: { id: commentId },
  });
  if (!comment || comment.taskId !== taskId) throw new NotFoundException('Comentário não encontrado');
  if (comment.userId !== userId) throw new ForbiddenException('Você só pode editar seus próprios comentários');

  const updated = await this.prisma.taskComment.update({
    where: { id: commentId },
    data: { content: dto.content },
    include: { user: { select: { id: true, name: true } } },
  });

  return this.mapComment(updated);
}

async deleteComment(taskId: string, commentId: string, organizationId: string, userId: string): Promise<void> {
  const task = await this.prisma.task.findFirst({
    where: { id: taskId, organizationId },
  });
  if (!task) throw new NotFoundException('Tarefa não encontrada');

  const comment = await this.prisma.taskComment.findUnique({
    where: { id: commentId },
  });
  if (!comment || comment.taskId !== taskId) throw new NotFoundException('Comentário não encontrado');
  if (comment.userId !== userId) throw new ForbiddenException('Você só pode excluir seus próprios comentários');

  await this.prisma.taskComment.delete({ where: { id: commentId } });
}
```

- [ ] **Step 8: Commit**

```bash
git add apps/api/src/modules/tasks/tasks.service.ts
git commit -m "feat: add checklist CRUD and comment update/delete to TasksService"
```

---

## Task 5: Backend - TasksController (Novos Endpoints)

**Files:**
- Modificar: `apps/api/src/modules/tasks/tasks.controller.ts`

- [ ] **Step 1: Ler arquivo atual do controller**

Read: `apps/api/src/modules/tasks/tasks.controller.ts`

- [ ] **Step 2: Adicionar imports para novos DTOs**

```typescript
import {
  CreateTaskDto,
  UpdateTaskDto,
  UpdateTaskStatusDto,
  CreateTaskCommentDto,
  CreateTaskChecklistItemDto,
  UpdateTaskChecklistItemDto,
  UpdateTaskCommentDto,
  ListTasksQueryDto,
} from './dto/task.dto';
import { TaskChecklistItem, TaskComment } from '@clinica-saas/contracts';
```

- [ ] **Step 3: Adicionar endpoints de checklist**

Adicionar novos métodos no controller:

```typescript
@Post(':id/checklist')
@ApiOperation({ summary: 'Criar item do checklist' })
async createChecklistItem(
  @Param('id', ParseUUIDPipe) id: string,
  @Body() dto: CreateTaskChecklistItemDto,
  @CurrentUser() user: any,
): Promise<TaskChecklistItem> {
  return this.tasksService.createChecklistItem(id, dto, user.organizationId!, user.sub);
}

@Patch(':id/checklist/:itemId')
@ApiOperation({ summary: 'Atualizar item do checklist' })
async updateChecklistItem(
  @Param('id', ParseUUIDPipe) id: string,
  @Param('itemId', ParseUUIDPipe) itemId: string,
  @Body() dto: UpdateTaskChecklistItemDto,
  @CurrentUser() user: any,
): Promise<TaskChecklistItem> {
  return this.tasksService.updateChecklistItem(id, itemId, dto, user.organizationId!);
}

@Patch(':id/checklist/:itemId/toggle')
@ApiOperation({ summary: 'Alternar concluído do item' })
async toggleChecklistItem(
  @Param('id', ParseUUIDPipe) id: string,
  @Param('itemId', ParseUUIDPipe) itemId: string,
  @CurrentUser() user: any,
): Promise<TaskChecklistItem> {
  return this.tasksService.toggleChecklistItem(id, itemId, user.organizationId!);
}

@Delete(':id/checklist/:itemId')
@ApiOperation({ summary: 'Excluir item do checklist' })
async deleteChecklistItem(
  @Param('id', ParseUUIDPipe) id: string,
  @Param('itemId', ParseUUIDPipe) itemId: string,
  @CurrentUser() user: any,
): Promise<void> {
  return this.tasksService.deleteChecklistItem(id, itemId, user.organizationId!);
}
```

- [ ] **Step 4: Adicionar endpoints de comentários (PUT/DELETE)**

```typescript
@Patch(':id/comments/:commentId')
@ApiOperation({ summary: 'Editar comentário' })
async updateComment(
  @Param('id', ParseUUIDPipe) id: string,
  @Param('commentId', ParseUUIDPipe) commentId: string,
  @Body() dto: UpdateTaskCommentDto,
  @CurrentUser() user: any,
): Promise<TaskComment> {
  return this.tasksService.updateComment(id, commentId, dto, user.organizationId!, user.sub);
}

@Delete(':id/comments/:commentId')
@ApiOperation({ summary: 'Excluir comentário' })
async deleteComment(
  @Param('id', ParseUUIDPipe) id: string,
  @Param('commentId', ParseUUIDPipe) commentId: string,
  @CurrentUser() user: any,
): Promise<void> {
  return this.tasksService.deleteComment(id, commentId, user.organizationId!, user.sub);
}
```

- [ ] **Step 5: Commit**

```bash
git add apps/api/src/modules/tasks/tasks.controller.ts
git commit -m "feat: add checklist and comment endpoints to TasksController"
```

---

## Task 6: Frontend - API Client

**Files:**
- Modificar: `apps/web/src/lib/api/tasks.ts`

- [ ] **Step 1: Ler arquivo atual**

Read: `apps/web/src/lib/api/tasks.ts`

- [ ] **Step 2: Adicionar funções para checklist**

```typescript
export const tasksApi = {
  // ... existing methods ...

  // Checklist
  createChecklistItem: async (taskId: string, data: { content: string; isCompleted?: boolean }) => {
    const res = await fetch(`${API_URL}/tasks/${taskId}/checklist`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...getHeaders() },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('Failed to create checklist item');
    return res.json();
  },

  updateChecklistItem: async (taskId: string, itemId: string, data: { content?: string; isCompleted?: boolean }) => {
    const res = await fetch(`${API_URL}/tasks/${taskId}/checklist/${itemId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', ...getHeaders() },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('Failed to update checklist item');
    return res.json();
  },

  toggleChecklistItem: async (taskId: string, itemId: string) => {
    const res = await fetch(`${API_URL}/tasks/${taskId}/checklist/${itemId}/toggle`, {
      method: 'PATCH',
      headers: getHeaders(),
    });
    if (!res.ok) throw new Error('Failed to toggle checklist item');
    return res.json();
  },

  deleteChecklistItem: async (taskId: string, itemId: string) => {
    const res = await fetch(`${API_URL}/tasks/${taskId}/checklist/${itemId}`, {
      method: 'DELETE',
      headers: getHeaders(),
    });
    if (!res.ok) throw new Error('Failed to delete checklist item');
  },

  // Comments
  updateComment: async (taskId: string, commentId: string, data: { content: string }) => {
    const res = await fetch(`${API_URL}/tasks/${taskId}/comments/${commentId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', ...getHeaders() },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('Failed to update comment');
    return res.json();
  },

  deleteComment: async (taskId: string, commentId: string) => {
    const res = await fetch(`${API_URL}/tasks/${taskId}/comments/${commentId}`, {
      method: 'DELETE',
      headers: getHeaders(),
    });
    if (!res.ok) throw new Error('Failed to delete comment');
  },
};
```

- [ ] **Step 3: Commit**

```bash
git add apps/web/src/lib/api/tasks.ts
git commit -m "feat: add checklist and comment API methods"
```

---

## Task 7: Frontend - TaskChecklist Component

**Files:**
- Criar: `apps/web/src/components/tasks/TaskChecklist.tsx`

- [ ] **Step 1: Criar componente TaskChecklist**

```typescript
'use client';

import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { tasksApi } from '@/lib/api/tasks';
import { TaskChecklistItem, TaskChecklistItemCreateRequest } from '@clinica-saas/contracts';

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
    },
  });

  const createMutation = useMutation({
    mutationFn: (data: TaskChecklistItemCreateRequest) => tasksApi.createChecklistItem(taskId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      setNewItem('');
      setIsAdding(false);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (itemId: string) => tasksApi.deleteChecklistItem(taskId, itemId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
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
    <div className="bg-green-50 rounded-lg p-4">
      <div className="flex justify-between items-center mb-3">
        <h3 className="text-sm font-semibold text-green-800">CHECKLIST {items.length > 0 && `(${completedCount}/${items.length})`}</h3>
        {!readOnly && (
          <button
            onClick={() => setIsAdding(true)}
            className="text-xs text-green-600 hover:text-green-700 font-medium"
          >
            + Add
          </button>
        )}
      </div>

      {isAdding && (
        <div className="flex gap-2 mb-3">
          <input
            type="text"
            value={newItem}
            onChange={(e) => setNewItem(e.target.value)}
            placeholder="Novo item..."
            className="flex-1 px-3 py-2 text-sm border rounded focus:outline-none focus:ring-2 focus:ring-green-500"
            onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
            autoFocus
          />
          <button
            onClick={handleAdd}
            className="px-3 py-2 bg-green-600 text-white text-sm rounded hover:bg-green-700"
          >
            Add
          </button>
          <button
            onClick={() => { setIsAdding(false); setNewItem(''); }}
            className="px-3 py-2 text-gray-600 text-sm rounded hover:bg-gray-100"
          >
            Cancel
          </button>
        </div>
      )}

      <div className="space-y-2">
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
```

- [ ] **Step 2: Commit**

```bash
git add apps/web/src/components/tasks/TaskChecklist.tsx
git commit -m "feat: create TaskChecklist component"
```

---

## Task 8: Frontend - TaskComments Component

**Files:**
- Criar: `apps/web/src/components/tasks/TaskComments.tsx`

- [ ] **Step 1: Criar componente TaskComments**

```typescript
'use client';

import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { tasksApi } from '@/lib/api/tasks';
import { TaskComment } from '@clinica-saas/contracts';
import { useSession } from '@/providers/session-provider';

interface TaskCommentsProps {
  taskId: string;
  comments: TaskComment[];
}

export function TaskComments({ taskId, comments }: TaskCommentsProps) {
  const queryClient = useQueryClient();
  const { user } = useSession();
  const [newComment, setNewComment] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editContent, setEditContent] = useState('');

  const createMutation = useMutation({
    mutationFn: (content: string) => tasksApi.addComment(taskId, { content }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      setNewComment('');
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ commentId, content }: { commentId: string; content: string }) =>
      tasksApi.updateComment(taskId, commentId, { content }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      setEditingId(null);
      setEditContent('');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (commentId: string) => tasksApi.deleteComment(taskId, commentId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
    },
  });

  const handleSubmit = () => {
    if (newComment.trim()) {
      createMutation.mutate(newComment.trim());
    }
  };

  const handleEdit = (comment: TaskComment) => {
    setEditingId(comment.id);
    setEditContent(comment.content);
  };

  const handleSaveEdit = () => {
    if (editContent.trim() && editingId) {
      updateMutation.mutate({ commentId: editingId, content: editContent.trim() });
    }
  };

  const handleDelete = (commentId: string) => {
    if (confirm('Excluir este comentário?')) {
      deleteMutation.mutate(commentId);
    }
  };

  const isOwnComment = (comment: TaskComment) => user?.id === comment.userId;

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="bg-pink-50 rounded-lg p-4">
      <h3 className="text-sm font-semibold text-pink-800 mb-3">COMENTÁRIOS ({comments.length})</h3>

      <div className="space-y-3 mb-4">
        {comments.map((comment) => (
          <div key={comment.id} className="bg-white rounded p-3 shadow-sm">
            {editingId === comment.id ? (
              <div className="space-y-2">
                <textarea
                  value={editContent}
                  onChange={(e) => setEditContent(e.target.value)}
                  className="w-full px-2 py-1 text-sm border rounded focus:outline-none focus:ring-2 focus:ring-pink-500"
                  rows={2}
                />
                <div className="flex gap-2">
                  <button
                    onClick={handleSaveEdit}
                    className="px-2 py-1 bg-pink-600 text-white text-xs rounded hover:bg-pink-700"
                  >
                    Salvar
                  </button>
                  <button
                    onClick={() => { setEditingId(null); setEditContent(''); }}
                    className="px-2 py-1 text-gray-600 text-xs rounded hover:bg-gray-100"
                  >
                    Cancelar
                  </button>
                </div>
              </div>
            ) : (
              <>
                <div className="flex justify-between items-start mb-1">
                  <span className="text-xs font-medium text-gray-700">{comment.user.name}</span>
                  <span className="text-xs text-gray-400">{formatDate(comment.createdAt)}</span>
                </div>
                <p className="text-sm text-gray-600 whitespace-pre-wrap">{comment.content}</p>
                {isOwnComment(comment) && (
                  <div className="flex gap-2 mt-2">
                    <button
                      onClick={() => handleEdit(comment)}
                      className="text-xs text-gray-500 hover:text-gray-700"
                    >
                      Editar
                    </button>
                    <button
                      onClick={() => handleDelete(comment.id)}
                      className="text-xs text-red-500 hover:text-red-700"
                    >
                      Excluir
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        ))}
        {comments.length === 0 && (
          <p className="text-sm text-gray-400 italic">Nenhum comentário</p>
        )}
      </div>

      <div className="flex gap-2">
        <input
          type="text"
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          placeholder="Escrever comentário..."
          className="flex-1 px-3 py-2 text-sm border rounded focus:outline-none focus:ring-2 focus:ring-pink-500"
          onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handleSubmit()}
        />
        <button
          onClick={handleSubmit}
          disabled={!newComment.trim()}
          className="px-4 py-2 bg-pink-600 text-white text-sm rounded hover:bg-pink-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Enviar
        </button>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add apps/web/src/components/tasks/TaskComments.tsx
git commit -m "feat: create TaskComments component"
```

---

## Task 9: Frontend - TaskModal Component

**Files:**
- Criar: `apps/web/src/components/tasks/TaskModal.tsx`

- [ ] **Step 1: Criar componente TaskModal**

```typescript
'use client';

import { useEffect, useState } from 'react';
import { Task, TaskStatus, TaskPriority } from '@clinica-saas/contracts';
import { TaskChecklist } from './TaskChecklist';
import { TaskComments } from './TaskComments';
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
  const [isOpen, setIsOpen] = useState(false);

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
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  return (
    <div
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
      onClick={handleBackdropClick}
    >
      <div
        className={`bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto transition-opacity duration-200 ${isOpen ? 'opacity-100' : 'opacity-0'}`}
      >
        <div className="sticky top-0 bg-white border-b px-6 py-4 flex justify-between items-center rounded-t-lg">
          <h2 className="text-lg font-bold text-gray-800 truncate pr-4">{task.title}</h2>
          <button
            onClick={() => { setIsOpen(false); setTimeout(onClose, 200); }}
            className="text-gray-400 hover:text-gray-600 p-1"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="p-6 space-y-4">
          <div className="flex flex-wrap gap-2">
            <span className={`px-3 py-1 rounded-full text-xs font-medium ${priorityColors[task.priority]}`}>
              {priorityLabels[task.priority]}
            </span>
            <span className={`px-3 py-1 rounded-full text-xs font-medium ${statusColors[task.status]}`}>
              {statusLabels[task.status]}
            </span>
          </div>

          {(task.assignedTo || task.dueDate || task.patientId) && (
            <div className="text-sm text-gray-600 space-y-1">
              {task.assignedTo && <p><span className="font-medium">Responsável:</span> {task.assignedTo.name}</p>}
              {task.dueDate && <p><span className="font-medium">Vencimento:</span> {formatDate(task.dueDate)}</p>}
              {task.patientId && <p><span className="font-medium">Paciente:</span> ID {task.patientId}</p>}
            </div>
          )}

          {task.description && (
            <div className="bg-orange-50 rounded-lg p-4">
              <h3 className="text-xs font-semibold text-orange-800 mb-2">DETALHES</h3>
              <p className="text-sm text-gray-700 whitespace-pre-wrap">{task.description}</p>
            </div>
          )}

          {task.checklistItems && task.checklistItems.length > 0 && (
            <TaskChecklist taskId={task.id} items={task.checklistItems} />
          )}

          <TaskComments taskId={task.id} comments={task.comments || []} />
        </div>

        <div className="border-t px-6 py-4 flex justify-end gap-2">
          <Link
            href={`/tasks/${task.id}/edit`}
            className="px-4 py-2 text-blue-600 hover:bg-blue-50 rounded text-sm font-medium"
          >
            Editar Tarefa
          </Link>
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add apps/web/src/components/tasks/TaskModal.tsx
git commit -m "feat: create TaskModal component"
```

---

## Task 10: Frontend - Integrar Modal no Kanban

**Files:**
- Modificar: `apps/web/src/app/(authenticated)/tasks/page.tsx`

- [ ] **Step 1: Ler arquivo atual**

Read: `apps/web/src/app/(authenticated)/tasks/page.tsx`

- [ ] **Step 2: Adicionar estado para modal e imports**

```typescript
import { TaskModal } from '@/components/tasks/TaskModal';

// No componente:
const [selectedTask, setSelectedTask] = useState<Task | null>(null);
```

- [ ] **Step 3: Adicionar click handler no card**

Modificar o card da tarefa para abrir o modal ao clicar:

```typescript
<div
  className="bg-white p-3 rounded-lg shadow cursor-pointer hover:shadow-md transition-shadow"
  onClick={() => setSelectedTask(task)}
>
```

- [ ] **Step 4: Renderizar o modal**

Adicionar após o return do componente:

```typescript
{selectedTask && (
  <TaskModal task={selectedTask} onClose={() => setSelectedTask(null)} />
)}
```

- [ ] **Step 5: Typecheck**

Run: `cd /home/bruno/projects/clinica-saas/apps/web && npx tsc --noEmit`
Expected: No errors

- [ ] **Step 6: Commit**

```bash
git add apps/web/src/app/(authenticated)/tasks/page.tsx
git commit -m "feat: integrate TaskModal in Kanban"
```

---

## Task 11: Frontend - Checklist na Criação de Tarefa

**Files:**
- Modificar: `apps/web/src/app/(authenticated)/tasks/new/page.tsx`

- [ ] **Step 1: Ler arquivo atual**

Read: `apps/web/src/app/(authenticated)/tasks/new/page.tsx`

- [ ] **Step 2: Adicionar estado para checklist items**

```typescript
const [checklistItems, setChecklistItems] = useState<{ content: string }[]>([]);
const [newItem, setNewItem] = useState('');
```

- [ ] **Step 3: Adicionar inputs no formulário**

Adicionar seção de checklist antes do botão de submit:

```typescript
<div className="mb-4">
  <label className="block text-sm font-medium text-gray-700 mb-2">Checklist (opcional)</label>
  <div className="space-y-2 mb-2">
    {checklistItems.map((item, index) => (
      <div key={index} className="flex items-center gap-2">
        <span className="text-sm">{item.content}</span>
        <button
          type="button"
          onClick={() => setChecklistItems(items => items.filter((_, i) => i !== index))}
          className="text-red-500 hover:text-red-700"
        >
          ×
        </button>
      </div>
    ))}
  </div>
  <div className="flex gap-2">
    <input
      type="text"
      value={newItem}
      onChange={(e) => setNewItem(e.target.value)}
      placeholder="Adicionar item..."
      className="flex-1 px-3 py-2 border rounded"
    />
    <button
      type="button"
      onClick={() => { if (newItem.trim()) { setChecklistItems([...checklistItems, { content: newItem.trim() }]); setNewItem(''); } }}
      className="px-3 py-2 bg-gray-100 text-gray-700 rounded hover:bg-gray-200"
    >
      Add
    </button>
  </div>
</div>
```

- [ ] **Step 4: Passar checklistItems no submit**

Modificar o formData para incluir checklistItems:

```typescript
const formData = {
  title: formData.title,
  description: formData.description || undefined,
  priority: formData.priority || 'medium',
  assignedTo: formData.assignedTo || undefined,
  dueDate: formData.dueDate || undefined,
  checklistItems: checklistItems.length > 0 ? checklistItems : undefined,
};
```

- [ ] **Step 5: Typecheck e Commit**

Run: `cd /home/bruno/projects/clinica-saas/apps/web && npx tsc --noEmit`

- [ ] **Step 6: Commit**

```bash
git add apps/web/src/app/(authenticated)/tasks/new/page.tsx
git commit -m "feat: add checklist to task creation form"
```

---

## Task 12: Build e Teste Final

**Files:**
- Verificar: Todo o projeto

- [ ] **Step 1: Build completo**

Run: `cd /home/bruno/projects/clinica-saas && npm run build`
Expected: Build successful

- [ ] **Step 2: Testar manualmente**

Acessar `/tasks` e:
1. Clicar em uma tarefa para abrir o modal
2. Verificar checklist e comentários
3. Criar nova tarefa com checklist
4. Testar toggle de checklist
5. Testar adicionar/editar/excluir comentários

---

## Resumo de Commits

```
1. feat: add TaskChecklistItem model
2. feat: add TaskChecklistItem types to contracts
3. feat: add checklist and comment DTOs
4. feat: add checklist CRUD and comment update/delete to TasksService
5. feat: add checklist and comment endpoints to TasksController
6. feat: add checklist and comment API methods
7. feat: create TaskChecklist component
8. feat: create TaskComments component
9. feat: create TaskModal component
10. feat: integrate TaskModal in Kanban
11. feat: add checklist to task creation form
12. feat: final build and test
```

---

**Plan complete saved to** `docs/superpowers/plans/2026-04-29-task-modal-checklist-comments.md`

**Two execution options:**

**1. Subagent-Driven (recommended)** - I dispatch a fresh subagent per task, review between tasks, fast iteration

**2. Inline Execution** - Execute tasks in this session using executing-plans, batch execution with checkpoints

Which approach?