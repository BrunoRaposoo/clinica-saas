import { Injectable, NotFoundException, BadRequestException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../../common/prisma.service';

@Injectable()
export class ScheduleBlocksService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(organizationId: string, professionalId?: string) {
    const where: any = { organizationId };
    if (professionalId) where.professionalId = professionalId;

    const blocks = await this.prisma.scheduleBlock.findMany({
      where,
      include: { professional: { include: { user: { select: { name: true } } } } },
      orderBy: { startDate: 'asc' },
    });

    return blocks.map((b) => ({
      id: b.id,
      organizationId: b.organizationId,
      professionalId: b.professionalId,
      startDate: b.startDate.toISOString(),
      endDate: b.endDate.toISOString(),
      reason: b.reason,
      createdAt: b.createdAt.toISOString(),
      updatedAt: b.updatedAt.toISOString(),
      professional: { id: b.professional.id, name: b.professional.user.name },
    }));
  }

  async create(organizationId: string, dto: any) {
    const professional = await this.prisma.professional.findFirst({
      where: { id: dto.professionalId, organizationId, isActive: true },
    });
    if (!professional) throw new NotFoundException('Profissional não encontrado.');

    const startDate = new Date(dto.startDate);
    const endDate = new Date(dto.endDate);
    if (startDate >= endDate) throw new BadRequestException('Data de início deve ser anterior à data de fim.');

    const hasConflict = await this.prisma.scheduleBlock.count({
      where: {
        organizationId,
        professionalId: dto.professionalId,
        startDate: { lt: endDate },
        endDate: { gt: startDate },
      },
    });
    if (hasConflict > 0) throw new ConflictException('Já existe um bloqueio neste período.');

    const block = await this.prisma.scheduleBlock.create({
      data: { organizationId, ...dto, startDate, endDate },
      include: { professional: { include: { user: { select: { name: true } } } } },
    });

    return { ...block, startDate: block.startDate.toISOString(), endDate: block.endDate.toISOString(), createdAt: block.createdAt.toISOString(), updatedAt: block.updatedAt.toISOString() };
  }

  async delete(organizationId: string, id: string) {
    const block = await this.prisma.scheduleBlock.findFirst({ where: { id, organizationId } });
    if (!block) throw new NotFoundException('Bloqueio não encontrado.');

    await this.prisma.scheduleBlock.delete({ where: { id } });
    return { success: true };
  }
}