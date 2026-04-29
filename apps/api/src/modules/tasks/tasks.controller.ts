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
  ListTasksQueryDto,
} from './dto/task.dto';
import { Task, TaskListResponse, TaskComment } from '@clinica-saas/contracts';
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