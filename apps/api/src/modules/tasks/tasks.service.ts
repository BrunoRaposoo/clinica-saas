import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../../common/prisma.service';
import { Task, TaskStatus, TaskPriority, TaskListParams, TaskListResponse } from '@clinica-saas/contracts';
import { CreateTaskDto, UpdateTaskDto, UpdateTaskStatusDto, CreateTaskCommentDto } from './dto/task.dto';

function startOfDay(date: Date): Date {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
}

function endOfDay(date: Date): Date {
  const d = new Date(date);
  d.setHours(23, 59, 59, 999);
  return d;
}

@Injectable()
export class TasksService {
  constructor(private readonly prisma: PrismaService) {}

  async create(
    dto: CreateTaskDto,
    organizationId: string,
    userId: string,
  ): Promise<Task> {
    const task = await this.prisma.task.create({
      data: {
        organizationId,
        title: dto.title,
        description: dto.description,
        patientId: dto.patientId,
        appointmentId: dto.appointmentId,
        priority: dto.priority || 'medium',
        assignedTo: dto.assignedTo,
        dueDate: dto.dueDate ? new Date(dto.dueDate) : null,
        createdBy: userId,
      },
      include: {
        assignedToUser: { select: { id: true, name: true } },
        createdByUser: { select: { id: true, name: true } },
      },
    });

    await this.prisma.taskAudit.create({
      data: {
        taskId: task.id,
        action: 'create',
        performedBy: userId,
      },
    });

    return this.mapTask(task);
  }

