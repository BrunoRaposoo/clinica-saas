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
import { TasksService } from './tasks.service';
import {
  CreateTaskDto,
  UpdateTaskDto,
  UpdateTaskStatusDto,
  CreateTaskCommentDto,
  ListTasksQueryDto,
} from './dto/task.dto';
import { Task, TaskListResponse, TaskComment } from '@clinica-saas/contracts';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@ApiTags('Tasks')
@Controller('tasks')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
export class TasksController {
  constructor(private readonly tasksService: TasksService) {}

  @Get()
  @ApiOperation({ summary: 'Listar tarefas' })
  async findAll(
    @Query() query: ListTasksQueryDto,
    @CurrentUser() user: any,
  ): Promise<TaskListResponse> {
    return this.tasksService.findAll(query, user.organizationId!);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Detalhar tarefa' })
  async findOne(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: any,
  ): Promise<Task> {
    return this.tasksService.findById(id, user.organizationId!);
  }

  @Post()
  @ApiOperation({ summary: 'Criar tarefa' })
  async create(
    @Body() dto: CreateTaskDto,
    @CurrentUser() user: any,
  ): Promise<Task> {
    return this.tasksService.create(dto, user.organizationId!, user.id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Editar tarefa' })
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateTaskDto,
    @CurrentUser() user: any,
  ): Promise<Task> {
    return this.tasksService.update(id, dto, user.organizationId!, user.id);
  }

  @Patch(':id/status')
  @ApiOperation({ summary: 'Atualizar status da tarefa' })
  async updateStatus(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateTaskStatusDto,
    @CurrentUser() user: any,
  ): Promise<Task> {
    return this.tasksService.updateStatus(id, dto.status, user.organizationId!, user.id);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Excluir tarefa' })
  async remove(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: any,
  ): Promise<void> {
    return this.tasksService.delete(id, user.organizationId!, user.id);
  }

  @Post(':id/comments')
  @ApiOperation({ summary: 'Adicionar comentário' })
  async addComment(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: CreateTaskCommentDto,
    @CurrentUser() user: any,
  ): Promise<TaskComment> {
    return this.tasksService.addComment(id, dto, user.organizationId!, user.id);
  }

  @Get('patient/:patientId')
  @ApiOperation({ summary: 'Listar tarefas do paciente' })
  async findByPatient(
    @Param('patientId', ParseUUIDPipe) patientId: string,
    @CurrentUser() user: any,
  ): Promise<Task[]> {
    return this.tasksService.findByPatient(patientId, user.organizationId!);
  }

  @Get('appointment/:appointmentId')
  @ApiOperation({ summary: 'Listar tarefas do agendamento' })
  async findByAppointment(
    @Param('appointmentId', ParseUUIDPipe) appointmentId: string,
    @CurrentUser() user: any,
  ): Promise<Task[]> {
    return this.tasksService.findByAppointment(appointmentId, user.organizationId!);
  }
}