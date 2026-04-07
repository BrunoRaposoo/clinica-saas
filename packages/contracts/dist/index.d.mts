export { ApiResponseSchema, AppointmentSchema, AppointmentStatus, ClinicSchema, MessageStatus, PaginatedResponseSchema, PaginationSchema, PatientSchema, PaymentStatus, ProfessionalSchema, ProfessionalSpecialty, UserRole, UserSchema } from './zod.mjs';
import 'zod';

interface BaseEntity {
    id: string;
    createdAt: Date;
    updatedAt: Date;
}
interface Clinic extends BaseEntity {
    name: string;
    document: string;
    email?: string;
    phone?: string;
    address?: string;
}
interface User extends BaseEntity {
    email: string;
    name: string;
    role: 'admin' | 'clinic_owner' | 'professional' | 'receptionist';
    clinicId?: string | null;
}
interface Professional extends BaseEntity {
    userId: string;
    clinicId: string;
    specialty: string;
    document?: string;
}
interface Patient extends BaseEntity {
    clinicId: string;
    name: string;
    email?: string;
    phone?: string;
    document?: string;
    birthDate?: Date;
}
interface Appointment extends BaseEntity {
    clinicId: string;
    patientId: string;
    professionalId: string;
    status: string;
    startDate: Date;
    endDate: Date;
    notes?: string;
}
interface ApiError {
    code: string;
    message: string;
    details?: unknown;
}
interface ApiResponse<T = unknown> {
    success: boolean;
    data?: T;
    error?: ApiError;
    timestamp: Date;
}
interface Pagination {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
}
interface PaginatedResponse<T> {
    items: T[];
    pagination: Pagination;
}

export type { ApiError, ApiResponse, Appointment, BaseEntity, Clinic, PaginatedResponse, Pagination, Patient, Professional, User };
