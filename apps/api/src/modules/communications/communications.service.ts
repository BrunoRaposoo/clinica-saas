import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../common/prisma.service';
import { CreateCommunicationDto, ListCommunicationsQueryDto } from './dto/communication.dto';
import { getProvider } from './providers/message-provider.interface';

@Injectable()
export class CommunicationsService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(organizationId: string, query: ListCommunicationsQueryDto) {
    const { page = 1, limit = 20, patientId, appointmentId, channel, status, startDate, endDate } = query;
    const skip = (page - 1) * limit;

    const where: any = { organizationId };
    if (patientId) where.patientId = patientId;
    if (appointmentId) where.appointmentId = appointmentId;
    if (channel) where.channel = channel;
    if (status) where.status = status;
    if (startDate) where.createdAt = { ...where.createdAt, gte: new Date(startDate) };
    if (endDate) where.createdAt = { ...where.createdAt, lte: new Date(endDate) };

    const [items, total] = await Promise.all([
      this.prisma.communication.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          patient: { select: { id: true, name: true } },
          appointment: { select: { id: true, startDate: true } },
        },
      }),
      this.prisma.communication.count({ where }),
    ]);

    return {
      items: items.map((item) => ({
        id: item.id,
        organizationId: item.organizationId,
        patientId: item.patientId,
        appointmentId: item.appointmentId ?? undefined,
        templateId: item.templateId ?? undefined,
        channel: item.channel,
        type: item.type,
        recipient: item.recipient,
        message: item.message,
        status: item.status,
        provider: item.provider ?? undefined,
        providerMessageId: item.providerMessageId ?? undefined,
        errorMessage: item.errorMessage ?? undefined,
        scheduledAt: item.scheduledAt.toISOString(),
        sentAt: item.sentAt?.toISOString() ?? undefined,
        deliveredAt: item.deliveredAt?.toISOString() ?? undefined,
        createdAt: item.createdAt.toISOString(),
        patient: item.patient ? { id: item.patient.id, name: item.patient.name } : undefined,
        appointment: item.appointment ? { id: item.appointment.id, startDate: item.appointment.startDate.toISOString() } : undefined,
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
    const comm = await this.prisma.communication.findFirst({
      where: { id, organizationId },
      include: {
        patient: { select: { id: true, name: true } },
        appointment: { select: { id: true, startDate: true } },
      },
    });

    if (!comm) {
      throw new NotFoundException('Comunicação não encontrada');
    }

    return {
      id: comm.id,
      organizationId: comm.organizationId,
      patientId: comm.patientId,
      appointmentId: comm.appointmentId ?? undefined,
      templateId: comm.templateId ?? undefined,
      channel: comm.channel,
      type: comm.type,
      recipient: comm.recipient,
      message: comm.message,
      status: comm.status,
      provider: comm.provider ?? undefined,
      providerMessageId: comm.providerMessageId ?? undefined,
      errorMessage: comm.errorMessage ?? undefined,
      scheduledAt: comm.scheduledAt.toISOString(),
      sentAt: comm.sentAt?.toISOString() ?? undefined,
      deliveredAt: comm.deliveredAt?.toISOString() ?? undefined,
      createdAt: comm.createdAt.toISOString(),
      patient: comm.patient ? { id: comm.patient.id, name: comm.patient.name } : undefined,
      appointment: comm.appointment ? { id: comm.appointment.id, startDate: comm.appointment.startDate.toISOString() } : undefined,
    };
  }

  async findByPatient(organizationId: string, patientId: string) {
    const items = await this.prisma.communication.findMany({
      where: { organizationId, patientId },
      orderBy: { createdAt: 'desc' },
      take: 50,
      include: {
        patient: { select: { id: true, name: true } },
      },
    });

    return items.map((item) => ({
      id: item.id,
      channel: item.channel,
      type: item.type,
      recipient: item.recipient,
      message: item.message,
      status: item.status,
      createdAt: item.createdAt.toISOString(),
    }));
  }

  async create(organizationId: string, userId: string, data: CreateCommunicationDto) {
    const provider = getProvider(data.channel);
    
    const communication = await this.prisma.communication.create({
      data: {
        organizationId,
        patientId: data.patientId,
        appointmentId: data.appointmentId,
        templateId: data.templateId,
        channel: data.channel,
        type: data.type,
        recipient: data.recipient,
        message: data.message,
        status: 'pending',
        provider: provider.channel,
        scheduledAt: new Date(),
      },
    });

    await this.prisma.communicationAudit.create({
      data: {
        communicationId: communication.id,
        action: 'create',
        performedBy: userId,
      },
    });

    return {
      id: communication.id,
      status: communication.status,
    };
  }

  async send(organizationId: string, userId: string, id: string) {
    const comm = await this.prisma.communication.findFirst({
      where: { id, organizationId },
    });

    if (!comm) {
      throw new NotFoundException('Comunicação não encontrada');
    }

    if (comm.status !== 'pending') {
      return this.findById(organizationId, id);
    }

    const provider = getProvider(comm.channel as any);
    const result = await provider.send({
      to: comm.recipient,
      body: comm.message,
      appointmentId: comm.appointmentId ?? undefined,
    });

    const updated = await this.prisma.communication.update({
      where: { id },
      data: {
        status: result.success ? 'sent' : 'failed',
        providerMessageId: result.providerMessageId,
        errorMessage: result.error,
        sentAt: result.success ? new Date() : undefined,
      },
    });

    await this.prisma.communicationAudit.create({
      data: {
        communicationId: id,
        action: result.success ? 'sent' : 'failed',
        performedBy: userId,
      },
    });

    return {
      id: updated.id,
      status: updated.status,
      providerMessageId: updated.providerMessageId,
    };
  }
}