import {
  Task,
  TaskListParams,
  TaskListResponse,
  TaskCreateRequest,
  TaskUpdateRequest,
  TaskStatusUpdateRequest,
  TaskCommentCreateRequest,
  TaskComment,
} from '@clinica-saas/contracts';

import { getAuthHeaders, authenticatedFetch } from './client';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1';
const BASE_URL = `${API_URL}/tasks`;

export const tasksApi = {
  list: async (params?: TaskListParams): Promise<TaskListResponse> => {
    const searchParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== '') {
          searchParams.append(key, String(value));
        }
      });
    }
    const response = await authenticatedFetch(`${BASE_URL}?${searchParams}`, {
      headers: getAuthHeaders(),
    });
    if (!response.ok) throw new Error('Failed to fetch tasks');
    return response.json();
  },

  getById: async (id: string): Promise<Task> => {
    const response = await authenticatedFetch(`${BASE_URL}/${id}`, {
      headers: getAuthHeaders(),
    });
    if (!response.ok) throw new Error('Failed to fetch task');
    return response.json();
  },

  create: async (data: TaskCreateRequest): Promise<Task> => {
    const response = await authenticatedFetch(BASE_URL, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error('Failed to create task');
    return response.json();
  },

  update: async (id: string, data: TaskUpdateRequest): Promise<Task> => {
    const response = await authenticatedFetch(`${BASE_URL}/${id}`, {
      method: 'PATCH',
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error('Failed to update task');
    return response.json();
  },

  updateStatus: async (id: string, data: TaskStatusUpdateRequest): Promise<Task> => {
    const response = await authenticatedFetch(`${BASE_URL}/${id}/status`, {
      method: 'PATCH',
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error('Failed to update task status');
    return response.json();
  },

  delete: async (id: string): Promise<void> => {
    const response = await authenticatedFetch(`${BASE_URL}/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });
    if (!response.ok) throw new Error('Failed to delete task');
  },

  addComment: async (id: string, data: TaskCommentCreateRequest): Promise<TaskComment> => {
    const response = await authenticatedFetch(`${BASE_URL}/${id}/comments`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error('Failed to add comment');
    return response.json();
  },

  getByPatient: async (patientId: string): Promise<Task[]> => {
    const response = await authenticatedFetch(`${BASE_URL}/patient/${patientId}`, {
      headers: getAuthHeaders(),
    });
    if (!response.ok) throw new Error('Failed to fetch patient tasks');
    return response.json();
  },

  getByAppointment: async (appointmentId: string): Promise<Task[]> => {
    const response = await authenticatedFetch(`${BASE_URL}/appointment/${appointmentId}`, {
      headers: getAuthHeaders(),
    });
    if (!response.ok) throw new Error('Failed to fetch appointment tasks');
    return response.json();
  },
};