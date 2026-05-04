import { Module, OnModuleInit } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { NotificationQueueModule } from './modules/queues/notification.queue.module';
import { NotificationJobModule } from './modules/jobs/notification.job.module';
import { ReminderProcessor } from './modules/processors/reminder.processor';
import { ConfirmationProcessor } from './modules/processors/confirmation.processor';
import { CancellationProcessor } from './modules/processors/cancellation.processor';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    NotificationQueueModule,
    NotificationJobModule,
  ],
  providers: [
    ReminderProcessor,
    ConfirmationProcessor,
    CancellationProcessor,
  ],
})
export class AppModule {}