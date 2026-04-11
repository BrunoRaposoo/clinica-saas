# SPEC 008: Dashboard e Relatórios

## 1. Contexto do Problema

O sistema de gestão de clínicas precisa de um painel operacional centralizado que exiba indicadores-chave de todas as áreas do sistema. Com os 7 módulos anteriores implementados (Auth, Pacientes, Agenda, Comunicações, Documentos, Tarefas, Financeiro), há dados suficientes para criar um dashboard completo com comparativos temporais e drill-down.

## 2. Objetivo do Módulo

Criar dashboard operacional completo com:
- KPIs de todas as áreas (Financeiro, Agenda, Pacientes, Comunicações, Tarefas)
- Comparação temporal (hoje vs ontem, mês atual vs anterior, etc.)
- Drill-down completo (clicar no número abre lista filtrada)
- Visualização com line + bar charts

## 3. Escopo da Feature

### Dentro do Escopo:
- [x] Dashboard com 5 abas (Financeiro, Agenda, Pacientes, Comunicações, Tarefas)
- [x] Seletor de período com comparação (hoje, ontem, mês atual, mês anterior, semestre, anual, personalizado)
- [x] Comparação temporal com delta e tendência
- [x] Line charts para evolução temporal
- [x] Bar charts para comparativos
- [x] Drill-down completo em todos os KPIs
- [x] Resumo rápido (endpoint único)

### Fora do Escopo:
- [ ] Relatórios exportáveis (PDF/Excel)
- [ ] Alertas automáticos
- [ ] Dashboards customizáveis por usuário
- [ ] Comparação entre organizações

## 4. Personas e Papéis

| Role | Permissão |
|------|-----------|
| `super_admin` | Ver todas as organizações |
| `org_admin` | Ver dados da organização |
| `professional` | Ver dados da organização |
| `receptionist` | Ver dados da organização |
| `support` | Apenas leitura |

## 5. Modelo de Dados

### Agregações (sem novas entidades)

Usar agregações sobre dados existentes:

| Área | Entidade Principal | KPIs |
|------|---------------------|------|
| Financeiro | Charge | receita total, pendentes, vencidos, pagos, média |
| Agenda | Appointment | total, confirmados, cancelados, no-show, ocupação |
| Pacientes | Patient | total, novos, ativos, inativos |
| Comunicações | Communication | enviadas, entregues, falhas, taxa entrega |
| Tarefas | Task | pendentes, em progresso, concluídas, atrasadas |

## 6. Contratos de API

### Types

```typescript
export type PeriodType = 'today' | 'yesterday' | 'current_month' | 'previous_month' | 'current_semester' | 'current_year' | 'custom';

export interface DashboardPeriod {
  start: Date;
  end: Date;
  comparisonStart?: Date;
  comparisonEnd?: Date;
}

export interface DashboardKPI {
  value: number;
  previousValue: number;
  delta: number;
  deltaPercent: number;
  trend: 'up' | 'down' | 'stable';
}

export interface FinanceKPIs {
  totalRevenue: DashboardKPI;
  pending: DashboardKPI;
  overdue: DashboardKPI;
  paid: DashboardKPI;
  averageCharge: DashboardKPI;
}

export interface ScheduleKPIs {
  total: DashboardKPI;
  confirmed: DashboardKPI;
  cancelled: DashboardKPI;
  noShow: DashboardKPI;
  occupancyRate: DashboardKPI;
}

export interface PatientKPIs {
  total: DashboardKPI;
  newPatients: DashboardKPI;
  active: DashboardKPI;
  inactive: DashboardKPI;
}

export interface CommunicationKPIs {
  sent: DashboardKPI;
  delivered: DashboardKPI;
  failed: DashboardKPI;
  deliveryRate: DashboardKPI;
}

export interface TaskKPIs {
  pending: DashboardKPI;
  inProgress: DashboardKPI;
  completed: DashboardKPI;
  overdue: DashboardKPI;
}

export interface DashboardSummary {
  finance: FinanceKPIs;
  schedule: ScheduleKPIs;
  patients: PatientKPIs;
  communications: CommunicationKPIs;
  tasks: TaskKPIs;
  period: {
    start: string;
    end: string;
    comparisonStart?: string;
    comparisonEnd?: string;
  };
}
```

