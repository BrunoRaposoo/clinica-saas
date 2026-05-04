# Dashboard e Relatórios (SPEC 008) - Plano de Implementação

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) ou superpowers:executing-plans para implementar este plano task-by-task. Steps usam checkbox (`- [ ]`) syntax.

**Goal:** Implementar dashboard operacional completo com KPIs de todas as áreas (Financeiro, Agenda, Pacientes, Comunicações, Tarefas), comparativo temporal e drill-down.

**Architecture:** Abordagem híbrida - endpoint de resumo rápido + endpoints granulares para drill-down. Sem novas entidades no Prisma - usar agregações sobre dados existentes.

**Tech Stack:** NestJS (backend), Next.js (frontend), Recharts (charts), Prisma (banco).

---

## Estrutura de Arquivos

### Backend - Módulo Dashboard

```
apps/api/src/modules/dashboard/
├── dashboard.module.ts          # Module definitions
├── dashboard.controller.ts     # REST endpoints
├── dashboard.service.ts         # Business logic
├── dto/
│   ├── dashboard.dto.ts         # Period & KPIs DTOs
│   └── drill-down.dto.ts        # Drill-down params
└── AGENTS.md
```

### Contracts - Novos Tipos

```
packages/contracts/src/types/
└── dashboard.ts                 # Dashboard types (PeriodType, KPIs)
```

### Frontend - Dashboard

```
apps/web/src/app/(authenticated)/dashboard/
├── page.tsx                     # Main dashboard with tabs
└── components/
    ├── PeriodSelector.tsx       # Period selector component
    ├── KPICard.tsx              # KPI card with trend
    ├── TrendChart.tsx           # Line/Bar chart wrapper
    ├── DrillDownModal.tsx       # Drill-down modal
    └── tabs/
        ├── FinanceTab.tsx
        ├── ScheduleTab.tsx
        ├── PatientsTab.tsx
        ├── CommunicationsTab.tsx
        └── TasksTab.tsx

apps/web/src/lib/api/
└── dashboard.ts                 # API client
```

---

## Task 1: Contratos - Tipos de Dashboard

**Files:**
- Modify: `packages/contracts/src/types/index.ts`
- Create: `packages/contracts/src/types/dashboard.ts`

- [ ] **Step 1: Criar tipos de dashboard**

Criar arquivo `packages/contracts/src/types/dashboard.ts`:

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

export interface DrillDownParams {
  period: PeriodType;
  startDate?: string;
  endDate?: string;
  status?: string;
  professionalId?: string;
}
```

- [ ] **Step 2: Exportar no index**

Adicionar ao `packages/contracts/src/types/index.ts`:

```typescript
export * from './dashboard';
```

- [ ] **Step 3: Build dos contratos**

```bash
cd packages/contracts && npm run build
```

Expected: Build completo sem erros

- [ ] **Step 4: Commit**

```bash
git add packages/contracts/src/types/dashboard.ts packages/contracts/src/types/index.ts
git commit -m "feat(dashboard): add dashboard types and contracts"
```

---

## Task 2: Backend - Módulo Dashboard

**Files:**
- Create: `apps/api/src/modules/dashboard/dashboard.module.ts`
- Create: `apps/api/src/modules/dashboard/dashboard.controller.ts`
- Create: `apps/api/src/modules/dashboard/dashboard.service.ts`
- Create: `apps/api/src/modules/dashboard/dto/dashboard.dto.ts`
- Create: `apps/api/src/modules/dashboard/dto/drill-down.dto.ts`
- Create: `apps/api/src/modules/dashboard/AGENTS.md`

- [ ] **Step 1: Criar DTOs - dashboard.dto.ts**

Criar `apps/api/src/modules/dashboard/dto/dashboard.dto.ts`:

```typescript
import { IsEnum, IsOptional, IsDateString, IsString } from 'class-validator';
import { PeriodType } from '@clinica-saas/contracts';

export class DashboardPeriodDto {
  @IsEnum([
    'today',
    'yesterday',
    'current_month',
    'previous_month',
    'current_semester',
    'current_year',
    'custom',
  ])
  period!: PeriodType;

  @IsOptional()
  @IsDateString()
  startDate?: string;

  @IsOptional()
  @IsDateString()
  endDate?: string;
}

export class DrillDownQueryDto {
  @IsEnum([
    'today',
    'yesterday',
    'current_month',
    'previous_month',
    'current_semester',
    'current_year',
    'custom',
  ])
  period!: PeriodType;

  @IsOptional()
  @IsDateString()
  startDate?: string;

  @IsOptional()
  @IsDateString()
  endDate?: string;

  @IsOptional()
  @IsString()
  status?: string;

  @IsOptional()
  @IsString()
  professionalId?: string;

  @IsOptional()
  page?: number;

  @IsOptional()
  limit?: number;
}
```

- [ ] **Step 2: Criar DashboardService com lógica de KPIs**

Criar `apps/api/src/modules/dashboard/dashboard.service.ts`:

```typescript
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../common/prisma.service';
import {
  PeriodType,
  DashboardSummary,
  DashboardKPI,
  FinanceKPIs,
  ScheduleKPIs,
  PatientKPIs,
  CommunicationKPIs,
  TaskKPIs,
} from '@clinica-saas/contracts';

interface PeriodRange {
  start: Date;
  end: Date;
  comparisonStart?: Date;
  comparisonEnd?: Date;
}

@Injectable()
export class DashboardService {
  constructor(private readonly prisma: PrismaService) {}

