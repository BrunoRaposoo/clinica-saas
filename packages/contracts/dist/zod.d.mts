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

declare const PatientContactSchema: z.ZodObject<{
    id: z.ZodString;
    patientId: z.ZodString;
    name: z.ZodString;
    relationship: z.ZodString;
    phone: z.ZodOptional<z.ZodString>;
    email: z.ZodUnion<[z.ZodOptional<z.ZodString>, z.ZodLiteral<"">]>;
    isPrimary: z.ZodBoolean;
    createdAt: z.ZodString;
    updatedAt: z.ZodString;
}, "strip", z.ZodTypeAny, {
    name: string;
    id: string;
    patientId: string;
    relationship: string;
    isPrimary: boolean;
    createdAt: string;
    updatedAt: string;
    email?: string | undefined;
    phone?: string | undefined;
}, {
    name: string;
    id: string;
    patientId: string;
    relationship: string;
    isPrimary: boolean;
    createdAt: string;
    updatedAt: string;
    email?: string | undefined;
    phone?: string | undefined;
}>;
declare const PatientContactCreateSchema: z.ZodObject<{
    name: z.ZodString;
    relationship: z.ZodString;
    phone: z.ZodOptional<z.ZodString>;
    email: z.ZodUnion<[z.ZodOptional<z.ZodString>, z.ZodLiteral<"">]>;
    isPrimary: z.ZodDefault<z.ZodOptional<z.ZodBoolean>>;
}, "strip", z.ZodTypeAny, {
    name: string;
    relationship: string;
    isPrimary: boolean;
    email?: string | undefined;
    phone?: string | undefined;
}, {
    name: string;
    relationship: string;
    email?: string | undefined;
    phone?: string | undefined;
    isPrimary?: boolean | undefined;
}>;
declare const PatientContactUpdateSchema: z.ZodObject<{
    name: z.ZodOptional<z.ZodString>;
    relationship: z.ZodOptional<z.ZodString>;
    phone: z.ZodOptional<z.ZodString>;
    email: z.ZodUnion<[z.ZodOptional<z.ZodString>, z.ZodLiteral<"">]>;
    isPrimary: z.ZodOptional<z.ZodBoolean>;
}, "strip", z.ZodTypeAny, {
    email?: string | undefined;
    name?: string | undefined;
    relationship?: string | undefined;
    phone?: string | undefined;
    isPrimary?: boolean | undefined;
}, {
    email?: string | undefined;
    name?: string | undefined;
    relationship?: string | undefined;
    phone?: string | undefined;
    isPrimary?: boolean | undefined;
}>;
declare const PatientSchema$1: z.ZodObject<{
    id: z.ZodString;
    organizationId: z.ZodString;
    name: z.ZodString;
    email: z.ZodUnion<[z.ZodOptional<z.ZodString>, z.ZodLiteral<"">]>;
    phone: z.ZodOptional<z.ZodString>;
    document: z.ZodOptional<z.ZodString>;
    birthDate: z.ZodUnion<[z.ZodOptional<z.ZodString>, z.ZodLiteral<"">]>;
    gender: z.ZodOptional<z.ZodEnum<["male", "female", "other"]>>;
    addressStreet: z.ZodOptional<z.ZodString>;
    addressNumber: z.ZodOptional<z.ZodString>;
    addressComplement: z.ZodOptional<z.ZodString>;
    addressDistrict: z.ZodOptional<z.ZodString>;
    addressCity: z.ZodOptional<z.ZodString>;
    addressState: z.ZodOptional<z.ZodString>;
    addressZipCode: z.ZodOptional<z.ZodString>;
    notes: z.ZodOptional<z.ZodString>;
    tags: z.ZodDefault<z.ZodArray<z.ZodString, "many">>;
    isActive: z.ZodBoolean;
    deletedAt: z.ZodOptional<z.ZodString>;
    createdAt: z.ZodString;
    updatedAt: z.ZodString;
    contacts: z.ZodOptional<z.ZodArray<z.ZodObject<{
        id: z.ZodString;
        patientId: z.ZodString;
        name: z.ZodString;
        relationship: z.ZodString;
        phone: z.ZodOptional<z.ZodString>;
        email: z.ZodUnion<[z.ZodOptional<z.ZodString>, z.ZodLiteral<"">]>;
        isPrimary: z.ZodBoolean;
        createdAt: z.ZodString;
        updatedAt: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        name: string;
        id: string;
        patientId: string;
        relationship: string;
        isPrimary: boolean;
        createdAt: string;
        updatedAt: string;
        email?: string | undefined;
        phone?: string | undefined;
    }, {
        name: string;
        id: string;
        patientId: string;
        relationship: string;
        isPrimary: boolean;
        createdAt: string;
        updatedAt: string;
        email?: string | undefined;
        phone?: string | undefined;
    }>, "many">>;
}, "strip", z.ZodTypeAny, {
    name: string;
    organizationId: string;
    id: string;
    createdAt: string;
    updatedAt: string;
    tags: string[];
    isActive: boolean;
    email?: string | undefined;
    phone?: string | undefined;
    document?: string | undefined;
    birthDate?: string | undefined;
    gender?: "male" | "female" | "other" | undefined;
    addressStreet?: string | undefined;
    addressNumber?: string | undefined;
    addressComplement?: string | undefined;
    addressDistrict?: string | undefined;
    addressCity?: string | undefined;
    addressState?: string | undefined;
    addressZipCode?: string | undefined;
    notes?: string | undefined;
    deletedAt?: string | undefined;
    contacts?: {
        name: string;
        id: string;
        patientId: string;
        relationship: string;
        isPrimary: boolean;
        createdAt: string;
        updatedAt: string;
        email?: string | undefined;
        phone?: string | undefined;
    }[] | undefined;
}, {
    name: string;
    organizationId: string;
    id: string;
    createdAt: string;
    updatedAt: string;
    isActive: boolean;
    email?: string | undefined;
    phone?: string | undefined;
    document?: string | undefined;
    birthDate?: string | undefined;
    gender?: "male" | "female" | "other" | undefined;
    addressStreet?: string | undefined;
    addressNumber?: string | undefined;
    addressComplement?: string | undefined;
    addressDistrict?: string | undefined;
    addressCity?: string | undefined;
    addressState?: string | undefined;
    addressZipCode?: string | undefined;
    notes?: string | undefined;
    tags?: string[] | undefined;
    deletedAt?: string | undefined;
    contacts?: {
        name: string;
        id: string;
        patientId: string;
        relationship: string;
        isPrimary: boolean;
        createdAt: string;
        updatedAt: string;
        email?: string | undefined;
        phone?: string | undefined;
    }[] | undefined;
}>;
declare const PatientCreateSchema: z.ZodObject<{
    name: z.ZodString;
    email: z.ZodUnion<[z.ZodOptional<z.ZodString>, z.ZodLiteral<"">]>;
    phone: z.ZodOptional<z.ZodString>;
    document: z.ZodOptional<z.ZodString>;
    birthDate: z.ZodUnion<[z.ZodOptional<z.ZodString>, z.ZodLiteral<"">]>;
    gender: z.ZodOptional<z.ZodEnum<["male", "female", "other"]>>;
    addressStreet: z.ZodOptional<z.ZodString>;
    addressNumber: z.ZodOptional<z.ZodString>;
    addressComplement: z.ZodOptional<z.ZodString>;
    addressDistrict: z.ZodOptional<z.ZodString>;
    addressCity: z.ZodOptional<z.ZodString>;
    addressState: z.ZodOptional<z.ZodString>;
    addressZipCode: z.ZodOptional<z.ZodString>;
    notes: z.ZodOptional<z.ZodString>;
    tags: z.ZodDefault<z.ZodOptional<z.ZodArray<z.ZodString, "many">>>;
    contacts: z.ZodDefault<z.ZodOptional<z.ZodArray<z.ZodObject<{
        name: z.ZodString;
        relationship: z.ZodString;
        phone: z.ZodOptional<z.ZodString>;
        email: z.ZodUnion<[z.ZodOptional<z.ZodString>, z.ZodLiteral<"">]>;
        isPrimary: z.ZodDefault<z.ZodOptional<z.ZodBoolean>>;
    }, "strip", z.ZodTypeAny, {
        name: string;
        relationship: string;
        isPrimary: boolean;
        email?: string | undefined;
        phone?: string | undefined;
    }, {
        name: string;
        relationship: string;
        email?: string | undefined;
        phone?: string | undefined;
        isPrimary?: boolean | undefined;
    }>, "many">>>;
}, "strip", z.ZodTypeAny, {
    name: string;
    tags: string[];
    contacts: {
        name: string;
        relationship: string;
        isPrimary: boolean;
        email?: string | undefined;
        phone?: string | undefined;
    }[];
    email?: string | undefined;
    phone?: string | undefined;
    document?: string | undefined;
    birthDate?: string | undefined;
    gender?: "male" | "female" | "other" | undefined;
    addressStreet?: string | undefined;
    addressNumber?: string | undefined;
    addressComplement?: string | undefined;
    addressDistrict?: string | undefined;
    addressCity?: string | undefined;
    addressState?: string | undefined;
    addressZipCode?: string | undefined;
    notes?: string | undefined;
}, {
    name: string;
    email?: string | undefined;
    phone?: string | undefined;
    document?: string | undefined;
    birthDate?: string | undefined;
    gender?: "male" | "female" | "other" | undefined;
    addressStreet?: string | undefined;
    addressNumber?: string | undefined;
    addressComplement?: string | undefined;
    addressDistrict?: string | undefined;
    addressCity?: string | undefined;
    addressState?: string | undefined;
    addressZipCode?: string | undefined;
    notes?: string | undefined;
    tags?: string[] | undefined;
    contacts?: {
        name: string;
        relationship: string;
        email?: string | undefined;
        phone?: string | undefined;
        isPrimary?: boolean | undefined;
    }[] | undefined;
}>;
declare const PatientUpdateSchema: z.ZodObject<{
    name: z.ZodOptional<z.ZodString>;
    email: z.ZodUnion<[z.ZodOptional<z.ZodString>, z.ZodLiteral<"">]>;
    phone: z.ZodOptional<z.ZodString>;
    document: z.ZodOptional<z.ZodString>;
    birthDate: z.ZodUnion<[z.ZodOptional<z.ZodString>, z.ZodLiteral<"">]>;
    gender: z.ZodOptional<z.ZodEnum<["male", "female", "other"]>>;
    addressStreet: z.ZodOptional<z.ZodString>;
    addressNumber: z.ZodOptional<z.ZodString>;
    addressComplement: z.ZodOptional<z.ZodString>;
    addressDistrict: z.ZodOptional<z.ZodString>;
    addressCity: z.ZodOptional<z.ZodString>;
    addressState: z.ZodOptional<z.ZodString>;
    addressZipCode: z.ZodOptional<z.ZodString>;
    notes: z.ZodOptional<z.ZodString>;
    tags: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    isActive: z.ZodOptional<z.ZodBoolean>;
}, "strip", z.ZodTypeAny, {
    email?: string | undefined;
    name?: string | undefined;
    phone?: string | undefined;
    document?: string | undefined;
    birthDate?: string | undefined;
    gender?: "male" | "female" | "other" | undefined;
    addressStreet?: string | undefined;
    addressNumber?: string | undefined;
    addressComplement?: string | undefined;
    addressDistrict?: string | undefined;
    addressCity?: string | undefined;
    addressState?: string | undefined;
    addressZipCode?: string | undefined;
    notes?: string | undefined;
    tags?: string[] | undefined;
    isActive?: boolean | undefined;
}, {
    email?: string | undefined;
    name?: string | undefined;
    phone?: string | undefined;
    document?: string | undefined;
    birthDate?: string | undefined;
    gender?: "male" | "female" | "other" | undefined;
    addressStreet?: string | undefined;
    addressNumber?: string | undefined;
    addressComplement?: string | undefined;
    addressDistrict?: string | undefined;
    addressCity?: string | undefined;
    addressState?: string | undefined;
    addressZipCode?: string | undefined;
    notes?: string | undefined;
    tags?: string[] | undefined;
    isActive?: boolean | undefined;
}>;
type Patient = z.infer<typeof PatientSchema$1>;
type PatientCreate = z.infer<typeof PatientCreateSchema>;
type PatientUpdate = z.infer<typeof PatientUpdateSchema>;
type PatientContact = z.infer<typeof PatientContactSchema>;
type PatientContactCreate = z.infer<typeof PatientContactCreateSchema>;
type PatientContactUpdate = z.infer<typeof PatientContactUpdateSchema>;

