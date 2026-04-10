import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentOrganization } from '../../common/decorators/current-organization.decorator';
import { ProfessionalsService } from './professionals.service';

@ApiTags('Professionals')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('professionals')
export class ProfessionalsController {
  constructor(private readonly professionalsService: ProfessionalsService) {}

  @Get()
  @ApiOperation({ summary: 'Listar profissionais' })
  async findAll(@CurrentOrganization() organizationId: string) {
    return this.professionalsService.findAll(organizationId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Detalhar profissional' })
  @ApiResponse({ status: 404, description: 'Profissional não encontrado' })
  async findOne(
    @CurrentOrganization() organizationId: string,
    @Param('id') id: string,
  ) {
    return this.professionalsService.findOne(organizationId, id);
  }
}