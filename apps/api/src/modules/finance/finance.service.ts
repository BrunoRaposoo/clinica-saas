import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../../common/prisma.service';
import { Charge, ChargeStatus, ChargeListParams, ChargeListResponse, FinanceDashboard } from '@clinica-saas/contracts';
import { CreateChargeDto, UpdateChargeDto, ChargePaymentDto } from './dto/charge.dto';

function startOfDay(date: Date): Date {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
}

function endOfDay(date: Date): Date {
  const d = new Date(date);
  d.setHours(23, 59, 59, 999);
  return d;
}

@Injectable()
export class FinanceService {
  constructor(private readonly prisma: PrismaService) {}

  private calculateOverdueStatus(dueDate: Date): ChargeStatus {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const due = new Date(dueDate);
    due.setHours(0, 0, 0, 0);
    return due < today ? 'overdue' : 'pending';
  }

  async create(
    dto: CreateChargeDto,
    organizationId: string,
    userId: string,
  ): Promise<Charge> {
    const charge = await this.prisma.charge.create({
      data: {
        organizationId,
        description: dto.description,
        amount: dto.amount,
        dueDate: new Date(dto.dueDate),
        patientId: dto.patientId,
        appointmentId: dto.appointmentId,
        notes: dto.notes,
        status: this.calculateOverdueStatus(new Date(dto.dueDate)),
        createdBy: userId,
      },
      include: {
        createdByUser: { select: { id: true, name: true } },
      },
    });

    await this.prisma.chargeAudit.create({
      data: {
        chargeId: charge.id,
        action: 'create',
        performedBy: userId,
      },
    });

    return this.mapCharge(charge);
  }

  async findAll(
    params: ChargeListParams,
    organizationId: string,
  ): Promise<ChargeListResponse> {
    const { page = 1, limit = 20, status, patientId, appointmentId, dueDateFrom, dueDateTo, search } = params;
    const skip = (page - 1) * limit;

    const where: any = { organizationId };

    if (status && status !== 'overdue') where.status = status;
    if (patientId) where.patientId = patientId;
    if (appointmentId) where.appointmentId = appointmentId;
    if (search) {
      where.OR = [
        { description: { contains: search, mode: 'insensitive' } },
      ];
    }
    if (dueDateFrom || dueDateTo) {
      where.dueDate = {};
      if (dueDateFrom) where.dueDate.gte = startOfDay(new Date(dueDateFrom));
      if (dueDateTo) where.dueDate.lte = endOfDay(new Date(dueDateTo));
    }

    const [items, total] = await Promise.all([
      this.prisma.charge.findMany({
        where,
        skip,
        take: limit,
        orderBy: [{ dueDate: 'asc' }, { createdAt: 'desc' }],
        include: {
          createdByUser: { select: { id: true, name: true } },
        },
      }),
      this.prisma.charge.count({ where }),
    ]);

    return {
      items: items.map(this.mapCharge.bind(this)),
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    };
  }

  async findById(id: string, organizationId: string): Promise<Charge> {
    const charge = await this.prisma.charge.findFirst({
      where: { id, organizationId },
      include: {
        createdByUser: { select: { id: true, name: true } },
      },
    });

    if (!charge) {
      throw new NotFoundException('Cobrança não encontrada');
    }

    return this.mapCharge(charge);
  }

  async update(
    id: string,
    dto: UpdateChargeDto,
    organizationId: string,
    userId: string,
  ): Promise<Charge> {
    const existing = await this.prisma.charge.findFirst({
      where: { id, organizationId },
    });

    if (!existing) {
      throw new NotFoundException('Cobrança não encontrada');
    }

    if (existing.status === 'paid' || existing.status === 'cancelled') {
      throw new ForbiddenException('Não é possível editar cobrança paga ou cancelada');
    }

    const data: any = {};
    if (dto.description !== undefined) data.description = dto.description;
    if (dto.amount !== undefined) data.amount = dto.amount;
    if (dto.dueDate !== undefined) {
      data.dueDate = new Date(dto.dueDate);
      data.status = this.calculateOverdueStatus(new Date(dto.dueDate));
    }
    if (dto.notes !== undefined) data.notes = dto.notes;

    const charge = await this.prisma.charge.update({
      where: { id },
      data,
      include: {
        createdByUser: { select: { id: true, name: true } },
      },
    });

    await this.prisma.chargeAudit.create({
      data: {
        chargeId: id,
        action: 'update',
        performedBy: userId,
      },
    });

    return this.mapCharge(charge);
  }

