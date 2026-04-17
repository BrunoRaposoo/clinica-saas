import { Controller, Get, Post, Patch, Delete, Body, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { CurrentOrganization } from '../../common/decorators/current-organization.decorator';
import { PatientsService } from './patients.service';
import { CreatePatientDto, UpdatePatientDto, PatientContactCreateDto, PatientContactUpdateDto, ListPatientsQueryDto } from './dto/patient.dto';
import { TokenPayload } from '@clinica-saas/contracts';

@ApiTags('Patients')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('patients')
export class PatientsController {
  constructor(private readonly patientsService: PatientsService) {}

  @Get()
  @ApiOperation({ summary: 'Listar pacientes' })
  @ApiResponse({ status: 200, description: 'Lista de pacientes retornada com sucesso' })
  async findAll(
    @CurrentOrganization() organizationId: string,
    @Query() query: ListPatientsQueryDto,
  ) {
    return this.patientsService.findAll(organizationId, query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Detalhar paciente' })
  @ApiResponse({ status: 200, description: 'Paciente retornado com sucesso' })
  @ApiResponse({ status: 404, description: 'Paciente não encontrado' })
  async findOne(
    @CurrentOrganization() organizationId: string,
    @Param('id') id: string,
  ) {
    return this.patientsService.findOne(organizationId, id);
  }

  @Post()
  @ApiOperation({ summary: 'Criar paciente' })
  @ApiResponse({ status: 201, description: 'Paciente criado com sucesso' })
  async create(
    @CurrentOrganization() organizationId: string,
    @CurrentUser() user: TokenPayload,
    @Body() dto: CreatePatientDto,
  ) {
    console.log('[Patients] Recebido payload:', {
      name: dto.name,
      phone: dto.phone,
      zipCode: dto.addressZipCode,
      contacts: dto.contacts?.map(c => ({ name: c.name, phone: c.phone })),
    });
    return this.patientsService.create(organizationId, user.sub, dto);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Atualizar paciente' })
  @ApiResponse({ status: 200, description: 'Paciente atualizado com sucesso' })
  @ApiResponse({ status: 404, description: 'Paciente não encontrado' })
  async update(
    @CurrentOrganization() organizationId: string,
    @CurrentUser() user: TokenPayload,
    @Param('id') id: string,
    @Body() dto: UpdatePatientDto,
  ) {
    return this.patientsService.update(organizationId, user.sub, id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Excluir paciente (soft delete)' })
  @ApiResponse({ status: 200, description: 'Paciente excluído com sucesso' })
  @ApiResponse({ status: 404, description: 'Paciente não encontrado' })
  async delete(
    @CurrentOrganization() organizationId: string,
    @CurrentUser() user: TokenPayload,
    @Param('id') id: string,
  ) {
    return this.patientsService.delete(organizationId, user.sub, id);
  }

  @Get(':id/contacts')
  @ApiOperation({ summary: 'Listar contatos do paciente' })
  @ApiResponse({ status: 200, description: 'Contatos retornados com sucesso' })
  async getContacts(
    @CurrentOrganization() organizationId: string,
    @Param('id') patientId: string,
  ) {
    return this.patientsService.getContacts(organizationId, patientId);
  }

  @Post(':id/contacts')
  @ApiOperation({ summary: 'Criar contato do paciente' })
  @ApiResponse({ status: 201, description: 'Contato criado com sucesso' })
  async createContact(
    @CurrentOrganization() organizationId: string,
    @Param('id') patientId: string,
    @Body() dto: PatientContactCreateDto,
  ) {
    return this.patientsService.createContact(organizationId, patientId, dto);
  }

  @Patch('contacts/:contactId')
  @ApiOperation({ summary: 'Atualizar contato' })
  @ApiResponse({ status: 200, description: 'Contato atualizado com sucesso' })
  async updateContact(
    @CurrentOrganization() organizationId: string,
    @Param('contactId') contactId: string,
    @Body() dto: PatientContactUpdateDto,
  ) {
    return this.patientsService.updateContact(organizationId, contactId, dto);
  }

  @Delete('contacts/:contactId')
  @ApiOperation({ summary: 'Excluir contato' })
  @ApiResponse({ status: 200, description: 'Contato excluído com sucesso' })
  async deleteContact(
    @CurrentOrganization() organizationId: string,
    @Param('contactId') contactId: string,
  ) {
    return this.patientsService.deleteContact(organizationId, contactId);
  }

  @Get(':id/audit')
  @ApiOperation({ summary: 'Ver histórico de alterações' })
  @ApiResponse({ status: 200, description: 'Histórico retornado com sucesso' })
  async getAudit(
    @CurrentOrganization() organizationId: string,
    @Param('id') patientId: string,
  ) {
    return this.patientsService.getAudit(organizationId, patientId);
  }
}