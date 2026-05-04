import { Controller, Get, Post, Delete, Body, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentOrganization } from '../../common/decorators/current-organization.decorator';
import { ScheduleBlocksService } from './schedule-blocks.service';

@ApiTags('Schedule Blocks')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('schedule-blocks')
export class ScheduleBlocksController {
  constructor(private readonly scheduleBlocksService: ScheduleBlocksService) {}

  @Get()
  @ApiOperation({ summary: 'Listar bloqueios de agenda' })
  async findAll(
    @CurrentOrganization() organizationId: string,
    @Query('professionalId') professionalId?: string,
  ) {
    return this.scheduleBlocksService.findAll(organizationId, professionalId);
  }

  @Post()
  @ApiOperation({ summary: 'Criar bloqueio de agenda' })
  @ApiResponse({ status: 201, description: 'Bloqueio criado com sucesso' })
  async create(
    @CurrentOrganization() organizationId: string,
    @Body() dto: any,
  ) {
    return this.scheduleBlocksService.create(organizationId, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Remover bloqueio de agenda' })
  @ApiResponse({ status: 200, description: 'Bloqueio removido com sucesso' })
  async delete(
    @CurrentOrganization() organizationId: string,
    @Param('id') id: string,
  ) {
    return this.scheduleBlocksService.delete(organizationId, id);
  }
}