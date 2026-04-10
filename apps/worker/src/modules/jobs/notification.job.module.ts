import { Module } from '@nestjs/common';
import { NotificationQueueModule } from '../queues/notification.queue.module';
import { NotificationJobService } from './notification.job';

@Module({
  imports: [NotificationQueueModule],
  providers: [NotificationJobService],
  exports: [NotificationJobService],
})
export class NotificationJobModule {}