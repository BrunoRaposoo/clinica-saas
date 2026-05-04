import { Controller, Get, Post, Patch, Delete, Body, Param, Query, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { IntegrationsService } from './integrations.service';
import { CreateIntegrationDto, UpdateIntegrationDto, IntegrationQueryDto, IntegrationLogQueryDto } from './dto/integration.dto';

@ApiTags('Integrations')
@Controller('integrations')
@UseGuards(AuthGuard('jwt'))
export class IntegrationsController {
  constructor(private readonly integrationsService: IntegrationsService) {}

  @Get()
  @ApiOperation({ summary: 'Listar integrações' })
  findAll(@Query('organizationId') organizationId: string, @Query() query: IntegrationQueryDto) {
    return this.integrationsService.findAll(organizationId, query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Detalhes da integração' })
  findById(@Param('id') id: string) {
    return this.integrationsService.findById(id);
  }

  @Post()
  @ApiOperation({ summary: 'Criar integração' })
  create(@Query('organizationId') organizationId: string, @Body() dto: CreateIntegrationDto) {
    return this.integrationsService.create(organizationId, dto);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Atualizar integração' })
  update(@Param('id') id: string, @Body() dto: UpdateIntegrationDto) {
    return this.integrationsService.update(id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Remover integração' })
  delete(@Param('id') id: string) {
    return this.integrationsService.delete(id);
  }

  @Get(':id/logs')
  @ApiOperation({ summary: 'Logs da integração' })
  getLogs(@Param('id') id: string, @Query() query: IntegrationLogQueryDto) {
    return this.integrationsService.getLogs(id, query);
  }

  @Get(':id/status')
  @ApiOperation({ summary: 'Status da integração' })
  checkStatus(@Param('id') id: string) {
    return this.integrationsService.checkStatus(id);
  }
}