import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../common/prisma.service';
import { CreatePatientDto, UpdatePatientDto, PatientContactCreateDto, PatientContactUpdateDto, ListPatientsQueryDto } from './dto/patient.dto';

@Injectable()
export class PatientsService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(organizationId: string, query: ListPatientsQueryDto) {
    const { page = 1, limit = 20, search, document, phone, isActive } = query;
    const skip = (page - 1) * limit;

    const where: any = {
      organizationId,
      deletedAt: null,
    };

    if (search) {
      where.name = { contains: search, mode: 'insensitive' };
    }

    if (document) {
      where.document = document;
    }

    if (phone) {
      where.phone = { contains: phone };
    }

    if (isActive !== undefined) {
      where.isActive = isActive;
    }

    const [items, total] = await Promise.all([
      this.prisma.patient.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          name: true,
          email: true,
          phone: true,
          document: true,
          birthDate: true,
          isActive: true,
          createdAt: true,
          updatedAt: true,
        },
      }),
      this.prisma.patient.count({ where }),
    ]);

    return {
      items: items.map((item) => ({
        ...item,
        birthDate: item.birthDate?.toISOString() || null,
        createdAt: item.createdAt.toISOString(),
        updatedAt: item.updatedAt.toISOString(),
      })),
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findOne(organizationId: string, id: string) {
    const patient = await this.prisma.patient.findFirst({
      where: { id, organizationId, deletedAt: null },
      include: {
        contacts: true,
      },
    });

    if (!patient) {
      throw new NotFoundException('Paciente não encontrado.');
    }

    return {
      ...patient,
      birthDate: patient.birthDate?.toISOString() || null,
      createdAt: patient.createdAt.toISOString(),
      updatedAt: patient.updatedAt.toISOString(),
      contacts: patient.contacts.map((c) => ({
        ...c,
        createdAt: c.createdAt.toISOString(),
        updatedAt: c.updatedAt.toISOString(),
      })),
    };
  }

  async create(organizationId: string, userId: string, dto: CreatePatientDto) {
    const { contacts, ...patientData } = dto;

    const patient = await this.prisma.patient.create({
      data: {
        ...patientData,
        organizationId,
        birthDate: patientData.birthDate ? new Date(patientData.birthDate) : undefined,
        contacts: contacts
          ? {
              create: contacts.map((c) => ({
                ...c,
                isPrimary: c.isPrimary || false,
              })),
            }
          : undefined,
      },
      include: {
        contacts: true,
      },
    });

    await this.createAudit(patient.id, userId, 'create', patient);

    return {
      ...patient,
      birthDate: patient.birthDate?.toISOString() || null,
      createdAt: patient.createdAt.toISOString(),
      updatedAt: patient.updatedAt.toISOString(),
      contacts: patient.contacts.map((c) => ({
        ...c,
        createdAt: c.createdAt.toISOString(),
        updatedAt: c.updatedAt.toISOString(),
      })),
    };
  }

  async update(organizationId: string, userId: string, id: string, dto: UpdatePatientDto) {
    const existing = await this.prisma.patient.findFirst({
      where: { id, organizationId, deletedAt: null },
    });

    if (!existing) {
      throw new NotFoundException('Paciente não encontrado.');
    }

    const { birthDate, ...updateData } = dto;

    const patient = await this.prisma.patient.update({
      where: { id },
      data: {
        ...updateData,
        birthDate: birthDate ? new Date(birthDate) : undefined,
      },
      include: {
        contacts: true,
      },
    });

    await this.createAudit(id, userId, 'update', dto);

    return {
      ...patient,
      birthDate: patient.birthDate?.toISOString() || null,
      createdAt: patient.createdAt.toISOString(),
      updatedAt: patient.updatedAt.toISOString(),
      contacts: patient.contacts.map((c) => ({
        ...c,
        createdAt: c.createdAt.toISOString(),
        updatedAt: c.updatedAt.toISOString(),
      })),
    };
  }

  async delete(organizationId: string, userId: string, id: string) {
    const existing = await this.prisma.patient.findFirst({
      where: { id, organizationId, deletedAt: null },
    });

    if (!existing) {
      throw new NotFoundException('Paciente não encontrado.');
    }

    await this.prisma.patient.update({
      where: { id },
      data: { deletedAt: new Date() },
    });

    await this.createAudit(id, userId, 'delete', { name: existing.name });

    return { success: true };
  }

  async getContacts(organizationId: string, patientId: string) {
    const patient = await this.prisma.patient.findFirst({
      where: { id: patientId, organizationId, deletedAt: null },
    });

    if (!patient) {
      throw new NotFoundException('Paciente não encontrado.');
    }

    const contacts = await this.prisma.patientContact.findMany({
      where: { patientId },
      orderBy: { isPrimary: 'desc' },
    });

    return contacts.map((c) => ({
      ...c,
      createdAt: c.createdAt.toISOString(),
      updatedAt: c.updatedAt.toISOString(),
    }));
  }

  async createContact(organizationId: string, patientId: string, dto: PatientContactCreateDto) {
    const patient = await this.prisma.patient.findFirst({
      where: { id: patientId, organizationId, deletedAt: null },
    });

    if (!patient) {
      throw new NotFoundException('Paciente não encontrado.');
    }

    if (dto.isPrimary) {
      await this.prisma.patientContact.updateMany({
        where: { patientId, isPrimary: true },
        data: { isPrimary: false },
      });
    }

    const contact = await this.prisma.patientContact.create({
      data: {
        ...dto,
        patientId,
      },
    });

    return {
      ...contact,
      createdAt: contact.createdAt.toISOString(),
      updatedAt: contact.updatedAt.toISOString(),
    };
  }

  async updateContact(organizationId: string, contactId: string, dto: PatientContactUpdateDto) {
    const contact = await this.prisma.patientContact.findUnique({
      where: { id: contactId },
      include: { patient: true },
    });

    if (!contact || contact.patient.organizationId !== organizationId || contact.patient.deletedAt) {
      throw new NotFoundException('Contato não encontrado.');
    }

    if (dto.isPrimary && !contact.isPrimary) {
      await this.prisma.patientContact.updateMany({
        where: { patientId: contact.patientId, isPrimary: true },
        data: { isPrimary: false },
      });
    }

    const updated = await this.prisma.patientContact.update({
      where: { id: contactId },
      data: dto,
    });

    return {
      ...updated,
      createdAt: updated.createdAt.toISOString(),
      updatedAt: updated.updatedAt.toISOString(),
    };
  }

  async deleteContact(organizationId: string, contactId: string) {
    const contact = await this.prisma.patientContact.findUnique({
      where: { id: contactId },
      include: { patient: true },
    });

    if (!contact || contact.patient.organizationId !== organizationId || contact.patient.deletedAt) {
      throw new NotFoundException('Contato não encontrado.');
    }

    await this.prisma.patientContact.delete({ where: { id: contactId } });

    return { success: true };
  }

  async getAudit(organizationId: string, patientId: string) {
    const patient = await this.prisma.patient.findFirst({
      where: { id: patientId, organizationId },
    });

    if (!patient) {
      throw new NotFoundException('Paciente não encontrado.');
    }

    const audits = await this.prisma.patientAudit.findMany({
      where: { patientId },
      orderBy: { performedAt: 'desc' },
      include: {
        performedByUser: {
          select: { name: true, email: true },
        },
      },
    });

    return audits.map((a) => ({
      ...a,
      performedAt: a.performedAt.toISOString(),
    }));
  }

  private async createAudit(patientId: string, userId: string, action: string, changes: any) {
    await this.prisma.patientAudit.create({
      data: {
        patientId,
        performedBy: userId,
        action,
        changes,
      },
    });
  }
}