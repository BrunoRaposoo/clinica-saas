import {
  Controller,
  Get,
  Patch,
  Post,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  ParseIntPipe,
  DefaultValuePipe,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentOrganization } from '../../common/decorators/current-organization.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { SettingsService } from './settings.service';
import {
  UpdateOrganizationSettingsDto,
  UnitDto,
  UpdateUnitDto,
  ServiceTypeDto,
  UpdateServiceTypeDto,
  ProfessionalDto,
  UpdateProfessionalSettingsDto,
  SchedulePreferencesDto,
  CommunicationPreferencesDto,
} from './dto/settings.dto';
import { TokenPayload } from '@clinica-saas/contracts';

@ApiTags('Settings')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('settings')
export class SettingsController {
  constructor(private readonly settingsService: SettingsService) {}

  @Get()
  @ApiOperation({ summary: 'Buscar configurações da organização' })
  @ApiResponse({ status: 200, description: 'Configurações retornadas' })
  async getSettings(@CurrentOrganization() organizationId: string) {
    return this.settingsService.getSettings(organizationId);
  }

  @Patch()
  @ApiOperation({ summary: 'Atualizar configurações da organização' })
  @ApiResponse({ status: 200, description: 'Configurações atualizadas' })
  async updateSettings(
    @CurrentOrganization() organizationId: string,
    @Body() dto: UpdateOrganizationSettingsDto,
  ) {
    return this.settingsService.updateSettings(organizationId, dto);
  }

