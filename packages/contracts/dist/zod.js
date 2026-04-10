"use strict";
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// src/zod.ts
var zod_exports = {};
__export(zod_exports, {
  ApiResponseSchema: () => ApiResponseSchema,
  AppointmentSchema: () => AppointmentSchema,
  AuthUserResponseSchema: () => AuthUserResponseSchema,
  ForgotPasswordSchema: () => ForgotPasswordSchema,
  LoginResponseSchema: () => LoginResponseSchema,
  LoginSchema: () => LoginSchema,
  MessageStatus: () => MessageStatus,
  OrganizationSchema: () => OrganizationSchema,
  PaginatedResponseSchema: () => PaginatedResponseSchema,
  PaginationSchema: () => PaginationSchema,
  PatientSchema: () => PatientSchema,
  PaymentStatus: () => PaymentStatus,
  PermissionSchema: () => PermissionSchema,
  ProfessionalSchema: () => ProfessionalSchema,
  ProfessionalSpecialty: () => ProfessionalSpecialty,
  RefreshTokenResponseSchema: () => RefreshTokenResponseSchema,
  RefreshTokenSchema: () => RefreshTokenSchema,
  RegisterSchema: () => RegisterSchema,
  ResetPasswordSchema: () => ResetPasswordSchema,
  RoleSchema: () => RoleSchema,
  SystemRole: () => SystemRole,
  UserRole: () => UserRole,
  UserSchema: () => UserSchema
});
module.exports = __toCommonJS(zod_exports);

// src/schemas/index.ts
var import_zod2 = require("zod");

// src/schemas/auth.ts
var import_zod = require("zod");
var LoginSchema = import_zod.z.object({
  email: import_zod.z.string().email("Email inv\xE1lido"),
  password: import_zod.z.string().min(1, "Senha \xE9 obrigat\xF3ria")
});
var RegisterSchema = import_zod.z.object({
  email: import_zod.z.string().email("Email inv\xE1lido"),
  password: import_zod.z.string().min(8, "Senha deve ter pelo menos 8 caracteres").regex(/[A-Z]/, "Senha deve conter pelo menos uma letra mai\xFAscula").regex(/[0-9]/, "Senha deve conter pelo menos um n\xFAmero"),
  name: import_zod.z.string().min(1, "Nome \xE9 obrigat\xF3rio"),
  organizationId: import_zod.z.string().uuid().optional()
});
var RefreshTokenSchema = import_zod.z.object({
  refreshToken: import_zod.z.string().min(1, "Refresh token \xE9 obrigat\xF3rio")
});
var ForgotPasswordSchema = import_zod.z.object({
  email: import_zod.z.string().email("Email inv\xE1lido")
});
var ResetPasswordSchema = import_zod.z.object({
  token: import_zod.z.string().min(1, "Token \xE9 obrigat\xF3rio"),
  newPassword: import_zod.z.string().min(8, "Senha deve ter pelo menos 8 caracteres").regex(/[A-Z]/, "Senha deve conter pelo menos uma letra mai\xFAscula").regex(/[0-9]/, "Senha deve conter pelo menos um n\xFAmero")
});
var AuthUserResponseSchema = import_zod.z.object({
  id: import_zod.z.string().uuid(),
  email: import_zod.z.string().email(),
  name: import_zod.z.string(),
  organizationId: import_zod.z.string().uuid().nullable().optional(),
  roleId: import_zod.z.string().uuid(),
  roleName: import_zod.z.string()
});
var LoginResponseSchema = import_zod.z.object({
  accessToken: import_zod.z.string(),
  refreshToken: import_zod.z.string(),
  expiresIn: import_zod.z.number(),
  user: AuthUserResponseSchema
});
var RefreshTokenResponseSchema = import_zod.z.object({
  accessToken: import_zod.z.string(),
  expiresIn: import_zod.z.number()
});

