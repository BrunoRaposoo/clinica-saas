import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../common/prisma.service';
import { CreateSpecialtyDto, UpdateSpecialtyDto } from './dto/specialty.dto';

@Injectable()
export class SpecialtiesService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(organizationId: string, category?: string) {
    const where = {
      organizationId,
      ...(category && { category }),
    };

    const items = await this.prisma.specialty.findMany({
      where,
      orderBy: { name: 'asc' },
    });

    return { items };
  }

  async findOne(organizationId: string, id: string) {
    const specialty = await this.prisma.specialty.findFirst({
      where: { id, organizationId },
    });

    if (!specialty) {
      throw new NotFoundException('Especialidade não encontrada');
    }

    return specialty;
  }

  async create(organizationId: string, dto: CreateSpecialtyDto) {
    return this.prisma.specialty.create({
      data: {
        organizationId,
        category: dto.category,
        name: dto.name,
        isActive: true,
      },
    });
  }

  async update(organizationId: string, id: string, dto: UpdateSpecialtyDto) {
    await this.findOne(organizationId, id);

    return this.prisma.specialty.update({
      where: { id },
      data: {
        ...(dto.category && { category: dto.category }),
        ...(dto.name && { name: dto.name }),
        ...(dto.isActive !== undefined && { isActive: dto.isActive }),
      },
    });
  }

  async delete(organizationId: string, id: string) {
    await this.findOne(organizationId, id);

    return this.prisma.specialty.update({
      where: { id },
      data: { isActive: false },
    });
  }
}