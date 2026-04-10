export { ApiResponseSchema, Appointment, AppointmentCancel, AppointmentCreate, AppointmentReschedule, AppointmentSchema, AppointmentStatus, AppointmentUpdate, AuthUserResponse, AuthUserResponseSchema, ForgotPasswordInput, ForgotPasswordSchema, LoginInput, LoginResponsePayload, LoginResponseSchema, LoginSchema, MessageStatus, OrganizationSchema, PaginatedResponseSchema, PaginationSchema, Patient, PatientContact, PatientContactCreate, PatientContactUpdate, PatientCreate, PatientSchema, PatientUpdate, PaymentStatus, PermissionSchema, ProfessionalSchema, ProfessionalSpecialty, RefreshTokenInput, RefreshTokenResponsePayload, RefreshTokenResponseSchema, RefreshTokenSchema, RegisterInput, RegisterSchema, ResetPasswordInput, ResetPasswordSchema, RoleSchema, SystemRole, UserRole, UserSchema } from './zod.js';
import 'zod';

interface AuthUser {
    id: string;
    email: string;
    name: string;
    organizationId?: string | null;
    roleId: string;
    roleName: string;
}
interface LoginRequest {
    email: string;
    password: string;
}
interface LoginResponse {
    accessToken: string;
    refreshToken: string;
    expiresIn: number;
    user: AuthUser;
}
interface RegisterRequest {
    email: string;
    password: string;
    name: string;
    organizationId?: string;
}
interface RefreshTokenRequest {
    refreshToken: string;
}
interface RefreshTokenResponse {
    accessToken: string;
    expiresIn: number;
}
interface ForgotPasswordRequest {
    email: string;
}
interface ResetPasswordRequest {
    token: string;
    newPassword: string;
}
interface LogoutResponse {
    success: boolean;
}
interface TokenPayload {
    sub: string;
    email: string;
    name: string;
    organizationId?: string;
    roleId: string;
    roleName: string;
    jti: string;
    iat: number;
    exp: number;
}

interface Patient {
    id: string;
    organizationId: string;
    name: string;
    email?: string | null;
    phone?: string | null;
    document?: string | null;
    birthDate?: string | null;
    gender?: 'male' | 'female' | 'other' | null;
    addressStreet?: string | null;
    addressNumber?: string | null;
    addressComplement?: string | null;
    addressDistrict?: string | null;
    addressCity?: string | null;
    addressState?: string | null;
    addressZipCode?: string | null;
    notes?: string | null;
    tags: string[];
    isActive: boolean;
    deletedAt?: string | null;
    createdAt: string;
    updatedAt: string;
    contacts?: PatientContact[];
}
interface PatientContact {
    id: string;
    patientId: string;
    name: string;
    relationship: string;
    phone?: string | null;
    email?: string | null;
    isPrimary: boolean;
    createdAt: string;
    updatedAt: string;
}
interface PatientListParams {
    page?: number;
    limit?: number;
    search?: string;
    document?: string;
    phone?: string;
    isActive?: boolean;
}
interface PatientListResponse {
    items: Patient[];
    pagination: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
    };
}
interface PatientCreateRequest {
    name: string;
    email?: string;
    phone?: string;
    document?: string;
    birthDate?: string;
    gender?: 'male' | 'female' | 'other';
    addressStreet?: string;
    addressNumber?: string;
    addressComplement?: string;
    addressDistrict?: string;
    addressCity?: string;
    addressState?: string;
    addressZipCode?: string;
    notes?: string;
    tags?: string[];
    contacts?: PatientContactCreateRequest[];
}
interface PatientUpdateRequest {
    name?: string;
    email?: string;
    phone?: string;
    document?: string;
    birthDate?: string;
    gender?: 'male' | 'female' | 'other';
    addressStreet?: string;
    addressNumber?: string;
    addressComplement?: string;
    addressDistrict?: string;
    addressCity?: string;
    addressState?: string;
    addressZipCode?: string;
    notes?: string;
    tags?: string[];
    isActive?: boolean;
}
interface PatientContactCreateRequest {
    name: string;
    relationship: string;
    phone?: string;
    email?: string;
    isPrimary?: boolean;
}
interface PatientContactUpdateRequest {
    name?: string;
    relationship?: string;
    phone?: string;
    email?: string;
    isPrimary?: boolean;
}

