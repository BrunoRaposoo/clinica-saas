import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../../common/prisma.service';
import { Task, TaskStatus, TaskPriority, TaskListParams, TaskListResponse, TaskChecklistItem, TaskComment } from '@clinica-saas/contracts';
import { CreateTaskDto, UpdateTaskDto, UpdateTaskStatusDto, CreateTaskCommentDto, CreateTaskChecklistItemDto, UpdateTaskChecklistItemDto, UpdateTaskCommentDto } from './dto/task.dto';

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
        ...(dto.checklistItems && dto.checklistItems.length > 0 && {
          checklistItems: {
            create: dto.checklistItems.map((item, index) => ({
              content: item.content,
              isCompleted: item.isCompleted ?? false,
              order: index,
            })),
          },
        }),
      },
      include: {
        assignedToUser: { select: { id: true, name: true } },
        createdByUser: { select: { id: true, name: true } },
        checklistItems: { orderBy: { order: 'asc' } },
        comments: { include: { user: { select: { id: true, name: true } } }, orderBy: { createdAt: 'asc' } },
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
          checklistItems: { orderBy: { order: 'asc' } },
          comments: {
            include: { user: { select: { id: true, name: true } } },
            orderBy: { createdAt: 'asc' },
          },
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
        checklistItems: { orderBy: { order: 'asc' } },
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

    if (dto.checklistItems !== undefined) {
      await this.prisma.taskChecklistItem.deleteMany({ where: { taskId: id } });
      if (dto.checklistItems.length > 0) {
        await this.prisma.taskChecklistItem.createMany({
          data: dto.checklistItems.map((item, index) => ({
            taskId: id,
            content: item.content,
            isCompleted: item.isCompleted ?? false,
            order: index,
          })),
        });
      }
    }

    const task = await this.prisma.task.update({
      where: { id },
      data,
      include: {
        assignedToUser: { select: { id: true, name: true } },
        createdByUser: { select: { id: true, name: true } },
        checklistItems: { orderBy: { order: 'asc' } },
        comments: { include: { user: { select: { id: true, name: true } } }, orderBy: { createdAt: 'asc' } },
      },
    });

    await this.prisma.taskAudit.create({
      data: {
        taskId: id,
        action: 'update',
        performedBy: userId,
      },
    });

    return this.mapTaskWithComments(task);
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

  async createChecklistItem(taskId: string, dto: CreateTaskChecklistItemDto, organizationId: string, userId: string): Promise<TaskChecklistItem> {
    const task = await this.prisma.task.findFirst({
      where: { id: taskId, organizationId },
    });
    if (!task) throw new NotFoundException('Tarefa não encontrada');

    const lastItem = await this.prisma.taskChecklistItem.findFirst({
      where: { taskId },
      orderBy: { order: 'desc' },
    });

    const item = await this.prisma.taskChecklistItem.create({
      data: {
        taskId,
        content: dto.content,
        isCompleted: dto.isCompleted ?? false,
        order: (lastItem?.order ?? -1) + 1,
      },
    });

    return this.mapChecklistItem(item);
  }

  async updateChecklistItem(taskId: string, itemId: string, dto: UpdateTaskChecklistItemDto, organizationId: string): Promise<TaskChecklistItem> {
    const task = await this.prisma.task.findFirst({
      where: { id: taskId, organizationId },
    });
    if (!task) throw new NotFoundException('Tarefa não encontrada');

    const item = await this.prisma.taskChecklistItem.update({
      where: { id: itemId },
      data: {
        ...(dto.content !== undefined && { content: dto.content }),
        ...(dto.isCompleted !== undefined && { isCompleted: dto.isCompleted }),
      },
    });

    return this.mapChecklistItem(item);
  }

  async toggleChecklistItem(taskId: string, itemId: string, organizationId: string): Promise<TaskChecklistItem> {
    const task = await this.prisma.task.findFirst({
      where: { id: taskId, organizationId },
    });
    if (!task) throw new NotFoundException('Tarefa não encontrada');

    const item = await this.prisma.taskChecklistItem.findUnique({
      where: { id: itemId },
    });
    if (!item || item.taskId !== taskId) throw new NotFoundException('Item não encontrado');

    const updated = await this.prisma.taskChecklistItem.update({
      where: { id: itemId },
      data: { isCompleted: !item.isCompleted },
    });

    return this.mapChecklistItem(updated);
  }

  async deleteChecklistItem(taskId: string, itemId: string, organizationId: string): Promise<void> {
    const task = await this.prisma.task.findFirst({
      where: { id: taskId, organizationId },
    });
    if (!task) throw new NotFoundException('Tarefa não encontrada');

    await this.prisma.taskChecklistItem.delete({ where: { id: itemId } });
  }

  async updateComment(taskId: string, commentId: string, dto: UpdateTaskCommentDto, organizationId: string, userId: string): Promise<TaskComment> {
    const task = await this.prisma.task.findFirst({
      where: { id: taskId, organizationId },
    });
    if (!task) throw new NotFoundException('Tarefa não encontrada');

    const comment = await this.prisma.taskComment.findUnique({
      where: { id: commentId },
    });
    if (!comment || comment.taskId !== taskId) throw new NotFoundException('Comentário não encontrado');
    if (comment.userId !== userId) throw new ForbiddenException('Você só pode editar seus próprios comentários');

    const updated = await this.prisma.taskComment.update({
      where: { id: commentId },
      data: { content: dto.content },
      include: { user: { select: { id: true, name: true } } },
    });

    return {
      id: updated.id,
      taskId: updated.taskId,
      userId: updated.userId,
      user: { id: updated.user.id, name: updated.user.name },
      content: updated.content,
      createdAt: updated.createdAt.toISOString(),
    };
  }

  async deleteComment(taskId: string, commentId: string, organizationId: string, userId: string): Promise<void> {
    const task = await this.prisma.task.findFirst({
      where: { id: taskId, organizationId },
    });
    if (!task) throw new NotFoundException('Tarefa não encontrada');

    const comment = await this.prisma.taskComment.findUnique({
      where: { id: commentId },
    });
    if (!comment || comment.taskId !== taskId) throw new NotFoundException('Comentário não encontrado');
    if (comment.userId !== userId) throw new ForbiddenException('Você só pode excluir seus próprios comentários');

    await this.prisma.taskComment.delete({ where: { id: commentId } });
  }

  private mapChecklistItem(item: any): TaskChecklistItem {
    return {
      id: item.id,
      taskId: item.taskId,
      content: item.content,
      isCompleted: item.isCompleted,
      order: item.order,
      createdAt: item.createdAt.toISOString(),
      updatedAt: item.updatedAt.toISOString(),
    };
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
      checklistItems: task.checklistItems?.map((item: any) => ({
        id: item.id,
        taskId: item.taskId,
        content: item.content,
        isCompleted: item.isCompleted,
        order: item.order,
        createdAt: item.createdAt.toISOString(),
        updatedAt: item.updatedAt.toISOString(),
      })),
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

  private mapTaskWithComments(task: any): Task & { comments?: any[]; checklistItems?: any[] } {
    return {
      ...this.mapTask(task),
      checklistItems: task.checklistItems?.map((item: any) => ({
        id: item.id,
        taskId: item.taskId,
        content: item.content,
        isCompleted: item.isCompleted,
        order: item.order,
        createdAt: item.createdAt.toISOString(),
        updatedAt: item.updatedAt.toISOString(),
      })),
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