  async findAll(
    params: TaskListParams,
    organizationId: string,
    userId: string,
    roleName: string,
  ): Promise<TaskListResponse> {
    const { page = 1, limit = 20, status, priority, assignedTo, patientId, appointmentId, dueDateFrom, dueDateTo, search } = params;
    const skip = (page - 1) * limit;

    console.log('[TasksService.findAll] params:', JSON.stringify(params));
    console.log('[TasksService.findAll] userId:', userId, 'roleName:', roleName);

    const where: any = { organizationId };

    if (status) where.status = status;
    if (priority) where.priority = priority;
    if (assignedTo) where.assignedTo = assignedTo;
    if (patientId) where.patientId = patientId;
    if (appointmentId) where.appointmentId = appointmentId;
    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ];
    }
    if (dueDateFrom || dueDateTo) {
      where.dueDate = {};
      if (dueDateFrom) where.dueDate.gte = startOfDay(new Date(dueDateFrom));
      if (dueDateTo) where.dueDate.lte = endOfDay(new Date(dueDateTo));
    }

    console.log('[TasksService.findAll] where BEFORE professional filter:', JSON.stringify(where));

    if (roleName === 'professional') {
      const accessCondition = {
        OR: [
          { createdBy: userId },
          { assignedTo: userId },
        ],
      };

      console.log('[TasksService.findAll] accessCondition:', JSON.stringify(accessCondition));

      const existingConditions: any = { ...where };
      delete existingConditions.OR;
      
      console.log('[TasksService.findAll] existingConditions:', JSON.stringify(existingConditions));
      
      where.AND = [existingConditions, accessCondition];
      delete where.OR;

      console.log('[TasksService.findAll] where AFTER professional filter:', JSON.stringify(where));
    } else {
      console.log('[TasksService.findAll] roleName is NOT professional, no access filter applied');
    }

    const [items, total] = await Promise.all([
      this.prisma.task.findMany({
        where,
        skip,
        take: limit,
        orderBy: [{ priority: 'desc' }, { dueDate: 'asc' }, { createdAt: 'desc' }],
        include: {
          assignedToUser: { select: { id: true, name: true } },
          createdByUser: { select: { id: true, name: true } },
        },
      }),
      this.prisma.task.count({ where }),
    ]);

    return {
      items: items.map(this.mapTask.bind(this)),
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    };
  }

  async findById(id: string, organizationId: string, userId: string, roleName: string): Promise<Task> {
    const task = await this.prisma.task.findFirst({
      where: { id, organizationId },
      include: {
        assignedToUser: { select: { id: true, name: true } },
        createdByUser: { select: { id: true, name: true } },
        comments: {
          include: { user: { select: { id: true, name: true } } },
          orderBy: { createdAt: 'asc' },
        },
      },
    });

    if (!task) {
      throw new NotFoundException('Tarefa não encontrada');
    }

    if (roleName === 'professional' && task.createdBy !== userId && task.assignedTo !== userId) {
      throw new NotFoundException('Tarefa não encontrada');
    }

    return this.mapTaskWithComments(task);
  }

  async update(
    id: string,
    dto: UpdateTaskDto,
    organizationId: string,
    userId: string,
  ): Promise<Task> {
    const existing = await this.prisma.task.findFirst({
      where: { id, organizationId },
    });

    if (!existing) {
      throw new NotFoundException('Tarefa não encontrada');
    }

    if (existing.createdBy !== userId) {
      throw new ForbiddenException('Você não tem permissão para editar esta tarefa');
    }

    const data: any = {};
    if (dto.title !== undefined) data.title = dto.title;
    if (dto.description !== undefined) data.description = dto.description;
    if (dto.priority !== undefined) data.priority = dto.priority;
    if (dto.assignedTo !== undefined) data.assignedTo = dto.assignedTo || null;
    if (dto.dueDate !== undefined) data.dueDate = dto.dueDate ? new Date(dto.dueDate) : null;
    if (dto.status !== undefined) {
      data.status = dto.status;
      if (dto.status === 'completed') {
        data.completedAt = new Date();
      }
    }

    const task = await this.prisma.task.update({
      where: { id },
      data,
      include: {
        assignedToUser: { select: { id: true, name: true } },
        createdByUser: { select: { id: true, name: true } },
      },
    });

    await this.prisma.taskAudit.create({
      data: {
        taskId: id,
        action: 'update',
        performedBy: userId,
      },
    });

    return this.mapTask(task);
  }

  async updateStatus(
    id: string,
    status: TaskStatus,
    organizationId: string,
    userId: string,
  ): Promise<Task> {
    const existing = await this.prisma.task.findFirst({
      where: { id, organizationId },
    });

    if (!existing) {
      throw new NotFoundException('Tarefa não encontrada');
    }

    if (existing.createdBy !== userId && existing.assignedTo !== userId) {
      throw new ForbiddenException('Você não tem permissão para atualizar esta tarefa');
    }

    const data: any = { status };
    if (status === 'completed') {
      data.completedAt = new Date();
    } else {
      data.completedAt = null;
    }

    const task = await this.prisma.task.update({
      where: { id },
      data,
      include: {
        assignedToUser: { select: { id: true, name: true } },
        createdByUser: { select: { id: true, name: true } },
      },
    });

    await this.prisma.taskAudit.create({
      data: {
        taskId: id,
        action: 'status_change',
        performedBy: userId,
      },
    });

    return this.mapTask(task);
  }

  async delete(id: string, organizationId: string, userId: string): Promise<void> {
    const existing = await this.prisma.task.findFirst({
      where: { id, organizationId },
    });

    if (!existing) {
      throw new NotFoundException('Tarefa não encontrada');
    }

    if (existing.createdBy !== userId) {
      throw new ForbiddenException('Você não tem permissão para excluir esta tarefa');
    }

    await this.prisma.task.delete({ where: { id } });
  }

  async addComment(
    taskId: string,
    dto: CreateTaskCommentDto,
    organizationId: string,
    userId: string,
  ) {
    const task = await this.prisma.task.findFirst({
      where: { id: taskId, organizationId },
    });

    if (!task) {
      throw new NotFoundException('Tarefa não encontrada');
    }

    const comment = await this.prisma.taskComment.create({
      data: {
        taskId,
        userId,
        content: dto.content,
      },
      include: {
        user: { select: { id: true, name: true } },
      },
    });

    return {
      id: comment.id,
      taskId: comment.taskId,
      userId: comment.userId,
      user: { id: comment.user.id, name: comment.user.name },
      content: comment.content,
      createdAt: comment.createdAt.toISOString(),
    };
  }

  async findByPatient(patientId: string, organizationId: string, userId: string, roleName: string): Promise<Task[]> {
    const where: any = { patientId, organizationId };

    if (roleName === 'professional') {
      where.OR = [
        { createdBy: userId },
        { assignedTo: userId },
      ];
    }

    const tasks = await this.prisma.task.findMany({
      where,
      orderBy: [{ createdAt: 'desc' }],
      include: {
        assignedToUser: { select: { id: true, name: true } },
        createdByUser: { select: { id: true, name: true } },
      },
    });
    return tasks.map(this.mapTask.bind(this));
  }

  async findByAppointment(appointmentId: string, organizationId: string, userId: string, roleName: string): Promise<Task[]> {
    const where: any = { appointmentId, organizationId };

    if (roleName === 'professional') {
      where.OR = [
        { createdBy: userId },
        { assignedTo: userId },
      ];
    }

    const tasks = await this.prisma.task.findMany({
      where,
      orderBy: [{ createdAt: 'desc' }],
      include: {
        assignedToUser: { select: { id: true, name: true } },
        createdByUser: { select: { id: true, name: true } },
      },
    });
    return tasks.map(this.mapTask.bind(this));
  }

  private mapTask(task: any): Task {
    return {
      id: task.id,
      organizationId: task.organizationId,
      patientId: task.patientId,
      appointmentId: task.appointmentId,
      title: task.title,
      description: task.description,
      status: task.status as TaskStatus,
      priority: task.priority as TaskPriority,
      assignedTo: task.assignedToUser ? { id: task.assignedToUser.id, name: task.assignedToUser.name } : null,
      dueDate: task.dueDate?.toISOString(),
      completedAt: task.completedAt?.toISOString(),
      createdBy: { id: task.createdByUser.id, name: task.createdByUser.name },
      createdAt: task.createdAt.toISOString(),
      updatedAt: task.updatedAt.toISOString(),
    };
  }

  private mapTaskWithComments(task: any): Task & { comments?: any[] } {
    return {
      ...this.mapTask(task),
      comments: task.comments?.map((c: any) => ({
        id: c.id,
        taskId: c.taskId,
        userId: c.userId,
        user: { id: c.user.id, name: c.user.name },
        content: c.content,
        createdAt: c.createdAt.toISOString(),
      })),
    };
  }
}