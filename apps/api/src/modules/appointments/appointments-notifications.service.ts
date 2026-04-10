import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../common/prisma.service';

export interface NotificationData {
  appointmentId: string;
  organizationId: string;
  type: 'CONFIRMATION' | 'REMINDER' | 'CANCELLATION';
  scheduledFor: Date;
}

@Injectable()
export class AppointmentsNotificationsService {
  private readonly logger = new Logger(AppointmentsNotificationsService.name);

  constructor(private readonly prisma: PrismaService) {}

  async scheduleConfirmation(appointmentId: string, organizationId: string, scheduledFor: Date = new Date()) {
    await this.prisma.messageJob.create({
      data: {
        organizationId,
        appointmentId,
        type: 'CONFIRMATION',
        scheduledFor,
        status: 'pending',
        retryCount: 0,
      },
    });

    this.logger.log(`Scheduled confirmation for appointment ${appointmentId}`);
  }

  async scheduleReminder(appointmentId: string, organizationId: string, scheduledFor: Date) {
    await this.prisma.messageJob.create({
      data: {
        organizationId,
        appointmentId,
        type: 'REMINDER',
        scheduledFor,
        status: 'pending',
        retryCount: 0,
      },
    });

    this.logger.log(`Scheduled reminder for appointment ${appointmentId} at ${scheduledFor.toISOString()}`);
  }

  async scheduleCancellation(appointmentId: string, organizationId: string, scheduledFor: Date = new Date()) {
    await this.prisma.messageJob.create({
      data: {
        organizationId,
        appointmentId,
        type: 'CANCELLATION',
        scheduledFor,
        status: 'pending',
        retryCount: 0,
      },
    });

    this.logger.log(`Scheduled cancellation notification for appointment ${appointmentId}`);
  }

  async getDueJobs(organizationId: string, limit: number = 100) {
    return this.prisma.messageJob.findMany({
      where: {
        organizationId,
        status: 'pending',
        scheduledFor: { lte: new Date() },
      },
      take: limit,
      orderBy: { scheduledFor: 'asc' },
    });
  }

  async markCompleted(id: string) {
    return this.prisma.messageJob.update({
      where: { id },
      data: { status: 'completed', processedAt: new Date() },
    });
  }

  async markFailed(id: string, error: string) {
    return this.prisma.messageJob.update({
      where: { id },
      data: { status: 'failed', lastError: error, processedAt: new Date() },
    });
  }

  async incrementRetry(id: string) {
    const job = await this.prisma.messageJob.findUnique({ where: { id } });
    if (!job) return;

    const newRetryCount = job.retryCount + 1;
    if (newRetryCount >= 3) {
      await this.prisma.messageJob.update({
        where: { id },
        data: { status: 'failed', retryCount: newRetryCount, processedAt: new Date() },
      });
    } else {
      await this.prisma.messageJob.update({
        where: { id },
        data: { status: 'pending', retryCount: newRetryCount },
      });
    }
  }
}