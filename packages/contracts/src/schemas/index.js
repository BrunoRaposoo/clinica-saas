"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PaginatedResponseSchema = exports.PaginationSchema = exports.ApiResponseSchema = exports.AppointmentSchema = exports.PatientSchema = exports.ProfessionalSchema = exports.PermissionSchema = exports.RoleSchema = exports.OrganizationSchema = exports.UserSchema = exports.RefreshTokenResponseSchema = exports.AuthUserResponseSchema = exports.ResetPasswordSchema = exports.ForgotPasswordSchema = exports.RefreshTokenSchema = exports.RegisterSchema = exports.LoginResponseSchema = exports.LoginSchema = void 0;
const zod_1 = require("zod");
var auth_1 = require("./auth");
Object.defineProperty(exports, "LoginSchema", { enumerable: true, get: function () { return auth_1.LoginSchema; } });
Object.defineProperty(exports, "LoginResponseSchema", { enumerable: true, get: function () { return auth_1.LoginResponseSchema; } });
Object.defineProperty(exports, "RegisterSchema", { enumerable: true, get: function () { return auth_1.RegisterSchema; } });
Object.defineProperty(exports, "RefreshTokenSchema", { enumerable: true, get: function () { return auth_1.RefreshTokenSchema; } });
Object.defineProperty(exports, "ForgotPasswordSchema", { enumerable: true, get: function () { return auth_1.ForgotPasswordSchema; } });
Object.defineProperty(exports, "ResetPasswordSchema", { enumerable: true, get: function () { return auth_1.ResetPasswordSchema; } });
Object.defineProperty(exports, "AuthUserResponseSchema", { enumerable: true, get: function () { return auth_1.AuthUserResponseSchema; } });
Object.defineProperty(exports, "RefreshTokenResponseSchema", { enumerable: true, get: function () { return auth_1.RefreshTokenResponseSchema; } });
exports.UserSchema = zod_1.z.object({
    id: zod_1.z.string().uuid(),
    email: zod_1.z.string().email(),
    name: zod_1.z.string().min(1),
    organizationId: zod_1.z.string().uuid().nullable().optional(),
    roleId: zod_1.z.string().uuid(),
    isActive: zod_1.z.boolean(),
    createdAt: zod_1.z.date(),
    updatedAt: zod_1.z.date(),
});
exports.OrganizationSchema = zod_1.z.object({
    id: zod_1.z.string().uuid(),
    name: zod_1.z.string().min(1),
    document: zod_1.z.string().min(1),
    email: zod_1.z.string().email().optional(),
    phone: zod_1.z.string().optional(),
    address: zod_1.z.string().optional(),
    isActive: zod_1.z.boolean(),
    createdAt: zod_1.z.date(),
    updatedAt: zod_1.z.date(),
});
exports.RoleSchema = zod_1.z.object({
    id: zod_1.z.string().uuid(),
    name: zod_1.z.string(),
    description: zod_1.z.string().optional(),
    isSystem: zod_1.z.boolean(),
    createdAt: zod_1.z.date(),
    updatedAt: zod_1.z.date(),
});
exports.PermissionSchema = zod_1.z.object({
    id: zod_1.z.string().uuid(),
    name: zod_1.z.string(),
    description: zod_1.z.string().optional(),
    createdAt: zod_1.z.date(),
});
exports.ProfessionalSchema = zod_1.z.object({
    id: zod_1.z.string().uuid(),
    userId: zod_1.z.string().uuid(),
    organizationId: zod_1.z.string().uuid(),
    specialty: zod_1.z.enum([
        'nutritionist',
        'psychologist',
        'physiotherapist',
        'dentist',
        'general_practitioner',
        'other',
    ]),
    document: zod_1.z.string().optional(),
    createdAt: zod_1.z.date(),
    updatedAt: zod_1.z.date(),
});
exports.PatientSchema = zod_1.z.object({
    id: zod_1.z.string().uuid(),
    organizationId: zod_1.z.string().uuid(),
    name: zod_1.z.string().min(1),
    email: zod_1.z.string().email().optional(),
    phone: zod_1.z.string().optional(),
    document: zod_1.z.string().optional(),
    birthDate: zod_1.z.date().optional(),
    createdAt: zod_1.z.date(),
    updatedAt: zod_1.z.date(),
});
exports.AppointmentSchema = zod_1.z.object({
    id: zod_1.z.string().uuid(),
    organizationId: zod_1.z.string().uuid(),
    patientId: zod_1.z.string().uuid(),
    professionalId: zod_1.z.string().uuid(),
    status: zod_1.z.enum([
        'scheduled',
        'confirmed',
        'in_progress',
        'completed',
        'cancelled',
        'no_show',
    ]),
    startDate: zod_1.z.date(),
    endDate: zod_1.z.date(),
    notes: zod_1.z.string().optional(),
    createdAt: zod_1.z.date(),
    updatedAt: zod_1.z.date(),
});
exports.ApiResponseSchema = zod_1.z.object({
    success: zod_1.z.boolean(),
    data: zod_1.z.any().optional(),
    error: zod_1.z
        .object({
        code: zod_1.z.string(),
        message: zod_1.z.string(),
        details: zod_1.z.any().optional(),
    })
        .optional(),
    timestamp: zod_1.z.date(),
});
exports.PaginationSchema = zod_1.z.object({
    page: zod_1.z.number().int().positive().default(1),
    limit: zod_1.z.number().int().positive().max(100).default(20),
    total: zod_1.z.number().int().nonnegative(),
    totalPages: zod_1.z.number().int().nonnegative(),
});
exports.PaginatedResponseSchema = zod_1.z.object({
    items: zod_1.z.array(zod_1.z.any()),
    pagination: exports.PaginationSchema,
});
//# sourceMappingURL=index.js.map