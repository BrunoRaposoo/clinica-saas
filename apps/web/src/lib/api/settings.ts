import { authenticatedFetch } from './client';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1';

export interface OrganizationSettings {
  id: string;
  organizationId: string;
  businessName: string;
  tradeName?: string;
  email: string;
  phone?: string;
  address?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  timezone: string;
  locale: string;
  currency: string;
  createdAt: string;
  updatedAt: string;
}

export interface Unit {
  id: string;
  organizationId: string;
  name: string;
  address?: string;
  phone?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ServiceType {
  id: string;
  organizationId: string;
  name: string;
  description?: string;
  duration: number;
  price?: number;
  color?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Professional {
  id: string;
  organizationId: string;
  userId: string;
  user: { id: string; name: string; email: string; phone?: string };
  specialtyId?: string;
  specialty?: Specialty;
  registerNumber?: string;
  color?: string;
  appointmentTypeId?: string;
  appointmentType?: { id: string; name: string; duration: number };
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Specialty {
  id: string;
  organizationId: string;
  category: string;
  name: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export type SpecialtyCategory = 'medical' | 'dental' | 'psychology' | 'nutrition' | 'physiotherapy' | 'complementary' | 'technical' | 'admin';

export const SPECIALTY_CATEGORIES: { value: SpecialtyCategory; label: string }[] = [
  { value: 'medical', label: 'Médica' },
  { value: 'dental', label: 'Odontológica' },
  { value: 'psychology', label: 'Psicologia' },
  { value: 'nutrition', label: 'Nutrição' },
  { value: 'physiotherapy', label: 'Fisioterapia' },
  { value: 'complementary', label: 'Saúde Complementar' },
  { value: 'technical', label: 'Técnico em Saúde' },
  { value: 'admin', label: 'Administrativo' },
];

export interface SchedulePreferences {
  id: string;
  organizationId: string;
  defaultDuration: number;
  minInterval: number;
  maxAdvanceDays: number;
  allowOverbooking: boolean;
  requireConfirmation: boolean;
  startWorkHour: string;
  endWorkHour: string;
  workDays: number[];
  createdAt: string;
  updatedAt: string;
}

export interface CommunicationPreferences {
  id: string;
  organizationId: string;
  defaultChannel: string;
  sendAppointmentReminder: boolean;
  reminderHoursBefore: number;
  sendPaymentReminder: boolean;
  reminderDaysBefore: number;
  defaultEmailTemplate?: string;
  defaultSmsTemplate?: string;
  createdAt: string;
  updatedAt: string;
}

export interface AuditLog {
  id: string;
  organizationId: string;
  userId: string;
  user: { id: string; name: string };
  action: string;
  entity: string;
  entityId?: string;
  changes?: { before: Record<string, unknown>; after: Record<string, unknown> };
  ipAddress?: string;
  userAgent?: string;
  createdAt: string;
}

export const settingsApi = {
  getSettings: async (): Promise<OrganizationSettings> => {
    const response = await authenticatedFetch(`${API_URL}/settings`);
    if (!response.ok) throw new Error('Failed to fetch settings');
    return response.json();
  },

  updateSettings: async (data: Partial<OrganizationSettings>): Promise<OrganizationSettings> => {
    const response = await authenticatedFetch(`${API_URL}/settings`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error('Failed to update settings');
    return response.json();
  },

  listUnits: async (params?: { page?: number; limit?: number; isActive?: boolean }): Promise<{ items: Unit[]; pagination: any }> => {
    const searchParams = new URLSearchParams();
    if (params?.page) searchParams.set('page', String(params.page));
    if (params?.limit) searchParams.set('limit', String(params.limit));
    if (params?.isActive !== undefined) searchParams.set('isActive', String(params.isActive));
    const response = await authenticatedFetch(`${API_URL}/settings/units?${searchParams}`);
    if (!response.ok) throw new Error('Failed to fetch units');
    return response.json();
  },

  createUnit: async (data: { name: string; address?: string; phone?: string }): Promise<Unit> => {
    const response = await authenticatedFetch(`${API_URL}/settings/units`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error('Failed to create unit');
    return response.json();
  },

  updateUnit: async (id: string, data: Partial<Unit>): Promise<Unit> => {
    const response = await authenticatedFetch(`${API_URL}/settings/units/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error('Failed to update unit');
    return response.json();
  },

  deleteUnit: async (id: string): Promise<void> => {
    const response = await authenticatedFetch(`${API_URL}/settings/units/${id}`, { method: 'DELETE' });
    if (!response.ok) throw new Error('Failed to delete unit');
  },

  listServiceTypes: async (params?: { page?: number; limit?: number; isActive?: boolean }): Promise<{ items: ServiceType[]; pagination: any }> => {
    const searchParams = new URLSearchParams();
    if (params?.page) searchParams.set('page', String(params.page));
    if (params?.limit) searchParams.set('limit', String(params.limit));
    if (params?.isActive !== undefined) searchParams.set('isActive', String(params.isActive));
    const response = await authenticatedFetch(`${API_URL}/settings/service-types?${searchParams}`);
    if (!response.ok) throw new Error('Failed to fetch service types');
    return response.json();
  },

  createServiceType: async (data: { name: string; description?: string; duration: number; price?: string; color?: string }): Promise<ServiceType> => {
    const response = await authenticatedFetch(`${API_URL}/settings/service-types`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error('Failed to create service type');
    return response.json();
  },

  updateServiceType: async (id: string, data: Partial<ServiceType>): Promise<ServiceType> => {
    const response = await authenticatedFetch(`${API_URL}/settings/service-types/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error('Failed to update service type');
    return response.json();
  },

  deleteServiceType: async (id: string): Promise<void> => {
    const response = await authenticatedFetch(`${API_URL}/settings/service-types/${id}`, { method: 'DELETE' });
    if (!response.ok) throw new Error('Failed to delete service type');
  },

  listProfessionals: async (params?: { page?: number; limit?: number; isActive?: boolean }): Promise<{ items: Professional[]; pagination: any }> => {
    const searchParams = new URLSearchParams();
    if (params?.page) searchParams.set('page', String(params.page));
    if (params?.limit) searchParams.set('limit', String(params.limit));
    if (params?.isActive !== undefined) searchParams.set('isActive', String(params.isActive));
    const response = await authenticatedFetch(`${API_URL}/settings/professionals?${searchParams}`);
    if (!response.ok) throw new Error('Failed to fetch professionals');
    return response.json();
  },

  createProfessional: async (data: { userId: string; specialtyId?: string; registerNumber?: string; color?: string; appointmentTypeId?: string }): Promise<Professional> => {
    const response = await authenticatedFetch(`${API_URL}/settings/professionals`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error('Failed to create professional');
    return response.json();
  },

  updateProfessional: async (id: string, data: Partial<Professional>): Promise<Professional> => {
    const response = await authenticatedFetch(`${API_URL}/settings/professionals/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error('Failed to update professional');
    return response.json();
  },

  deleteProfessional: async (id: string): Promise<void> => {
    const response = await authenticatedFetch(`${API_URL}/settings/professionals/${id}`, { method: 'DELETE' });
    if (!response.ok) throw new Error('Failed to delete professional');
  },

  getSchedulePreferences: async (): Promise<SchedulePreferences> => {
    const response = await authenticatedFetch(`${API_URL}/settings/schedule-preferences`);
    if (!response.ok) throw new Error('Failed to fetch schedule preferences');
    return response.json();
  },

  updateSchedulePreferences: async (data: Partial<SchedulePreferences>): Promise<SchedulePreferences> => {
    const response = await authenticatedFetch(`${API_URL}/settings/schedule-preferences`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error('Failed to update schedule preferences');
    return response.json();
  },

  getCommunicationPreferences: async (): Promise<CommunicationPreferences> => {
    const response = await authenticatedFetch(`${API_URL}/settings/communication-preferences`);
    if (!response.ok) throw new Error('Failed to fetch communication preferences');
    return response.json();
  },

  updateCommunicationPreferences: async (data: Partial<CommunicationPreferences>): Promise<CommunicationPreferences> => {
    const response = await authenticatedFetch(`${API_URL}/settings/communication-preferences`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error('Failed to update communication preferences');
    return response.json();
  },
};

export const specialtiesApi = {
  list: async (params?: { category?: string }): Promise<{ items: Specialty[] }> => {
    const searchParams = new URLSearchParams();
    if (params?.category) searchParams.set('category', params.category);
    const query = searchParams.toString();
    const response = await authenticatedFetch(`${API_URL}/specialties${query ? `?${query}` : ''}`);
    if (!response.ok) throw new Error('Failed to fetch specialties');
    return response.json();
  },

  create: async (data: { category: string; name: string }): Promise<Specialty> => {
    const response = await authenticatedFetch(`${API_URL}/specialties`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error('Failed to create specialty');
    return response.json();
  },

  update: async (id: string, data: { name?: string; category?: string; isActive?: boolean }): Promise<Specialty> => {
    const response = await authenticatedFetch(`${API_URL}/specialties/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error('Failed to update specialty');
    return response.json();
  },

  delete: async (id: string): Promise<void> => {
    const response = await authenticatedFetch(`${API_URL}/specialties/${id}`, { method: 'DELETE' });
    if (!response.ok) throw new Error('Failed to delete specialty');
  },
};

export const auditApi = {
  listLogs: async (params?: {
    page?: number;
    limit?: number;
    userId?: string;
    action?: string;
    entity?: string;
    startDate?: string;
    endDate?: string;
  }): Promise<{ items: AuditLog[]; pagination: any }> => {
    const searchParams = new URLSearchParams();
    if (params?.page) searchParams.set('page', String(params.page));
    if (params?.limit) searchParams.set('limit', String(params.limit));
    if (params?.userId) searchParams.set('userId', params.userId);
    if (params?.action) searchParams.set('action', params.action);
    if (params?.entity) searchParams.set('entity', params.entity);
    if (params?.startDate) searchParams.set('startDate', params.startDate);
    if (params?.endDate) searchParams.set('endDate', params.endDate);
    const response = await authenticatedFetch(`${API_URL}/audit/logs?${searchParams}`);
    if (!response.ok) throw new Error('Failed to fetch audit logs');
    return response.json();
  },

  getLog: async (id: string): Promise<AuditLog> => {
    const response = await authenticatedFetch(`${API_URL}/audit/logs/${id}`);
    if (!response.ok) throw new Error('Failed to fetch audit log');
    return response.json();
  },
};