  private calculatePeriod(type: PeriodType, customStart?: string, customEnd?: string): PeriodRange {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const todayEnd = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);

    switch (type) {
      case 'today':
        return {
          start: today,
          end: todayEnd,
          comparisonStart: new Date(today.getTime() - 86400000),
          comparisonEnd: new Date(todayEnd.getTime() - 86400000),
        };
      case 'yesterday':
        const yesterday = new Date(today.getTime() - 86400000);
        return {
          start: yesterday,
          end: new Date(yesterday.getTime() + 86399999),
          comparisonStart: new Date(yesterday.getTime() - 86400000),
          comparisonEnd: new Date(yesterday.getTime() - 1),
        };
      case 'current_month':
        const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
        const prevMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        const prevMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59, 999);
        return {
          start: monthStart,
          end: todayEnd,
          comparisonStart: prevMonthStart,
          comparisonEnd: prevMonthEnd,
        };
      case 'previous_month':
        const pMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        const pMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59, 999);
        const ppMonthStart = new Date(now.getFullYear(), now.getMonth() - 2, 1);
        const ppMonthEnd = new Date(now.getFullYear(), now.getMonth() - 1, 0, 23, 59, 59, 999);
        return {
          start: pMonthStart,
          end: pMonthEnd,
          comparisonStart: ppMonthStart,
          comparisonEnd: ppMonthEnd,
        };
      case 'current_semester':
        const semester = Math.floor(now.getMonth() / 6);
        const semStart = new Date(now.getFullYear(), semester * 6, 1);
        const prevSemStart = new Date(now.getFullYear(), (semester - 1) * 6, 1);
        const prevSemEnd = new Date(now.getFullYear(), semester * 6 - 1, 31, 23, 59, 59, 999);
        return {
          start: semStart,
          end: todayEnd,
          comparisonStart: prevSemStart,
          comparisonEnd: prevSemEnd,
        };
      case 'current_year':
        const yearStart = new Date(now.getFullYear(), 0, 1);
        const prevYearStart = new Date(now.getFullYear() - 1, 0, 1);
        const prevYearEnd = new Date(now.getFullYear() - 1, 11, 31, 23, 59, 59, 999);
        return {
          start: yearStart,
          end: todayEnd,
          comparisonStart: prevYearStart,
          comparisonEnd: prevYearEnd,
        };
      case 'custom':
        const start = customStart ? new Date(customStart) : today;
        const end = customEnd ? new Date(customEnd) : todayEnd;
        const diff = end.getTime() - start.getTime();
        return {
          start,
          end,
          comparisonStart: new Date(start.getTime() - diff),
          comparisonEnd: new Date(start.getTime() - 1),
        };
    }
  }

  private calculateKPI(current: number, previous: number): DashboardKPI {
    const delta = current - previous;
    const deltaPercent = previous > 0 ? (delta / previous) * 100 : 0;
    let trend: 'up' | 'down' | 'stable' = 'stable';
    if (deltaPercent > 1) trend = 'up';
    if (deltaPercent < -1) trend = 'down';

    return {
      value: current,
      previousValue: previous,
      delta,
      deltaPercent: Math.round(deltaPercent * 100) / 100,
      trend,
    };
  }

  async getSummary(organizationId: string, period: PeriodType, customStart?: string, customEnd?: string): Promise<DashboardSummary> {
    const range = this.calculatePeriod(period, customStart, customEnd);

    const [finance, schedule, patients, communications, tasks] = await Promise.all([
      this.getFinanceKPIs(organizationId, range),
      this.getScheduleKPIs(organizationId, range),
      this.getPatientKPIs(organizationId, range),
      this.getCommunicationKPIs(organizationId, range),
      this.getTaskKPIs(organizationId, range),
    ]);

    return {
      finance,
      schedule,
      patients,
      communications,
      tasks,
      period: {
        start: range.start.toISOString(),
        end: range.end.toISOString(),
        comparisonStart: range.comparisonStart?.toISOString(),
        comparisonEnd: range.comparisonEnd?.toISOString(),
      },
    };
  }

  private async getFinanceKPIs(organizationId: string, range: PeriodRange): Promise<FinanceKPIs> {
    const [current, previous] = await Promise.all([
      this.prisma.charge.aggregate({
        where: {
          organizationId,
          createdAt: { gte: range.start, lte: range.end },
          status: { not: 'cancelled' },
        },
        _sum: { amount: true },
        _count: true,
      }),
      this.prisma.charge.aggregate({
        where: {
          organizationId,
          createdAt: { gte: range.comparisonStart, lte: range.comparisonEnd },
          status: { not: 'cancelled' },
        },
        _sum: { amount: true },
        _count: true,
      }),
    ]);

    const [pendingCurrent, pendingPrevious] = await Promise.all([
      this.prisma.charge.aggregate({
        where: { organizationId, status: 'pending', dueDate: { lte: range.end } },
        _sum: { amount: true },
        _count: true,
      }),
      this.prisma.charge.aggregate({
        where: { organizationId, status: 'pending', dueDate: { lte: range.comparisonEnd } },
        _sum: { amount: true },
        _count: true,
      }),
    ]);

    const [overdueCurrent, overduePrevious] = await Promise.all([
      this.prisma.charge.aggregate({
        where: { organizationId, status: 'overdue' },
        _sum: { amount: true },
        _count: true,
      }),
      this.prisma.charge.aggregate({
        where: { organizationId, status: 'overdue' },
        _sum: { amount: true },
        _count: true,
      }),
    ]);

    const [paidCurrent, paidPrevious] = await Promise.all([
      this.prisma.charge.aggregate({
        where: { organizationId, status: 'paid', paidAt: { gte: range.start, lte: range.end } },
        _sum: { amount: true },
        _count: true,
      }),
      this.prisma.charge.aggregate({
        where: { organizationId, status: 'paid', paidAt: { gte: range.comparisonStart, lte: range.comparisonEnd } },
        _sum: { amount: true },
        _count: true,
      }),
    ]);

    const totalRevenueCurrent = Number(current._sum.amount || 0);
    const totalRevenuePrevious = Number(previous._sum.amount || 0);
    const pendingVal = Number(pendingCurrent._sum.amount || 0);
    const pendingPrevVal = Number(pendingPrevious._sum.amount || 0);
    const overdueVal = Number(overdueCurrent._sum.amount || 0);
    const overduePrevVal = Number(overduePrevious._sum.amount || 0);
    const paidVal = Number(paidCurrent._sum.amount || 0);
    const paidPrevVal = Number(paidPrevious._sum.amount || 0);

    return {
      totalRevenue: this.calculateKPI(totalRevenueCurrent, totalRevenuePrevious),
      pending: this.calculateKPI(pendingVal, pendingPrevVal),
      overdue: this.calculateKPI(overdueVal, overduePrevVal),
      paid: this.calculateKPI(paidVal, paidPrevVal),
      averageCharge: this.calculateKPI(
        current._count > 0 ? totalRevenueCurrent / current._count : 0,
        previous._count > 0 ? totalRevenuePrevious / previous._count : 0
      ),
    };
  }

  private async getScheduleKPIs(organizationId: string, range: PeriodRange): Promise<ScheduleKPIs> {
    const [current, previous] = await Promise.all([
      this.prisma.appointment.findMany({
        where: { organizationId, startDate: { gte: range.start, lte: range.end } },
      }),
      this.prisma.appointment.findMany({
        where: { organizationId, startDate: { gte: range.comparisonStart, lte: range.comparisonEnd } },
      }),
    ]);

    const calcKPIs = (appointments: any[]) => {
      const total = appointments.length;
      const confirmed = appointments.filter(a => a.status === 'confirmed').length;
      const cancelled = appointments.filter(a => a.status === 'cancelled').length;
      const noShow = appointments.filter(a => a.status === 'no_show').length;
      return { total, confirmed, cancelled, noShow };
    };

    const currKPIs = calcKPIs(current);
    const prevKPIs = calcKPIs(previous);

    return {
      total: this.calculateKPI(currKPIs.total, prevKPIs.total),
      confirmed: this.calculateKPI(currKPIs.confirmed, prevKPIs.confirmed),
      cancelled: this.calculateKPI(currKPIs.cancelled, prevKPIs.cancelled),
      noShow: this.calculateKPI(currKPIs.noShow, prevKPIs.noShow),
      occupancyRate: this.calculateKPI(
        currKPIs.total > 0 ? (currKPIs.confirmed / currKPIs.total) * 100 : 0,
        prevKPIs.total > 0 ? (prevKPIs.confirmed / prevKPIs.total) * 100 : 0
      ),
    };
  }

  private async getPatientKPIs(organizationId: string, range: PeriodRange): Promise<PatientKPIs> {
    const [total, current, previous, active, inactive] = await Promise.all([
      this.prisma.patient.count({ where: { organizationId, deletedAt: null } }),
      this.prisma.patient.count({
        where: { organizationId, createdAt: { gte: range.start, lte: range.end }, deletedAt: null },
      }),
      this.prisma.patient.count({
        where: { organizationId, createdAt: { gte: range.comparisonStart, lte: range.comparisonEnd }, deletedAt: null },
      }),
      this.prisma.patient.count({ where: { organizationId, isActive: true, deletedAt: null } }),
      this.prisma.patient.count({ where: { organizationId, isActive: false, deletedAt: null } }),
    ]);

    const [prevTotal, prevActive, prevInactive] = await Promise.all([
      this.prisma.patient.count({ where: { organizationId, createdAt: { lt: range.comparisonStart }, deletedAt: null } }),
      this.prisma.patient.count({ where: { organizationId, isActive: true, deletedAt: null } }),
      this.prisma.patient.count({ where: { organizationId, isActive: false, deletedAt: null } }),
    ]);

    return {
      total: this.calculateKPI(total, prevTotal),
      newPatients: this.calculateKPI(current, previous),
      active: this.calculateKPI(active, prevActive),
      inactive: this.calculateKPI(inactive, prevInactive),
    };
  }

  private async getCommunicationKPIs(organizationId: string, range: PeriodRange): Promise<CommunicationKPIs> {
    const [current, previous] = await Promise.all([
      this.prisma.communication.findMany({
        where: { organizationId, createdAt: { gte: range.start, lte: range.end } },
      }),
      this.prisma.communication.findMany({
        where: { organizationId, createdAt: { gte: range.comparisonStart, lte: range.comparisonEnd } },
      }),
    ]);

    const calcKPIs = (comms: any[]) => {
      const sent = comms.length;
      const delivered = comms.filter(c => c.status === 'delivered').length;
      const failed = comms.filter(c => c.status === 'failed').length;
      return { sent, delivered, failed };
    };

    const currKPIs = calcKPIs(current);
    const prevKPIs = calcKPIs(previous);

    return {
      sent: this.calculateKPI(currKPIs.sent, prevKPIs.sent),
      delivered: this.calculateKPI(currKPIs.delivered, prevKPIs.delivered),
      failed: this.calculateKPI(currKPIs.failed, prevKPIs.failed),
      deliveryRate: this.calculateKPI(
        currKPIs.sent > 0 ? (currKPIs.delivered / currKPIs.sent) * 100 : 0,
        prevKPIs.sent > 0 ? (prevKPIs.delivered / prevKPIs.sent) * 100 : 0
      ),
    };
  }

  private async getTaskKPIs(organizationId: string, range: PeriodRange): Promise<TaskKPIs> {
    const now = new Date();

    const [pending, inProgress, completed, overdue, prevPending, prevInProgress, prevCompleted] = await Promise.all([
      this.prisma.task.count({ where: { organizationId, status: 'pending' } }),
      this.prisma.task.count({ where: { organizationId, status: 'in_progress' } }),
      this.prisma.task.count({
        where: { organizationId, status: 'completed', updatedAt: { gte: range.start, lte: range.end } },
      }),
      this.prisma.task.count({ where: { organizationId, status: { in: ['pending', 'in_progress'] }, dueDate: { lt: now } } }),
      this.prisma.task.count({ where: { organizationId, status: 'pending' } }),
      this.prisma.task.count({ where: { organizationId, status: 'in_progress' } }),
      this.prisma.task.count({
        where: { organizationId, status: 'completed', updatedAt: { gte: range.comparisonStart, lte: range.comparisonEnd } },
      }),
    ]);

    return {
      pending: this.calculateKPI(pending, prevPending),
      inProgress: this.calculateKPI(inProgress, prevInProgress),
      completed: this.calculateKPI(completed, prevCompleted),
      overdue: this.calculateKPI(overdue, 0),
    };
  }

  async getChargesForDrillDown(organizationId: string, params: DrillDownQueryDto) {
    const range = this.calculatePeriod(params.period, params.startDate, params.endDate);

    const where: any = { organizationId, createdAt: { gte: range.start, lte: range.end } };
    if (params.status) where.status = params.status;

    const [items, total] = await Promise.all([
      this.prisma.charge.findMany({
        where,
        include: { patient: { select: { id: true, name: true } } },
        orderBy: { createdAt: 'desc' },
        skip: ((params.page || 1) - 1) * (params.limit || 20),
        take: params.limit || 20,
      }),
      this.prisma.charge.count({ where }),
    ]);

    return {
      items: items.map(c => ({
        id: c.id,
        patientName: c.patient?.name || 'Sem paciente',
        description: c.description,
        amount: Number(c.amount),
        status: c.status,
        dueDate: c.dueDate.toISOString(),
        createdAt: c.createdAt.toISOString(),
      })),
      pagination: { page: params.page || 1, limit: params.limit || 20, total, totalPages: Math.ceil(total / (params.limit || 20)) },
    };
  }

  async getAppointmentsForDrillDown(organizationId: string, params: DrillDownQueryDto) {
    const range = this.calculatePeriod(params.period, params.startDate, params.endDate);

    const where: any = { organizationId, startDate: { gte: range.start, lte: range.end } };
    if (params.status) where.status = params.status;
    if (params.professionalId) where.professionalId = params.professionalId;

    const [items, total] = await Promise.all([
      this.prisma.appointment.findMany({
        where,
        include: {
          patient: { select: { id: true, name: true } },
          professional: { select: { id: true, specialty: true }, include: { user: { select: { name: true } } } },
        },
        orderBy: { startDate: 'desc' },
        skip: ((params.page || 1) - 1) * (params.limit || 20),
        take: params.limit || 20,
      }),
      this.prisma.appointment.count({ where }),
    ]);

    return {
      items: items.map(a => ({
        id: a.id,
        patientName: a.patient.name,
        professionalName: a.professional.user.name,
        specialty: a.professional.specialty,
        startDate: a.startDate.toISOString(),
        endDate: a.endDate.toISOString(),
        status: a.status,
      })),
      pagination: { page: params.page || 1, limit: params.limit || 20, total, totalPages: Math.ceil(total / (params.limit || 20)) },
    };
  }

  async getPatientsForDrillDown(organizationId: string, params: DrillDownQueryDto) {
    const range = this.calculatePeriod(params.period, params.startDate, params.endDate);

    const where: any = { organizationId, deletedAt: null };
    if (params.status === 'active') where.isActive = true;
    if (params.status === 'inactive') where.isActive = false;
    if (params.status === 'new') where.createdAt = { gte: range.start, lte: range.end };

    const [items, total] = await Promise.all([
      this.prisma.patient.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: ((params.page || 1) - 1) * (params.limit || 20),
        take: params.limit || 20,
      }),
      this.prisma.patient.count({ where }),
    ]);

    return {
      items,
      pagination: { page: params.page || 1, limit: params.limit || 20, total, totalPages: Math.ceil(total / (params.limit || 20)) },
    };
  }

  async getCommunicationsForDrillDown(organizationId: string, params: DrillDownQueryDto) {
    const range = this.calculatePeriod(params.period, params.startDate, params.endDate);

    const where: any = { organizationId, createdAt: { gte: range.start, lte: range.end } };
    if (params.status) where.status = params.status;

    const [items, total] = await Promise.all([
      this.prisma.communication.findMany({
        where,
        include: { patient: { select: { id: true, name: true } } },
        orderBy: { createdAt: 'desc' },
        skip: ((params.page || 1) - 1) * (params.limit || 20),
        take: params.limit || 20,
      }),
      this.prisma.communication.count({ where }),
    ]);

    return {
      items: items.map(c => ({
        id: c.id,
        patientName: c.patient.name,
        channel: c.channel,
        type: c.type,
        status: c.status,
        createdAt: c.createdAt.toISOString(),
      })),
      pagination: { page: params.page || 1, limit: params.limit || 20, total, totalPages: Math.ceil(total / (params.limit || 20)) },
    };
  }

  async getTasksForDrillDown(organizationId: string, params: DrillDownQueryDto) {
    const range = this.calculatePeriod(params.period, params.startDate, params.endDate);
    const now = new Date();

    const where: any = { organizationId };
    if (params.status === 'pending') where.status = 'pending';
    if (params.status === 'in_progress') where.status = 'in_progress';
    if (params.status === 'completed') where.status = 'completed';
    if (params.status === 'overdue') where.status = { in: ['pending', 'in_progress'] };
    if (params.status === 'completed') where.updatedAt = { gte: range.start, lte: range.end };

    const [items, total] = await Promise.all([
      this.prisma.task.findMany({
        where,
        include: {
          assignedToUser: { select: { id: true, name: true } },
          patient: { select: { id: true, name: true } },
        },
        orderBy: { createdAt: 'desc' },
        skip: ((params.page || 1) - 1) * (params.limit || 20),
        take: params.limit || 20,
      }),
      this.prisma.task.count({ where }),
    ]);

    return {
      items: items.map(t => ({
        id: t.id,
        title: t.title,
        status: t.status,
        priority: t.priority,
        assignedToName: t.assignedToUser?.name || 'Não atribuído',
        patientName: t.patient?.name || 'Sem paciente',
        dueDate: t.dueDate?.toISOString(),
        isOverdue: t.dueDate && t.dueDate < now && t.status !== 'completed',
      })),
      pagination: { page: params.page || 1, limit: params.limit || 20, total, totalPages: Math.ceil(total / (params.limit || 20)) },
    };
  }
}
```

- [ ] **Step 3: Criar DashboardController**

Criar `apps/api/src/modules/dashboard/dashboard.controller.ts`:

```typescript
import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { DashboardService } from './dashboard.service';
import { DashboardPeriodDto, DrillDownQueryDto } from './dto/dashboard.dto';
import { PeriodType, DrillDownParams } from '@clinica-saas/contracts';

