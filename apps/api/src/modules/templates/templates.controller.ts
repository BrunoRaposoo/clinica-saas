import { Controller, Get, Post, Patch, Delete, Body, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { TemplatesService } from './templates.service';
import { CreateTemplateDto, UpdateTemplateDto, ListTemplatesQueryDto } from './dto/template.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { CurrentOrganization } from '../../common/decorators/current-organization.decorator';

@ApiTags('Templates')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('templates')
export class TemplatesController {
  constructor(private readonly templatesService: TemplatesService) {}

  @Get()
  @ApiOperation({ summary: 'Listar templates' })
  findAll(@Query() query: ListTemplatesQueryDto, @CurrentOrganization() organizationId: string) {
    return this.templatesService.findAll(organizationId, query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Detalhar template' })
  findById(@Param('id') id: string, @CurrentOrganization() organizationId: string) {
    return this.templatesService.findById(organizationId, id);
  }

  @Post()
  @ApiOperation({ summary: 'Criar template' })
  create(
    @CurrentOrganization() organizationId: string,
    @CurrentUser() userId: string,
    @Body() data: CreateTemplateDto,
  ) {
    return this.templatesService.create(organizationId, userId, data);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Atualizar template' })
  update(
    @Param('id') id: string,
    @CurrentOrganization() organizationId: string,
    @CurrentUser() userId: string,
    @Body() data: UpdateTemplateDto,
  ) {
    return this.templatesService.update(organizationId, userId, id, data);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Desativar template' })
  delete(@Param('id') id: string, @CurrentOrganization() organizationId: string, @CurrentUser() userId: string) {
    return this.templatesService.delete(organizationId, userId, id);
  }
}