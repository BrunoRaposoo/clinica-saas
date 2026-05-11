import { authenticatedFetch } from './client';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1';

export interface User {
  id: string;
  email: string;
  name: string;
  phone?: string;
  role: string;
  roleId: string;
  roleName: string;
  organizationId: string;
  isActive: boolean;
  lastLoginAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateUserInput {
  email: string;
  password: string;
  name: string;
  phone?: string;
  roleId: string;
}

export const usersApi = {
  async createUser(data: CreateUserInput): Promise<User> {
    const response = await authenticatedFetch(`${API_URL}/users`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
    
    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Erro ao criar usuário' }));
      throw new Error(error.message || 'Erro ao criar usuário');
    }
    
    return response.json();
  },

  async listUsers(params?: { role?: string; page?: number; limit?: number }): Promise<{ items: User[]; pagination: any }> {
    const searchParams = new URLSearchParams();
    if (params?.role) searchParams.set('role', params.role);
    if (params?.page) searchParams.set('page', String(params.page));
    if (params?.limit) searchParams.set('limit', String(params.limit));
    
    const response = await authenticatedFetch(`${API_URL}/users?${searchParams}`);
    
    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Erro ao listar usuários' }));
      throw new Error(error.message || 'Erro ao listar usuários');
    }
    
    return response.json();
  },
};