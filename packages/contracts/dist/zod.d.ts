import { z } from 'zod';

declare enum UserRole {
    ADMIN = "admin",
    CLINIC_OWNER = "clinic_owner",
    PROFESSIONAL = "professional",
    RECEPTIONIST = "receptionist"
}
declare enum SystemRole {
    SUPER_ADMIN = "super_admin",
    ORG_ADMIN = "org_admin",
    PROFESSIONAL = "professional",
    RECEPTIONIST = "receptionist",
    SUPPORT = "support"
}
declare enum ProfessionalSpecialty {
    NUTRITIONIST = "nutritionist",
    PSYCHOLOGIST = "psychologist",
    PHYSIOTHERAPIST = "physiotherapist",
    DENTIST = "dentist",
    GENERAL_PRACTITIONER = "general_practitioner",
    OTHER = "other"
}
declare enum PaymentStatus {
    PENDING = "pending",
    PAID = "paid",
    OVERDUE = "overdue",
    REFUNDED = "refunded"
}
declare enum MessageStatus {
    PENDING = "pending",
    SENT = "sent",
    FAILED = "failed"
}

declare const LoginSchema: z.ZodObject<{
    email: z.ZodString;
    password: z.ZodString;
}, "strip", z.ZodTypeAny, {
    email: string;
    password: string;
}, {
    email: string;
    password: string;
}>;
type LoginInput = z.infer<typeof LoginSchema>;
declare const RegisterSchema: z.ZodObject<{
    email: z.ZodString;
    password: z.ZodString;
    name: z.ZodString;
    organizationId: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    email: string;
    password: string;
    name: string;
    organizationId?: string | undefined;
}, {
    email: string;
    password: string;
    name: string;
    organizationId?: string | undefined;
}>;
type RegisterInput = z.infer<typeof RegisterSchema>;
declare const RefreshTokenSchema: z.ZodObject<{
    refreshToken: z.ZodString;
}, "strip", z.ZodTypeAny, {
    refreshToken: string;
}, {
    refreshToken: string;
}>;
type RefreshTokenInput = z.infer<typeof RefreshTokenSchema>;
declare const ForgotPasswordSchema: z.ZodObject<{
    email: z.ZodString;
}, "strip", z.ZodTypeAny, {
    email: string;
}, {
    email: string;
}>;
type ForgotPasswordInput = z.infer<typeof ForgotPasswordSchema>;
declare const ResetPasswordSchema: z.ZodObject<{
    token: z.ZodString;
    newPassword: z.ZodString;
}, "strip", z.ZodTypeAny, {
    token: string;
    newPassword: string;
}, {
    token: string;
    newPassword: string;
}>;
type ResetPasswordInput = z.infer<typeof ResetPasswordSchema>;
declare const AuthUserResponseSchema: z.ZodObject<{
    id: z.ZodString;
    email: z.ZodString;
    name: z.ZodString;
    organizationId: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    roleId: z.ZodString;
    roleName: z.ZodString;
}, "strip", z.ZodTypeAny, {
    email: string;
    name: string;
    id: string;
    roleId: string;
    roleName: string;
    organizationId?: string | null | undefined;
}, {
    email: string;
    name: string;
    id: string;
    roleId: string;
    roleName: string;
    organizationId?: string | null | undefined;
}>;
type AuthUserResponse = z.infer<typeof AuthUserResponseSchema>;
declare const LoginResponseSchema: z.ZodObject<{
    accessToken: z.ZodString;
    refreshToken: z.ZodString;
    expiresIn: z.ZodNumber;
    user: z.ZodObject<{
        id: z.ZodString;
        email: z.ZodString;
        name: z.ZodString;
        organizationId: z.ZodOptional<z.ZodNullable<z.ZodString>>;
        roleId: z.ZodString;
        roleName: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        email: string;
        name: string;
        id: string;
        roleId: string;
        roleName: string;
        organizationId?: string | null | undefined;
    }, {
        email: string;
        name: string;
        id: string;
        roleId: string;
        roleName: string;
        organizationId?: string | null | undefined;
    }>;
}, "strip", z.ZodTypeAny, {
    refreshToken: string;
    accessToken: string;
    expiresIn: number;
    user: {
        email: string;
        name: string;
        id: string;
        roleId: string;
        roleName: string;
        organizationId?: string | null | undefined;
    };
}, {
    refreshToken: string;
    accessToken: string;
    expiresIn: number;
    user: {
        email: string;
        name: string;
        id: string;
        roleId: string;
        roleName: string;
        organizationId?: string | null | undefined;
    };
}>;
type LoginResponsePayload = z.infer<typeof LoginResponseSchema>;
declare const RefreshTokenResponseSchema: z.ZodObject<{
    accessToken: z.ZodString;
    expiresIn: z.ZodNumber;
}, "strip", z.ZodTypeAny, {
    accessToken: string;
    expiresIn: number;
}, {
    accessToken: string;
    expiresIn: number;
}>;
type RefreshTokenResponsePayload = z.infer<typeof RefreshTokenResponseSchema>;

