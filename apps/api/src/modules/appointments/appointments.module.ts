import { Module } from '@nestjs/common';
import { AppointmentsController } from './appointments.controller';
import { AppointmentsService } from './appointments.service';
import { AppointmentsNotificationsService } from './appointments-notifications.service';
import { PrismaModule } from '../../common/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [AppointmentsController],
  providers: [AppointmentsService, AppointmentsNotificationsService],
  exports: [AppointmentsService, AppointmentsNotificationsService],
})
export class AppointmentsModule {}