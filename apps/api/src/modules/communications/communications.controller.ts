import { Controller, Get, Post, Body, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { CommunicationsService } from './communications.service';
import { CreateCommunicationDto, ListCommunicationsQueryDto } from './dto/communication.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { CurrentOrganization } from '../../common/decorators/current-organization.decorator';

@ApiTags('Communications')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('communications')
export class CommunicationsController {
  constructor(private readonly communicationsService: CommunicationsService) {}

  @Get()
  @ApiOperation({ summary: 'Listar comunicações' })
  findAll(@Query() query: ListCommunicationsQueryDto, @CurrentOrganization() organizationId: string) {
    return this.communicationsService.findAll(organizationId, query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Detalhar comunicação' })
  findById(@Param('id') id: string, @CurrentOrganization() organizationId: string) {
    return this.communicationsService.findById(organizationId, id);
  }

  @Get('patient/:patientId')
  @ApiOperation({ summary: 'Histórico do paciente' })
  findByPatient(@Param('patientId') patientId: string, @CurrentOrganization() organizationId: string) {
    return this.communicationsService.findByPatient(organizationId, patientId);
  }

  @Get('appointment/:appointmentId')
  @ApiOperation({ summary: 'Comunicações do agendamento' })
  findByAppointment(@Param('appointmentId') appointmentId: string, @CurrentOrganization() organizationId: string) {
    return this.communicationsService.findByAppointment(organizationId, appointmentId);
  }

  @Post()
  @ApiOperation({ summary: 'Criar comunicação' })
  create(
    @CurrentOrganization() organizationId: string,
    @CurrentUser() userId: string,
    @Body() data: CreateCommunicationDto,
  ) {
    return this.communicationsService.create(organizationId, userId, data);
  }

  @Post(':id/send')
  @ApiOperation({ summary: 'Enviar comunicação' })
  send(
    @Param('id') id: string,
    @CurrentOrganization() organizationId: string,
    @CurrentUser() userId: string,
  ) {
    return this.communicationsService.send(organizationId, userId, id);
  }
}