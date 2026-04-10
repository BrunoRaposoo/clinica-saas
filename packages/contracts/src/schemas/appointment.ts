import { z } from 'zod';

export const AppointmentStatusEnum = z.enum(['scheduled', 'confirmed', 'in_progress', 'completed', 'cancelled', 'no_show']);

export const AppointmentTypeSchema = z.object({
  id: z.string().uuid(),
  organizationId: z.string().uuid(),
  name: z.string().min(1),
  duration: z.number().int().positive(),
  color: z.string(),
  isActive: z.boolean(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

export const PatientBasicSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1),
});

export const ProfessionalBasicSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1),
  specialty: z.string(),
  color: z.string(),
});

export const AppointmentTypeBasicSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1),
  duration: z.number().int().positive(),
  color: z.string(),
});

export const AppointmentSchema = z.object({
  id: z.string().uuid(),
  organizationId: z.string().uuid(),
  patientId: z.string().uuid(),
  professionalId: z.string().uuid(),
  appointmentTypeId: z.string().uuid().nullable().optional(),
  status: AppointmentStatusEnum,
  startDate: z.string().datetime(),
  endDate: z.string().datetime(),
  duration: z.number().int().positive(),
  notes: z.string().optional(),
  cancellationReason: z.string().optional(),
  cancelledBy: z.string().uuid().optional(),
  cancelledAt: z.string().datetime().optional(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
  patient: PatientBasicSchema.optional(),
  professional: ProfessionalBasicSchema.optional(),
  appointmentType: AppointmentTypeBasicSchema.optional(),
});

export const AppointmentCreateSchema = z.object({
  patientId: z.string().uuid(),
  professionalId: z.string().uuid(),
  appointmentTypeId: z.string().uuid().optional(),
  startDate: z.string().datetime(),
  notes: z.string().optional(),
});

export const AppointmentUpdateSchema = z.object({
  appointmentTypeId: z.string().uuid().optional(),
  startDate: z.string().datetime().optional(),
  notes: z.string().optional(),
  status: AppointmentStatusEnum.optional(),
});

export const AppointmentCancelSchema = z.object({
  reason: z.string().min(1, 'Motivo é obrigatório'),
});

export const AppointmentRescheduleSchema = z.object({
  newStartDate: z.string().datetime(),
});

export const AppointmentListParamsSchema = z.object({
  page: z.number().int().positive().optional().default(1),
  limit: z.number().int().positive().max(100).optional().default(20),
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
  professionalId: z.string().uuid().optional(),
  patientId: z.string().uuid().optional(),
  status: AppointmentStatusEnum.optional(),
});

export const ProfessionalSchema = z.object({
  id: z.string().uuid(),
  userId: z.string().uuid(),
  organizationId: z.string().uuid(),
  specialty: z.string(),
  appointmentTypeId: z.string().uuid().nullable().optional(),
  color: z.string(),
  isActive: z.boolean(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
  user: z.object({
    id: z.string().uuid(),
    name: z.string(),
  }).optional(),
});

export const ScheduleBlockSchema = z.object({
  id: z.string().uuid(),
  organizationId: z.string().uuid(),
  professionalId: z.string().uuid(),
  startDate: z.string().datetime(),
  endDate: z.string().datetime(),
  reason: z.string(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

export const ScheduleBlockCreateSchema = z.object({
  professionalId: z.string().uuid(),
  startDate: z.string().datetime(),
  endDate: z.string().datetime(),
  reason: z.string().min(1),
});

export const CalendarSlotSchema = z.object({
  time: z.string(),
  appointment: AppointmentSchema.optional(),
  available: z.boolean().optional(),
  blocked: z.object({
    start: z.string(),
    end: z.string(),
    reason: z.string(),
  }).optional(),
});

export const CalendarDaySchema = z.object({
  date: z.string(),
  slots: z.array(CalendarSlotSchema),
});

export const CalendarResponseSchema = z.object({
  view: z.enum(['day', 'week', 'month']),
  startDate: z.string(),
  endDate: z.string(),
  days: z.array(CalendarDaySchema),
});

export const AvailabilityResponseSchema = z.object({
  date: z.string(),
  availableSlots: z.array(z.string()),
  blockedSlots: z.array(
    z.object({
      start: z.string(),
      end: z.string(),
      reason: z.string(),
    })
  ),
});