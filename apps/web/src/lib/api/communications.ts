import { getAuthHeaders, authenticatedFetch } from './client';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1';

export interface Communication {
  id: string;
  organizationId: string;
  patientId: string;
  appointmentId?: string;
  templateId?: string;
  channel: string;
  type: string;
  recipient: string;
  message: string;
  status: string;
  provider?: string;
  scheduledAt: string;
  sentAt?: string;
  createdAt: string;
}

export interface CommunicationCreateRequest {
  patientId: string;
  appointmentId?: string;
  templateId?: string;
  channel: string;
  type: string;
  recipient: string;
  message: string;
  scheduledAt: string;
}

export interface CommunicationsApiClient {
  list(params?: {
    page?: number;
    limit?: number;
    patientId?: string;
    appointmentId?: string;
    channel?: string;
    status?: string;
    startDate?: string;
    endDate?: string;
  }): Promise<{ items: Communication[]; pagination: any }>;
  getById(id: string): Promise<Communication>;
  getByPatient(patientId: string): Promise<Communication[]>;
  getByAppointment(appointmentId: string): Promise<Communication[]>;
  create(data: CommunicationCreateRequest): Promise<Communication>;
  send(id: string): Promise<void>;
}

export const communicationsApi: CommunicationsApiClient = {
  async list(params) {
    const searchParams = new URLSearchParams();
    if (params?.page) searchParams.set('page', String(params.page));
    if (params?.limit) searchParams.set('limit', String(params.limit));
    if (params?.patientId) searchParams.set('patientId', params.patientId);
    if (params?.appointmentId) searchParams.set('appointmentId', params.appointmentId);
    if (params?.channel) searchParams.set('channel', params.channel);
    if (params?.status) searchParams.set('status', params.status);
    if (params?.startDate) searchParams.set('startDate', params.startDate);
    if (params?.endDate) searchParams.set('endDate', params.endDate);

    const response = await authenticatedFetch(`${API_URL}/communications?${searchParams}`, {
      headers: getAuthHeaders(),
    });
    if (!response.ok) throw new Error('Failed to fetch communications');
    return response.json();
  },

  async getById(id) {
    const response = await authenticatedFetch(`${API_URL}/communications/${id}`, {
      headers: getAuthHeaders(),
    });
    if (!response.ok) throw new Error('Failed to fetch communication');
    return response.json();
  },

  async getByPatient(patientId) {
    const response = await authenticatedFetch(`${API_URL}/communications/patient/${patientId}`, {
      headers: getAuthHeaders(),
    });
    if (!response.ok) throw new Error('Failed to fetch patient communications');
    return response.json();
  },

  async getByAppointment(appointmentId) {
    const response = await authenticatedFetch(`${API_URL}/communications/appointment/${appointmentId}`, {
      headers: getAuthHeaders(),
    });
    if (!response.ok) throw new Error('Failed to fetch appointment communications');
    return response.json();
  },

  async create(data) {
    const response = await authenticatedFetch(`${API_URL}/communications`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error('Failed to create communication');
    return response.json();
  },

  async send(id) {
    const response = await authenticatedFetch(`${API_URL}/communications/${id}/send`, {
      method: 'POST',
      headers: getAuthHeaders(),
    });
    if (!response.ok) throw new Error('Failed to send communication');
  },
};