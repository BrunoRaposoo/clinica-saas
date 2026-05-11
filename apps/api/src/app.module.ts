import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ThrottlerModule } from '@nestjs/throttler';
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
import { DocumentsModule } from './modules/documents/documents.module';
import { TasksModule } from './modules/tasks/tasks.module';
import { FinanceModule } from './modules/finance/finance.module';
import { DashboardModule } from './modules/dashboard/dashboard.module';
import { IntegrationsModule } from './modules/integrations/integrations.module';
import { PrismaModule } from './common/prisma.module';
import { SettingsModule } from './modules/settings/settings.module';
import { SpecialtiesModule } from './modules/specialties/specialties.module';
import { SeedService } from './common/seed.service';
import { MetricsInterceptor } from './common/interceptors/metrics.interceptor';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    ThrottlerModule.forRoot([{
      name: 'short',
      ttl: 60000,
      limit: 100,
    }, {
      name: 'medium',
      ttl: 600000,
      limit: 500,
    }]),
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
    DocumentsModule,
    TasksModule,
    FinanceModule,
    DashboardModule,
    IntegrationsModule,
    SettingsModule,
    SpecialtiesModule,
  ],
  providers: [SeedService, MetricsInterceptor],
})
export class AppModule {}