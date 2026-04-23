import { Controller, Get, Post, Patch, Delete, Body, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { UsersService } from './users.service';
import { CreateUserDto, UpdateUserDto } from './dto/user.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentOrganization } from '../../common/decorators/current-user.decorator';

@ApiTags('Users')
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Listar usuários' })
  async findAll(
    @CurrentOrganization() organizationId: string,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ) {
    return this.usersService.findAll(organizationId, Number(page) || 1, Number(limit) || 20);
  }

  @Get(':id')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Detalhar usuário' })
  async findOne(
    @Param('id') id: string,
    @CurrentOrganization() organizationId: string,
  ) {
    return this.usersService.findOne(id, organizationId);
  }

  @Post()
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Criar usuário' })
  async create(
    @Body() dto: CreateUserDto,
    @CurrentOrganization() organizationId: string,
  ) {
    console.log('[Users] Recebendo dados para criar usuário:', { email: dto.email, name: dto.name, roleId: dto.roleId });
    return this.usersService.create(dto, organizationId);
  }

  @Patch(':id')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Atualizar usuário' })
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateUserDto,
    @CurrentOrganization() organizationId: string,
  ) {
    return this.usersService.update(id, dto, organizationId);
  }

  @Delete(':id')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Inativar usuário' })
  async delete(
    @Param('id') id: string,
    @CurrentOrganization() organizationId: string,
  ) {
    return this.usersService.delete(id, organizationId);
  }
}