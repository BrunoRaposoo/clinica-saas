import { getAuthHeaders, authenticatedFetch } from './client';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1';

export interface MessageTemplate {
  id: string;
  organizationId: string;
  name: string;
  channel: string;
  type: string;
  subject?: string;
  body: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface TemplatesResponse {
  items: MessageTemplate[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface CreateTemplateDto {
  name: string;
  channel: string;
  type: string;
  subject?: string;
  body: string;
}

export interface UpdateTemplateDto {
  name?: string;
  subject?: string;
  body?: string;
  isActive?: boolean;
}

export interface TemplatesApiClient {
  list(params?: { page?: number; limit?: number; channel?: string; type?: string; isActive?: boolean }): Promise<TemplatesResponse>;
  getById(id: string): Promise<MessageTemplate>;
  create(data: CreateTemplateDto): Promise<MessageTemplate>;
  update(id: string, data: UpdateTemplateDto): Promise<MessageTemplate>;
  delete(id: string): Promise<void>;
}

export const templatesApi: TemplatesApiClient = {
  async list(params) {
    const searchParams = new URLSearchParams();
    if (params?.page) searchParams.set('page', String(params.page));
    if (params?.limit) searchParams.set('limit', String(params.limit));
    if (params?.channel) searchParams.set('channel', params.channel);
    if (params?.type) searchParams.set('type', params.type);
    if (params?.isActive !== undefined) searchParams.set('isActive', String(params.isActive));

    const response = await authenticatedFetch(`${API_URL}/templates?${searchParams}`, {
      headers: getAuthHeaders(),
    });
    if (!response.ok) throw new Error('Failed to fetch templates');
    return response.json();
  },

  async getById(id) {
    const response = await authenticatedFetch(`${API_URL}/templates/${id}`, {
      headers: getAuthHeaders(),
    });
    if (!response.ok) throw new Error('Failed to fetch template');
    return response.json();
  },

  async create(data) {
    const response = await authenticatedFetch(`${API_URL}/templates`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error('Failed to create template');
    return response.json();
  },

  async update(id, data) {
    const response = await authenticatedFetch(`${API_URL}/templates/${id}`, {
      method: 'PATCH',
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error('Failed to update template');
    return response.json();
  },

  async delete(id) {
    const response = await authenticatedFetch(`${API_URL}/templates/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });
    if (!response.ok) throw new Error('Failed to delete template');
  },
};