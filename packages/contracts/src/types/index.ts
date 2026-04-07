export interface BaseEntity {
  id: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Clinic extends BaseEntity {
  name: string;
  document: string;
  email?: string;
  phone?: string;
  address?: string;
}

export interface User extends BaseEntity {
  email: string;
  name: string;
  role: 'admin' | 'clinic_owner' | 'professional' | 'receptionist';
  clinicId?: string | null;
}

export interface Professional extends BaseEntity {
  userId: string;
  clinicId: string;
  specialty: string;
  document?: string;
}

export interface Patient extends BaseEntity {
  clinicId: string;
  name: string;
  email?: string;
  phone?: string;
  document?: string;
  birthDate?: Date;
}

export interface Appointment extends BaseEntity {
  clinicId: string;
  patientId: string;
  professionalId: string;
  status: string;
  startDate: Date;
  endDate: Date;
  notes?: string;
}

export interface ApiError {
  code: string;
  message: string;
  details?: unknown;
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: ApiError;
  timestamp: Date;
}

export interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface PaginatedResponse<T> {
  items: T[];
  pagination: Pagination;
}