// src/schemas/index.ts
var UserSchema = import_zod2.z.object({
  id: import_zod2.z.string().uuid(),
  email: import_zod2.z.string().email(),
  name: import_zod2.z.string().min(1),
  organizationId: import_zod2.z.string().uuid().nullable().optional(),
  roleId: import_zod2.z.string().uuid(),
  isActive: import_zod2.z.boolean(),
  createdAt: import_zod2.z.date(),
  updatedAt: import_zod2.z.date()
});
var OrganizationSchema = import_zod2.z.object({
  id: import_zod2.z.string().uuid(),
  name: import_zod2.z.string().min(1),
  document: import_zod2.z.string().min(1),
  email: import_zod2.z.string().email().optional(),
  phone: import_zod2.z.string().optional(),
  address: import_zod2.z.string().optional(),
  isActive: import_zod2.z.boolean(),
  createdAt: import_zod2.z.date(),
  updatedAt: import_zod2.z.date()
});
var RoleSchema = import_zod2.z.object({
  id: import_zod2.z.string().uuid(),
  name: import_zod2.z.string(),
  description: import_zod2.z.string().optional(),
  isSystem: import_zod2.z.boolean(),
  createdAt: import_zod2.z.date(),
  updatedAt: import_zod2.z.date()
});
var PermissionSchema = import_zod2.z.object({
  id: import_zod2.z.string().uuid(),
  name: import_zod2.z.string(),
  description: import_zod2.z.string().optional(),
  createdAt: import_zod2.z.date()
});
var ProfessionalSchema = import_zod2.z.object({
  id: import_zod2.z.string().uuid(),
  userId: import_zod2.z.string().uuid(),
  organizationId: import_zod2.z.string().uuid(),
  specialty: import_zod2.z.enum([
    "nutritionist",
    "psychologist",
    "physiotherapist",
    "dentist",
    "general_practitioner",
    "other"
  ]),
  document: import_zod2.z.string().optional(),
  createdAt: import_zod2.z.date(),
  updatedAt: import_zod2.z.date()
});
var PatientSchema = import_zod2.z.object({
  id: import_zod2.z.string().uuid(),
  organizationId: import_zod2.z.string().uuid(),
  name: import_zod2.z.string().min(1),
  email: import_zod2.z.string().email().optional(),
  phone: import_zod2.z.string().optional(),
  document: import_zod2.z.string().optional(),
  birthDate: import_zod2.z.date().optional(),
  createdAt: import_zod2.z.date(),
  updatedAt: import_zod2.z.date()
});
var AppointmentSchema = import_zod2.z.object({
  id: import_zod2.z.string().uuid(),
  organizationId: import_zod2.z.string().uuid(),
  patientId: import_zod2.z.string().uuid(),
  professionalId: import_zod2.z.string().uuid(),
  status: import_zod2.z.enum([
    "scheduled",
    "confirmed",
    "in_progress",
    "completed",
    "cancelled",
    "no_show"
  ]),
  startDate: import_zod2.z.date(),
  endDate: import_zod2.z.date(),
  notes: import_zod2.z.string().optional(),
  createdAt: import_zod2.z.date(),
  updatedAt: import_zod2.z.date()
});
var ApiResponseSchema = import_zod2.z.object({
  success: import_zod2.z.boolean(),
  data: import_zod2.z.any().optional(),
  error: import_zod2.z.object({
    code: import_zod2.z.string(),
    message: import_zod2.z.string(),
    details: import_zod2.z.any().optional()
  }).optional(),
  timestamp: import_zod2.z.date()
});
var PaginationSchema = import_zod2.z.object({
  page: import_zod2.z.number().int().positive().default(1),
  limit: import_zod2.z.number().int().positive().max(100).default(20),
  total: import_zod2.z.number().int().nonnegative(),
  totalPages: import_zod2.z.number().int().nonnegative()
});
var PaginatedResponseSchema = import_zod2.z.object({
  items: import_zod2.z.array(import_zod2.z.any()),
  pagination: PaginationSchema
});

// src/enums/index.ts
var UserRole = /* @__PURE__ */ ((UserRole2) => {
  UserRole2["ADMIN"] = "admin";
  UserRole2["CLINIC_OWNER"] = "clinic_owner";
  UserRole2["PROFESSIONAL"] = "professional";
  UserRole2["RECEPTIONIST"] = "receptionist";
  return UserRole2;
})(UserRole || {});
var SystemRole = /* @__PURE__ */ ((SystemRole2) => {
  SystemRole2["SUPER_ADMIN"] = "super_admin";
  SystemRole2["ORG_ADMIN"] = "org_admin";
  SystemRole2["PROFESSIONAL"] = "professional";
  SystemRole2["RECEPTIONIST"] = "receptionist";
  SystemRole2["SUPPORT"] = "support";
  return SystemRole2;
})(SystemRole || {});
var ProfessionalSpecialty = /* @__PURE__ */ ((ProfessionalSpecialty2) => {
  ProfessionalSpecialty2["NUTRITIONIST"] = "nutritionist";
  ProfessionalSpecialty2["PSYCHOLOGIST"] = "psychologist";
  ProfessionalSpecialty2["PHYSIOTHERAPIST"] = "physiotherapist";
  ProfessionalSpecialty2["DENTIST"] = "dentist";
  ProfessionalSpecialty2["GENERAL_PRACTITIONER"] = "general_practitioner";
  ProfessionalSpecialty2["OTHER"] = "other";
  return ProfessionalSpecialty2;
})(ProfessionalSpecialty || {});
var PaymentStatus = /* @__PURE__ */ ((PaymentStatus2) => {
  PaymentStatus2["PENDING"] = "pending";
  PaymentStatus2["PAID"] = "paid";
  PaymentStatus2["OVERDUE"] = "overdue";
  PaymentStatus2["REFUNDED"] = "refunded";
  return PaymentStatus2;
})(PaymentStatus || {});
var MessageStatus = /* @__PURE__ */ ((MessageStatus2) => {
  MessageStatus2["PENDING"] = "pending";
  MessageStatus2["SENT"] = "sent";
  MessageStatus2["FAILED"] = "failed";
  return MessageStatus2;
})(MessageStatus || {});
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
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
});
//# sourceMappingURL=zod.js.map