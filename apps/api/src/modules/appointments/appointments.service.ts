import { Injectable, NotFoundException, BadRequestException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../../common/prisma.service';
import { CreateAppointmentDto, UpdateAppointmentDto, CancelAppointmentDto, RescheduleAppointmentDto, ListAppointmentsQueryDto, CalendarQueryDto, AvailabilityQueryDto } from './dto/appointment.dto';
import { AppointmentsNotificationsService } from './appointments-notifications.service';

@Injectable()
export class AppointmentsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly notifications: AppointmentsNotificationsService,
  ) {}

  async findAll(organizationId: string, query: ListAppointmentsQueryDto) {
    const { page = 1, limit = 20, startDate, endDate, professionalId, patientId, status } = query;
    const skip = (page - 1) * limit;

    const where: any = { organizationId };

    if (startDate) where.startDate = { gte: new Date(startDate) };
    if (endDate) where.endDate = { ...where.endDate, lte: new Date(endDate) };
    if (professionalId) where.professionalId = professionalId;
    if (patientId) where.patientId = patientId;
    if (status) where.status = status;

    const [items, total] = await Promise.all([
      this.prisma.appointment.findMany({
        where,
        skip,
        take: limit,
        orderBy: { startDate: 'asc' },
        include: {
          patient: { select: { id: true, name: true } },
          professional: { include: { user: { select: { name: true } } } },
          appointmentType: true,
        },
      }),
      this.prisma.appointment.count({ where }),
    ]);

    return {
      items: items.map((item) => ({
        id: item.id,
        organizationId: item.organizationId,
        patientId: item.patientId,
        professionalId: item.professionalId,
        appointmentTypeId: item.appointmentTypeId,
        status: item.status,
        startDate: item.startDate.toISOString(),
        endDate: item.endDate.toISOString(),
        duration: item.duration,
        notes: item.notes,
        cancellationReason: item.cancellationReason,
        cancelledBy: item.cancelledBy,
        cancelledAt: item.cancelledAt?.toISOString() || null,
        createdAt: item.createdAt.toISOString(),
        updatedAt: item.updatedAt.toISOString(),
        patient: item.patient ? { id: item.patient.id, name: item.patient.name } : undefined,
        professional: item.professional ? {
          id: item.professional.id,
          name: item.professional.user.name,
          specialty: item.professional.specialty,
          color: item.professional.color,
        } : undefined,
        appointmentType: item.appointmentType ? {
          id: item.appointmentType.id,
          name: item.appointmentType.name,
          duration: item.appointmentType.duration,
          color: item.appointmentType.color,
        } : undefined,
      })),
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    };
  }

  async findOne(organizationId: string, id: string) {
    const appointment = await this.prisma.appointment.findFirst({
      where: { id, organizationId },
      include: {
        patient: true,
        professional: { include: { user: true } },
        appointmentType: true,
        audits: { include: { performedByUser: { select: { name: true } } }, orderBy: { performedAt: 'desc' } },
      },
    });

    if (!appointment) throw new NotFoundException('Agendamento não encontrado.');

    return {
      ...appointment,
      startDate: appointment.startDate.toISOString(),
      endDate: appointment.endDate.toISOString(),
      createdAt: appointment.createdAt.toISOString(),
      updatedAt: appointment.updatedAt.toISOString(),
      cancelledAt: appointment.cancelledAt?.toISOString() || null,
      patient: { id: appointment.patient.id, name: appointment.patient.name, phone: appointment.patient.phone },
      professional: {
        id: appointment.professional.id,
        name: appointment.professional.user.name,
        specialty: appointment.professional.specialty,
        color: appointment.professional.color,
      },
      appointmentType: appointment.appointmentType ? {
        id: appointment.appointmentType.id,
        name: appointment.appointmentType.name,
        duration: appointment.appointmentType.duration,
        color: appointment.appointmentType.color,
      } : undefined,
      audits: appointment.audits.map((a) => ({
        ...a,
        performedAt: a.performedAt.toISOString(),
      })),
    };
  }

  async create(organizationId: string, userId: string, dto: CreateAppointmentDto) {
    const [patient, professional, appointmentType] = await Promise.all([
      this.prisma.patient.findFirst({ where: { id: dto.patientId, organizationId, deletedAt: null } }),
      this.prisma.professional.findFirst({ where: { id: dto.professionalId, organizationId, isActive: true } }),
      dto.appointmentTypeId ? this.prisma.appointmentType.findFirst({ where: { id: dto.appointmentTypeId, organizationId, isActive: true } }) : null,
    ]);

    if (!patient) throw new NotFoundException('Paciente não encontrado.');
    if (!professional) throw new NotFoundException('Profissional não encontrado.');

    const startDate = new Date(dto.startDate);
    const duration = appointmentType?.duration || 30;
    const endDate = new Date(startDate.getTime() + duration * 60000);

    const hasConflict = await this.checkConflict(organizationId, dto.professionalId, startDate, endDate);
    if (hasConflict) throw new ConflictException('Horário não disponível. Já existe agendamento neste horário.');

    const hasBlock = await this.checkBlock(organizationId, dto.professionalId, startDate, endDate);
    if (hasBlock) throw new ConflictException('Horário bloqueado. O profissional está indisponível neste período.');

    if (startDate < new Date()) throw new BadRequestException('Não é possível agendar no passado.');

    const appointment = await this.prisma.appointment.create({
      data: {
        organizationId,
        patientId: dto.patientId,
        professionalId: dto.professionalId,
        appointmentTypeId: dto.appointmentTypeId || null,
        startDate,
        endDate,
        duration,
        notes: dto.notes || null,
        status: 'scheduled',
      },
      include: {
        patient: { select: { id: true, name: true } },
        professional: { include: { user: { select: { name: true } } } },
        appointmentType: true,
      },
    });

    await this.createAudit(appointment.id, userId, 'create', { startDate: dto.startDate, patientId: dto.patientId, professionalId: dto.professionalId });

    await this.notifications.scheduleConfirmation(appointment.id, organizationId);

    const appointmentDate = new Date(appointment.startDate);
    appointmentDate.setHours(appointmentDate.getHours() - 24);
    await this.notifications.scheduleReminder(appointment.id, organizationId, appointmentDate);

    return {
      ...appointment,
      startDate: appointment.startDate.toISOString(),
      endDate: appointment.endDate.toISOString(),
      createdAt: appointment.createdAt.toISOString(),
      updatedAt: appointment.updatedAt.toISOString(),
    };
  }

  async update(organizationId: string, userId: string, id: string, dto: UpdateAppointmentDto) {
    const existing = await this.prisma.appointment.findFirst({ where: { id, organizationId } });
    if (!existing) throw new NotFoundException('Agendamento não encontrado.');

    if (['cancelled', 'completed', 'no_show'].includes(existing.status)) {
      throw new BadRequestException('Não é possível editar um agendamento cancelado, concluído ou faltou.');
    }

    let startDate = existing.startDate;
    let endDate = existing.endDate;
    let duration = existing.duration;

    if (dto.startDate) {
      startDate = new Date(dto.startDate);
      const type = dto.appointmentTypeId ? await this.prisma.appointmentType.findUnique({ where: { id: dto.appointmentTypeId } }) : null;
      duration = type?.duration || existing.duration;
      endDate = new Date(startDate.getTime() * duration * 60000);
    }

    if (dto.startDate || dto.appointmentTypeId) {
      const hasConflict = await this.checkConflict(organizationId, existing.professionalId, startDate, endDate, id);
      if (hasConflict) throw new ConflictException('Horário não disponível.');

      const hasBlock = await this.checkBlock(organizationId, existing.professionalId, startDate, endDate);
      if (hasBlock) throw new ConflictException('Horário bloqueado.');
    }

    const appointment = await this.prisma.appointment.update({
      where: { id },
      data: {
        ...dto,
        startDate: dto.startDate ? startDate : undefined,
        endDate: dto.startDate ? endDate : undefined,
      },
      include: {
        patient: { select: { id: true, name: true } },
        professional: { include: { user: { select: { name: true } } } },
        appointmentType: true,
      },
    });

    await this.createAudit(id, userId, 'update', dto);

    return {
      ...appointment,
      startDate: appointment.startDate.toISOString(),
      endDate: appointment.endDate.toISOString(),
      createdAt: appointment.createdAt.toISOString(),
      updatedAt: appointment.updatedAt.toISOString(),
    };
  }

  async cancel(organizationId: string, userId: string, id: string, dto: CancelAppointmentDto) {
    const existing = await this.prisma.appointment.findFirst({ where: { id, organizationId } });
    if (!existing) throw new NotFoundException('Agendamento não encontrado.');

    if (existing.status === 'cancelled') throw new BadRequestException('Agendamento já está cancelado.');

    const appointment = await this.prisma.appointment.update({
      where: { id },
      data: {
        status: 'cancelled',
        cancellationReason: dto.reason,
        cancelledBy: userId,
        cancelledAt: new Date(),
      },
    });

    await this.createAudit(id, userId, 'cancel', { reason: dto.reason });

    await this.notifications.scheduleCancellation(id, organizationId);

    return { success: true, message: 'Agendamento cancelado com sucesso.' };
  }

  async reschedule(organizationId: string, userId: string, id: string, dto: RescheduleAppointmentDto) {
    const existing = await this.prisma.appointment.findFirst({ where: { id, organizationId } });
    if (!existing) throw new NotFoundException('Agendamento não encontrado.');

    if (existing.status === 'cancelled') throw new BadRequestException('Agendamento está cancelado.');

    const newStartDate = new Date(dto.newStartDate);
    const duration = existing.duration;
    const newEndDate = new Date(newStartDate.getTime() + duration * 60000);

    const hasConflict = await this.checkConflict(organizationId, existing.professionalId, newStartDate, newEndDate);
    if (hasConflict) throw new ConflictException('Novo horário não disponível.');

    const hasBlock = await this.checkBlock(organizationId, existing.professionalId, newStartDate, newEndDate);
    if (hasBlock) throw new ConflictException('Novo horário está bloqueado.');

    await this.prisma.$transaction([
      this.prisma.appointment.update({
        where: { id },
        data: { status: 'cancelled', cancellationReason: 'Reagendado', cancelledBy: userId, cancelledAt: new Date() },
      }),
      this.prisma.appointment.create({
        data: {
          organizationId,
          patientId: existing.patientId,
          professionalId: existing.professionalId,
          appointmentTypeId: existing.appointmentTypeId,
          startDate: newStartDate,
          endDate: newEndDate,
          duration,
          notes: existing.notes,
          status: 'scheduled',
        },
      }),
    ]);

    await this.createAudit(id, userId, 'reschedule', { oldDate: existing.startDate.toISOString(), newDate: dto.newStartDate });

    const newAppointment = await this.prisma.appointment.findFirst({
      where: { organizationId, patientId: existing.patientId },
      orderBy: { createdAt: 'desc' },
    });

    if (newAppointment) {
      await this.notifications.scheduleConfirmation(newAppointment.id, organizationId);

      const appointmentDate = new Date(newAppointment.startDate);
      appointmentDate.setHours(appointmentDate.getHours() - 24);
      await this.notifications.scheduleReminder(newAppointment.id, organizationId, appointmentDate);
    }

    return { success: true, message: 'Agendamento reagendado com sucesso.' };
  }

  async getCalendar(organizationId: string, query: CalendarQueryDto) {
    const { startDate, endDate, view, professionalId } = query;
    const start = new Date(startDate);
    const end = new Date(endDate);

    const where: any = { organizationId, startDate: { gte: start }, endDate: { lte: end } };
    if (professionalId) where.professionalId = professionalId;

    const appointments = await this.prisma.appointment.findMany({
      where,
      include: {
        patient: { select: { id: true, name: true } },
        professional: { include: { user: { select: { name: true } } } },
        appointmentType: true,
      },
      orderBy: { startDate: 'asc' },
    });

    const blocks = await this.prisma.scheduleBlock.findMany({
      where: { organizationId, professionalId, startDate: { lte: end }, endDate: { gte: start } },
    });

    const days: any[] = [];
    const current = new Date(start);
    while (current <= end) {
      const dateStr = current.toISOString().split('T')[0];
      const dayAppointments = appointments.filter((a) => a.startDate.toISOString().startsWith(dateStr));
      const dayBlocks = blocks.filter((b) => b.startDate.toISOString().startsWith(dateStr));

      const slots: any[] = [];
      for (let hour = 8; hour < 18; hour++) {
        const timeStr = `${hour.toString().padStart(2, '0')}:00`;
        const slotTime = new Date(`${dateStr}T${timeStr}:00`);

        const appointment = dayAppointments.find((a) => {
          const aStart = new Date(a.startDate);
          return aStart.getHours() === hour;
        });

        if (appointment) {
          slots.push({
            time: timeStr,
            appointment: {
              id: appointment.id,
              patient: appointment.patient.name,
              professional: appointment.professional.user.name,
              startDate: appointment.startDate.toISOString(),
              endDate: appointment.endDate.toISOString(),
              status: appointment.status,
            },
          });
        } else {
          const blocked = dayBlocks.find((b) => {
            const bStart = new Date(b.startDate);
            return bStart.getHours() === hour;
          });
          if (blocked) {
            slots.push({ time: timeStr, blocked: { start: blocked.startDate.toISOString(), end: blocked.endDate.toISOString(), reason: blocked.reason } });
          } else {
            slots.push({ time: timeStr, available: true });
          }
        }
      }

      days.push({ date: dateStr, slots });
      current.setDate(current.getDate() + 1);
    }

    return { view, startDate: startDate, endDate: endDate, days };
  }

  async getAvailability(organizationId: string, query: AvailabilityQueryDto) {
    const { date, professionalId } = query;
    const dayStart = new Date(date);
    dayStart.setHours(8, 0, 0, 0);
    const dayEnd = new Date(date);
    dayEnd.setHours(18, 0, 0, 0);

    const appointments = await this.prisma.appointment.findMany({
      where: { organizationId, professionalId, startDate: { gte: dayStart }, endDate: { lte: dayEnd }, status: { not: 'cancelled' } },
    });

    const blocks = await this.prisma.scheduleBlock.findMany({
      where: { organizationId, professionalId, startDate: { lte: dayEnd }, endDate: { gte: dayStart } },
    });

    const availableSlots: string[] = [];
    const blockedSlots: any[] = [];

    for (let hour = 8; hour < 18; hour++) {
      const slotStart = new Date(dayStart);
      slotStart.setHours(hour, 0, 0, 0);
      const slotEnd = new Date(dayStart);
      slotEnd.setHours(hour + 1, 0, 0, 0);

      const hasAppointment = appointments.some((a) => {
        const aStart = new Date(a.startDate);
        return aStart.getHours() === hour;
      });

      const block = blocks.find((b) => {
        const bStart = new Date(b.startDate);
        return bStart.getHours() === hour;
      });

      if (!hasAppointment && !block) {
        availableSlots.push(`${hour.toString().padStart(2, '0')}:00`);
      } else if (block) {
        blockedSlots.push({ start: `${hour.toString().padStart(2, '0')}:00`, end: `${(hour + 1).toString().padStart(2, '0')}:00`, reason: block.reason });
      }
    }

    return { date, availableSlots, blockedSlots };
  }

  private async checkConflict(organizationId: string, professionalId: string, startDate: Date, endDate: Date, excludeId?: string): Promise<boolean> {
    const where: any = {
      organizationId,
      professionalId,
      status: { not: 'cancelled' },
      OR: [
        { startDate: { lt: endDate }, endDate: { gt: startDate } },
      ],
    };
    if (excludeId) where.NOT = { id: excludeId };

    const count = await this.prisma.appointment.count({ where });
    return count > 0;
  }

  private async checkBlock(organizationId: string, professionalId: string, startDate: Date, endDate: Date): Promise<boolean> {
    const count = await this.prisma.scheduleBlock.count({
      where: { organizationId, professionalId, startDate: { lt: endDate }, endDate: { gt: startDate } },
    });
    return count > 0;
  }

  private async createAudit(appointmentId: string, userId: string, action: string, changes: any) {
    await this.prisma.appointmentAudit.create({
      data: { appointmentId, performedBy: userId, action, changes },
    });
  }
}