const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1';

function getAuthHeaders(): HeadersInit {
  const accessToken = typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null;
  return {
    'Content-Type': 'application/json',
    ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
  };
}

export type DocumentCategory = 'identity' | 'exams' | 'prescriptions' | 'reports' | 'administrative' | 'other';

export interface Document {
  id: string;
  organizationId: string;
  patientId?: string;
  appointmentId?: string;
  category: DocumentCategory;
  type: string;
  name: string;
  description?: string;
  fileName: string;
  fileSize: number;
  mimeType: string;
  storageProvider: string;
  isPublic: boolean;
  expiresAt?: string;
  uploadedBy: { id: string; name: string };
  createdAt: string;
  updatedAt: string;
}

export interface DocumentsResponse {
  items: Document[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface CreateDocumentDto {
  patientId?: string;
  appointmentId?: string;
  category: DocumentCategory;
  type: string;
  name: string;
  description?: string;
}

export interface UpdateDocumentDto {
  category?: DocumentCategory;
  type?: string;
  name?: string;
  description?: string;
  isPublic?: boolean;
}

export interface DocumentsApiClient {
  list(params?: {
    page?: number;
    limit?: number;
    patientId?: string;
    appointmentId?: string;
    category?: DocumentCategory;
    type?: string;
    startDate?: string;
    endDate?: string;
    search?: string;
  }): Promise<DocumentsResponse>;
  getById(id: string): Promise<Document>;
  getByPatient(patientId: string): Promise<Document[]>;
  getByAppointment(appointmentId: string): Promise<Document[]>;
  create(data: CreateDocumentDto): Promise<Document>;
  update(id: string, data: UpdateDocumentDto): Promise<Document>;
  delete(id: string): Promise<void>;
}

export const documentsApi: DocumentsApiClient = {
  async list(params) {
    const searchParams = new URLSearchParams();
    if (params?.page) searchParams.set('page', String(params.page));
    if (params?.limit) searchParams.set('limit', String(params.limit));
    if (params?.patientId) searchParams.set('patientId', params.patientId);
    if (params?.appointmentId) searchParams.set('appointmentId', params.appointmentId);
    if (params?.category) searchParams.set('category', params.category);
    if (params?.type) searchParams.set('type', params.type);
    if (params?.startDate) searchParams.set('startDate', params.startDate);
    if (params?.endDate) searchParams.set('endDate', params.endDate);
    if (params?.search) searchParams.set('search', params.search);

    const response = await fetch(`${API_URL}/documents?${searchParams}`, {
      headers: getAuthHeaders(),
    });
    if (!response.ok) throw new Error('Failed to fetch documents');
    return response.json();
  },

  async getById(id) {
    const response = await fetch(`${API_URL}/documents/${id}`, {
      headers: getAuthHeaders(),
    });
    if (!response.ok) throw new Error('Failed to fetch document');
    return response.json();
  },

  async getByPatient(patientId) {
    const response = await fetch(`${API_URL}/documents/patient/${patientId}`, {
      headers: getAuthHeaders(),
    });
    if (!response.ok) throw new Error('Failed to fetch patient documents');
    return response.json();
  },

  async getByAppointment(appointmentId) {
    const response = await fetch(`${API_URL}/documents/appointment/${appointmentId}`, {
      headers: getAuthHeaders(),
    });
    if (!response.ok) throw new Error('Failed to fetch appointment documents');
    return response.json();
  },

  async create(data) {
    const response = await fetch(`${API_URL}/documents`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error('Failed to create document');
    return response.json();
  },

  async update(id, data) {
    const response = await fetch(`${API_URL}/documents/${id}`, {
      method: 'PATCH',
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error('Failed to update document');
    return response.json();
  },

  async delete(id) {
    const response = await fetch(`${API_URL}/documents/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });
    if (!response.ok) throw new Error('Failed to delete document');
  },
};