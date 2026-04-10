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

  private createQueue(name: string): Queue {
    const options: QueueOptions = {
      connection: this.getConnection(),
      defaultJobOptions: {
        attempts: 3,
        backoff: {
          type: 'exponential',
          delay: 5000,
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