import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../common/prisma.service';
import { EmailProvider } from './providers/email.provider';
import { WhatsAppProvider } from './providers/whatsapp.provider';
import {
  Integration,
  IntegrationListParams,
  IntegrationListResponse,
  IntegrationCreateRequest,
  IntegrationUpdateRequest,
  IntegrationLog,
  IntegrationLogListParams,
  IntegrationLogListResponse,
} from '@clinica-saas/contracts';
import { CreateIntegrationDto, UpdateIntegrationDto, IntegrationQueryDto, IntegrationLogQueryDto } from './dto/integration.dto';

@Injectable()
export class IntegrationsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly emailProvider: EmailProvider,
    private readonly whatsappProvider: WhatsAppProvider,
  ) {}

  async findAll(organizationId: string, query: IntegrationQueryDto): Promise<IntegrationListResponse> {
    const { page = 1, limit = 20, provider, status } = query;

    const where: any = { organizationId };
    if (provider) where.provider = provider;
    if (status) where.status = status;

    const [items, total] = await Promise.all([
      this.prisma.integration.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.integration.count({ where }),
    ]);

    return {
      items: items as unknown as Integration[],
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    };
  }

  async findById(id: string): Promise<Integration> {
    const integration = await this.prisma.integration.findUnique({ where: { id } });
    if (!integration) throw new NotFoundException('Integração não encontrada');
    return integration as unknown as Integration;
  }

  async create(organizationId: string, dto: CreateIntegrationDto): Promise<Integration> {
    const integration = await this.prisma.integration.create({
      data: {
        organizationId,
        provider: dto.provider,
        providerConfig: dto.providerConfig as any,
        credentials: dto.credentials as any,
        status: 'connected',
        isActive: true,
      },
    });
    return integration as unknown as Integration;
  }

  async update(id: string, dto: UpdateIntegrationDto): Promise<Integration> {
    const integration = await this.prisma.integration.update({
      where: { id },
      data: {
        providerConfig: dto.providerConfig as any,
        credentials: dto.credentials as any,
        isActive: dto.isActive,
      },
    });
    return integration as unknown as Integration;
  }

  async delete(id: string): Promise<void> {
    await this.prisma.integration.delete({ where: { id } });
  }

  async getLogs(integrationId: string, query: IntegrationLogQueryDto): Promise<IntegrationLogListResponse> {
    const { page = 1, limit = 20, status } = query;

    const where: any = { integrationId };
    if (status) where.status = status;

    const [items, total] = await Promise.all([
      this.prisma.integrationLog.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.integrationLog.count({ where }),
    ]);

    return {
      items: items as unknown as IntegrationLog[],
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    };
  }

  async checkStatus(id: string): Promise<{ status: string }> {
    const integration = await this.prisma.integration.findUnique({ where: { id } });
    if (!integration) throw new NotFoundException('Integração não encontrada');
    return { status: integration.status };
  }

  async sendEmail(params: { to: string; subject: string; body: string; integrationId?: string }) {
    return this.emailProvider.sendEmail(params);
  }

  async sendWhatsApp(params: { to: string; message: string; integrationId?: string }) {
    return this.whatsappProvider.sendMessage(params);
  }
}