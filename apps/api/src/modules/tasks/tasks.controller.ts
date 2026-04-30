import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  ParseUUIDPipe,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiResponse } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/guards/roles.guard';
import { TasksService } from './tasks.service';
import {
  CreateTaskDto,
  UpdateTaskDto,
  UpdateTaskStatusDto,
  CreateTaskCommentDto,
  CreateTaskChecklistItemDto,
  UpdateTaskChecklistItemDto,
  UpdateTaskCommentDto,
  ListTasksQueryDto,
} from './dto/task.dto';
import { Task, TaskListResponse, TaskComment, TaskChecklistItem } from '@clinica-saas/contracts';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@ApiTags('Tasks')
@Controller('tasks')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('super_admin', 'org_admin', 'receptionist', 'professional')
export class TasksController {
  constructor(private readonly tasksService: TasksService) {}

  @Get()
  @ApiOperation({ summary: 'Listar tarefas' })
  async findAll(
    @Query() query: ListTasksQueryDto,
    @CurrentUser() user: any,
  ): Promise<TaskListResponse> {
    console.log('[TasksController.findAll] user:', JSON.stringify({ 
      sub: user.sub, 
      roleName: user.roleName, 
      organizationId: user.organizationId 
    }));
    return this.tasksService.findAll(query, user.organizationId!, user.sub, user.roleName);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Detalhar tarefa' })
  async findOne(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: any,
  ): Promise<Task> {
    return this.tasksService.findById(id, user.organizationId!, user.sub, user.roleName);
  }

  @Post()
  @ApiOperation({ summary: 'Criar tarefa' })
  async create(
    @Body() dto: CreateTaskDto,
    @CurrentUser() user: any,
  ): Promise<Task> {
    return this.tasksService.create(dto, user.organizationId!, user.sub);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Editar tarefa' })
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateTaskDto,
    @CurrentUser() user: any,
  ): Promise<Task> {
    return this.tasksService.update(id, dto, user.organizationId!, user.sub);
  }

  @Patch(':id/status')
  @ApiOperation({ summary: 'Atualizar status da tarefa' })
  async updateStatus(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateTaskStatusDto,
    @CurrentUser() user: any,
  ): Promise<Task> {
    return this.tasksService.updateStatus(id, dto.status, user.organizationId!, user.sub);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Excluir tarefa' })
  async remove(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: any,
  ): Promise<void> {
    return this.tasksService.delete(id, user.organizationId!, user.sub);
  }

  @Post(':id/comments')
  @ApiOperation({ summary: 'Adicionar comentário' })
  async addComment(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: CreateTaskCommentDto,
    @CurrentUser() user: any,
  ): Promise<TaskComment> {
    return this.tasksService.addComment(id, dto, user.organizationId!, user.sub);
  }

  @Patch(':id/comments/:commentId')
  @ApiOperation({ summary: 'Editar comentário' })
  async updateComment(
    @Param('id', ParseUUIDPipe) id: string,
    @Param('commentId', ParseUUIDPipe) commentId: string,
    @Body() dto: UpdateTaskCommentDto,
    @CurrentUser() user: any,
  ): Promise<TaskComment> {
    return this.tasksService.updateComment(id, commentId, dto, user.organizationId!, user.sub);
  }

  @Delete(':id/comments/:commentId')
  @ApiOperation({ summary: 'Excluir comentário' })
  async deleteComment(
    @Param('id', ParseUUIDPipe) id: string,
    @Param('commentId', ParseUUIDPipe) commentId: string,
    @CurrentUser() user: any,
  ): Promise<void> {
    return this.tasksService.deleteComment(id, commentId, user.organizationId!, user.sub);
  }

  @Post(':id/checklist')
  @ApiOperation({ summary: 'Criar item do checklist' })
  async createChecklistItem(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: CreateTaskChecklistItemDto,
    @CurrentUser() user: any,
  ): Promise<TaskChecklistItem> {
    return this.tasksService.createChecklistItem(id, dto, user.organizationId!, user.sub);
  }

  @Patch(':id/checklist/:itemId')
  @ApiOperation({ summary: 'Atualizar item do checklist' })
  async updateChecklistItem(
    @Param('id', ParseUUIDPipe) id: string,
    @Param('itemId', ParseUUIDPipe) itemId: string,
    @Body() dto: UpdateTaskChecklistItemDto,
    @CurrentUser() user: any,
  ): Promise<TaskChecklistItem> {
    return this.tasksService.updateChecklistItem(id, itemId, dto, user.organizationId!);
  }

  @Patch(':id/checklist/:itemId/toggle')
  @ApiOperation({ summary: 'Alternar concluído do item' })
  async toggleChecklistItem(
    @Param('id', ParseUUIDPipe) id: string,
    @Param('itemId', ParseUUIDPipe) itemId: string,
    @CurrentUser() user: any,
  ): Promise<TaskChecklistItem> {
    return this.tasksService.toggleChecklistItem(id, itemId, user.organizationId!);
  }

  @Delete(':id/checklist/:itemId')
  @ApiOperation({ summary: 'Excluir item do checklist' })
  async deleteChecklistItem(
    @Param('id', ParseUUIDPipe) id: string,
    @Param('itemId', ParseUUIDPipe) itemId: string,
    @CurrentUser() user: any,
  ): Promise<void> {
    return this.tasksService.deleteChecklistItem(id, itemId, user.organizationId!);
  }

  @Get('patient/:patientId')
  @ApiOperation({ summary: 'Listar tarefas do paciente' })
  async findByPatient(
    @Param('patientId', ParseUUIDPipe) patientId: string,
    @CurrentUser() user: any,
  ): Promise<Task[]> {
    return this.tasksService.findByPatient(patientId, user.organizationId!, user.sub, user.roleName);
  }

  @Get('appointment/:appointmentId')
  @ApiOperation({ summary: 'Listar tarefas do agendamento' })
  async findByAppointment(
    @Param('appointmentId', ParseUUIDPipe) appointmentId: string,
    @CurrentUser() user: any,
  ): Promise<Task[]> {
    return this.tasksService.findByAppointment(appointmentId, user.organizationId!, user.sub, user.roleName);
  }
}