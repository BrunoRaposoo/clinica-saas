export { ApiResponseSchema, AppointmentSchema, AuthUserResponse, AuthUserResponseSchema, ForgotPasswordInput, ForgotPasswordSchema, LoginInput, LoginResponsePayload, LoginResponseSchema, LoginSchema, MessageStatus, OrganizationSchema, PaginatedResponseSchema, PaginationSchema, PatientSchema, PaymentStatus, PermissionSchema, ProfessionalSchema, ProfessionalSpecialty, RefreshTokenInput, RefreshTokenResponsePayload, RefreshTokenResponseSchema, RefreshTokenSchema, RegisterInput, RegisterSchema, ResetPasswordInput, ResetPasswordSchema, RoleSchema, SystemRole, UserRole, UserSchema } from './zod.js';
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
interface PatientAudit {
    id: string;
    patientId: string;
    action: 'create' | 'update' | 'delete';
    changes?: Record<string, unknown> | null;
    performedBy: string;
    performedAt: string;
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
interface AppointmentType {
    id: string;
    organizationId: string;
    name: string;
    duration: number;
    color: string;
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
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
interface WaitingList {
    id: string;
    organizationId: string;
    patientId: string;
    professionalId: string;
    preferredDate?: string | null;
    notes?: string | null;
    status: 'waiting' | 'scheduled' | 'cancelled';
    createdAt: string;
    updatedAt: string;
    patient?: PatientBasic;
    professional?: ProfessionalBasic;
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

type MessageChannel = 'whatsapp' | 'email' | 'sms';
type MessageType = 'reminder' | 'confirmation' | 'cancellation' | 'custom';
type CommunicationStatus = 'pending' | 'sent' | 'delivered' | 'failed';
type JobType = 'reminder' | 'confirmation' | 'cancellation';
type JobStatus = 'pending' | 'processing' | 'completed' | 'failed';
interface MessageTemplate {
    id: string;
    organizationId: string;
    name: string;
    channel: MessageChannel;
    type: MessageType;
    subject?: string;
    body: string;
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
}
interface MessageTemplateListParams {
    page?: number;
    limit?: number;
    channel?: MessageChannel;
    type?: MessageType;
    isActive?: boolean;
}
interface MessageTemplateListResponse {
    items: MessageTemplate[];
    pagination: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
    };
}
interface MessageTemplateCreateRequest {
    name: string;
    channel: MessageChannel;
    type: MessageType;
    subject?: string;
    body: string;
}
interface MessageTemplateUpdateRequest {
    name?: string;
    subject?: string;
    body?: string;
    isActive?: boolean;
}
interface Communication {
    id: string;
    organizationId: string;
    patientId: string;
    appointmentId?: string;
    templateId?: string;
    channel: MessageChannel;
    type: string;
    recipient: string;
    message: string;
    status: CommunicationStatus;
    provider?: string;
    providerMessageId?: string;
    errorMessage?: string;
    scheduledAt: string;
    sentAt?: string;
    deliveredAt?: string;
    createdAt: string;
    patient?: {
        id: string;
        name: string;
    };
    appointment?: {
        id: string;
        startDate: string;
    };
}
interface CommunicationListParams {
    page?: number;
    limit?: number;
    patientId?: string;
    appointmentId?: string;
    channel?: MessageChannel;
    status?: CommunicationStatus;
    startDate?: string;
    endDate?: string;
}
interface CommunicationListResponse {
    items: Communication[];
    pagination: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
    };
}
interface CommunicationCreateRequest {
    patientId: string;
    appointmentId?: string;
    channel: MessageChannel;
    type: MessageType;
    recipient: string;
    message: string;
    templateId?: string;
}
interface CommunicationAudit {
    id: string;
    communicationId: string;
    action: string;
    changes?: Record<string, unknown> | null;
    performedBy: string;
    performedAt: string;
}
interface MessageJob {
    id: string;
    organizationId: string;
    type: JobType;
    appointmentId: string;
    scheduledFor: string;
    status: JobStatus;
    retryCount: number;
    lastError?: string;
    createdAt: string;
    processedAt?: string;
}
interface MessageJobListParams {
    page?: number;
    limit?: number;
    type?: JobType;
    status?: JobStatus;
    appointmentId?: string;
}
interface MessageJobListResponse {
    items: MessageJob[];
    pagination: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
    };
}
interface SendParams {
    to: string;
    subject?: string;
    body: string;
    appointmentId?: string;
}
interface SendResult {
    success: boolean;
    providerMessageId?: string;
    error?: string;
}
interface IMessageProvider {
    channel: MessageChannel;
    send(params: SendParams): Promise<SendResult>;
    getStatus(messageId: string): Promise<CommunicationStatus>;
}

