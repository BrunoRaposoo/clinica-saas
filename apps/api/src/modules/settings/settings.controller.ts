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
  async getSettings(@CurrentOrganization() organizationId: string) {
    console.log('[Settings] GET / configurações chamadas');
    return this.settingsService.getSettings(organizationId);
  }

  @Patch()
  @ApiOperation({ summary: 'Atualizar configurações da organização' })
  async updateSettings(
    @CurrentOrganization() organizationId: string,
    @Body() dto: UpdateOrganizationSettingsDto,
  ) {
    console.log('[Settings] PATCH / configurações chamadas');
    return this.settingsService.updateSettings(organizationId, dto);
  }

  // ==================== UNITS ====================
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
    console.log('[Settings] GET /units chamada');
    return this.settingsService.getUnits(
      organizationId,
      page,
      limit,
      isActive === 'true' ? true : isActive === 'false' ? false : undefined,
    );
  }

  @Post('units')
  @ApiOperation({ summary: 'Criar unidade' })
  async createUnit(
    @CurrentOrganization() organizationId: string,
    @Body() dto: UnitDto,
  ) {
    console.log('[Settings] POST /units chamada');
    return this.settingsService.createUnit(organizationId, dto);
  }

  @Get('units/:id')
  @ApiOperation({ summary: 'Detalhar unidade' })
  async getUnit(
    @Param('id') id: string,
    @CurrentOrganization() organizationId: string,
  ) {
    console.log('[Settings] GET /units/:id chamada', id);
    return this.settingsService.getUnitById(id, organizationId);
  }

  @Patch('units/:id')
  @ApiOperation({ summary: 'Atualizar unidade' })
  async updateUnit(
    @Param('id') id: string,
    @CurrentOrganization() organizationId: string,
    @Body() dto: UpdateUnitDto,
  ) {
    console.log('[Settings] PATCH /units/:id chamada', id);
    return this.settingsService.updateUnit(id, organizationId, dto);
  }

  @Delete('units/:id')
  @ApiOperation({ summary: 'Desativar unidade' })
  async deleteUnit(
    @Param('id') id: string,
    @CurrentOrganization() organizationId: string,
  ) {
    console.log('[Settings] DELETE /units/:id chamada', id);
    return this.settingsService.deleteUnit(id, organizationId);
  }

  // ==================== SERVICE TYPES (geral ANTES de /:id) ====================
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
    console.log('[Settings] GET /service-types chamada - organizationId:', organizationId);
    return this.settingsService.getServiceTypes(
      organizationId,
      page,
      limit,
      isActive === 'true' ? true : isActive === 'false' ? false : undefined,
    );
  }

  @Post('service-types')
  @ApiOperation({ summary: 'Criar tipo de serviço' })
  async createServiceType(
    @CurrentOrganization() organizationId: string,
    @Body() dto: ServiceTypeDto,
  ) {
    console.log('[Settings] POST /service-types chamada');
    return this.settingsService.createServiceType(organizationId, dto);
  }

  @Get('service-types/:id')
  @ApiOperation({ summary: 'Detalhar tipo de serviço' })
  async getServiceType(
    @Param('id') id: string,
    @CurrentOrganization() organizationId: string,
  ) {
    console.log('[Settings] GET /service-types/:id chamada', id);
    return this.settingsService.getServiceTypeById(id, organizationId);
  }

  @Patch('service-types/:id')
  @ApiOperation({ summary: 'Atualizar tipo de serviço' })
  async updateServiceType(
    @Param('id') id: string,
    @CurrentOrganization() organizationId: string,
    @Body() dto: UpdateServiceTypeDto,
  ) {
    console.log('[Settings] PATCH /service-types/:id chamada', id);
    return this.settingsService.updateServiceType(id, organizationId, dto);
  }

  @Delete('service-types/:id')
  @ApiOperation({ summary: 'Desativar tipo de serviço' })
  async deleteServiceType(
    @Param('id') id: string,
    @CurrentOrganization() organizationId: string,
  ) {
    console.log('[Settings] DELETE /service-types/:id chamada', id);
    return this.settingsService.deleteServiceType(id, organizationId);
  }

  // ==================== PROFESSIONALS (geral ANTES de /:id) ====================
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
    console.log('[Settings] GET /professionals chamada - organizationId:', organizationId);
    return this.settingsService.getProfessionals(
      organizationId,
      page,
      limit,
      isActive === 'true' ? true : isActive === 'false' ? false : undefined,
    );
  }

  @Post('professionals')
  @ApiOperation({ summary: 'Criar profissional' })
  async createProfessional(
    @CurrentOrganization() organizationId: string,
    @Body() dto: ProfessionalDto,
  ) {
    console.log('[Settings] POST /professionals chamada - organizationId:', organizationId, 'dto:', dto);
    return this.settingsService.createProfessional(organizationId, dto);
  }

  @Get('professionals/:id')
  @ApiOperation({ summary: 'Detalhar profissional' })
  async getProfessional(
    @Param('id') id: string,
    @CurrentOrganization() organizationId: string,
  ) {
    console.log('[Settings] GET /professionals/:id chamada', id);
    return this.settingsService.getProfessionalById(id, organizationId);
  }

  @Patch('professionals/:id')
  @ApiOperation({ summary: 'Atualizar profissional' })
  async updateProfessional(
    @Param('id') id: string,
    @CurrentOrganization() organizationId: string,
    @Body() dto: UpdateProfessionalSettingsDto,
  ) {
    console.log('[Settings] PATCH /professionals/:id chamada', id);
    return this.settingsService.updateProfessional(id, organizationId, dto);
  }

  @Delete('professionals/:id')
  @ApiOperation({ summary: 'Desativar profissional' })
  async deleteProfessional(
    @Param('id') id: string,
    @CurrentOrganization() organizationId: string,
  ) {
    console.log('[Settings] DELETE /professionals/:id chamada', id);
    return this.settingsService.deleteProfessional(id, organizationId);
  }

  // ==================== SCHEDULE PREFERENCES ====================
  @Get('schedule-preferences')
  @ApiOperation({ summary: 'Buscar preferências de agenda' })
  async getSchedulePreferences(@CurrentOrganization() organizationId: string) {
    console.log('[Settings] GET /schedule-preferences chamada');
    return this.settingsService.getSchedulePreferences(organizationId);
  }

  @Patch('schedule-preferences')
  @ApiOperation({ summary: 'Atualizar preferências de agenda' })
  async updateSchedulePreferences(
    @CurrentOrganization() organizationId: string,
    @Body() dto: SchedulePreferencesDto,
  ) {
    console.log('[Settings] PATCH /schedule-preferences chamada');
    return this.settingsService.updateSchedulePreferences(organizationId, dto);
  }

  // ==================== COMMUNICATION PREFERENCES ====================
  @Get('communication-preferences')
  @ApiOperation({ summary: 'Buscar preferências de comunicação' })
  async getCommunicationPreferences(@CurrentOrganization() organizationId: string) {
    console.log('[Settings] GET /communication-preferences chamada');
    return this.settingsService.getCommunicationPreferences(organizationId);
  }

  @Patch('communication-preferences')
  @ApiOperation({ summary: 'Atualizar preferências de comunicação' })
  async updateCommunicationPreferences(
    @CurrentOrganization() organizationId: string,
    @Body() dto: CommunicationPreferencesDto,
  ) {
    console.log('[Settings] PATCH /communication-preferences chamada');
    return this.settingsService.updateCommunicationPreferences(organizationId, dto);
  }
}