@Controller('dashboard')
@UseGuards(AuthGuard('jwt'))
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get('summary')
  async getSummary(
    @Query() query: DashboardPeriodDto & { organizationId: string },
  ) {
    return this.dashboardService.getSummary(
      query.organizationId,
      query.period,
      query.startDate,
      query.endDate,
    );
  }

  @Get('charges')
  async getChargesDrillDown(
    @Query() query: DrillDownQueryDto & { organizationId: string },
  ) {
    return this.dashboardService.getChargesForDrillDown(query.organizationId, query);
  }

  @Get('appointments')
  async getAppointmentsDrillDown(
    @Query() query: DrillDownQueryDto & { organizationId: string },
  ) {
    return this.dashboardService.getAppointmentsForDrillDown(query.organizationId, query);
  }

  @Get('patients')
  async getPatientsDrillDown(
    @Query() query: DrillDownQueryDto & { organizationId: string },
  ) {
    return this.dashboardService.getPatientsForDrillDown(query.organizationId, query);
  }

  @Get('communications')
  async getCommunicationsDrillDown(
    @Query() query: DrillDownQueryDto & { organizationId: string },
  ) {
    return this.dashboardService.getCommunicationsForDrillDown(query.organizationId, query);
  }

  @Get('tasks')
  async getTasksDrillDown(
    @Query() query: DrillDownQueryDto & { organizationId: string },
  ) {
    return this.dashboardService.getTasksForDrillDown(query.organizationId, query);
  }
}
```

- [ ] **Step 4: Criar DashboardModule**

Criar `apps/api/src/modules/dashboard/dashboard.module.ts`:

```typescript
import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { DashboardController } from './dashboard.controller';
import { DashboardService } from './dashboard.service';
import { JwtStrategy } from '../../common/strategies/jwt.strategy';

