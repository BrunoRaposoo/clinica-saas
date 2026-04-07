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
  AppointmentStatus: () => AppointmentStatus,
  ClinicSchema: () => ClinicSchema,
  MessageStatus: () => MessageStatus,
  PaginatedResponseSchema: () => PaginatedResponseSchema,
  PaginationSchema: () => PaginationSchema,
  PatientSchema: () => PatientSchema,
  PaymentStatus: () => PaymentStatus,
  ProfessionalSchema: () => ProfessionalSchema,
  ProfessionalSpecialty: () => ProfessionalSpecialty,
  UserRole: () => UserRole,
  UserSchema: () => UserSchema
});
module.exports = __toCommonJS(zod_exports);

// src/schemas/index.ts
var import_zod = require("zod");
var UserSchema = import_zod.z.object({
  id: import_zod.z.string().uuid(),
  email: import_zod.z.string().email(),
  name: import_zod.z.string().min(1),
  role: import_zod.z.enum(["admin", "clinic_owner", "professional", "receptionist"]),
  clinicId: import_zod.z.string().uuid().nullable(),
  createdAt: import_zod.z.date(),
  updatedAt: import_zod.z.date()
});
var ClinicSchema = import_zod.z.object({
  id: import_zod.z.string().uuid(),
  name: import_zod.z.string().min(1),
  document: import_zod.z.string().min(1),
  email: import_zod.z.string().email().optional(),
  phone: import_zod.z.string().optional(),
  address: import_zod.z.string().optional(),
  createdAt: import_zod.z.date(),
  updatedAt: import_zod.z.date()
});
var ProfessionalSchema = import_zod.z.object({
  id: import_zod.z.string().uuid(),
  userId: import_zod.z.string().uuid(),
  clinicId: import_zod.z.string().uuid(),
  specialty: import_zod.z.enum([
    "nutritionist",
    "psychologist",
    "physiotherapist",
    "dentist",
    "general_practitioner",
    "other"
  ]),
  document: import_zod.z.string().optional(),
  createdAt: import_zod.z.date(),
  updatedAt: import_zod.z.date()
});
var PatientSchema = import_zod.z.object({
  id: import_zod.z.string().uuid(),
  clinicId: import_zod.z.string().uuid(),
  name: import_zod.z.string().min(1),
  email: import_zod.z.string().email().optional(),
  phone: import_zod.z.string().optional(),
  document: import_zod.z.string().optional(),
  birthDate: import_zod.z.date().optional(),
  createdAt: import_zod.z.date(),
  updatedAt: import_zod.z.date()
});
var AppointmentSchema = import_zod.z.object({
  id: import_zod.z.string().uuid(),
  clinicId: import_zod.z.string().uuid(),
  patientId: import_zod.z.string().uuid(),
  professionalId: import_zod.z.string().uuid(),
  status: import_zod.z.enum([
    "scheduled",
    "confirmed",
    "in_progress",
    "completed",
    "cancelled",
    "no_show"
  ]),
  startDate: import_zod.z.date(),
  endDate: import_zod.z.date(),
  notes: import_zod.z.string().optional(),
  createdAt: import_zod.z.date(),
  updatedAt: import_zod.z.date()
});
var ApiResponseSchema = import_zod.z.object({
  success: import_zod.z.boolean(),
  data: import_zod.z.any().optional(),
  error: import_zod.z.object({
    code: import_zod.z.string(),
    message: import_zod.z.string(),
    details: import_zod.z.any().optional()
  }).optional(),
  timestamp: import_zod.z.date()
});
var PaginationSchema = import_zod.z.object({
  page: import_zod.z.number().int().positive().default(1),
  limit: import_zod.z.number().int().positive().max(100).default(20),
  total: import_zod.z.number().int().nonnegative(),
  totalPages: import_zod.z.number().int().nonnegative()
});
var PaginatedResponseSchema = import_zod.z.object({
  items: import_zod.z.array(import_zod.z.any()),
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
var ProfessionalSpecialty = /* @__PURE__ */ ((ProfessionalSpecialty2) => {
  ProfessionalSpecialty2["NUTRITIONIST"] = "nutritionist";
  ProfessionalSpecialty2["PSYCHOLOGIST"] = "psychologist";
  ProfessionalSpecialty2["PHYSIOTHERAPIST"] = "physiotherapist";
  ProfessionalSpecialty2["DENTIST"] = "dentist";
  ProfessionalSpecialty2["GENERAL_PRACTITIONER"] = "general_practitioner";
  ProfessionalSpecialty2["OTHER"] = "other";
  return ProfessionalSpecialty2;
})(ProfessionalSpecialty || {});
var AppointmentStatus = /* @__PURE__ */ ((AppointmentStatus2) => {
  AppointmentStatus2["SCHEDULED"] = "scheduled";
  AppointmentStatus2["CONFIRMED"] = "confirmed";
  AppointmentStatus2["IN_PROGRESS"] = "in_progress";
  AppointmentStatus2["COMPLETED"] = "completed";
  AppointmentStatus2["CANCELLED"] = "cancelled";
  AppointmentStatus2["NO_SHOW"] = "no_show";
  return AppointmentStatus2;
})(AppointmentStatus || {});
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
  AppointmentStatus,
  ClinicSchema,
  MessageStatus,
  PaginatedResponseSchema,
  PaginationSchema,
  PatientSchema,
  PaymentStatus,
  ProfessionalSchema,
  ProfessionalSpecialty,
  UserRole,
  UserSchema
});
//# sourceMappingURL=zod.js.map