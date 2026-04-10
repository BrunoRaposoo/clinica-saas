import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../common/prisma.service';
import { CreateTemplateDto, UpdateTemplateDto, ListTemplatesQueryDto } from './dto/template.dto';

@Injectable()
export class TemplatesService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(organizationId: string, query: ListTemplatesQueryDto) {
    const { page = 1, limit = 20, channel, type, isActive } = query;
    const skip = (page - 1) * limit;

    const where: any = { organizationId };
    if (channel) where.channel = channel;
    if (type) where.type = type;
    if (isActive !== undefined) where.isActive = isActive;

    const [items, total] = await Promise.all([
      this.prisma.messageTemplate.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.messageTemplate.count({ where }),
    ]);

    return {
      items: items.map((item) => ({
        id: item.id,
        organizationId: item.organizationId,
        name: item.name,
        channel: item.channel,
        type: item.type,
        subject: item.subject,
        body: item.body,
        isActive: item.isActive,
        createdAt: item.createdAt.toISOString(),
        updatedAt: item.updatedAt.toISOString(),
      })),
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findById(organizationId: string, id: string) {
    const template = await this.prisma.messageTemplate.findFirst({
      where: { id, organizationId },
    });

    if (!template) {
      throw new NotFoundException('Template não encontrado');
    }

    return {
      id: template.id,
      organizationId: template.organizationId,
      name: template.name,
      channel: template.channel,
      type: template.type,
      subject: template.subject,
      body: template.body,
      isActive: template.isActive,
      createdAt: template.createdAt.toISOString(),
      updatedAt: template.updatedAt.toISOString(),
    };
  }

  async create(organizationId: string, userId: string, data: CreateTemplateDto) {
    const template = await this.prisma.messageTemplate.create({
      data: {
        organizationId,
        name: data.name,
        channel: data.channel,
        type: data.type,
        subject: data.subject,
        body: data.body,
      },
    });

    await this.prisma.communicationAudit.create({
      data: {
        communicationId: template.id,
        action: 'create',
        performedBy: userId,
      },
    });

    return {
      id: template.id,
      organizationId: template.organizationId,
      name: template.name,
      channel: template.channel,
      type: template.type,
      subject: template.subject,
      body: template.body,
      isActive: template.isActive,
      createdAt: template.createdAt.toISOString(),
      updatedAt: template.updatedAt.toISOString(),
    };
  }

  async update(organizationId: string, userId: string, id: string, data: UpdateTemplateDto) {
    const existing = await this.prisma.messageTemplate.findFirst({
      where: { id, organizationId },
    });

    if (!existing) {
      throw new NotFoundException('Template não encontrado');
    }

    const template = await this.prisma.messageTemplate.update({
      where: { id },
      data: {
        ...(data.name && { name: data.name }),
        ...(data.subject !== undefined && { subject: data.subject }),
        ...(data.body && { body: data.body }),
        ...(data.isActive !== undefined && { isActive: data.isActive }),
      },
    });

    await this.prisma.communicationAudit.create({
      data: {
        communicationId: template.id,
        action: 'update',
        changes: data as any,
        performedBy: userId,
      },
    });

    return {
      id: template.id,
      organizationId: template.organizationId,
      name: template.name,
      channel: template.channel,
      type: template.type,
      subject: template.subject,
      body: template.body,
      isActive: template.isActive,
      createdAt: template.createdAt.toISOString(),
      updatedAt: template.updatedAt.toISOString(),
    };
  }

  async delete(organizationId: string, userId: string, id: string) {
    const existing = await this.prisma.messageTemplate.findFirst({
      where: { id, organizationId },
    });

    if (!existing) {
      throw new NotFoundException('Template não encontrado');
    }

    await this.prisma.messageTemplate.update({
      where: { id },
      data: { isActive: false },
    });

    await this.prisma.communicationAudit.create({
      data: {
        communicationId: existing.id,
        action: 'delete',
        performedBy: userId,
      },
    });
  }
}