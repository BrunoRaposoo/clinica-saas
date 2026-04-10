export interface BaseEntity {
  id: string;
  createdAt: Date;
  updatedAt: Date;
}

export * from './auth';
export type {
  PatientListParams,
  PatientListResponse,
  PatientCreateRequest,
  PatientUpdateRequest,
  PatientContactCreateRequest,
  PatientContactUpdateRequest,
} from './patient';
export type {
  AppointmentListParams,
  AppointmentListResponse,
  AppointmentCreateRequest,
  AppointmentUpdateRequest,
  AppointmentCancelRequest,
  AppointmentRescheduleRequest,
  CalendarResponse,
  AvailabilityResponse,
  Professional,
  ScheduleBlock,
  ScheduleBlockCreateRequest,
} from './appointment';

export interface Organization extends BaseEntity {
  name: string;
  document: string;
  email?: string;
  phone?: string;
  address?: string;
  isActive: boolean;
}

export interface User extends BaseEntity {
  email: string;
  name: string;
  organizationId?: string | null;
  roleId: string;
  isActive: boolean;
  lastLoginAt?: Date | null;
}

export interface Role extends BaseEntity {
  name: string;
  description?: string | null;
  isSystem: boolean;
}

export interface Permission extends BaseEntity {
  name: string;
  description?: string | null;
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