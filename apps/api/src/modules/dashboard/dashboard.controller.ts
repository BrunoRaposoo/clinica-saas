import { Controller, Get, Query, UseGuards, Logger } from '@nestjs/common';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/guards/roles.guard';
import { DashboardService } from './dashboard.service';
import { DashboardPeriodDto, DrillDownQueryDto } from './dto/dashboard.dto';
import { CurrentOrganization } from '../../common/decorators/current-organization.decorator';

@Controller('dashboard')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('super_admin', 'org_admin', 'receptionist', 'professional', 'support')
export class DashboardController {
  private readonly logger = new Logger(DashboardController.name);

  constructor(private readonly dashboardService: DashboardService) {}

  @Get('summary')
  async getSummary(
    @CurrentOrganization() organizationId: string,
    @Query() query: DashboardPeriodDto,
  ) {
    this.logger.log(`[Dashboard] getSummary - orgId: ${organizationId || 'UNDEFINED'}, period: ${query.period}`);
    if (!organizationId) {
      this.logger.error('[Dashboard] organizationId is undefined! Check JWT token payload.');
      throw new Error('Organization ID not found in token. Please login again.');
    }
    return this.dashboardService.getSummary(
      organizationId,
      query.period,
      query.startDate,
      query.endDate,
    );
  }

  @Get('charges')
  async getChargesDrillDown(
    @CurrentOrganization() organizationId: string,
    @Query() query: DrillDownQueryDto,
  ) {
    this.logger.log(`[Dashboard] getChargesDrillDown - orgId: ${organizationId}, period: ${query.period}`);
    return this.dashboardService.getChargesForDrillDown(organizationId, query);
  }

  @Get('appointments')
  async getAppointmentsDrillDown(
    @CurrentOrganization() organizationId: string,
    @Query() query: DrillDownQueryDto,
  ) {
    this.logger.log(`[Dashboard] getAppointmentsDrillDown - orgId: ${organizationId}, period: ${query.period}`);
    return this.dashboardService.getAppointmentsForDrillDown(organizationId, query);
  }

  @Get('patients')
  async getPatientsDrillDown(
    @CurrentOrganization() organizationId: string,
    @Query() query: DrillDownQueryDto,
  ) {
    this.logger.log(`[Dashboard] getPatientsDrillDown - orgId: ${organizationId}, period: ${query.period}`);
    return this.dashboardService.getPatientsForDrillDown(organizationId, query);
  }

  @Get('communications')
  async getCommunicationsDrillDown(
    @CurrentOrganization() organizationId: string,
    @Query() query: DrillDownQueryDto,
  ) {
    this.logger.log(`[Dashboard] getCommunicationsDrillDown - orgId: ${organizationId}, period: ${query.period}`);
    return this.dashboardService.getCommunicationsForDrillDown(organizationId, query);
  }

  @Get('tasks')
  async getTasksDrillDown(
    @CurrentOrganization() organizationId: string,
    @Query() query: DrillDownQueryDto,
  ) {
    this.logger.log(`[Dashboard] getTasksDrillDown - orgId: ${organizationId}, period: ${query.period}`);
    return this.dashboardService.getTasksForDrillDown(organizationId, query);
  }
}