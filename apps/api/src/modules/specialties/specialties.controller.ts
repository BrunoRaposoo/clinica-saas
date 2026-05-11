import { Controller, Get, Post, Patch, Delete, Body, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { SpecialtiesService } from './specialties.service';
import { CreateSpecialtyDto, UpdateSpecialtyDto } from './dto/specialty.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/guards/roles.guard';
import { CurrentOrganization } from '../../common/decorators/current-organization.decorator';

@ApiTags('Specialties')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('specialties')
export class SpecialtiesController {
  constructor(private readonly specialtiesService: SpecialtiesService) {}

  @Get()
  @ApiOperation({ summary: 'Listar especialidades' })
  @ApiQuery({ name: 'category', required: false, enum: ['medical', 'dental', 'psychology', 'nutrition', 'physiotherapy', 'complementary', 'technical', 'admin'] })
  async findAll(
    @CurrentOrganization() organizationId: string,
    @Query('category') category?: string,
  ) {
    return this.specialtiesService.findAll(organizationId, category);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Detalhar especialidade' })
  async findOne(
    @CurrentOrganization() organizationId: string,
    @Param('id') id: string,
  ) {
    return this.specialtiesService.findOne(organizationId, id);
  }

  @Post()
  @Roles('org_admin', 'super_admin')
  @ApiOperation({ summary: 'Criar especialidade' })
  async create(
    @CurrentOrganization() organizationId: string,
    @Body() dto: CreateSpecialtyDto,
  ) {
    return this.specialtiesService.create(organizationId, dto);
  }

  @Patch(':id')
  @Roles('org_admin', 'super_admin')
  @ApiOperation({ summary: 'Atualizar especialidade' })
  async update(
    @CurrentOrganization() organizationId: string,
    @Param('id') id: string,
    @Body() dto: UpdateSpecialtyDto,
  ) {
    return this.specialtiesService.update(organizationId, id, dto);
  }

  @Delete(':id')
  @Roles('org_admin', 'super_admin')
  @ApiOperation({ summary: 'Inativar especialidade' })
  async delete(
    @CurrentOrganization() organizationId: string,
    @Param('id') id: string,
  ) {
    return this.specialtiesService.delete(organizationId, id);
  }
}