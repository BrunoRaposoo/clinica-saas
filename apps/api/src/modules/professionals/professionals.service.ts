import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../common/prisma.service';

@Injectable()
export class ProfessionalsService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(organizationId: string) {
    const professionals = await this.prisma.professional.findMany({
      where: { organizationId, isActive: true },
      include: {
        user: { select: { id: true, name: true, email: true } },
        appointmentType: true,
      },
      orderBy: { user: { name: 'asc' } },
    });

    return professionals.map((p) => ({
      id: p.id,
      userId: p.userId,
      organizationId: p.organizationId,
      specialty: p.specialty,
      appointmentTypeId: p.appointmentTypeId,
      color: p.color,
      isActive: p.isActive,
      createdAt: p.createdAt.toISOString(),
      updatedAt: p.updatedAt.toISOString(),
      user: { id: p.user.id, name: p.user.name, email: p.user.email },
      appointmentType: p.appointmentType ? {
        id: p.appointmentType.id,
        name: p.appointmentType.name,
        duration: p.appointmentType.duration,
      } : undefined,
    }));
  }

  async findOne(organizationId: string, id: string) {
    const professional = await this.prisma.professional.findFirst({
      where: { id, organizationId },
      include: {
        user: true,
        appointmentType: true,
      },
    });

    if (!professional) throw new NotFoundException('Profissional não encontrado.');

    return {
      ...professional,
      createdAt: professional.createdAt.toISOString(),
      updatedAt: professional.updatedAt.toISOString(),
    };
  }
}