import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../common/prisma.service';
import { DEFAULT_PAGE_SIZE } from '@clinica-saas/shared';
import {
  UpdateOrganizationSettingsDto,
  UnitDto,
  UpdateUnitDto,
  ServiceTypeDto,
  UpdateServiceTypeDto,
  ProfessionalDto,
  UpdateProfessionalSettingsDto,
  SchedulePreferencesDto,
  CommunicationPreferencesDto,
} from './dto/settings.dto';

@Injectable()
export class SettingsService {
  constructor(private readonly prisma: PrismaService) {}

  async getSettings(organizationId: string) {
    let settings = await this.prisma.organizationSettings.findUnique({
      where: { organizationId },
    });

    if (!settings) {
      settings = await this.prisma.organizationSettings.create({
        data: {
          organizationId,
          businessName: '',
          email: '',
          timezone: 'America/Sao_Paulo',
          locale: 'pt-BR',
          currency: 'BRL',
        },
      });
    }

    return settings;
  }

  async updateSettings(organizationId: string, dto: UpdateOrganizationSettingsDto) {
    const existing = await this.prisma.organizationSettings.findUnique({
      where: { organizationId },
    });

    if (!existing) {
      return this.prisma.organizationSettings.create({
        data: {
          organizationId,
          businessName: dto.businessName || '',
          tradeName: dto.tradeName,
          logo: dto.logo,
          email: dto.email || '',
          phone: dto.phone,
          address: dto.address,
          city: dto.city,
          state: dto.state,
          zipCode: dto.zipCode,
          timezone: dto.timezone || 'America/Sao_Paulo',
          locale: dto.locale || 'pt-BR',
          currency: dto.currency || 'BRL',
        },
      });
    }

    return this.prisma.organizationSettings.update({
      where: { organizationId },
      data: dto,
    });
  }

  async getUnits(organizationId: string, page = 1, limit = DEFAULT_PAGE_SIZE, isActive?: boolean) {
    const skip = (page - 1) * limit;
    const where: any = { organizationId };
    if (isActive !== undefined) where.isActive = isActive;

    const [items, total] = await Promise.all([
      this.prisma.unit.findMany({
        where,
        skip,
        take: limit,
        orderBy: { name: 'asc' },
      }),
      this.prisma.unit.count({ where }),
    ]);

    return {
      items,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    };
  }

  async getUnitById(id: string, organizationId: string) {
    const unit = await this.prisma.unit.findFirst({
      where: { id, organizationId },
    });

    if (!unit) throw new NotFoundException('Unidade não encontrada');
    return unit;
  }

  async createUnit(organizationId: string, dto: UnitDto) {
    return this.prisma.unit.create({
      data: {
        organizationId,
        name: dto.name,
        address: dto.address,
        phone: dto.phone,
      },
    });
  }

  async updateUnit(id: string, organizationId: string, dto: UpdateUnitDto) {
    const existing = await this.prisma.unit.findFirst({
      where: { id, organizationId },
    });

    if (!existing) throw new NotFoundException('Unidade não encontrada');

    return this.prisma.unit.update({
      where: { id },
      data: dto,
    });
  }

  async deleteUnit(id: string, organizationId: string) {
    const existing = await this.prisma.unit.findFirst({
      where: { id, organizationId },
    });

    if (!existing) throw new NotFoundException('Unidade não encontrada');

    return this.prisma.unit.update({
      where: { id },
      data: { isActive: false },
    });
  }

  async getServiceTypes(organizationId: string, page = 1, limit = DEFAULT_PAGE_SIZE, isActive?: boolean) {
    const skip = (page - 1) * limit;
    const where: any = { organizationId };
    if (isActive !== undefined) where.isActive = isActive;

    const [items, total] = await Promise.all([
      this.prisma.serviceType.findMany({
        where,
        skip,
        take: limit,
        orderBy: { name: 'asc' },
      }),
      this.prisma.serviceType.count({ where }),
    ]);

    return {
      items: items.map((item) => ({
        ...item,
        price: item.price ? Number(item.price) : null,
      })),
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    };
  }

  async getServiceTypeById(id: string, organizationId: string) {
    const serviceType = await this.prisma.serviceType.findFirst({
      where: { id, organizationId },
    });

    if (!serviceType) throw new NotFoundException('Tipo de serviço não encontrado');
    return {
      ...serviceType,
      price: serviceType.price ? Number(serviceType.price) : null,
    };
  }

  async createServiceType(organizationId: string, dto: ServiceTypeDto) {
    return this.prisma.serviceType.create({
      data: {
        organizationId,
        name: dto.name,
        description: dto.description,
        duration: dto.duration,
        price: dto.price ? parseFloat(dto.price) : null,
        color: dto.color,
      },
    });
  }

  async updateServiceType(id: string, organizationId: string, dto: UpdateServiceTypeDto) {
    const existing = await this.prisma.serviceType.findFirst({
      where: { id, organizationId },
    });

    if (!existing) throw new NotFoundException('Tipo de serviço não encontrado');

    const data: any = { ...dto };
    if (dto.price) data.price = parseFloat(dto.price);

    return this.prisma.serviceType.update({
      where: { id },
      data,
    });
  }

  async deleteServiceType(id: string, organizationId: string) {
    const existing = await this.prisma.serviceType.findFirst({
      where: { id, organizationId },
    });

    if (!existing) throw new NotFoundException('Tipo de serviço não encontrado');

    return this.prisma.serviceType.update({
      where: { id },
      data: { isActive: false },
    });
  }

