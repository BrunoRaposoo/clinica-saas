import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  Queue,
  QueueOptions,
  WorkerOptions,
} from 'bullmq';

export const QUEUE_NAMES = {
  REMINDER: 'notification:reminder',
  CONFIRMATION: 'notification:confirmation',
  CANCELLATION: 'notification:cancellation',
  EMAIL: 'integration:email',
  WHATSAPP: 'integration:whatsapp',
  AUTOMATION: 'automation:trigger',
} as const;

@Injectable()
export class NotificationQueueService {
  private readonly queues: Map<string, Queue> = new Map();

  constructor(private readonly configService: ConfigService) {}

  getReminderQueue(): Queue {
    if (!this.queues.has(QUEUE_NAMES.REMINDER)) {
      this.queues.set(
        QUEUE_NAMES.REMINDER,
        this.createQueue(QUEUE_NAMES.REMINDER),
      );
    }
    return this.queues.get(QUEUE_NAMES.REMINDER)!;
  }

  getConfirmationQueue(): Queue {
    if (!this.queues.has(QUEUE_NAMES.CONFIRMATION)) {
      this.queues.set(
        QUEUE_NAMES.CONFIRMATION,
        this.createQueue(QUEUE_NAMES.CONFIRMATION),
      );
    }
    return this.queues.get(QUEUE_NAMES.CONFIRMATION)!;
  }

  getCancellationQueue(): Queue {
    if (!this.queues.has(QUEUE_NAMES.CANCELLATION)) {
      this.queues.set(
        QUEUE_NAMES.CANCELLATION,
        this.createQueue(QUEUE_NAMES.CANCELLATION),
      );
    }
    return this.queues.get(QUEUE_NAMES.CANCELLATION)!;
  }

  getEmailQueue(): Queue {
    if (!this.queues.has(QUEUE_NAMES.EMAIL)) {
      this.queues.set(
        QUEUE_NAMES.EMAIL,
        this.createQueue(QUEUE_NAMES.EMAIL),
      );
    }
    return this.queues.get(QUEUE_NAMES.EMAIL)!;
  }

  getWhatsAppQueue(): Queue {
    if (!this.queues.has(QUEUE_NAMES.WHATSAPP)) {
      this.queues.set(
        QUEUE_NAMES.WHATSAPP,
        this.createQueue(QUEUE_NAMES.WHATSAPP),
      );
    }
    return this.queues.get(QUEUE_NAMES.WHATSAPP)!;
  }

  getAutomationQueue(): Queue {
    if (!this.queues.has(QUEUE_NAMES.AUTOMATION)) {
      this.queues.set(
        QUEUE_NAMES.AUTOMATION,
        this.createQueue(QUEUE_NAMES.AUTOMATION, { attempts: 2, backoff: { type: 'exponential', delay: 2000 } }),
      );
    }
    return this.queues.get(QUEUE_NAMES.AUTOMATION)!;
  }

  private createQueue(name: string, jobOptions?: { attempts: number; backoff: { type: string; delay: number } }): Queue {
    const options: QueueOptions = {
      connection: this.getConnection(),
      defaultJobOptions: {
        attempts: jobOptions?.attempts ?? 3,
        backoff: {
          type: jobOptions?.backoff.type ?? 'exponential',
          delay: jobOptions?.backoff.delay ?? 5000,
        },
        removeOnComplete: {
          count: 1000,
        },
        removeOnFail: {
          count: 5000,
        },
      },
    };

    return new Queue(name, options);
  }

  private getConnection() {
    const host = this.configService.get<string>('REDIS_HOST', 'localhost');
    const port = this.configService.get<number>('REDIS_PORT', 6379);

    return {
      host,
      port,
    };
  }

  async closeAll(): Promise<void> {
    for (const queue of this.queues.values()) {
      await queue.close();
    }
    this.queues.clear();
  }
}