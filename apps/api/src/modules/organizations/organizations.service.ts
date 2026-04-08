import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../common/prisma.service';
import { CreateOrganizationDto, UpdateOrganizationDto } from './dto/organization.dto';
import { DEFAULT_PAGE_SIZE } from '@clinica-saas/shared';

@Injectable()
export class OrganizationsService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(page = 1, limit = DEFAULT_PAGE_SIZE) {
    const [items, total] = await Promise.all([
      this.prisma.organization.findMany({
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.organization.count(),
    ]);

    return {
      items,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    };
  }

  async findOne(id: string) {
    const org = await this.prisma.organization.findUnique({ where: { id } });
    if (!org) throw new NotFoundException('Organização não encontrada.');
    return org;
  }

  async create(dto: CreateOrganizationDto) {
    const existing = await this.prisma.organization.findUnique({ where: { document: dto.document } });
    if (existing) throw new BadRequestException('CNPJ/CPF já cadastrado.');
    return this.prisma.organization.create({ data: dto });
  }

  async update(id: string, dto: UpdateOrganizationDto) {
    const existing = await this.prisma.organization.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException('Organização não encontrada.');
    return this.prisma.organization.update({ where: { id }, data: dto });
  }

  async delete(id: string) {
    const existing = await this.prisma.organization.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException('Organização não encontrada.');
    await this.prisma.organization.update({ where: { id }, data: { isActive: false } });
    return { success: true };
  }
}