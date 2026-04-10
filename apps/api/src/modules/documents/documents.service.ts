import { Injectable, NotFoundException, BadRequestException, Logger } from '@nestjs/common';
import { PrismaService } from '../../common/prisma.service';
import type { Document, DocumentCategory } from '@clinica-saas/contracts';

export interface ListDocumentsQueryDto {
  page?: number;
  limit?: number;
  patientId?: string;
  appointmentId?: string;
  category?: string;
  type?: string;
  startDate?: string;
  endDate?: string;
  search?: string;
}

export interface CreateDocumentDto {
  patientId?: string;
  appointmentId?: string;
  category: string;
  type: string;
  name: string;
  description?: string;
  fileName: string;
  fileSize: number;
  mimeType: string;
  file: Buffer;
  storageKey: string;
}

export interface UpdateDocumentDto {
  category?: string;
  type?: string;
  name?: string;
  description?: string;
  isPublic?: boolean;
}

@Injectable()
export class DocumentsService {
  private readonly logger = new Logger(DocumentsService.name);

  constructor(private readonly prisma: PrismaService) {}

  async findAll(organizationId: string, query: ListDocumentsQueryDto) {
    const { page = 1, limit = 20, patientId, appointmentId, category, type, startDate, endDate, search } = query;
    const skip = (page - 1) * limit;

    const where: any = { organizationId };
    if (patientId) where.patientId = patientId;
    if (appointmentId) where.appointmentId = appointmentId;
    if (category) where.category = category;
    if (type) where.type = type;
    if (startDate) where.createdAt = { ...where.createdAt, gte: new Date(startDate) };
    if (endDate) where.createdAt = { ...where.createdAt, lte: new Date(endDate) };
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { fileName: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [items, total] = await Promise.all([
      this.prisma.document.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          uploadedByUser: { select: { id: true, name: true } },
        },
      }),
      this.prisma.document.count({ where }),
    ]);

    return {
      items: items.map((item) => this.mapDocument(item)),
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    };
  }

  async findById(organizationId: string, id: string) {
    const document = await this.prisma.document.findFirst({
      where: { id, organizationId },
      include: {
        uploadedByUser: { select: { id: true, name: true } },
      },
    });

    if (!document) {
      throw new NotFoundException('Documento não encontrado');
    }

    return this.mapDocument(document);
  }

  async findByPatient(organizationId: string, patientId: string) {
    const documents = await this.prisma.document.findMany({
      where: { organizationId, patientId },
      orderBy: { createdAt: 'desc' },
      include: {
        uploadedByUser: { select: { id: true, name: true } },
      },
    });

    return documents.map((doc) => this.mapDocument(doc));
  }

  async findByAppointment(organizationId: string, appointmentId: string) {
    const documents = await this.prisma.document.findMany({
      where: { organizationId, appointmentId },
      orderBy: { createdAt: 'desc' },
      include: {
        uploadedByUser: { select: { id: true, name: true } },
      },
    });

    return documents.map((doc) => this.mapDocument(doc));
  }

  async create(organizationId: string, userId: string, dto: CreateDocumentDto) {
    const document = await this.prisma.document.create({
      data: {
        organizationId,
        patientId: dto.patientId || null,
        appointmentId: dto.appointmentId || null,
        category: dto.category,
        type: dto.type,
        name: dto.name,
        description: dto.description || null,
        fileName: dto.fileName,
        filePath: `/documents/${dto.storageKey}`,
        fileSize: dto.fileSize,
        mimeType: dto.mimeType,
        storageProvider: 'local',
        storageKey: dto.storageKey,
        uploadedBy: userId,
      },
      include: {
        uploadedByUser: { select: { id: true, name: true } },
      },
    });

    await this.createAudit(document.id, userId, 'create');

    return this.mapDocument(document);
  }

  async update(organizationId: string, userId: string, id: string, dto: UpdateDocumentDto) {
    const existing = await this.prisma.document.findFirst({
      where: { id, organizationId },
    });

    if (!existing) {
      throw new NotFoundException('Documento não encontrado');
    }

    const document = await this.prisma.document.update({
      where: { id },
      data: {
        ...(dto.category && { category: dto.category }),
        ...(dto.type && { type: dto.type }),
        ...(dto.name && { name: dto.name }),
        ...(dto.description !== undefined && { description: dto.description }),
        ...(dto.isPublic !== undefined && { isPublic: dto.isPublic }),
      },
      include: {
        uploadedByUser: { select: { id: true, name: true } },
      },
    });

    await this.createAudit(id, userId, 'update', dto as any);

    return this.mapDocument(document);
  }

  async delete(organizationId: string, userId: string, id: string) {
    const existing = await this.prisma.document.findFirst({
      where: { id, organizationId },
    });

    if (!existing) {
      throw new NotFoundException('Documento não encontrado');
    }

    await this.prisma.document.delete({ where: { id } });

    await this.createAudit(id, userId, 'delete');

    return { success: true };
  }

  private async createAudit(
    documentId: string,
    userId: string,
    action: string,
    changes?: Record<string, unknown>,
  ) {
    await this.prisma.documentAudit.create({
      data: {
        documentId,
        action,
        changes: changes as unknown as any,
        performedBy: userId,
      },
    });
  }

  private mapDocument(doc: any) {
    return {
      id: doc.id,
      organizationId: doc.organizationId,
      patientId: doc.patientId,
      appointmentId: doc.appointmentId,
      category: doc.category,
      type: doc.type,
      name: doc.name,
      description: doc.description,
      fileName: doc.fileName,
      fileSize: doc.fileSize,
      mimeType: doc.mimeType,
      storageProvider: doc.storageProvider,
      isPublic: doc.isPublic,
      expiresAt: doc.expiresAt?.toISOString() || null,
      uploadedBy: {
        id: doc.uploadedByUser?.id || doc.uploadedBy,
        name: doc.uploadedByUser?.name || '',
      },
      createdAt: doc.createdAt.toISOString(),
      updatedAt: doc.updatedAt.toISOString(),
    };
  }
}