### Rotas API

| Método | Rota | Descrição |
|--------|------|-----------|
| GET | /dashboard/summary | Resumo de todas as áreas |
| GET | /dashboard/finance | KPIs financeiros detalhados |
| GET | /dashboard/schedule | KPIs de agendamentos |
| GET | /dashboard/patients | KPIs de pacientes |
| GET | /dashboard/communications | KPIs de comunicações |
| GET | /dashboard/tasks | KPIs de tarefas |
| GET | /dashboard/appointments | Lista para drill-down (fitros) |
| GET | /dashboard/charges | Lista para drill-down (fitros) |
| GET | /dashboard/patients/list | Lista para drill-down (fitros) |
| GET | /dashboard/communications/list | Lista para drill-down (fitros) |
| GET | /dashboard/tasks/list | Lista para drill-down (fitros) |

### Query Params para Drill-down

```typescript
export interface DrillDownParams {
  period: PeriodType;
  startDate?: string;
  endDate?: string;
  status?: string;
  professionalId?: string;
}
```

## 7. Componentes Frontend

### Estrutura de Pastas

```
apps/web/src/app/(authenticated)/dashboard/
├── page.tsx                          # Dashboard principal com abas
└── components/
    ├── PeriodSelector.tsx           # Seletor de período
    ├── KPICard.tsx                  # Card com valor + delta
    ├── TrendChart.tsx               # Line/Bar chart
    ├── DrillDownModal.tsx           # Modal com lista filtrada
    ├── tabs/
    │   ├── FinanceTab.tsx
    │   ├── ScheduleTab.tsx
    │   ├── PatientsTab.tsx
    │   ├── CommunicationsTab.tsx
    │   └── TasksTab.tsx
    └── hooks/
        └── useDashboard.ts         # Hook para dados

apps/web/src/lib/api/
└── dashboard.ts                     # API client
```

### Tabs e KPIs por Aba

| Aba | KPIs | Chart |
|-----|------|-------|
| Financeiro | Receita, Pendentes, Vencidos, Pago, Média | Bar (mensal) |
| Agenda | Total, Confirmados, Cancelados, No-show, Ocupação | Line (semanal) |
| Pacientes | Total, Novos, Ativos, Inativos | Bar (mensal) |
| Comunicações | Enviadas, Entregues, Falhas, Taxa | Line (diário) |
| Tarefas | Pendentes, Em Progresso, Concluídas, Atrasadas | Bar (por prioridade) |

## 8. Seletor de Período

### Opções

| Opção | Período Atual | Período Comparação |
|-------|---------------|---------------------|
| hoje | Data atual | Ontem |
| ontem | Ontem | Dia anterior |
| mês atual | 1º dia mês até hoje | Mês anterior completo |
| mês anterior | Mês anterior completo | Mês anterior ao anterior |
| semestre atual | 1º dia semestre até hoje | Semestre anterior |
| ano atual | 1º dia ano até hoje | Ano anterior |
| personalizado | Definido pelo usuário | Período anterior igual |

## 9. Validações

- Período customizado: startDate < endDate
- Máximo período: 1 ano
- Data não futura para comparação

## 10. Estrutura de Pastas Backend

```
apps/api/src/modules/dashboard/
├── dashboard.module.ts
├── dashboard.controller.ts
├── dashboard.service.ts
├── dto/
│   ├── dashboard.dto.ts
│   └── drill-down.dto.ts
└── AGENTS.md
```

## 11. Critérios de Aceite

- [x] Dashboard com 5 abas funcionais
- [x] Seletor de período com comparação
- [x] KPIs com delta e tendência
- [x] Charts line + bar por área
- [x] Drill-down completo em todos os KPIs
- [x] Build compila
- [x] Isolamento por organização
- [x] Resumo rápido em endpoint único

---

**Versão**: 1.0.0
**Data**: 2026-04-11
**Status**: Design aprovado