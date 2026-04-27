export interface Appointment {
  id: string;
  organizationId: string;
  patientId: string;
  professionalId: string;
  appointmentTypeId?: string | null;
  status: AppointmentStatus;
  startDate: string;
  endDate: string;
  duration: number;
  notes?: string | null;
  cancellationReason?: string | null;
  cancelledBy?: string | null;
  cancelledAt?: string | null;
  createdAt: string;
  updatedAt: string;
  patient?: PatientBasic;
  professional?: ProfessionalBasic;
  appointmentType?: AppointmentTypeBasic;
}

export interface PatientBasic {
  id: string;
  name: string;
  phone?: string | null;
  email?: string | null;
  document?: string | null;
}

export interface ProfessionalBasic {
  id: string;
  name: string;
  specialty: string;
  color: string;
}

export interface AppointmentTypeBasic {
  id: string;
  name: string;
  duration: number;
  color: string;
}

export type AppointmentStatus = 'scheduled' | 'confirmed' | 'in_progress' | 'completed' | 'cancelled' | 'no_show';

export interface AppointmentListParams {
  page?: number;
  limit?: number;
  startDate?: string;
  endDate?: string;
  professionalId?: string;
  patientId?: string;
  status?: AppointmentStatus;
}

export interface AppointmentListResponse {
  items: Appointment[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface AppointmentCreateRequest {
  patientId: string;
  professionalId: string;
  appointmentTypeId?: string;
  startDate: string;
  notes?: string;
}

export interface AppointmentUpdateRequest {
  appointmentTypeId?: string;
  startDate?: string;
  notes?: string;
  status?: AppointmentStatus;
}

export interface AppointmentCancelRequest {
  reason: string;
}

export interface AppointmentRescheduleRequest {
  newStartDate: string;
}

export interface CalendarDay {
  date: string;
  slots: CalendarSlot[];
}

export interface CalendarSlot {
  time: string;
  appointment?: Appointment;
  available?: boolean;
  blocked?: { start: string; end: string; reason: string };
}

export interface CalendarResponse {
  view: 'day' | 'week' | 'month';
  startDate: string;
  endDate: string;
  days: CalendarDay[];
}

export interface Professional {
  id: string;
  userId: string;
  organizationId: string;
  specialty: string;
  appointmentTypeId?: string | null;
  color: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  user?: {
    id: string;
    name: string;
  };
}

export interface AppointmentType {
  id: string;
  organizationId: string;
  name: string;
  duration: number;
  color: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ScheduleBlock {
  id: string;
  organizationId: string;
  professionalId: string;
  startDate: string;
  endDate: string;
  reason: string;
  createdAt: string;
  updatedAt: string;
}

export interface ScheduleBlockCreateRequest {
  professionalId: string;
  startDate: string;
  endDate: string;
  reason: string;
}

export interface WaitingList {
  id: string;
  organizationId: string;
  patientId: string;
  professionalId: string;
  preferredDate?: string | null;
  notes?: string | null;
  status: 'waiting' | 'scheduled' | 'cancelled';
  createdAt: string;
  updatedAt: string;
  patient?: PatientBasic;
  professional?: ProfessionalBasic;
}

export interface AvailabilityResponse {
  date: string;
  availableSlots: string[];
  blockedSlots: { start: string; end: string; reason: string }[];
}