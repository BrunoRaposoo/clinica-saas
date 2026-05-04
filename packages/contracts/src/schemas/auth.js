"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RefreshTokenResponseSchema = exports.LoginResponseSchema = exports.AuthUserResponseSchema = exports.ResetPasswordSchema = exports.ForgotPasswordSchema = exports.RefreshTokenSchema = exports.RegisterSchema = exports.LoginSchema = void 0;
const zod_1 = require("zod");
exports.LoginSchema = zod_1.z.object({
    email: zod_1.z.string().email('Email inválido'),
    password: zod_1.z.string().min(1, 'Senha é obrigatória'),
});
exports.RegisterSchema = zod_1.z.object({
    email: zod_1.z.string().email('Email inválido'),
    password: zod_1.z
        .string()
        .min(8, 'Senha deve ter pelo menos 8 caracteres')
        .regex(/[A-Z]/, 'Senha deve conter pelo menos uma letra maiúscula')
        .regex(/[0-9]/, 'Senha deve conter pelo menos um número'),
    name: zod_1.z.string().min(1, 'Nome é obrigatório'),
    organizationId: zod_1.z.string().uuid().optional(),
});
exports.RefreshTokenSchema = zod_1.z.object({
    refreshToken: zod_1.z.string().min(1, 'Refresh token é obrigatório'),
});
exports.ForgotPasswordSchema = zod_1.z.object({
    email: zod_1.z.string().email('Email inválido'),
});
exports.ResetPasswordSchema = zod_1.z.object({
    token: zod_1.z.string().min(1, 'Token é obrigatório'),
    newPassword: zod_1.z
        .string()
        .min(8, 'Senha deve ter pelo menos 8 caracteres')
        .regex(/[A-Z]/, 'Senha deve conter pelo menos uma letra maiúscula')
        .regex(/[0-9]/, 'Senha deve conter pelo menos um número'),
});
exports.AuthUserResponseSchema = zod_1.z.object({
    id: zod_1.z.string().uuid(),
    email: zod_1.z.string().email(),
    name: zod_1.z.string(),
    organizationId: zod_1.z.string().uuid().nullable().optional(),
    roleId: zod_1.z.string().uuid(),
    roleName: zod_1.z.string(),
});
exports.LoginResponseSchema = zod_1.z.object({
    accessToken: zod_1.z.string(),
    refreshToken: zod_1.z.string(),
    expiresIn: zod_1.z.number(),
    user: exports.AuthUserResponseSchema,
});
exports.RefreshTokenResponseSchema = zod_1.z.object({
    accessToken: zod_1.z.string(),
    expiresIn: zod_1.z.number(),
});
//# sourceMappingURL=auth.js.map