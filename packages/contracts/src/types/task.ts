export type TaskStatus = 'pending' | 'in_progress' | 'completed';
export type TaskPriority = 'low' | 'medium' | 'high';
export type TaskAction = 'create' | 'update' | 'status_change' | 'delete';

export interface Task {
  id: string;
  organizationId: string;
  patientId?: string;
  appointmentId?: string;
  title: string;
  description?: string;
  status: TaskStatus;
  priority: TaskPriority;
  assignedTo?: { id: string; name: string } | null;
  dueDate?: string;
  completedAt?: string;
  createdBy: { id: string; name: string };
  createdAt: string;
  updatedAt: string;
}

export interface TaskListParams {
  page?: number;
  limit?: number;
  status?: TaskStatus;
  priority?: TaskPriority;
  assignedTo?: string;
  patientId?: string;
  appointmentId?: string;
  dueDateFrom?: string;
  dueDateTo?: string;
  search?: string;
}

export interface TaskListResponse {
  items: Task[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface TaskCreateRequest {
  title: string;
  description?: string;
  patientId?: string;
  appointmentId?: string;
  priority?: TaskPriority;
  assignedTo?: string;
  dueDate?: string;
}

export interface TaskUpdateRequest {
  title?: string;
  description?: string;
  priority?: TaskPriority;
  assignedTo?: string;
  dueDate?: string;
  status?: TaskStatus;
}

export interface TaskStatusUpdateRequest {
  status: TaskStatus;
}

export interface TaskComment {
  id: string;
  taskId: string;
  userId: string;
  user: { id: string; name: string };
  content: string;
  createdAt: string;
}

export interface TaskCommentCreateRequest {
  content: string;
}