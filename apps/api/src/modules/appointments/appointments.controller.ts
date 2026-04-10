import { Controller, Get, Post, Patch, Delete, Body, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { CurrentOrganization } from '../../common/decorators/current-organization.decorator';
import { AppointmentsService } from './appointments.service';
import { CreateAppointmentDto, UpdateAppointmentDto, CancelAppointmentDto, RescheduleAppointmentDto, ListAppointmentsQueryDto, CalendarQueryDto, AvailabilityQueryDto } from './dto/appointment.dto';
import { TokenPayload } from '@clinica-saas/contracts';

@ApiTags('Appointments')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('appointments')
export class AppointmentsController {
  constructor(private readonly appointmentsService: AppointmentsService) {}

  @Get()
  @ApiOperation({ summary: 'Listar agendamentos' })
  async findAll(
    @CurrentOrganization() organizationId: string,
    @Query() query: ListAppointmentsQueryDto,
  ) {
    return this.appointmentsService.findAll(organizationId, query);
  }

  @Get('calendar')
  @ApiOperation({ summary: 'Calendário de agendamentos' })
  async getCalendar(
    @CurrentOrganization() organizationId: string,
    @Query() query: CalendarQueryDto,
  ) {
    return this.appointmentsService.getCalendar(organizationId, query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Detalhar agendamento' })
  @ApiResponse({ status: 404, description: 'Agendamento não encontrado' })
  async findOne(
    @CurrentOrganization() organizationId: string,
    @Param('id') id: string,
  ) {
    return this.appointmentsService.findOne(organizationId, id);
  }

  @Post()
  @ApiOperation({ summary: 'Criar agendamento' })
  @ApiResponse({ status: 201, description: 'Agendamento criado com sucesso' })
  async create(
    @CurrentOrganization() organizationId: string,
    @CurrentUser() user: TokenPayload,
    @Body() dto: CreateAppointmentDto,
  ) {
    return this.appointmentsService.create(organizationId, user.sub, dto);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Atualizar agendamento' })
  @ApiResponse({ status: 200, description: 'Agendamento atualizado com sucesso' })
  async update(
    @CurrentOrganization() organizationId: string,
    @CurrentUser() user: TokenPayload,
    @Param('id') id: string,
    @Body() dto: UpdateAppointmentDto,
  ) {
    return this.appointmentsService.update(organizationId, user.sub, id, dto);
  }

  @Patch(':id/cancel')
  @ApiOperation({ summary: 'Cancelar agendamento' })
  @ApiResponse({ status: 200, description: 'Agendamento cancelado com sucesso' })
  async cancel(
    @CurrentOrganization() organizationId: string,
    @CurrentUser() user: TokenPayload,
    @Param('id') id: string,
    @Body() dto: CancelAppointmentDto,
  ) {
    return this.appointmentsService.cancel(organizationId, user.sub, id, dto);
  }

  @Patch(':id/reschedule')
  @ApiOperation({ summary: 'Reagendar agendamento' })
  @ApiResponse({ status: 200, description: 'Agendamento reagendado com sucesso' })
  async reschedule(
    @CurrentOrganization() organizationId: string,
    @CurrentUser() user: TokenPayload,
    @Param('id') id: string,
    @Body() dto: RescheduleAppointmentDto,
  ) {
    return this.appointmentsService.reschedule(organizationId, user.sub, id, dto);
  }

  @Get(':id/availability')
  @ApiOperation({ summary: 'Verificar disponibilidade' })
  async getAvailability(
    @CurrentOrganization() organizationId: string,
    @Param('id') id: string,
    @Query() query: AvailabilityQueryDto,
  ) {
    return this.appointmentsService.getAvailability(organizationId, { ...query, professionalId: id });
  }
}