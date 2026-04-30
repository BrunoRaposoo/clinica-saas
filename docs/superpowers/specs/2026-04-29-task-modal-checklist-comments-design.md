# SPEC: Modal de Detalhes da Tarefa com Checklist e Comentários

## 1. Contexto

O sistema de tarefas atualmente exibe cards simples no Kanban. O usuário deseja um modal de detalhes que permita:
- Visualizar informações completas da tarefa
- Gerenciar checklist de itens (criar, marcar, excluir)
- Adicionar/editar/excluir comentários para discussão da equipe
- Editar informações diretamente no modal (como Jira)

## 2. Objetivo

Criar modal de detalhes da tarefa com:
- Visualização completa dos dados da tarefa
- Checklist opcional para acompanhamento de subtarefas
- Sistema de comentários para colaboração
- **Edição inline** de todos os campos diretamente no modal (estilo Jira)

## 3. Escopo

### Dentro do Escopo:
- [x] Modal de detalhes ao clicar no card da tarefa
- [x] Visualizar: título, descrição, prioridade, status, paciente, responsável, data vencimento
- [x] Checklist: criar, marcar como feito, excluir itens
- [x] Checklist opcional na criação da tarefa
- [x] Comentários: listar, criar, editar, excluir
- [x] Backend: novo modelo TaskChecklistItem, novos endpoints
- [ ] **Edição inline** de título (clique para editar)
- [ ] **Edição inline** de descrição (clique para editar)
- [ ] **Edição inline** de prioridade (dropdown)
- [ ] **Edição inline** de status (dropdown)
- [ ] **Edição inline** de responsável (dropdown)
- [ ] **Edição inline** de data de vencimento (date picker)
- [ ] Layout estilo Jira (duas colunas)

### Fora do Escopo:
- [ ] Notificações em tempo real
- [ ] Histórico de alterações do checklist
- [ ] Checklist dependente entre si
- [ ] Arquivos anexos

## 4. Modelo de Dados

### Novo modelo Prisma

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

### Relações
- Task 1:N TaskChecklistItem

## 5. Contratos de API

### Novos Tipos (packages/contracts)

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

