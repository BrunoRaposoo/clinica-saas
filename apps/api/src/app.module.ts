import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { HealthModule } from './modules/health/health.module';
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { OrganizationsModule } from './modules/organizations/organizations.module';
import { RolesModule } from './modules/roles/roles.module';
import { PatientsModule } from './modules/patients/patients.module';
import { AppointmentsModule } from './modules/appointments/appointments.module';
import { ProfessionalsModule } from './modules/professionals/professionals.module';
import { ScheduleBlocksModule } from './modules/schedule-blocks/schedule-blocks.module';
import { TemplatesModule } from './modules/templates/templates.module';
import { CommunicationsModule } from './modules/communications/communications.module';
import { PrismaModule } from './common/prisma.module';
import { SeedService } from './common/seed.service';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    PrismaModule,
    HealthModule,
    AuthModule,
    UsersModule,
    OrganizationsModule,
    RolesModule,
    PatientsModule,
    AppointmentsModule,
    ProfessionalsModule,
    ScheduleBlocksModule,
    TemplatesModule,
    CommunicationsModule,
  ],
  providers: [SeedService],
})
export class AppModule {}