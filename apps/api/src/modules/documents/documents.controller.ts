import { Controller, Get, Post, Body, Param, Query, UseGuards, Patch, Delete } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { DocumentsService, ListDocumentsQueryDto, CreateDocumentDto, UpdateDocumentDto } from './documents.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/guards/roles.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { CurrentOrganization } from '../../common/decorators/current-organization.decorator';

@ApiTags('Documents')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('super_admin', 'org_admin', 'receptionist', 'professional')
@Controller('documents')
export class DocumentsController {
  constructor(private readonly documentsService: DocumentsService) {}

  @Get()
  @ApiOperation({ summary: 'Listar documentos' })
  findAll(@Query() query: ListDocumentsQueryDto, @CurrentOrganization() organizationId: string) {
    return this.documentsService.findAll(organizationId, query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Detalhar documento' })
  findById(@Param('id') id: string, @CurrentOrganization() organizationId: string) {
    return this.documentsService.findById(organizationId, id);
  }

  @Get('patient/:patientId')
  @ApiOperation({ summary: 'Documentos do paciente' })
  findByPatient(@Param('patientId') patientId: string, @CurrentOrganization() organizationId: string) {
    return this.documentsService.findByPatient(organizationId, patientId);
  }

  @Get('appointment/:appointmentId')
  @ApiOperation({ summary: 'Documentos do agendamento' })
  findByAppointment(@Param('appointmentId') appointmentId: string, @CurrentOrganization() organizationId: string) {
    return this.documentsService.findByAppointment(organizationId, appointmentId);
  }

  @Post()
  @ApiOperation({ summary: 'Criar documento' })
  create(
    @CurrentOrganization() organizationId: string,
    @CurrentUser() userId: string,
    @Body() data: CreateDocumentDto,
  ) {
    return this.documentsService.create(organizationId, userId, data);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Atualizar documento' })
  update(
    @Param('id') id: string,
    @CurrentOrganization() organizationId: string,
    @CurrentUser() userId: string,
    @Body() data: UpdateDocumentDto,
  ) {
    return this.documentsService.update(organizationId, userId, id, data);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Excluir documento' })
  delete(
    @Param('id') id: string,
    @CurrentOrganization() organizationId: string,
    @CurrentUser() userId: string,
  ) {
    return this.documentsService.delete(organizationId, userId, id);
  }
}