export interface Task extends Task {
  checklistItems?: TaskChecklistItem[];
  comments?: TaskComment[];
}
```

### Novas Rotas API

| Método | Rota | Descrição |
|--------|------|-----------|
| GET | /tasks/:id | Retorna com checklist e comentários |
| POST | /tasks/:id/checklist | Criar item do checklist |
| PATCH | /tasks/:id/checklist/:itemId | Atualizar item |
| DELETE | /tasks/:id/checklist/:itemId | Excluir item |
| PATCH | /tasks/:id/checklist/:itemId/toggle | Alternar concluído |
| POST | /tasks/:id/comments | Criar comentário |
| PATCH | /tasks/:id/comments/:commentId | Editar comentário |
| DELETE | /tasks/:id/comments/:commentId | Excluir comentário |
| PATCH | /tasks/:id | Atualizar qualquer campo da tarefa |

## 6. Frontend - UI

### Modal de Detalhes (Layout Estilo Jira - Edição Inline)

```
┌─────────────────────────────────────────────────────────────────┐
│  [X]                                                            │
├─────────────────────────────────────────────────────────────────┤
│  ┌──────────────────────────────┬────────────────────────────┐ │
│  │     COLUNA ESQUERDA          │     COLUNA DIREITA         │ │
│  │                              │                            │ │
│  │  [📝 Título editável]        │  CHECKLIST                 │ │
│  │                              │  ☑ Item 1           [🗑]   │ │
│  │  STATUS: [Pendente ▼]         │  ☐ Item 2           [🗑]   │ │
│  │  PRIORIDADE: [Alta ▼]         │  + Adicionar item         │ │
│  │                              │                            │ │
│  │  RESPONSÁVEL: [Dr. Carlos ▼]  ├────────────────────────────┤ │
│  │  VENCIMENTO: [📅 30/04/2026]  │                            │ │
│  │                              │  COMENTÁRIOS               │ │
│  │  DESCRIÇÃO:                  │  Dr. Carlos - 10:30       │ │
│  │  [📝 Description editável]  │  Preciso desses resultados │ │
│  │                              │                            │ │
│  │                              │  [Digite um comentário...] │ │
│  │                              │                            │ │
│  └──────────────────────────────┴────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
```

### Comportamento de Edição Inline

1. **Título**: Clique no texto → vira input → Enter ou blur para salvar
2. **Descrição**: Clique no texto → vira textarea → blur para salvar
3. **Status**: Clique no badge → abre dropdown → seleciona opção → salva automaticamente
4. **Prioridade**: Clique no badge → abre dropdown → seleciona opção → salva automaticamente
5. **Responsável**: Clique no nome → abre dropdown com usuários → seleciona → salva automaticamente
6. **Vencimento**: Clique na data → abre date picker → seleciona → salva automaticamente

### Feedback Visual
- Mostrar "Salvando..." durante request
- Mostrar ✓ verde momentary após salvar com sucesso
- Manter estado visual durante loading

## 7. Fluxos

### Fluxo 1: Abrir modal de detalhes
1. Usuário clica no card da tarefa no Kanban
2. Abre modal com dados completos da tarefa
3. Carrega checklist e comentários do backend

### Fluxo 2: Edição inline (como Jira)
1. Usuário clica em qualquer campo editável
2. Campo transforma em input/select
3. Ao alterar, faz PATCH automático para API
4. Feedback visual de "Salvando..." → "Salvo"

### Fluxo 3: Gerenciar checklist
1. Clicar em checkbox → toggle (PATCH /checklist/:id/toggle)
2. Clicar em "+ Add" → abre input → criar item (POST /checklist)
3. Clicar em ícone lixeira → excluir item (DELETE /checklist/:id)

### Fluxo 4: Comentários
1. Listar comentários no modal
2. Digitar no campo → enviar (POST /comments)
3. Clicar em comentário próprio → editar (PATCH /comments/:id)
4. Clicar em ícone lixeira no próprio comentário → excluir (DELETE /comments/:id)

## 8. Estrutura de Pastas

### Frontend
```
apps/web/src/
├── app/(authenticated)/tasks/
│   ├── page.tsx (Kanban)
│   ├── new/page.tsx
│   └── [id]/page.tsx
├── components/tasks/
│   ├── TaskModal.tsx (modal com edição inline)
│   ├── TaskChecklist.tsx
│   ├── TaskComments.tsx
│   ├── PatientSelect.tsx
│   ├── AppointmentSelect.tsx
│   ├── UserSelect.tsx
│   └── TaskFilters.tsx
└── lib/api/
    └── tasks.ts
```

## 9. Validações

### Edição Inline
- Título: 3-200 caracteres, obrigatório
- Descrição: máximo 2000 caracteres
- Priority: enum (low, medium, high)
- Status: enum (pending, in_progress, completed)
- DueDate: data opcional

### Checklist Item
- content: obrigatório, 1-200 caracteres
- isCompleted: opcional, padrão false
- order: automático (incrementa)

### Comentário
- content: obrigatório, 1-1000 caracteres
- Apenas autor pode editar/excluir

### Permissões
- Qualquer membro da org pode editar campos da tarefa
- Qualquer membro da org pode ver/editar checklist
- Qualquer membro da org pode criar comentário
- Apenas autor do comentário pode editar/excluir

## 10. Critérios de Aceite

### Modal com Edição Inline
- [ ] Título editável ao clicar
- [ ] Descrição editável ao clicar
- [ ] Status com dropdown editável
- [ ] Prioridade com dropdown editável
- [ ] Responsável com dropdown editável
- [ ] Data de vencimento com date picker editável
- [ ] Feedback visual de "Salvando..." durante request

### Checklist
- [x] Criar item na criação da tarefa (opcional)
- [ ] Adicionar itens no modal (mesmo vazio)
- [ ] Marcar/desmarcar como concluído
- [ ] Excluir itens
- [ ] Itens persistem no banco

### Comentários
- [x] Listar comentários no modal
- [x] Adicionar novo comentário
- [x] Editar próprio comentário
- [x] Excluir próprio comentário

### Modal
- [x] Abre ao clicar no card
- [x] Fecha ao clicar fora ou X
- [ ] Layout responsivo com duas colunas (estilo Jira)

---

**Versão**: 1.1.0
**Data**: 2026-04-30
**Status**: Em desenvolvimento
**Modificações**: Adicionada edição inline estilo Jira