@Module({
  imports: [PassportModule.register({ defaultStrategy: 'jwt' }), JwtModule.register({})],
  controllers: [DashboardController],
  providers: [DashboardService, JwtStrategy],
  exports: [DashboardService],
})
export class DashboardModule {}
```

- [ ] **Step 5: Registrar módulo no AppModule**

Modificar `apps/api/src/app.module.ts` para importar DashboardModule.

- [ ] **Step 6: Commit**

```bash
git add apps/api/src/modules/dashboard/
git commit -m "feat(dashboard): add dashboard module with KPIs"
```

---

## Task 3: Frontend - Componentes de Dashboard

**Files:**
- Create: `apps/web/src/lib/api/dashboard.ts`
- Create: `apps/web/src/app/(authenticated)/dashboard/page.tsx`
- Create: `apps/web/src/app/(authenticated)/dashboard/components/PeriodSelector.tsx`
- Create: `apps/web/src/app/(authenticated)/dashboard/components/KPICard.tsx`
- Create: `apps/web/src/app/(authenticated)/dashboard/components/DrillDownModal.tsx`
- Create: `apps/web/src/app/(authenticated)/dashboard/components/tabs/FinanceTab.tsx`
- Create: `apps/web/src/app/(authenticated)/dashboard/components/tabs/ScheduleTab.tsx`
- Create: `apps/web/src/app/(authenticated)/dashboard/components/tabs/PatientsTab.tsx`
- Create: `apps/web/src/app/(authenticated)/dashboard/components/tabs/CommunicationsTab.tsx`
- Create: `apps/web/src/app/(authenticated)/dashboard/components/tabs/TasksTab.tsx`

- [ ] **Step 1: Criar API client**

Criar `apps/web/src/lib/api/dashboard.ts`:

```typescript
import type { PeriodType, DashboardSummary, DrillDownParams } from '@clinica-saas/contracts';