declare const AppointmentStatusEnum: z.ZodEnum<["scheduled", "confirmed", "in_progress", "completed", "cancelled", "no_show"]>;
declare const AppointmentSchema$1: z.ZodObject<{
    id: z.ZodString;
    organizationId: z.ZodString;
    patientId: z.ZodString;
    professionalId: z.ZodString;
    appointmentTypeId: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    status: z.ZodEnum<["scheduled", "confirmed", "in_progress", "completed", "cancelled", "no_show"]>;
    startDate: z.ZodString;
    endDate: z.ZodString;
    duration: z.ZodNumber;
    notes: z.ZodOptional<z.ZodString>;
    cancellationReason: z.ZodOptional<z.ZodString>;
    cancelledBy: z.ZodOptional<z.ZodString>;
    cancelledAt: z.ZodOptional<z.ZodString>;
    createdAt: z.ZodString;
    updatedAt: z.ZodString;
    patient: z.ZodOptional<z.ZodObject<{
        id: z.ZodString;
        name: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        name: string;
        id: string;
    }, {
        name: string;
        id: string;
    }>>;
    professional: z.ZodOptional<z.ZodObject<{
        id: z.ZodString;
        name: z.ZodString;
        specialty: z.ZodString;
        color: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        name: string;
        id: string;
        color: string;
        specialty: string;
    }, {
        name: string;
        id: string;
        color: string;
        specialty: string;
    }>>;
    appointmentType: z.ZodOptional<z.ZodObject<{
        id: z.ZodString;
        name: z.ZodString;
        duration: z.ZodNumber;
        color: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        name: string;
        id: string;
        duration: number;
        color: string;
    }, {
        name: string;
        id: string;
        duration: number;
        color: string;
    }>>;
}, "strip", z.ZodTypeAny, {
    status: "scheduled" | "confirmed" | "in_progress" | "completed" | "cancelled" | "no_show";
    organizationId: string;
    id: string;
    patientId: string;
    createdAt: string;
    updatedAt: string;
    duration: number;
    professionalId: string;
    startDate: string;
    endDate: string;
    professional?: {
        name: string;
        id: string;
        color: string;
        specialty: string;
    } | undefined;
    notes?: string | undefined;
    appointmentTypeId?: string | null | undefined;
    cancellationReason?: string | undefined;
    cancelledBy?: string | undefined;
    cancelledAt?: string | undefined;
    patient?: {
        name: string;
        id: string;
    } | undefined;
    appointmentType?: {
        name: string;
        id: string;
        duration: number;
        color: string;
    } | undefined;
}, {
    status: "scheduled" | "confirmed" | "in_progress" | "completed" | "cancelled" | "no_show";
    organizationId: string;
    id: string;
    patientId: string;
    createdAt: string;
    updatedAt: string;
    duration: number;
    professionalId: string;
    startDate: string;
    endDate: string;
    professional?: {
        name: string;
        id: string;
        color: string;
        specialty: string;
    } | undefined;
    notes?: string | undefined;
    appointmentTypeId?: string | null | undefined;
    cancellationReason?: string | undefined;
    cancelledBy?: string | undefined;
    cancelledAt?: string | undefined;
    patient?: {
        name: string;
        id: string;
    } | undefined;
    appointmentType?: {
        name: string;
        id: string;
        duration: number;
        color: string;
    } | undefined;
}>;
declare const AppointmentCreateSchema: z.ZodObject<{
    patientId: z.ZodString;
    professionalId: z.ZodString;
    appointmentTypeId: z.ZodOptional<z.ZodString>;
    startDate: z.ZodString;
    notes: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    patientId: string;
    professionalId: string;
    startDate: string;
    notes?: string | undefined;
    appointmentTypeId?: string | undefined;
}, {
    patientId: string;
    professionalId: string;
    startDate: string;
    notes?: string | undefined;
    appointmentTypeId?: string | undefined;
}>;
declare const AppointmentUpdateSchema: z.ZodObject<{
    appointmentTypeId: z.ZodOptional<z.ZodString>;
    startDate: z.ZodOptional<z.ZodString>;
    notes: z.ZodOptional<z.ZodString>;
    status: z.ZodOptional<z.ZodEnum<["scheduled", "confirmed", "in_progress", "completed", "cancelled", "no_show"]>>;
}, "strip", z.ZodTypeAny, {
    status?: "scheduled" | "confirmed" | "in_progress" | "completed" | "cancelled" | "no_show" | undefined;
    notes?: string | undefined;
    appointmentTypeId?: string | undefined;
    startDate?: string | undefined;
}, {
    status?: "scheduled" | "confirmed" | "in_progress" | "completed" | "cancelled" | "no_show" | undefined;
    notes?: string | undefined;
    appointmentTypeId?: string | undefined;
    startDate?: string | undefined;
}>;
declare const AppointmentCancelSchema: z.ZodObject<{
    reason: z.ZodString;
}, "strip", z.ZodTypeAny, {
    reason: string;
}, {
    reason: string;
}>;
declare const AppointmentRescheduleSchema: z.ZodObject<{
    newStartDate: z.ZodString;
}, "strip", z.ZodTypeAny, {
    newStartDate: string;
}, {
    newStartDate: string;
}>;
type Appointment = z.infer<typeof AppointmentSchema$1>;
type AppointmentCreate = z.infer<typeof AppointmentCreateSchema>;
type AppointmentUpdate = z.infer<typeof AppointmentUpdateSchema>;
type AppointmentCancel = z.infer<typeof AppointmentCancelSchema>;
type AppointmentReschedule = z.infer<typeof AppointmentRescheduleSchema>;
type AppointmentStatus = z.infer<typeof AppointmentStatusEnum>;

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
    createdAt: Date;
    updatedAt: Date;
    isActive: boolean;
    organizationId?: string | null | undefined;
}, {
    email: string;
    name: string;
    id: string;
    roleId: string;
    createdAt: Date;
    updatedAt: Date;
    isActive: boolean;
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
    createdAt: Date;
    updatedAt: Date;
    document: string;
    isActive: boolean;
    email?: string | undefined;
    phone?: string | undefined;
    address?: string | undefined;
}, {
    name: string;
    id: string;
    createdAt: Date;
    updatedAt: Date;
    document: string;
    isActive: boolean;
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
    specialty: "other" | "nutritionist" | "psychologist" | "physiotherapist" | "dentist" | "general_practitioner";
    userId: string;
    document?: string | undefined;
}, {
    organizationId: string;
    id: string;
    createdAt: Date;
    updatedAt: Date;
    specialty: "other" | "nutritionist" | "psychologist" | "physiotherapist" | "dentist" | "general_practitioner";
    userId: string;
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
    phone?: string | undefined;
    document?: string | undefined;
    birthDate?: Date | undefined;
}, {
    name: string;
    organizationId: string;
    id: string;
    createdAt: Date;
    updatedAt: Date;
    email?: string | undefined;
    phone?: string | undefined;
    document?: string | undefined;
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
    patientId: string;
    createdAt: Date;
    updatedAt: Date;
    professionalId: string;
    startDate: Date;
    endDate: Date;
    notes?: string | undefined;
}, {
    status: "scheduled" | "confirmed" | "in_progress" | "completed" | "cancelled" | "no_show";
    organizationId: string;
    id: string;
    patientId: string;
    createdAt: Date;
    updatedAt: Date;
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

export { ApiResponseSchema, type Appointment, type AppointmentCancel, type AppointmentCreate, type AppointmentReschedule, AppointmentSchema, type AppointmentStatus, type AppointmentUpdate, type AuthUserResponse, AuthUserResponseSchema, type ForgotPasswordInput, ForgotPasswordSchema, type LoginInput, type LoginResponsePayload, LoginResponseSchema, LoginSchema, MessageStatus, OrganizationSchema, PaginatedResponseSchema, PaginationSchema, type Patient, type PatientContact, type PatientContactCreate, type PatientContactUpdate, type PatientCreate, PatientSchema, type PatientUpdate, PaymentStatus, PermissionSchema, ProfessionalSchema, ProfessionalSpecialty, type RefreshTokenInput, type RefreshTokenResponsePayload, RefreshTokenResponseSchema, RefreshTokenSchema, type RegisterInput, RegisterSchema, type ResetPasswordInput, ResetPasswordSchema, RoleSchema, SystemRole, UserRole, UserSchema };
