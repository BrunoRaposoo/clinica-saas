import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { DashboardService } from './dashboard.service';
import { DashboardPeriodDto, DrillDownQueryDto } from './dto/dashboard.dto';

@Controller('dashboard')
@UseGuards(AuthGuard('jwt'))
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get('summary')
  async getSummary(
    @Query() query: DashboardPeriodDto & { organizationId: string },
  ) {
    return this.dashboardService.getSummary(
      query.organizationId,
      query.period,
      query.startDate,
      query.endDate,
    );
  }

  @Get('charges')
  async getChargesDrillDown(
    @Query() query: DrillDownQueryDto & { organizationId: string },
  ) {
    return this.dashboardService.getChargesForDrillDown(query.organizationId, query);
  }

  @Get('appointments')
  async getAppointmentsDrillDown(
    @Query() query: DrillDownQueryDto & { organizationId: string },
  ) {
    return this.dashboardService.getAppointmentsForDrillDown(query.organizationId, query);
  }

  @Get('patients')
  async getPatientsDrillDown(
    @Query() query: DrillDownQueryDto & { organizationId: string },
  ) {
    return this.dashboardService.getPatientsForDrillDown(query.organizationId, query);
  }

  @Get('communications')
  async getCommunicationsDrillDown(
    @Query() query: DrillDownQueryDto & { organizationId: string },
  ) {
    return this.dashboardService.getCommunicationsForDrillDown(query.organizationId, query);
  }

  @Get('tasks')
  async getTasksDrillDown(
    @Query() query: DrillDownQueryDto & { organizationId: string },
  ) {
    return this.dashboardService.getTasksForDrillDown(query.organizationId, query);
  }
}