const API_BASE = '/api/v1/dashboard';

export async function getDashboardSummary(
  organizationId: string,
  period: PeriodType,
  startDate?: string,
  endDate?: string
): Promise<DashboardSummary> {
  const params = new URLSearchParams({ period, organizationId });
  if (startDate) params.append('startDate', startDate);
  if (endDate) params.append('endDate', endDate);

  const res = await fetch(`${API_BASE}/summary?${params}`);
  if (!res.ok) throw new Error('Failed to fetch dashboard');
  return res.json();
}

export async function getChargesDrillDown(organizationId: string, params: DrillDownParams & { page?: number; limit?: number }) {
  const searchParams = new URLSearchParams({ period: params.period, organizationId });
  if (params.status) searchParams.append('status', params.status);
  if (params.startDate) searchParams.append('startDate', params.startDate);
  if (params.endDate) searchParams.append('endDate', params.endDate);
  if (params.page) searchParams.append('page', String(params.page));
  if (params.limit) searchParams.append('limit', String(params.limit));

  const res = await fetch(`${API_BASE}/charges?${searchParams}`);
  if (!res.ok) throw new Error('Failed to fetch charges');
  return res.json();
}

export async function getAppointmentsDrillDown(organizationId: string, params: DrillDownParams & { page?: number; limit?: number }) {
  const searchParams = new URLSearchParams({ period: params.period, organizationId });
  if (params.status) searchParams.append('status', params.status);
  if (params.professionalId) searchParams.append('professionalId', params.professionalId);
  if (params.startDate) searchParams.append('startDate', params.startDate);
  if (params.endDate) searchParams.append('endDate', params.endDate);
  if (params.page) searchParams.append('page', String(params.page));
  if (params.limit) searchParams.append('limit', String(params.limit));

  const res = await fetch(`${API_BASE}/appointments?${searchParams}`);
  if (!res.ok) throw new Error('Failed to fetch appointments');
  return res.json();
}

