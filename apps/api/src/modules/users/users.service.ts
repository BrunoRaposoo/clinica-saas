import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../common/prisma.service';
import * as bcrypt from 'bcrypt';
import { CreateUserDto, UpdateUserDto } from './dto/user.dto';
import { DEFAULT_PAGE_SIZE } from '@clinica-saas/shared';

@Injectable()
export class UsersService {
  private readonly BCRYPT_ROUNDS = 12;

  constructor(private readonly prisma: PrismaService) {}

  async findAll(organizationId?: string, page = 1, limit = DEFAULT_PAGE_SIZE, role?: string) {
    const where = organizationId 
      ? { 
          organizationId,
          ...(role && { role: { name: role } }),
        }
      : {};

    const [items, total] = await Promise.all([
      this.prisma.user.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        include: { 
          role: true,
          organization: true,
        },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.user.count({ where }),
    ]);

    return {
      items: items.map(user => ({
        id: user.id,
        email: user.email,
        name: user.name,
        phone: user.phone,
        role: user.role.name,
        roleId: user.roleId,
        organizationId: user.organizationId,
        organizationName: user.organization?.name,
        isActive: user.isActive,
        lastLoginAt: user.lastLoginAt,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      })),
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findOne(id: string, organizationId?: string) {
    const where = organizationId 
      ? { id, organizationId }
      : { id };

    const user = await this.prisma.user.findFirst({
      where,
      include: { 
        role: true,
        organization: true,
      },
    });

    if (!user) {
      throw new NotFoundException('Usuário não encontrado.');
    }

    return {
      id: user.id,
      email: user.email,
      name: user.name,
      roleId: user.roleId,
      roleName: user.role.name,
      organizationId: user.organizationId,
      organizationName: user.organization?.name,
      isActive: user.isActive,
      lastLoginAt: user.lastLoginAt,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  }

  async create(dto: CreateUserDto, creatorOrganizationId?: string) {
    const existingUser = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });

    if (existingUser) {
      throw new BadRequestException('Email já está em uso.');
    }

    const hashedPassword = await bcrypt.hash(dto.password, this.BCRYPT_ROUNDS);

    const roleId = dto.roleId || await this.getDefaultRoleId();

    const user = await this.prisma.user.create({
      data: {
        email: dto.email,
        password: hashedPassword,
        name: dto.name,
        phone: dto.phone || null,
        organizationId: dto.organizationId || creatorOrganizationId,
        roleId,
      },
      include: { 
        role: true,
        organization: true,
      },
    });

    return {
      id: user.id,
      email: user.email,
      name: user.name,
      phone: user.phone,
      role: user.role.name,
      roleId: user.roleId,
      organizationId: user.organizationId,
      organizationName: user.organization?.name,
      isActive: user.isActive,
      createdAt: user.createdAt,
    };
  }

  async update(id: string, dto: UpdateUserDto, organizationId?: string) {
    const where = organizationId 
      ? { id, organizationId }
      : { id };

    const existingUser = await this.prisma.user.findFirst({ where });

    if (!existingUser) {
      throw new NotFoundException('Usuário não encontrado.');
    }

    const user = await this.prisma.user.update({
      where: { id },
      data: {
        name: dto.name,
        organizationId: dto.organizationId,
        roleId: dto.roleId,
        isActive: dto.isActive,
      },
      include: { 
        role: true,
        organization: true,
      },
    });

    return {
      id: user.id,
      email: user.email,
      name: user.name,
      roleId: user.roleId,
      roleName: user.role.name,
      organizationId: user.organizationId,
      organizationName: user.organization?.name,
      isActive: user.isActive,
      updatedAt: user.updatedAt,
    };
  }

  async delete(id: string, organizationId?: string): Promise<{ success: boolean }> {
    const where = organizationId 
      ? { id, organizationId }
      : { id };

    const existingUser = await this.prisma.user.findFirst({ where });

    if (!existingUser) {
      throw new NotFoundException('Usuário não encontrado.');
    }

    await this.prisma.user.update({
      where: { id },
      data: { isActive: false },
    });

    return { success: true };
  }

  private async getDefaultRoleId(): Promise<string> {
    const role = await this.prisma.role.findFirst({
      where: { name: 'support' },
    });
    return role?.id || '00000000-0000-0000-0000-000000000001';
  }
}