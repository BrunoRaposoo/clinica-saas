import { z } from 'zod';

export const GenderEnum = z.enum(['male', 'female', 'other']);

export const PatientContactSchema = z.object({
  id: z.string().uuid(),
  patientId: z.string().uuid(),
  name: z.string().min(2).max(255),
  relationship: z.string().min(2).max(100),
  phone: z.string().optional(),
  email: z.string().email().optional().or(z.literal('')),
  isPrimary: z.boolean(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

export const PatientContactCreateSchema = z.object({
  name: z.string().min(2).max(255),
  relationship: z.string().min(2).max(100),
  phone: z.string().min(10).max(11).optional(),
  email: z.string().email().optional().or(z.literal('')),
  isPrimary: z.boolean().optional().default(false),
});

export const PatientContactUpdateSchema = z.object({
  name: z.string().min(2).max(255).optional(),
  relationship: z.string().min(2).max(100).optional(),
  phone: z.string().min(10).max(11).optional(),
  email: z.string().email().optional().or(z.literal('')),
  isPrimary: z.boolean().optional(),
});

export const PatientSchema = z.object({
  id: z.string().uuid(),
  organizationId: z.string().uuid(),
  name: z.string().min(2).max(255),
  email: z.string().email().optional().or(z.literal('')),
  phone: z.string().optional(),
  document: z.string().optional(),
  birthDate: z.string().datetime().optional().or(z.literal('')),
  gender: GenderEnum.optional(),
  addressStreet: z.string().optional(),
  addressNumber: z.string().optional(),
  addressComplement: z.string().optional(),
  addressDistrict: z.string().optional(),
  addressCity: z.string().optional(),
  addressState: z.string().optional(),
  addressZipCode: z.string().optional(),
  notes: z.string().optional(),
  tags: z.array(z.string()).default([]),
  isActive: z.boolean(),
  deletedAt: z.string().datetime().optional(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
  contacts: z.array(PatientContactSchema).optional(),
});

export const PatientCreateSchema = z.object({
  name: z.string().min(2).max(255),
  email: z.string().email().optional().or(z.literal('')),
  phone: z.string().min(10).max(11).optional(),
  document: z.string().optional(),
  birthDate: z.string().datetime().optional().or(z.literal('')),
  gender: GenderEnum.optional(),
  addressStreet: z.string().optional(),
  addressNumber: z.string().optional(),
  addressComplement: z.string().optional(),
  addressDistrict: z.string().optional(),
  addressCity: z.string().optional(),
  addressState: z.string().optional(),
  addressZipCode: z.string().min(8).max(8).optional(),
  notes: z.string().optional(),
  tags: z.array(z.string()).optional().default([]),
  contacts: z.array(PatientContactCreateSchema).optional().default([]),
});

export const PatientUpdateSchema = z.object({
  name: z.string().min(2).max(255).optional(),
  email: z.string().email().optional().or(z.literal('')),
  phone: z.string().min(10).max(11).optional(),
  document: z.string().optional(),
  birthDate: z.string().datetime().optional().or(z.literal('')),
  gender: GenderEnum.optional(),
  addressStreet: z.string().optional(),
  addressNumber: z.string().optional(),
  addressComplement: z.string().optional(),
  addressDistrict: z.string().optional(),
  addressCity: z.string().optional(),
  addressState: z.string().optional(),
  addressZipCode: z.string().min(8).max(8).optional(),
  notes: z.string().optional(),
  tags: z.array(z.string()).optional(),
  isActive: z.boolean().optional(),
});

export const PatientListParamsSchema = z.object({
  page: z.number().int().positive().optional().default(1),
  limit: z.number().int().positive().max(100).optional().default(20),
  search: z.string().optional(),
  document: z.string().optional(),
  phone: z.string().optional(),
  isActive: z.boolean().optional(),
});

export const PatientAuditSchema = z.object({
  id: z.string().uuid(),
  patientId: z.string().uuid(),
  action: z.enum(['create', 'update', 'delete']),
  changes: z.record(z.unknown()).optional(),
  performedBy: z.string().uuid(),
  performedAt: z.string().datetime(),
});