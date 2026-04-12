import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../common/prisma.service';
import { DEFAULT_PAGE_SIZE } from '@clinica-saas/shared';

@Injectable()
export class AuditService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(
    organizationId: string,
    page = 1,
    limit = DEFAULT_PAGE_SIZE,
    userId?: string,
    action?: string,
    entity?: string,
    startDate?: string,
    endDate?: string,
  ) {
    const skip = (page - 1) * limit;
    const where: any = { organizationId };

    if (userId) where.userId = userId;
    if (action) where.action = action;
    if (entity) where.entity = entity;
    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) where.createdAt.gte = new Date(startDate);
      if (endDate) where.createdAt.lte = new Date(endDate);
    }

    const [items, total] = await Promise.all([
      this.prisma.auditLog.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          user: { select: { id: true, name: true } },
        },
      }),
      this.prisma.auditLog.count({ where }),
    ]);

    return {
      items: items.map((item) => ({
        id: item.id,
        organizationId: item.organizationId,
        userId: item.userId,
        user: item.user,
        action: item.action,
        entity: item.entity,
        entityId: item.entityId,
        changes: item.changes,
        ipAddress: item.ipAddress,
        userAgent: item.userAgent,
        createdAt: item.createdAt,
      })),
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    };
  }

  async findById(id: string, organizationId: string) {
    const log = await this.prisma.auditLog.findFirst({
      where: { id, organizationId },
      include: {
        user: { select: { id: true, name: true } },
      },
    });

    if (!log) throw new NotFoundException('Log de auditoria não encontrado');

    return {
      id: log.id,
      organizationId: log.organizationId,
      userId: log.userId,
      user: log.user,
      action: log.action,
      entity: log.entity,
      entityId: log.entityId,
      changes: log.changes,
      ipAddress: log.ipAddress,
      userAgent: log.userAgent,
      createdAt: log.createdAt,
    };
  }

  async create(
    organizationId: string,
    userId: string,
    action: string,
    entity: string,
    entityId?: string,
    changes?: Record<string, unknown>,
    ipAddress?: string,
    userAgent?: string,
  ) {
    return this.prisma.auditLog.create({
      data: {
        organizationId,
        userId,
        action,
        entity,
        entityId,
        changes: changes ? { before: changes['before'], after: changes['after'] } as any : undefined,
        ipAddress,
        userAgent,
      },
    });
  }
}