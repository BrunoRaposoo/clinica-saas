import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../common/prisma.service';
import { CreateRoleDto, UpdateRoleDto } from './dto/role.dto';
import { DEFAULT_PAGE_SIZE } from '@clinica-saas/shared';

@Injectable()
export class RolesService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(page = 1, limit = DEFAULT_PAGE_SIZE) {
    const [items, total] = await Promise.all([
      this.prisma.role.findMany({
        skip: (page - 1) * limit,
        take: limit,
        include: { permissions: { include: { permission: true } } },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.role.count(),
    ]);

    return {
      items: items.map(role => ({
        id: role.id,
        name: role.name,
        description: role.description,
        isSystem: role.isSystem,
        permissions: role.permissions.map(p => ({ id: p.permission.id, name: p.permission.name })),
        createdAt: role.createdAt,
        updatedAt: role.updatedAt,
      })),
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    };
  }

  async findOne(id: string) {
    const role = await this.prisma.role.findUnique({
      where: { id },
      include: { permissions: { include: { permission: true } } },
    });
    if (!role) throw new NotFoundException('Role não encontrada.');
    return {
      id: role.id,
      name: role.name,
      description: role.description,
      isSystem: role.isSystem,
      permissions: role.permissions.map(p => ({ id: p.permission.id, name: p.permission.name })),
      createdAt: role.createdAt,
      updatedAt: role.updatedAt,
    };
  }

  async create(dto: CreateRoleDto) {
    const existing = await this.prisma.role.findUnique({ where: { name: dto.name } });
    if (existing) throw new BadRequestException('Role já existe.');
    return this.prisma.role.create({ data: dto });
  }

  async update(id: string, dto: UpdateRoleDto) {
    const existing = await this.prisma.role.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException('Role não encontrada.');
    if (existing.isSystem) throw new BadRequestException('Roles do sistema não podem ser alteradas.');
    return this.prisma.role.update({ where: { id }, data: dto });
  }

  async delete(id: string) {
    const existing = await this.prisma.role.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException('Role não encontrada.');
    if (existing.isSystem) throw new BadRequestException('Roles do sistema não podem ser excluídas.');
    await this.prisma.role.delete({ where: { id } });
    return { success: true };
  }

  async assignPermissions(roleId: string, permissionIds: string[]) {
    const role = await this.prisma.role.findUnique({ where: { id: roleId } });
    if (!role) throw new NotFoundException('Role não encontrada.');
    if (role.isSystem) throw new BadRequestException('Roles do sistema não podem ser alteradas.');
    
    await this.prisma.rolePermission.deleteMany({ where: { roleId } });
    await this.prisma.rolePermission.createMany({
      data: permissionIds.map(pid => ({ roleId, permissionId: pid })),
    });
    
    return { success: true };
  }

  async findAllPermissions() {
    return this.prisma.permission.findMany({ orderBy: { name: 'asc' } });
  }
}