  async processPayment(
    id: string,
    dto: ChargePaymentDto,
    organizationId: string,
    userId: string,
  ): Promise<Charge> {
    const existing = await this.prisma.charge.findFirst({
      where: { id, organizationId },
    });

    if (!existing) {
      throw new NotFoundException('Cobrança não encontrada');
    }

    if (existing.status === 'paid' || existing.status === 'cancelled') {
      throw new ForbiddenException('Cobrança já está paga ou cancelada');
    }

    const charge = await this.prisma.charge.update({
      where: { id },
      data: {
        status: 'paid',
        paidAt: new Date(),
        paymentMethod: dto.paymentMethod,
      },
      include: {
        createdByUser: { select: { id: true, name: true } },
      },
    });

    await this.prisma.chargeAudit.create({
      data: {
        chargeId: id,
        action: 'payment',
        performedBy: userId,
      },
    });

    return this.mapCharge(charge);
  }

  async cancel(id: string, organizationId: string, userId: string): Promise<void> {
    const existing = await this.prisma.charge.findFirst({
      where: { id, organizationId },
    });

    if (!existing) {
      throw new NotFoundException('Cobrança não encontrada');
    }

    if (existing.status === 'paid') {
      throw new ForbiddenException('Não é possível cancelar cobrança já paga');
    }

    await this.prisma.charge.update({
      where: { id },
      data: { status: 'cancelled' },
    });

    await this.prisma.chargeAudit.create({
      data: {
        chargeId: id,
        action: 'cancel',
        performedBy: userId,
      },
    });
  }

  async getDashboard(organizationId: string, periodFrom?: Date, periodTo?: Date): Promise<FinanceDashboard> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const paidWhere: any = { organizationId, status: 'paid' };
    if (periodFrom) {
      paidWhere.createdAt = { gte: periodFrom };
    }
    if (periodTo) {
      paidWhere.createdAt = { ...paidWhere.createdAt, lte: periodTo };
    }

    const [pendingResult, paidResult, overdueResult, countResult] = await Promise.all([
      this.prisma.charge.aggregate({
        where: { organizationId, status: 'pending' },
        _sum: { amount: true },
      }),
      this.prisma.charge.aggregate({
        where: paidWhere,
        _sum: { amount: true },
      }),
      this.prisma.charge.aggregate({
        where: { organizationId, status: 'overdue' },
        _sum: { amount: true },
      }),
      this.prisma.charge.count({
        where: { organizationId, status: 'pending' },
      }),
    ]);

    return {
      totalPending: Number(pendingResult._sum.amount) || 0,
      totalPaid: Number(paidResult._sum.amount) || 0,
      totalOverdue: Number(overdueResult._sum.amount) || 0,
      pendingCount: countResult,
    };
  }

  private mapCharge(charge: any): Charge {
    return {
      id: charge.id,
      organizationId: charge.organizationId,
      patientId: charge.patientId,
      appointmentId: charge.appointmentId,
      description: charge.description,
      amount: Number(charge.amount),
      dueDate: charge.dueDate.toISOString(),
      status: charge.status as ChargeStatus,
      paidAt: charge.paidAt?.toISOString(),
      paymentMethod: charge.paymentMethod as any,
      notes: charge.notes,
      createdBy: { id: charge.createdByUser.id, name: charge.createdByUser.name },
      createdAt: charge.createdAt.toISOString(),
      updatedAt: charge.updatedAt.toISOString(),
    };
  }

  async updateOverdueCharges(): Promise<number> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const result = await this.prisma.charge.updateMany({
      where: {
        status: 'pending',
        dueDate: { lt: today },
      },
      data: {
        status: 'overdue',
      },
    });

    return result.count;
  }
}