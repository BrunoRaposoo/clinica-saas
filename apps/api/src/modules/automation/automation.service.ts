import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../common/prisma.service';
import { Automation } from '@clinica-saas/contracts';

@Injectable()
export class AutomationService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(organizationId: string) {
    const items = await this.prisma.automation.findMany({
      where: { organizationId },
      orderBy: { createdAt: 'desc' },
    });

    return items.map((item) => ({
      id: item.id,
      organizationId: item.organizationId,
      name: item.name,
      event: item.event,
      action: item.action,
      config: item.config as Record<string, unknown> || {},
      isActive: item.isActive,
      createdAt: item.createdAt.toISOString(),
      updatedAt: item.updatedAt.toISOString(),
    }));
  }

  async findById(organizationId: string, id: string) {
    const item = await this.prisma.automation.findFirst({
      where: { id, organizationId },
    });

    if (!item) {
      throw new NotFoundException('Automação não encontrada');
    }

    return {
      id: item.id,
      organizationId: item.organizationId,
      name: item.name,
      event: item.event,
      action: item.action,
      config: item.config as Record<string, unknown> || {},
      isActive: item.isActive,
      createdAt: item.createdAt.toISOString(),
      updatedAt: item.updatedAt.toISOString(),
    };
  }

  async create(organizationId: string, data: {
    name: string;
    event: string;
    action: string;
    config: Record<string, unknown>;
  }) {
    const item = await this.prisma.automation.create({
      data: {
        organizationId,
        name: data.name,
        event: data.event,
        action: data.action,
        config: data.config as any,
        isActive: true,
      },
    });

    return {
      id: item.id,
      organizationId: item.organizationId,
      name: item.name,
      event: item.event,
      action: item.action,
      config: item.config as Record<string, unknown>,
      isActive: item.isActive,
      createdAt: item.createdAt.toISOString(),
      updatedAt: item.updatedAt.toISOString(),
    };
  }

  async update(organizationId: string, id: string, data: {
    name?: string;
    event?: string;
    action?: string;
    config?: Record<string, unknown>;
    isActive?: boolean;
  }) {
    const existing = await this.prisma.automation.findFirst({
      where: { id, organizationId },
    });

    if (!existing) {
      throw new NotFoundException('Automação não encontrada');
    }

    const updateData: any = {};
    if (data.name) updateData.name = data.name;
    if (data.event) updateData.event = data.event;
    if (data.action) updateData.action = data.action;
    if (data.config) updateData.config = data.config;
    if (data.isActive !== undefined) updateData.isActive = data.isActive;

    const item = await this.prisma.automation.update({
      where: { id },
      data: updateData,
    });

    return {
      id: item.id,
      organizationId: item.organizationId,
      name: item.name,
      event: item.event,
      action: item.action,
      config: item.config as Record<string, unknown>,
      isActive: item.isActive,
      createdAt: item.createdAt.toISOString(),
      updatedAt: item.updatedAt.toISOString(),
    };
  }

  async delete(organizationId: string, id: string) {
    const existing = await this.prisma.automation.findFirst({
      where: { id, organizationId },
    });

    if (!existing) {
      throw new NotFoundException('Automação não encontrada');
    }

    await this.prisma.automation.delete({ where: { id } });
  }

  async triggerEvent(event: string, organizationId: string, data: Record<string, unknown>) {
    const automations = await this.prisma.automation.findMany({
      where: { event, organizationId, isActive: true },
    });

    const results: Array<{ automationId: string; success: boolean; action: string; result?: unknown; error?: string }> = [];

    for (const automation of automations) {
      const result = this.processAutomation(automation.action, automation.config as Record<string, unknown>, data);
      results.push({ automationId: automation.id, ...result });
    }

    return { triggered: automations.length, results };
  }

  private processAutomation(action: string, config: Record<string, unknown>, data: Record<string, unknown>) {
    switch (action) {
      case 'send_email':
        return {
          success: true,
          action: 'send_email',
          result: { type: 'email', to: config.to || data.recipient, subject: config.subject || 'Notificação' },
        };
      case 'send_whatsapp':
        return {
          success: true,
          action: 'send_whatsapp',
          result: { type: 'whatsapp', to: config.to || data.recipient, message: config.message || data.message },
        };
      case 'webhook':
        return {
          success: true,
          action: 'webhook',
          result: { type: 'webhook', url: config.url, method: 'POST', payload: data },
        };
      default:
        return { success: false, action, error: 'Unknown action' };
    }
  }
}