# AGENTS.md - Módulo Dashboard

## Escopo

Módulo de dashboard operacional com KPIs de todas as áreas do sistema.

## Objetivo

Dashboard completo com:
- KPIs de todas as áreas (Financeiro, Agenda, Pacientes, Comunicações, Tarefas)
- Comparação temporal
- Drill-down completo

## Estrutura

apps/api/src/modules/dashboard/
├── dashboard.module.ts
├── dashboard.controller.ts
├── dashboard.service.ts
├── dto/
│   └── dashboard.dto.ts
└── AGENTS.md

## ROTAS API

| Método | Rota | Descrição |
|--------|------|-----------|
| GET | /dashboard/summary | Resumo de todas as áreas |
| GET | /dashboard/charges | Drill-down cobranças |
| GET | /dashboard/appointments | Drill-down agendamentos |
| GET | /dashboard/patients | Drill-down pacientes |
| GET | /dashboard/communications | Drill-down comunicações |
| GET | /dashboard/tasks | Drill-down tarefas |

---

Contato: docs/specs/008-dashboard-reports.md