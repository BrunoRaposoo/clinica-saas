import {
  MessageStatus,
  PaymentStatus,
  ProfessionalSpecialty,
  SystemRole,
  UserRole
} from "./chunk-JBI3IEM3.mjs";

// src/schemas/index.ts
import { z as z2 } from "zod";

// src/schemas/auth.ts
import { z } from "zod";
var LoginSchema = z.object({
  email: z.string().email("Email inv\xE1lido"),
  password: z.string().min(1, "Senha \xE9 obrigat\xF3ria")
});
var RegisterSchema = z.object({
  email: z.string().email("Email inv\xE1lido"),
  password: z.string().min(8, "Senha deve ter pelo menos 8 caracteres").regex(/[A-Z]/, "Senha deve conter pelo menos uma letra mai\xFAscula").regex(/[0-9]/, "Senha deve conter pelo menos um n\xFAmero"),
  name: z.string().min(1, "Nome \xE9 obrigat\xF3rio"),
  organizationId: z.string().uuid().optional()
});
var RefreshTokenSchema = z.object({
  refreshToken: z.string().min(1, "Refresh token \xE9 obrigat\xF3rio")
});
var ForgotPasswordSchema = z.object({
  email: z.string().email("Email inv\xE1lido")
});
var ResetPasswordSchema = z.object({
  token: z.string().min(1, "Token \xE9 obrigat\xF3rio"),
  newPassword: z.string().min(8, "Senha deve ter pelo menos 8 caracteres").regex(/[A-Z]/, "Senha deve conter pelo menos uma letra mai\xFAscula").regex(/[0-9]/, "Senha deve conter pelo menos um n\xFAmero")
});
var AuthUserResponseSchema = z.object({
  id: z.string().uuid(),
  email: z.string().email(),
  name: z.string(),
  organizationId: z.string().uuid().nullable().optional(),
  roleId: z.string().uuid(),
  roleName: z.string()
});
var LoginResponseSchema = z.object({
  accessToken: z.string(),
  refreshToken: z.string(),
  expiresIn: z.number(),
  user: AuthUserResponseSchema
});
var RefreshTokenResponseSchema = z.object({
  accessToken: z.string(),
  expiresIn: z.number()
});

// src/schemas/index.ts
var UserSchema = z2.object({
  id: z2.string().uuid(),
  email: z2.string().email(),
  name: z2.string().min(1),
  organizationId: z2.string().uuid().nullable().optional(),
  roleId: z2.string().uuid(),
  isActive: z2.boolean(),
  createdAt: z2.date(),
  updatedAt: z2.date()
});
var OrganizationSchema = z2.object({
  id: z2.string().uuid(),
  name: z2.string().min(1),
  document: z2.string().min(1),
  email: z2.string().email().optional(),
  phone: z2.string().optional(),
  address: z2.string().optional(),
  isActive: z2.boolean(),
  createdAt: z2.date(),
  updatedAt: z2.date()
});
var RoleSchema = z2.object({
  id: z2.string().uuid(),
  name: z2.string(),
  description: z2.string().optional(),
  isSystem: z2.boolean(),
  createdAt: z2.date(),
  updatedAt: z2.date()
});
var PermissionSchema = z2.object({
  id: z2.string().uuid(),
  name: z2.string(),
  description: z2.string().optional(),
  createdAt: z2.date()
});
var ProfessionalSchema = z2.object({
  id: z2.string().uuid(),
  userId: z2.string().uuid(),
  organizationId: z2.string().uuid(),
  specialty: z2.enum([
    "nutritionist",
    "psychologist",
    "physiotherapist",
    "dentist",
    "general_practitioner",
    "other"
  ]),
  document: z2.string().optional(),
  createdAt: z2.date(),
  updatedAt: z2.date()
});
var PatientSchema = z2.object({
  id: z2.string().uuid(),
  organizationId: z2.string().uuid(),
  name: z2.string().min(1),
  email: z2.string().email().optional(),
  phone: z2.string().optional(),
  document: z2.string().optional(),
  birthDate: z2.date().optional(),
  createdAt: z2.date(),
  updatedAt: z2.date()
});
var AppointmentSchema = z2.object({
  id: z2.string().uuid(),
  organizationId: z2.string().uuid(),
  patientId: z2.string().uuid(),
  professionalId: z2.string().uuid(),
  status: z2.enum([
    "scheduled",
    "confirmed",
    "in_progress",
    "completed",
    "cancelled",
    "no_show"
  ]),
  startDate: z2.date(),
  endDate: z2.date(),
  notes: z2.string().optional(),
  createdAt: z2.date(),
  updatedAt: z2.date()
});
var ApiResponseSchema = z2.object({
  success: z2.boolean(),
  data: z2.any().optional(),
  error: z2.object({
    code: z2.string(),
    message: z2.string(),
    details: z2.any().optional()
  }).optional(),
  timestamp: z2.date()
});
var PaginationSchema = z2.object({
  page: z2.number().int().positive().default(1),
  limit: z2.number().int().positive().max(100).default(20),
  total: z2.number().int().nonnegative(),
  totalPages: z2.number().int().nonnegative()
});
var PaginatedResponseSchema = z2.object({
  items: z2.array(z2.any()),
  pagination: PaginationSchema
});
export {
  ApiResponseSchema,
  AppointmentSchema,
  AuthUserResponseSchema,
  ForgotPasswordSchema,
  LoginResponseSchema,
  LoginSchema,
  MessageStatus,
  OrganizationSchema,
  PaginatedResponseSchema,
  PaginationSchema,
  PatientSchema,
  PaymentStatus,
  PermissionSchema,
  ProfessionalSchema,
  ProfessionalSpecialty,
  RefreshTokenResponseSchema,
  RefreshTokenSchema,
  RegisterSchema,
  ResetPasswordSchema,
  RoleSchema,
  SystemRole,
  UserRole,
  UserSchema
};
//# sourceMappingURL=zod.mjs.map