  async getProfessionals(organizationId: string, page = 1, limit = DEFAULT_PAGE_SIZE, isActive?: boolean) {
    const skip = (page - 1) * limit;
    const where: any = { organizationId };
    if (isActive !== undefined) where.isActive = isActive;

    const [items, total] = await Promise.all([
      this.prisma.professional.findMany({
        where,
        skip,
        take: limit,
        orderBy: [{ isActive: 'desc' }, { user: { name: 'asc' } }],
        include: {
          user: { select: { id: true, name: true, email: true } },
        },
      }),
      this.prisma.professional.count({ where }),
    ]);

    return {
      items: items.map((item) => ({
        id: item.id,
        organizationId: item.organizationId,
        userId: item.userId,
        user: item.user,
        specialty: item.specialty,
        registerNumber: item.registerNumber,
        isActive: item.isActive,
        createdAt: item.createdAt,
        updatedAt: item.updatedAt,
      })),
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    };
  }

  async getProfessionalById(id: string, organizationId: string) {
    const professional = await this.prisma.professional.findFirst({
      where: { id, organizationId },
      include: {
        user: { select: { id: true, name: true, email: true } },
      },
    });

    if (!professional) throw new NotFoundException('Profissional não encontrado');
    return {
      id: professional.id,
      organizationId: professional.organizationId,
      userId: professional.userId,
      user: professional.user,
      specialty: professional.specialty,
      registerNumber: professional.registerNumber,
      isActive: professional.isActive,
      createdAt: professional.createdAt,
      updatedAt: professional.updatedAt,
    };
  }

  async createProfessional(organizationId: string, dto: ProfessionalDto) {
    const existingUser = await this.prisma.user.findUnique({
      where: { id: dto.userId },
    });

    if (!existingUser) throw new NotFoundException('Usuário não encontrado');

    const existingProfessional = await this.prisma.professional.findUnique({
      where: { userId: dto.userId },
    });

    if (existingProfessional) throw new BadRequestException('Usuário já é profissional');

    return this.prisma.professional.create({
      data: {
        organizationId,
        userId: dto.userId,
        specialty: dto.specialty,
        appointmentTypeId: undefined,
      },
      include: {
        user: { select: { id: true, name: true, email: true } },
      },
    });
  }

  async updateProfessional(id: string, organizationId: string, dto: UpdateProfessionalSettingsDto) {
    const existing = await this.prisma.professional.findFirst({
      where: { id, organizationId },
    });

    if (!existing) throw new NotFoundException('Profissional não encontrado');

    return this.prisma.professional.update({
      where: { id },
      data: dto,
      include: {
        user: { select: { id: true, name: true, email: true } },
      },
    });
  }

  async deleteProfessional(id: string, organizationId: string) {
    const existing = await this.prisma.professional.findFirst({
      where: { id, organizationId },
    });

    if (!existing) throw new NotFoundException('Profissional não encontrado');

    return this.prisma.professional.update({
      where: { id },
      data: { isActive: false },
    });
  }

  async getSchedulePreferences(organizationId: string) {
    let prefs = await this.prisma.schedulePreferences.findUnique({
      where: { organizationId },
    });

    if (!prefs) {
      prefs = await this.prisma.schedulePreferences.create({
        data: {
          organizationId,
          defaultDuration: 30,
          minInterval: 15,
          maxAdvanceDays: 60,
          allowOverbooking: false,
          requireConfirmation: true,
          startWorkHour: '08:00',
          endWorkHour: '18:00',
          workDays: [1, 2, 3, 4, 5],
        },
      });
    }

    return {
      ...prefs,
      workDays: prefs.workDays as unknown as number[],
    };
  }

  async updateSchedulePreferences(organizationId: string, dto: SchedulePreferencesDto) {
    const existing = await this.prisma.schedulePreferences.findUnique({
      where: { organizationId },
    });

    const data: any = { ...dto };
    if (dto.workDays) {
      try {
        data.workDays = JSON.parse(dto.workDays);
      } catch {
        data.workDays = [1, 2, 3, 4, 5];
      }
    }

    if (!existing) {
      return this.prisma.schedulePreferences.create({
        data: {
          organizationId,
          ...data,
        },
      });
    }

    return this.prisma.schedulePreferences.update({
      where: { organizationId },
      data,
    });
  }

  async getCommunicationPreferences(organizationId: string) {
    let prefs = await this.prisma.communicationPreferences.findUnique({
      where: { organizationId },
    });

    if (!prefs) {
      prefs = await this.prisma.communicationPreferences.create({
        data: {
          organizationId,
          defaultChannel: 'email',
          sendAppointmentReminder: true,
          reminderHoursBefore: 24,
          sendPaymentReminder: true,
          reminderDaysBefore: 3,
        },
      });
    }

    return prefs;
  }

  async updateCommunicationPreferences(organizationId: string, dto: CommunicationPreferencesDto) {
    const existing = await this.prisma.communicationPreferences.findUnique({
      where: { organizationId },
    });

    if (!existing) {
      return this.prisma.communicationPreferences.create({
        data: {
          organizationId,
          ...dto,
        },
      });
    }

    return this.prisma.communicationPreferences.update({
      where: { organizationId },
      data: dto,
    });
  }
}