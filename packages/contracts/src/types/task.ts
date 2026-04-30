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
  checklistItems?: TaskChecklistItem[];
  comments?: TaskComment[];
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
  checklistItems?: TaskChecklistItemCreateRequest[];
}

export interface TaskUpdateRequest {
  title?: string;
  description?: string;
  priority?: TaskPriority;
  assignedTo?: string;
  dueDate?: string;
  status?: TaskStatus;
  checklistItems?: TaskChecklistItemCreateRequest[];
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

export interface TaskChecklistItem {
  id: string;
  taskId: string;
  content: string;
  isCompleted: boolean;
  order: number;
  createdAt: string;
  updatedAt: string;
}

export interface TaskChecklistItemCreateRequest {
  content: string;
  isCompleted?: boolean;
}

export interface TaskChecklistItemUpdateRequest {
  content?: string;
  isCompleted?: boolean;
}