  @Get('units')
  @ApiOperation({ summary: 'Listar unidades' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'isActive', required: false, type: Boolean })
  async getUnits(
    @CurrentOrganization() organizationId: string,
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(20), ParseIntPipe) limit: number,
    @Query('isActive') isActive?: string,
  ) {
    return this.settingsService.getUnits(
      organizationId,
      page,
      limit,
      isActive === 'true' ? true : isActive === 'false' ? false : undefined,
    );
  }

  @Post('units')
  @ApiOperation({ summary: 'Criar unidade' })
  @ApiResponse({ status: 201, description: 'Unidade criada' })
  async createUnit(
    @CurrentOrganization() organizationId: string,
    @Body() dto: UnitDto,
  ) {
    return this.settingsService.createUnit(organizationId, dto);
  }

  @Get('units/:id')
  @ApiOperation({ summary: 'Detalhar unidade' })
  @ApiResponse({ status: 200, description: 'Unidade retornada' })
  async getUnit(
    @Param('id') id: string,
    @CurrentOrganization() organizationId: string,
  ) {
    return this.settingsService.getUnitById(id, organizationId);
  }

  @Patch('units/:id')
  @ApiOperation({ summary: 'Atualizar unidade' })
  @ApiResponse({ status: 200, description: 'Unidade atualizada' })
  async updateUnit(
    @Param('id') id: string,
    @CurrentOrganization() organizationId: string,
    @Body() dto: UpdateUnitDto,
  ) {
    return this.settingsService.updateUnit(id, organizationId, dto);
  }

  @Delete('units/:id')
  @ApiOperation({ summary: 'Desativar unidade' })
  @ApiResponse({ status: 200, description: 'Unidade desativada' })
  async deleteUnit(
    @Param('id') id: string,
    @CurrentOrganization() organizationId: string,
  ) {
    return this.settingsService.deleteUnit(id, organizationId);
  }

  @Get('service-types')
  @ApiOperation({ summary: 'Listar tipos de serviço' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'isActive', required: false, type: Boolean })
  async getServiceTypes(
    @CurrentOrganization() organizationId: string,
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(20), ParseIntPipe) limit: number,
    @Query('isActive') isActive?: string,
  ) {
    return this.settingsService.getServiceTypes(
      organizationId,
      page,
      limit,
      isActive === 'true' ? true : isActive === 'false' ? false : undefined,
    );
  }

  @Post('service-types')
  @ApiOperation({ summary: 'Criar tipo de serviço' })
  @ApiResponse({ status: 201, description: 'Tipo de serviço criado' })
  async createServiceType(
    @CurrentOrganization() organizationId: string,
    @Body() dto: ServiceTypeDto,
  ) {
    return this.settingsService.createServiceType(organizationId, dto);
  }

  @Get('service-types/:id')
  @ApiOperation({ summary: 'Detalhar tipo de serviço' })
  @ApiResponse({ status: 200, description: 'Tipo de serviço retornado' })
  async getServiceType(
    @Param('id') id: string,
    @CurrentOrganization() organizationId: string,
  ) {
    return this.settingsService.getServiceTypeById(id, organizationId);
  }

  @Patch('service-types/:id')
  @ApiOperation({ summary: 'Atualizar tipo de serviço' })
  @ApiResponse({ status: 200, description: 'Tipo de serviço atualizado' })
  async updateServiceType(
    @Param('id') id: string,
    @CurrentOrganization() organizationId: string,
    @Body() dto: UpdateServiceTypeDto,
  ) {
    return this.settingsService.updateServiceType(id, organizationId, dto);
  }

  @Delete('service-types/:id')
  @ApiOperation({ summary: 'Desativar tipo de serviço' })
  @ApiResponse({ status: 200, description: 'Tipo de serviço desativado' })
  async deleteServiceType(
    @Param('id') id: string,
    @CurrentOrganization() organizationId: string,
  ) {
    return this.settingsService.deleteServiceType(id, organizationId);
  }

  @Get('professionals')
  @ApiOperation({ summary: 'Listar profissionais' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'isActive', required: false, type: Boolean })
  async getProfessionals(
    @CurrentOrganization() organizationId: string,
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(20), ParseIntPipe) limit: number,
    @Query('isActive') isActive?: string,
  ) {
    return this.settingsService.getProfessionals(
      organizationId,
      page,
      limit,
      isActive === 'true' ? true : isActive === 'false' ? false : undefined,
    );
  }

  @Post('professionals')
  @ApiOperation({ summary: 'Criar profissional' })
  @ApiResponse({ status: 201, description: 'Profissional criado' })
  async createProfessional(
    @CurrentOrganization() organizationId: string,
    @Body() dto: ProfessionalDto,
  ) {
    return this.settingsService.createProfessional(organizationId, dto);
  }

  @Get('professionals/:id')
  @ApiOperation({ summary: 'Detalhar profissional' })
  @ApiResponse({ status: 200, description: 'Profissional retornado' })
  async getProfessional(
    @Param('id') id: string,
    @CurrentOrganization() organizationId: string,
  ) {
    return this.settingsService.getProfessionalById(id, organizationId);
  }

  @Patch('professionals/:id')
  @ApiOperation({ summary: 'Atualizar profissional' })
  @ApiResponse({ status: 200, description: 'Profissional atualizado' })
  async updateProfessional(
    @Param('id') id: string,
    @CurrentOrganization() organizationId: string,
    @Body() dto: UpdateProfessionalSettingsDto,
  ) {
    return this.settingsService.updateProfessional(id, organizationId, dto);
  }

  @Delete('professionals/:id')
  @ApiOperation({ summary: 'Desativar profissional' })
  @ApiResponse({ status: 200, description: 'Profissional desativado' })
  async deleteProfessional(
    @Param('id') id: string,
    @CurrentOrganization() organizationId: string,
  ) {
    return this.settingsService.deleteProfessional(id, organizationId);
  }

  @Get('schedule-preferences')
  @ApiOperation({ summary: 'Buscar preferências de agenda' })
  @ApiResponse({ status: 200, description: 'Preferências retornadas' })
  async getSchedulePreferences(@CurrentOrganization() organizationId: string) {
    return this.settingsService.getSchedulePreferences(organizationId);
  }

  @Patch('schedule-preferences')
  @ApiOperation({ summary: 'Atualizar preferências de agenda' })
  @ApiResponse({ status: 200, description: 'Preferências atualizadas' })
  async updateSchedulePreferences(
    @CurrentOrganization() organizationId: string,
    @Body() dto: SchedulePreferencesDto,
  ) {
    return this.settingsService.updateSchedulePreferences(organizationId, dto);
  }

  @Get('communication-preferences')
  @ApiOperation({ summary: 'Buscar preferências de comunicação' })
  @ApiResponse({ status: 200, description: 'Preferências retornadas' })
  async getCommunicationPreferences(@CurrentOrganization() organizationId: string) {
    return this.settingsService.getCommunicationPreferences(organizationId);
  }

  @Patch('communication-preferences')
  @ApiOperation({ summary: 'Atualizar preferências de comunicação' })
  @ApiResponse({ status: 200, description: 'Preferências atualizadas' })
  async updateCommunicationPreferences(
    @CurrentOrganization() organizationId: string,
    @Body() dto: CommunicationPreferencesDto,
  ) {
    return this.settingsService.updateCommunicationPreferences(organizationId, dto);
  }
}