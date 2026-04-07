import { z } from 'zod';

declare enum UserRole {
    ADMIN = "admin",
    CLINIC_OWNER = "clinic_owner",
    PROFESSIONAL = "professional",
    RECEPTIONIST = "receptionist"
}
declare enum ProfessionalSpecialty {
    NUTRITIONIST = "nutritionist",
    PSYCHOLOGIST = "psychologist",
    PHYSIOTHERAPIST = "physiotherapist",
    DENTIST = "dentist",
    GENERAL_PRACTITIONER = "general_practitioner",
    OTHER = "other"
}
declare enum AppointmentStatus {
    SCHEDULED = "scheduled",
    CONFIRMED = "confirmed",
    IN_PROGRESS = "in_progress",
    COMPLETED = "completed",
    CANCELLED = "cancelled",
    NO_SHOW = "no_show"
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

declare const UserSchema: z.ZodObject<{
    id: z.ZodString;
    email: z.ZodString;
    name: z.ZodString;
    role: z.ZodEnum<["admin", "clinic_owner", "professional", "receptionist"]>;
    clinicId: z.ZodNullable<z.ZodString>;
    createdAt: z.ZodDate;
    updatedAt: z.ZodDate;
}, "strip", z.ZodTypeAny, {
    id: string;
    email: string;
    name: string;
    role: "admin" | "clinic_owner" | "professional" | "receptionist";
    clinicId: string | null;
    createdAt: Date;
    updatedAt: Date;
}, {
    id: string;
    email: string;
    name: string;
    role: "admin" | "clinic_owner" | "professional" | "receptionist";
    clinicId: string | null;
    createdAt: Date;
    updatedAt: Date;
}>;
declare const ClinicSchema: z.ZodObject<{
    id: z.ZodString;
    name: z.ZodString;
    document: z.ZodString;
    email: z.ZodOptional<z.ZodString>;
    phone: z.ZodOptional<z.ZodString>;
    address: z.ZodOptional<z.ZodString>;
    createdAt: z.ZodDate;
    updatedAt: z.ZodDate;
}, "strip", z.ZodTypeAny, {
    id: string;
    name: string;
    createdAt: Date;
    updatedAt: Date;
    document: string;
    email?: string | undefined;
    phone?: string | undefined;
    address?: string | undefined;
}, {
    id: string;
    name: string;
    createdAt: Date;
    updatedAt: Date;
    document: string;
    email?: string | undefined;
    phone?: string | undefined;
    address?: string | undefined;
}>;
declare const ProfessionalSchema: z.ZodObject<{
    id: z.ZodString;
    userId: z.ZodString;
    clinicId: z.ZodString;
    specialty: z.ZodEnum<["nutritionist", "psychologist", "physiotherapist", "dentist", "general_practitioner", "other"]>;
    document: z.ZodOptional<z.ZodString>;
    createdAt: z.ZodDate;
    updatedAt: z.ZodDate;
}, "strip", z.ZodTypeAny, {
    id: string;
    clinicId: string;
    createdAt: Date;
    updatedAt: Date;
    userId: string;
    specialty: "nutritionist" | "psychologist" | "physiotherapist" | "dentist" | "general_practitioner" | "other";
    document?: string | undefined;
}, {
    id: string;
    clinicId: string;
    createdAt: Date;
    updatedAt: Date;
    userId: string;
    specialty: "nutritionist" | "psychologist" | "physiotherapist" | "dentist" | "general_practitioner" | "other";
    document?: string | undefined;
}>;
declare const PatientSchema: z.ZodObject<{
    id: z.ZodString;
    clinicId: z.ZodString;
    name: z.ZodString;
    email: z.ZodOptional<z.ZodString>;
    phone: z.ZodOptional<z.ZodString>;
    document: z.ZodOptional<z.ZodString>;
    birthDate: z.ZodOptional<z.ZodDate>;
    createdAt: z.ZodDate;
    updatedAt: z.ZodDate;
}, "strip", z.ZodTypeAny, {
    id: string;
    name: string;
    clinicId: string;
    createdAt: Date;
    updatedAt: Date;
    email?: string | undefined;
    document?: string | undefined;
    phone?: string | undefined;
    birthDate?: Date | undefined;
}, {
    id: string;
    name: string;
    clinicId: string;
    createdAt: Date;
    updatedAt: Date;
    email?: string | undefined;
    document?: string | undefined;
    phone?: string | undefined;
    birthDate?: Date | undefined;
}>;
declare const AppointmentSchema: z.ZodObject<{
    id: z.ZodString;
    clinicId: z.ZodString;
    patientId: z.ZodString;
    professionalId: z.ZodString;
    status: z.ZodEnum<["scheduled", "confirmed", "in_progress", "completed", "cancelled", "no_show"]>;
    startDate: z.ZodDate;
    endDate: z.ZodDate;
    notes: z.ZodOptional<z.ZodString>;
    createdAt: z.ZodDate;
    updatedAt: z.ZodDate;
}, "strip", z.ZodTypeAny, {
    id: string;
    status: "scheduled" | "confirmed" | "in_progress" | "completed" | "cancelled" | "no_show";
    clinicId: string;
    createdAt: Date;
    updatedAt: Date;
    patientId: string;
    professionalId: string;
    startDate: Date;
    endDate: Date;
    notes?: string | undefined;
}, {
    id: string;
    status: "scheduled" | "confirmed" | "in_progress" | "completed" | "cancelled" | "no_show";
    clinicId: string;
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
    data?: any;
    error?: {
        code: string;
        message: string;
        details?: any;
    } | undefined;
}, {
    success: boolean;
    timestamp: Date;
    data?: any;
    error?: {
        code: string;
        message: string;
        details?: any;
    } | undefined;
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

export { ApiResponseSchema, AppointmentSchema, AppointmentStatus, ClinicSchema, MessageStatus, PaginatedResponseSchema, PaginationSchema, PatientSchema, PaymentStatus, ProfessionalSchema, ProfessionalSpecialty, UserRole, UserSchema };