declare const UserSchema: z.ZodObject<{
    id: z.ZodString;
    email: z.ZodString;
    name: z.ZodString;
    organizationId: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    roleId: z.ZodString;
    isActive: z.ZodBoolean;
    createdAt: z.ZodDate;
    updatedAt: z.ZodDate;
}, "strip", z.ZodTypeAny, {
    email: string;
    name: string;
    id: string;
    roleId: string;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
    organizationId?: string | null | undefined;
}, {
    email: string;
    name: string;
    id: string;
    roleId: string;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
    organizationId?: string | null | undefined;
}>;
declare const OrganizationSchema: z.ZodObject<{
    id: z.ZodString;
    name: z.ZodString;
    document: z.ZodString;
    email: z.ZodOptional<z.ZodString>;
    phone: z.ZodOptional<z.ZodString>;
    address: z.ZodOptional<z.ZodString>;
    isActive: z.ZodBoolean;
    createdAt: z.ZodDate;
    updatedAt: z.ZodDate;
}, "strip", z.ZodTypeAny, {
    name: string;
    id: string;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
    document: string;
    email?: string | undefined;
    phone?: string | undefined;
    address?: string | undefined;
}, {
    name: string;
    id: string;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
    document: string;
    email?: string | undefined;
    phone?: string | undefined;
    address?: string | undefined;
}>;
declare const RoleSchema: z.ZodObject<{
    id: z.ZodString;
    name: z.ZodString;
    description: z.ZodOptional<z.ZodString>;
    isSystem: z.ZodBoolean;
    createdAt: z.ZodDate;
    updatedAt: z.ZodDate;
}, "strip", z.ZodTypeAny, {
    name: string;
    id: string;
    createdAt: Date;
    updatedAt: Date;
    isSystem: boolean;
    description?: string | undefined;
}, {
    name: string;
    id: string;
    createdAt: Date;
    updatedAt: Date;
    isSystem: boolean;
    description?: string | undefined;
}>;
declare const PermissionSchema: z.ZodObject<{
    id: z.ZodString;
    name: z.ZodString;
    description: z.ZodOptional<z.ZodString>;
    createdAt: z.ZodDate;
}, "strip", z.ZodTypeAny, {
    name: string;
    id: string;
    createdAt: Date;
    description?: string | undefined;
}, {
    name: string;
    id: string;
    createdAt: Date;
    description?: string | undefined;
}>;
declare const ProfessionalSchema: z.ZodObject<{
    id: z.ZodString;
    userId: z.ZodString;
    organizationId: z.ZodString;
    specialty: z.ZodEnum<["nutritionist", "psychologist", "physiotherapist", "dentist", "general_practitioner", "other"]>;
    document: z.ZodOptional<z.ZodString>;
    createdAt: z.ZodDate;
    updatedAt: z.ZodDate;
}, "strip", z.ZodTypeAny, {
    organizationId: string;
    id: string;
    createdAt: Date;
    updatedAt: Date;
    userId: string;
    specialty: "other" | "nutritionist" | "psychologist" | "physiotherapist" | "dentist" | "general_practitioner";
    document?: string | undefined;
}, {
    organizationId: string;
    id: string;
    createdAt: Date;
    updatedAt: Date;
    userId: string;
    specialty: "other" | "nutritionist" | "psychologist" | "physiotherapist" | "dentist" | "general_practitioner";
    document?: string | undefined;
}>;
declare const PatientSchema: z.ZodObject<{
    id: z.ZodString;
    organizationId: z.ZodString;
    name: z.ZodString;
    email: z.ZodOptional<z.ZodString>;
    phone: z.ZodOptional<z.ZodString>;
    document: z.ZodOptional<z.ZodString>;
    birthDate: z.ZodOptional<z.ZodDate>;
    createdAt: z.ZodDate;
    updatedAt: z.ZodDate;
}, "strip", z.ZodTypeAny, {
    name: string;
    organizationId: string;
    id: string;
    createdAt: Date;
    updatedAt: Date;
    email?: string | undefined;
    document?: string | undefined;
    phone?: string | undefined;
    birthDate?: Date | undefined;
}, {
    name: string;
    organizationId: string;
    id: string;
    createdAt: Date;
    updatedAt: Date;
    email?: string | undefined;
    document?: string | undefined;
    phone?: string | undefined;
    birthDate?: Date | undefined;
}>;
declare const AppointmentSchema: z.ZodObject<{
    id: z.ZodString;
    organizationId: z.ZodString;
    patientId: z.ZodString;
    professionalId: z.ZodString;
    status: z.ZodEnum<["scheduled", "confirmed", "in_progress", "completed", "cancelled", "no_show"]>;
    startDate: z.ZodDate;
    endDate: z.ZodDate;
    notes: z.ZodOptional<z.ZodString>;
    createdAt: z.ZodDate;
    updatedAt: z.ZodDate;
}, "strip", z.ZodTypeAny, {
    status: "scheduled" | "confirmed" | "in_progress" | "completed" | "cancelled" | "no_show";
    organizationId: string;
    id: string;
    createdAt: Date;
    updatedAt: Date;
    patientId: string;
    professionalId: string;
    startDate: Date;
    endDate: Date;
    notes?: string | undefined;
}, {
    status: "scheduled" | "confirmed" | "in_progress" | "completed" | "cancelled" | "no_show";
    organizationId: string;
    id: string;
    createdAt: Date;
    updatedAt: Date;
    patientId: string;
    professionalId: string;
    startDate: Date;
    endDate: Date;
    notes?: string | undefined;
}>;
declare const ApiResponseSchema: z.ZodObject<{
    success: z.ZodBoolean;
    data: z.ZodOptional<z.ZodAny>;
    error: z.ZodOptional<z.ZodObject<{
        code: z.ZodString;
        message: z.ZodString;
        details: z.ZodOptional<z.ZodAny>;
    }, "strip", z.ZodTypeAny, {
        code: string;
        message: string;
        details?: any;
    }, {
        code: string;
        message: string;
        details?: any;
    }>>;
    timestamp: z.ZodDate;
}, "strip", z.ZodTypeAny, {
    success: boolean;
    timestamp: Date;
    error?: {
        code: string;
        message: string;
        details?: any;
    } | undefined;
    data?: any;
}, {
    success: boolean;
    timestamp: Date;
    error?: {
        code: string;
        message: string;
        details?: any;
    } | undefined;
    data?: any;
}>;
declare const PaginationSchema: z.ZodObject<{
    page: z.ZodDefault<z.ZodNumber>;
    limit: z.ZodDefault<z.ZodNumber>;
    total: z.ZodNumber;
    totalPages: z.ZodNumber;
}, "strip", z.ZodTypeAny, {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
}, {
    total: number;
    totalPages: number;
    page?: number | undefined;
    limit?: number | undefined;
}>;
declare const PaginatedResponseSchema: z.ZodObject<{
    items: z.ZodArray<z.ZodAny, "many">;
    pagination: z.ZodObject<{
        page: z.ZodDefault<z.ZodNumber>;
        limit: z.ZodDefault<z.ZodNumber>;
        total: z.ZodNumber;
        totalPages: z.ZodNumber;
    }, "strip", z.ZodTypeAny, {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
    }, {
        total: number;
        totalPages: number;
        page?: number | undefined;
        limit?: number | undefined;
    }>;
}, "strip", z.ZodTypeAny, {
    items: any[];
    pagination: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
    };
}, {
    items: any[];
    pagination: {
        total: number;
        totalPages: number;
        page?: number | undefined;
        limit?: number | undefined;
    };
}>;

export { ApiResponseSchema, AppointmentSchema, type AuthUserResponse, AuthUserResponseSchema, type ForgotPasswordInput, ForgotPasswordSchema, type LoginInput, type LoginResponsePayload, LoginResponseSchema, LoginSchema, MessageStatus, OrganizationSchema, PaginatedResponseSchema, PaginationSchema, PatientSchema, PaymentStatus, PermissionSchema, ProfessionalSchema, ProfessionalSpecialty, type RefreshTokenInput, type RefreshTokenResponsePayload, RefreshTokenResponseSchema, RefreshTokenSchema, type RegisterInput, RegisterSchema, type ResetPasswordInput, ResetPasswordSchema, RoleSchema, SystemRole, UserRole, UserSchema };