type DocumentCategory = 'identity' | 'exams' | 'prescriptions' | 'reports' | 'administrative' | 'other';
type DocumentAction = 'create' | 'read' | 'update' | 'delete' | 'download';
type StorageProvider = 's3' | 'local';
interface Document {
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
    storageProvider: StorageProvider;
    isPublic: boolean;
    expiresAt?: string;
    uploadedBy: {
        id: string;
        name: string;
    };
    createdAt: string;
    updatedAt: string;
}
interface DocumentListParams {
    page?: number;
    limit?: number;
    patientId?: string;
    appointmentId?: string;
    category?: DocumentCategory;
    type?: string;
    startDate?: string;
    endDate?: string;
    search?: string;
}
interface DocumentListResponse {
    items: Document[];
    pagination: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
    };
}
interface DocumentCreateRequest {
    patientId?: string;
    appointmentId?: string;
    category: DocumentCategory;
    type: string;
    name: string;
    description?: string;
    fileName: string;
    fileSize: number;
    mimeType: string;
}
interface DocumentUpdateRequest {
    category?: DocumentCategory;
    type?: string;
    name?: string;
    description?: string;
    isPublic?: boolean;
}
interface DocumentAudit {
    id: string;
    documentId: string;
    action: DocumentAction;
    changes?: Record<string, unknown>;
    performedBy: string;
    performedAt: string;
}
interface StorageOptions {
    contentType: string;
    maxAge?: number;
}
interface StoredFile {
    key: string;
    url: string;
    size: number;
    contentType: string;
}

type TaskStatus = 'pending' | 'in_progress' | 'completed';
type TaskPriority = 'low' | 'medium' | 'high';
type TaskAction = 'create' | 'update' | 'status_change' | 'delete';
interface Task {
    id: string;
    organizationId: string;
    patientId?: string;
    appointmentId?: string;
    title: string;
    description?: string;
    status: TaskStatus;
    priority: TaskPriority;
    assignedTo?: {
        id: string;
        name: string;
    } | null;
    dueDate?: string;
    completedAt?: string;
    createdBy: {
        id: string;
        name: string;
    };
    createdAt: string;
    updatedAt: string;
}
interface TaskListParams {
    page?: number;
    limit?: number;
    status?: TaskStatus;
    priority?: TaskPriority;
    assignedTo?: string;
    patientId?: string;
    appointmentId?: string;
    dueDateFrom?: string;
    dueDateTo?: string;
    search?: string;
}
interface TaskListResponse {
    items: Task[];
    pagination: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
    };
}
interface TaskCreateRequest {
    title: string;
    description?: string;
    patientId?: string;
    appointmentId?: string;
    priority?: TaskPriority;
    assignedTo?: string;
    dueDate?: string;
}
interface TaskUpdateRequest {
    title?: string;
    description?: string;
    priority?: TaskPriority;
    assignedTo?: string;
    dueDate?: string;
    status?: TaskStatus;
}
interface TaskStatusUpdateRequest {
    status: TaskStatus;
}
interface TaskComment {
    id: string;
    taskId: string;
    userId: string;
    user: {
        id: string;
        name: string;
    };
    content: string;
    createdAt: string;
}
interface TaskCommentCreateRequest {
    content: string;
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

export type { ApiError, ApiResponse, Appointment, AppointmentCancelRequest, AppointmentCreateRequest, AppointmentListParams, AppointmentListResponse, AppointmentRescheduleRequest, AppointmentStatus, AppointmentType, AppointmentTypeBasic, AppointmentUpdateRequest, AuthUser, AvailabilityResponse, BaseEntity, CalendarDay, CalendarResponse, CalendarSlot, Communication, CommunicationAudit, CommunicationCreateRequest, CommunicationListParams, CommunicationListResponse, CommunicationStatus, Document, DocumentAction, DocumentAudit, DocumentCategory, DocumentCreateRequest, DocumentListParams, DocumentListResponse, DocumentUpdateRequest, ForgotPasswordRequest, IMessageProvider, JobStatus, JobType, LoginRequest, LoginResponse, LogoutResponse, MessageChannel, MessageJob, MessageJobListParams, MessageJobListResponse, MessageTemplate, MessageTemplateCreateRequest, MessageTemplateListParams, MessageTemplateListResponse, MessageTemplateUpdateRequest, MessageType, Organization, PaginatedResponse, Pagination, Patient, PatientAudit, PatientBasic, PatientContact, PatientContactCreateRequest, PatientContactUpdateRequest, PatientCreateRequest, PatientListParams, PatientListResponse, PatientUpdateRequest, Permission, Professional, ProfessionalBasic, RefreshTokenRequest, RefreshTokenResponse, RegisterRequest, ResetPasswordRequest, Role, ScheduleBlock, ScheduleBlockCreateRequest, SendParams, SendResult, StorageOptions, StorageProvider, StoredFile, Task, TaskAction, TaskComment, TaskCommentCreateRequest, TaskCreateRequest, TaskListParams, TaskListResponse, TaskPriority, TaskStatus, TaskStatusUpdateRequest, TaskUpdateRequest, TokenPayload, User, WaitingList };
