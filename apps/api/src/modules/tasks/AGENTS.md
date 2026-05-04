# AGENTS.md - Módulo de Tarefas

## Escopo

Módulo de gerenciamento de tarefas internas e pendências com Kanban.

## Objetivo

Criar sistema de tarefas com:
- Kanban 3 colunas (Pendente → Em Andamento → Concluído)
- Atribuição de responsável
- Prioridade e prazo
- Comentários internos
- Auditoria

## Estrutura

apps/api/src/modules/tasks/
├── tasks.module.ts
├── tasks.service.ts
├── tasks.controller.ts
├── dto/task.dto.ts
└── AGENTS.md

## Responsabilidades

### O que fazer
- CRUD completo de tarefas
- Kanban com status
- Comentários
- Auditoria

### O que não fazer
- Automações complexas
- Dependências entre tarefas

## ROTAS API

| Método | Rota | Descrição |
|--------|------|-----------|
| GET | /tasks | Listar |
| GET | /tasks/:id | Detalhar |
| POST | /tasks | Criar |
| PATCH | /tasks/:id | Editar |
| PATCH | /tasks/:id/status | Status |
| DELETE | /tasks/:id | Excluir |
| POST | /tasks/:id/comments | Comentar |
| GET | /tasks/patient/:patientId | Por paciente |
| GET | /tasks/appointment/:appointmentId | Por agendamento |

---

Contato: docs/specs/006-tasks.md