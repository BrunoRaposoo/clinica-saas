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
  DrillDownParams,
} from '@clinica-saas/contracts';
import { DrillDownQueryDto } from './dto/dashboard.dto';

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
      const confirmed = appointments.filter((a) => a.status === 'confirmed').length;
      const cancelled = appointments.filter((a) => a.status === 'cancelled').length;
      const noShow = appointments.filter((a) => a.status === 'no_show').length;
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
      const delivered = comms.filter((c) => c.status === 'delivered').length;
      const failed = comms.filter((c) => c.status === 'failed').length;
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
      items: items.map((c) => ({
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
      items: items.map((a) => ({
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
      items: items.map((c) => ({
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
      items: items.map((t) => ({
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