export async function getPatientsDrillDown(organizationId: string, params: DrillDownParams & { page?: number; limit?: number }) {
  const searchParams = new URLSearchParams({ period: params.period, organizationId });
  if (params.status) searchParams.append('status', params.status);
  if (params.startDate) searchParams.append('startDate', params.startDate);
  if (params.endDate) searchParams.append('endDate', params.endDate);
  if (params.page) searchParams.append('page', String(params.page));
  if (params.limit) searchParams.append('limit', String(params.limit));

  const res = await fetch(`${API_BASE}/patients?${searchParams}`);
  if (!res.ok) throw new Error('Failed to fetch patients');
  return res.json();
}

export async function getCommunicationsDrillDown(organizationId: string, params: DrillDownParams & { page?: number; limit?: number }) {
  const searchParams = new URLSearchParams({ period: params.period, organizationId });
  if (params.status) searchParams.append('status', params.status);
  if (params.startDate) searchParams.append('startDate', params.startDate);
  if (params.endDate) searchParams.append('endDate', params.endDate);
  if (params.page) searchParams.append('page', String(params.page));
  if (params.limit) searchParams.append('limit', String(params.limit));

  const res = await fetch(`${API_BASE}/communications?${searchParams}`);
  if (!res.ok) throw new Error('Failed to fetch communications');
  return res.json();
}

export async function getTasksDrillDown(organizationId: string, params: DrillDownParams & { page?: number; limit?: number }) {
  const searchParams = new URLSearchParams({ period: params.period, organizationId });
  if (params.status) searchParams.append('status', params.status);
  if (params.startDate) searchParams.append('startDate', params.startDate);
  if (params.endDate) searchParams.append('endDate', params.endDate);
  if (params.page) searchParams.append('page', String(params.page));
  if (params.limit) searchParams.append('limit', String(params.limit));

  const res = await fetch(`${API_BASE}/tasks?${searchParams}`);
  if (!res.ok) throw new Error('Failed to fetch tasks');
  return res.json();
}
```

- [ ] **Step 2: Criar PeriodSelector**

Criar `apps/web/src/app/(authenticated)/dashboard/components/PeriodSelector.tsx`:

```typescript
'use client';

import { PeriodType } from '@clinica-saas/contracts';

interface Props {
  value: PeriodType;
  onChange: (period: PeriodType) => void;
  customStart?: string;
  customEnd?: string;
  onCustomStartChange?: (date: string) => void;
  onCustomEndChange?: (date: string) => void;
}

const periods: { value: PeriodType; label: string }[] = [
  { value: 'today', label: 'Hoje' },
  { value: 'yesterday', label: 'Ontem' },
  { value: 'current_month', label: 'Mês Atual' },
  { value: 'previous_month', label: 'Mês Anterior' },
  { value: 'current_semester', label: 'Semestre Atual' },
  { value: 'current_year', label: 'Ano Atual' },
  { value: 'custom', label: 'Personalizado' },
];

