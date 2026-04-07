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

// src/schemas/index.ts
import { z } from "zod";
var UserSchema = z.object({
  id: z.string().uuid(),
  email: z.string().email(),
  name: z.string().min(1),
  role: z.enum(["admin", "clinic_owner", "professional", "receptionist"]),
  clinicId: z.string().uuid().nullable(),
  createdAt: z.date(),
  updatedAt: z.date()
});
var ClinicSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1),
  document: z.string().min(1),
  email: z.string().email().optional(),
  phone: z.string().optional(),
  address: z.string().optional(),
  createdAt: z.date(),
  updatedAt: z.date()
});
var ProfessionalSchema = z.object({
  id: z.string().uuid(),
  userId: z.string().uuid(),
  clinicId: z.string().uuid(),
  specialty: z.enum([
    "nutritionist",
    "psychologist",
    "physiotherapist",
    "dentist",
    "general_practitioner",
    "other"
  ]),
  document: z.string().optional(),
  createdAt: z.date(),
  updatedAt: z.date()
});
var PatientSchema = z.object({
  id: z.string().uuid(),
  clinicId: z.string().uuid(),
  name: z.string().min(1),
  email: z.string().email().optional(),
  phone: z.string().optional(),
  document: z.string().optional(),
  birthDate: z.date().optional(),
  createdAt: z.date(),
  updatedAt: z.date()
});
var AppointmentSchema = z.object({
  id: z.string().uuid(),
  clinicId: z.string().uuid(),
  patientId: z.string().uuid(),
  professionalId: z.string().uuid(),
  status: z.enum([
    "scheduled",
    "confirmed",
    "in_progress",
    "completed",
    "cancelled",
    "no_show"
  ]),
  startDate: z.date(),
  endDate: z.date(),
  notes: z.string().optional(),
  createdAt: z.date(),
  updatedAt: z.date()
});
var ApiResponseSchema = z.object({
  success: z.boolean(),
  data: z.any().optional(),
  error: z.object({
    code: z.string(),
    message: z.string(),
    details: z.any().optional()
  }).optional(),
  timestamp: z.date()
});
var PaginationSchema = z.object({
  page: z.number().int().positive().default(1),
  limit: z.number().int().positive().max(100).default(20),
  total: z.number().int().nonnegative(),
  totalPages: z.number().int().nonnegative()
});
var PaginatedResponseSchema = z.object({
  items: z.array(z.any()),
  pagination: PaginationSchema
});

export {
  UserRole,
  ProfessionalSpecialty,
  AppointmentStatus,
  PaymentStatus,
  MessageStatus,
  UserSchema,
  ClinicSchema,
  ProfessionalSchema,
  PatientSchema,
  AppointmentSchema,
  ApiResponseSchema,
  PaginationSchema,
  PaginatedResponseSchema
};
//# sourceMappingURL=chunk-HWL3HGCC.mjs.map