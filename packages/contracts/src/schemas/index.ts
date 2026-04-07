import { z } from 'zod';

export const UserSchema = z.object({
  id: z.string().uuid(),
  email: z.string().email(),
  name: z.string().min(1),
  role: z.enum(['admin', 'clinic_owner', 'professional', 'receptionist']),
  clinicId: z.string().uuid().nullable(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export const ClinicSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1),
  document: z.string().min(1),
  email: z.string().email().optional(),
  phone: z.string().optional(),
  address: z.string().optional(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export const ProfessionalSchema = z.object({
  id: z.string().uuid(),
  userId: z.string().uuid(),
  clinicId: z.string().uuid(),
  specialty: z.enum([
    'nutritionist',
    'psychologist',
    'physiotherapist',
    'dentist',
    'general_practitioner',
    'other',
  ]),
  document: z.string().optional(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export const PatientSchema = z.object({
  id: z.string().uuid(),
  clinicId: z.string().uuid(),
  name: z.string().min(1),
  email: z.string().email().optional(),
  phone: z.string().optional(),
  document: z.string().optional(),
  birthDate: z.date().optional(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export const AppointmentSchema = z.object({
  id: z.string().uuid(),
  clinicId: z.string().uuid(),
  patientId: z.string().uuid(),
  professionalId: z.string().uuid(),
  status: z.enum([
    'scheduled',
    'confirmed',
    'in_progress',
    'completed',
    'cancelled',
    'no_show',
  ]),
  startDate: z.date(),
  endDate: z.date(),
  notes: z.string().optional(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export const ApiResponseSchema = z.object({
  success: z.boolean(),
  data: z.any().optional(),
  error: z
    .object({
      code: z.string(),
      message: z.string(),
      details: z.any().optional(),
    })
    .optional(),
  timestamp: z.date(),
});

export const PaginationSchema = z.object({
  page: z.number().int().positive().default(1),
  limit: z.number().int().positive().max(100).default(20),
  total: z.number().int().nonnegative(),
  totalPages: z.number().int().nonnegative(),
});

export const PaginatedResponseSchema = z.object({
  items: z.array(z.any()),
  pagination: PaginationSchema,
});