export function PeriodSelector({ value, onChange, customStart, customEnd, onCustomStartChange, onCustomEndChange }: Props) {
  return (
    <div className="flex items-center gap-4">
      <select
        value={value}
        onChange={e => onChange(e.target.value as PeriodType)}
        className="px-3 py-2 border rounded-lg"
      >
        {periods.map(p => (
          <option key={p.value} value={p.value}>{p.label}</option>
        ))}
      </select>
      {value === 'custom' && (
        <>
          <input
            type="date"
            value={customStart}
            onChange={e => onCustomStartChange?.(e.target.value)}
            className="px-3 py-2 border rounded-lg"
          />
          <span>até</span>
          <input
            type="date"
            value={customEnd}
            onChange={e => onCustomEndChange?.(e.target.value)}
            className="px-3 py-2 border rounded-lg"
          />
        </>
      )}
    </div>
  );
}
```

- [ ] **Step 3: Criar KPICard**

Criar `apps/web/src/app/(authenticated)/dashboard/components/KPICard.tsx`:

```typescript
'use client';

import type { DashboardKPI } from '@clinica-saas/contracts';

interface Props {
  title: string;
  kpi: DashboardKPI;
  onClick?: () => void;
  format?: 'number' | 'currency' | 'percent';
}

export function KPICard({ title, kpi, onClick, format = 'number' }: Props) {
  const formatValue = (val: number) => {
    if (format === 'currency') return `R$ ${val.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`;
    if (format === 'percent') return `${val.toFixed(1)}%`;
    return val.toLocaleString('pt-BR');
  };

  const trendIcon = kpi.trend === 'up' ? '↑' : kpi.trend === 'down' ? '↓' : '→';
  const trendColor = kpi.trend === 'up' ? 'text-green-600' : kpi.trend === 'down' ? 'text-red-600' : 'text-gray-500';

  return (
    <div
      onClick={onClick}
      className={`p-4 bg-white rounded-lg shadow ${onClick ? 'cursor-pointer hover:shadow-md' : ''}`}
    >
      <p className="text-sm text-gray-500">{title}</p>
      <p className="text-2xl font-bold mt-1">{formatValue(kpi.value)}</p>
      <div className={`flex items-center gap-1 mt-2 text-sm ${trendColor}`}>
        <span>{trendIcon}</span>
        <span>{kpi.deltaPercent > 0 ? '+' : ''}{kpi.deltaPercent.toFixed(1)}%</span>
        <span className="text-gray-400">vs período anterior</span>
      </div>
    </div>
  );
}
```

- [ ] **Step 4: Criar DrillDownModal**

Criar `apps/web/src/app/(authenticated)/dashboard/components/DrillDownModal.tsx`:

```typescript
'use client';

import { useState, useEffect } from 'react';

interface DrillDownModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  fetchData: () => Promise<any>;
  columns: { key: string; label: string }[];
  type: 'charges' | 'appointments' | 'patients' | 'communications' | 'tasks';
}