interface Appointment {
    id: string;
    organizationId: string;
    patientId: string;
    professionalId: string;
    appointmentTypeId?: string | null;
    status: AppointmentStatus;
    startDate: string;
    endDate: string;
    duration: number;
    notes?: string | null;
    cancellationReason?: string | null;
    cancelledBy?: string | null;
    cancelledAt?: string | null;
    createdAt: string;
    updatedAt: string;
    patient?: PatientBasic;
    professional?: ProfessionalBasic;
    appointmentType?: AppointmentTypeBasic;
}
interface PatientBasic {
    id: string;
    name: string;
}
interface ProfessionalBasic {
    id: string;
    name: string;
    specialty: string;
    color: string;
}
interface AppointmentTypeBasic {
    id: string;
    name: string;
    duration: number;
    color: string;
}
type AppointmentStatus = 'scheduled' | 'confirmed' | 'in_progress' | 'completed' | 'cancelled' | 'no_show';
interface AppointmentListParams {
    page?: number;
    limit?: number;
    startDate?: string;
    endDate?: string;
    professionalId?: string;
    patientId?: string;
    status?: AppointmentStatus;
}
interface AppointmentListResponse {
    items: Appointment[];
    pagination: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
    };
}
interface AppointmentCreateRequest {
    patientId: string;
    professionalId: string;
    appointmentTypeId?: string;
    startDate: string;
    notes?: string;
}
interface AppointmentUpdateRequest {
    appointmentTypeId?: string;
    startDate?: string;
    notes?: string;
    status?: AppointmentStatus;
}
interface AppointmentCancelRequest {
    reason: string;
}
interface AppointmentRescheduleRequest {
    newStartDate: string;
}
interface CalendarDay {
    date: string;
    slots: CalendarSlot[];
}
interface CalendarSlot {
    time: string;
    appointment?: Appointment;
    available?: boolean;
    blocked?: {
        start: string;
        end: string;
        reason: string;
    };
}
interface CalendarResponse {
    view: 'day' | 'week' | 'month';
    startDate: string;
    endDate: string;
    days: CalendarDay[];
}
interface Professional {
    id: string;
    userId: string;
    organizationId: string;
    specialty: string;
    appointmentTypeId?: string | null;
    color: string;
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
    user?: {
        id: string;
        name: string;
    };
}
interface ScheduleBlock {
    id: string;
    organizationId: string;
    professionalId: string;
    startDate: string;
    endDate: string;
    reason: string;
    createdAt: string;
    updatedAt: string;
}
interface ScheduleBlockCreateRequest {
    professionalId: string;
    startDate: string;
    endDate: string;
    reason: string;
}
interface AvailabilityResponse {
    date: string;
    availableSlots: string[];
    blockedSlots: {
        start: string;
        end: string;
        reason: string;
    }[];
}

interface BaseEntity {
    id: string;
    createdAt: Date;
    updatedAt: Date;
}

interface Organization extends BaseEntity {
    name: string;
    document: string;
    email?: string;
    phone?: string;
    address?: string;
    isActive: boolean;
}
interface User extends BaseEntity {
    email: string;
    name: string;
    organizationId?: string | null;
    roleId: string;
    isActive: boolean;
    lastLoginAt?: Date | null;
}
interface Role extends BaseEntity {
    name: string;
    description?: string | null;
    isSystem: boolean;
}
interface Permission extends BaseEntity {
    name: string;
    description?: string | null;
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

export type { ApiError, ApiResponse, AppointmentCancelRequest, AppointmentCreateRequest, AppointmentListParams, AppointmentListResponse, AppointmentRescheduleRequest, AppointmentUpdateRequest, AuthUser, AvailabilityResponse, BaseEntity, CalendarResponse, ForgotPasswordRequest, LoginRequest, LoginResponse, LogoutResponse, Organization, PaginatedResponse, Pagination, PatientContactCreateRequest, PatientContactUpdateRequest, PatientCreateRequest, PatientListParams, PatientListResponse, PatientUpdateRequest, Permission, Professional, RefreshTokenRequest, RefreshTokenResponse, RegisterRequest, ResetPasswordRequest, Role, ScheduleBlock, ScheduleBlockCreateRequest, TokenPayload, User };
