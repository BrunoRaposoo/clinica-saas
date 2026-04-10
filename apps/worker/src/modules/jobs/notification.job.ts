import { Injectable, Logger } from '@nestjs/common';
import { Queue } from 'bullmq';
import { NotificationQueueService } from '../queues/notification.queue';

export interface JobOptions {
  delay?: number;
  priority?: number;
  attempts?: number;
  backoff?: {
    type: 'exponential' | 'fixed';
    delay: number;
  };
}

@Injectable()
export class NotificationJobService {
  private readonly logger = new Logger(NotificationJobService.name);

  constructor(private readonly queueService: NotificationQueueService) {}

  async enqueueReminder(data: {
    appointmentId: string;
    patientId: string;
    organizationId: string;
    channel: 'WHATSAPP' | 'EMAIL' | 'SMS';
    templateId?: string;
  }, options?: JobOptions): Promise<string> {
    const queue = this.queueService.getReminderQueue();
    const job = await queue.add('reminder', data, {
      delay: options?.delay,
      priority: options?.priority,
    });

    this.logger.log(`Enqueued reminder job ${job.id} for appointment ${data.appointmentId}`);
    return job.id!;
  }

  async enqueueConfirmation(data: {
    appointmentId: string;
    patientId: string;
    organizationId: string;
    channel: 'WHATSAPP' | 'EMAIL' | 'SMS';
    templateId?: string;
  }): Promise<string> {
    const queue = this.queueService.getConfirmationQueue();
    const job = await queue.add('confirmation', data);

    this.logger.log(`Enqueued confirmation job ${job.id} for appointment ${data.appointmentId}`);
    return job.id!;
  }

  async enqueueCancellation(data: {
    appointmentId: string;
    patientId: string;
    organizationId: string;
    channel: 'WHATSAPP' | 'EMAIL' | 'SMS';
    templateId?: string;
    reason?: string;
  }): Promise<string> {
    const queue = this.queueService.getCancellationQueue();
    const job = await queue.add('cancellation', data);

    this.logger.log(`Enqueued cancellation job ${job.id} for appointment ${data.appointmentId}`);
    return job.id!;
  }

  async scheduleReminder24h(data: {
    appointmentId: string;
    patientId: string;
    organizationId: string;
    channel: 'WHATSAPP' | 'EMAIL' | 'SMS';
    templateId?: string;
  }): Promise<string> {
    const delay = 24 * 60 * 60 * 1000;
    return this.enqueueReminder(data, { delay });
  }
}