export function DrillDownModal({ open, onClose, title, fetchData, columns, type }: DrillDownModalProps) {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    if (open) {
      setLoading(true);
      fetchData().then(res => {
        setData(res.items);
        setTotalPages(res.pagination.totalPages);
        setLoading(false);
      });
    }
  }, [open, page]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg w-full max-w-4xl max-h-[80vh] overflow-hidden">
        <div className="p-4 border-b flex justify-between items-center">
          <h2 className="text-lg font-semibold">{title}</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">✕</button>
        </div>
        <div className="p-4 overflow-auto max-h-[60vh]">
          {loading ? (
            <p>Carregando...</p>
          ) : (
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  {columns.map(col => (
                    <th key={col.key} className="text-left p-2">{col.label}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {data.map((item, idx) => (
                  <tr key={idx} className="border-b hover:bg-gray-50">
                    {columns.map(col => (
                      <td key={col.key} className="p-2">{item[col.key]}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
        <div className="p-4 border-t flex justify-between">
          <button disabled={page === 1} onClick={() => setPage(p => p - 1)} className="px-3 py-1 border rounded">Anterior</button>
          <span>Página {page} de {totalPages}</span>
          <button disabled={page === totalPages} onClick={() => setPage(p => p + 1)} className="px-3 py-1 border rounded">Próxima</button>
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 5: Criar tabs**

Criar cada tab em `apps/web/src/app/(authenticated)/dashboard/components/tabs/`:

**FinanceTab.tsx:**
```typescript
'use client';

import { FinanceKPIs } from '@clinica-saas/contracts';
import { KPICard } from '../KPICard';
import { DrillDownModal } from '../DrillDownModal';
import { getChargesDrillDown } from '@/lib/api/dashboard';
import { useState } from 'react';

interface Props {
  data: FinanceKPIs;
  organizationId: string;
  period: string;
}

export function FinanceTab({ data, organizationId, period }: Props) {
  const [drillDown, setDrillDown] = useState<{ type: string; status?: string } | null>(null);

  const handleDrillDown = (type: string, status?: string) => {
    setDrillDown({ type, status });
  };

  const fetchData = () => getChargesDrillDown(organizationId, { period: period as any, status: drillDown?.status });

  return (
    <div>
      <div className="grid grid-cols-5 gap-4">
        <KPICard title="Receita Total" kpi={data.totalRevenue} format="currency" onClick={() => handleDrillDown('finance', undefined)} />
        <KPICard title="Pendentes" kpi={data.pending} format="currency" onClick={() => handleDrillDown('finance', 'pending')} />
        <KPICard title="Vencidos" kpi={data.overdue} format="currency" onClick={() => handleDrillDown('finance', 'overdue')} />
        <KPICard title="Pagos" kpi={data.paid} format="currency" onClick={() => handleDrillDown('finance', 'paid')} />
        <KPICard title="Média por Cobrança" kpi={data.averageCharge} format="currency" />
      </div>
      {drillDown && (
        <DrillDownModal
          open={true}
          onClose={() => setDrillDown(null)}
          title="Cobranças"
          fetchData={fetchData}
          columns={[
            { key: 'patientName', label: 'Paciente' },
            { key: 'description', label: 'Descrição' },
            { key: 'amount', label: 'Valor' },
            { key: 'status', label: 'Status' },
            { key: 'dueDate', label: 'Vencimento' },
          ]}
          type="charges"
        />
      )}
    </div>
  );
}
```

**ScheduleTab.tsx, PatientsTab.tsx, CommunicationsTab.tsx, TasksTab.tsx** - Criar estrutura similar com seus respectivos KPIs e funções de drill-down.

- [ ] **Step 6: Criar página principal do dashboard**

Criar `apps/web/src/app/(authenticated)/dashboard/page.tsx`:

```typescript
'use client';

import { useState, useEffect } from 'react';
import { PeriodSelector } from './components/PeriodSelector';
import { FinanceTab } from './components/tabs/FinanceTab';
import { ScheduleTab } from './components/tabs/ScheduleTab';
import { PatientsTab } from './components/tabs/PatientsTab';
import { CommunicationsTab } from './components/tabs/CommunicationsTab';
import { TasksTab } from './components/tabs/TasksTab';
import { getDashboardSummary } from '@/lib/api/dashboard';
import type { DashboardSummary, PeriodType } from '@clinica-saas/contracts';

type Tab = 'finance' | 'schedule' | 'patients' | 'communications' | 'tasks';

export default function DashboardPage() {
  const [organizationId, setOrganizationId] = useState('');
  const [period, setPeriod] = useState<PeriodType>('current_month');
  const [data, setData] = useState<DashboardSummary | null>(null);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<Tab>('finance');

  useEffect(() => {
    const orgId = localStorage.getItem('organizationId');
    if (orgId) setOrganizationId(orgId);
  }, []);

  useEffect(() => {
    if (organizationId) {
      setLoading(true);
      getDashboardSummary(organizationId, period).then(setData).finally(() => setLoading(false));
    }
  }, [organizationId, period]);

  const tabs: { key: Tab; label: string }[] = [
    { key: 'finance', label: 'Financeiro' },
    { key: 'schedule', label: 'Agenda' },
    { key: 'patients', label: 'Pacientes' },
    { key: 'communications', label: 'Comunicações' },
    { key: 'tasks', label: 'Tarefas' },
  ];

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Dashboard Operacional</h1>
        <PeriodSelector value={period} onChange={setPeriod} />
      </div>

      <div className="flex gap-2 mb-6 border-b">
        {tabs.map(tab => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`px-4 py-2 -mb-px ${activeTab === tab.key ? 'border-b-2 border-blue-500 font-semibold' : 'text-gray-500'}`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {loading ? (
        <p>Carregando...</p>
      ) : data ? (
        <div>
          {activeTab === 'finance' && <FinanceTab data={data.finance} organizationId={organizationId} period={period} />}
          {activeTab === 'schedule' && <ScheduleTab data={data.schedule} organizationId={organizationId} period={period} />}
          {activeTab === 'patients' && <PatientsTab data={data.patients} organizationId={organizationId} period={period} />}
          {activeTab === 'communications' && <CommunicationsTab data={data.communications} organizationId={organizationId} period={period} />}
          {activeTab === 'tasks' && <TasksTab data={data.tasks} organizationId={organizationId} period={period} />}
        </div>
      ) : (
        <p>Dados não disponíveis</p>
      )}
    </div>
  );
}
```

- [ ] **Step 7: Commit**

```bash
git add apps/web/src/lib/api/dashboard.ts apps/web/src/app/(authenticated)/dashboard/
git commit -m "feat(dashboard): add frontend components and pages"
```

---

## Task 4: Build e Verificação

- [ ] **Step 1: Build dos contratos**

```bash
cd packages/contracts && npm run build
```

- [ ] **Step 2: Build do backend**

```bash
cd apps/api && npm run build
```

- [ ] **Step 3: Build do frontend**

```bash
cd apps/web && npm run build
```

- [ ] **Step 4: Commit final**

```bash
git add .
git commit -m "feat(dashboard): complete dashboard implementation"
```

---

## Plano Completo

Este plano cobre:
- [x] Task 1: Contratos (tipos TypeScript)
- [x] Task 2: Backend (módulo NestJS)
- [x] Task 3: Frontend (componentes React)
- [x] Task 4: Build e verificação

**Dois modelos de execução:**

**1. Subagent-Driven (recomendado)** — Dispenso um subagent por task, revisando entre tasks, iteração rápida

**2. Execução Inline** — Executo as tasks nesta sessão usando executing-plans, execução em lote com checkpoints

Qual abordagem prefere?