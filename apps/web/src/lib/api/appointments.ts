import type {
  Appointment,
  AppointmentListParams,
  AppointmentListResponse,
  AppointmentCreateRequest,
  AppointmentUpdateRequest,
  AppointmentCancelRequest,
  AppointmentRescheduleRequest,
  CalendarResponse,
  AvailabilityResponse,
  Professional,
  ScheduleBlock,
  ScheduleBlockCreateRequest,
} from '@clinica-saas/contracts';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1';

function getAuthHeaders(): HeadersInit {
  const accessToken = typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null;
  return {
    'Content-Type': 'application/json',
    ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
  };
}

export interface AppointmentsApiClient {
  getAppointments(params?: AppointmentListParams): Promise<AppointmentListResponse>;
  getAppointment(id: string): Promise<Appointment>;
  createAppointment(data: AppointmentCreateRequest): Promise<Appointment>;
  updateAppointment(id: string, data: AppointmentUpdateRequest): Promise<Appointment>;
  cancelAppointment(id: string, data: AppointmentCancelRequest): Promise<Appointment>;
  rescheduleAppointment(id: string, data: AppointmentRescheduleRequest): Promise<Appointment>;
  getCalendar(startDate: string, endDate: string, view?: 'day' | 'week' | 'month', professionalId?: string): Promise<CalendarResponse>;
  getAvailability(appointmentTypeId: string, professionalId: string, date: string): Promise<AvailabilityResponse>;
}

export interface ProfessionalsApiClient {
  getProfessionals(): Promise<Professional[]>;
  getProfessional(id: string): Promise<Professional>;
}

export interface ScheduleBlocksApiClient {
  getScheduleBlocks(startDate?: string, endDate?: string, professionalId?: string): Promise<ScheduleBlock[]>;
  createScheduleBlock(data: ScheduleBlockCreateRequest): Promise<ScheduleBlock>;
  deleteScheduleBlock(id: string): Promise<void>;
}

export const appointmentsApi: AppointmentsApiClient = {
  async getAppointments(params?: AppointmentListParams) {
    const searchParams = new URLSearchParams();
    if (params) {
      if (params.page) searchParams.set('page', String(params.page));
      if (params.limit) searchParams.set('limit', String(params.limit));
      if (params.startDate) searchParams.set('startDate', params.startDate);
      if (params.endDate) searchParams.set('endDate', params.endDate);
      if (params.professionalId) searchParams.set('professionalId', params.professionalId);
      if (params.patientId) searchParams.set('patientId', params.patientId);
      if (params.status) searchParams.set('status', params.status);
    }

    const res = await fetch(`${API_URL}/appointments?${searchParams}`, {
      headers: getAuthHeaders(),
      credentials: 'include',
    });

    if (!res.ok) {
      const error = await res.json().catch(() => ({ message: 'Erro ao buscar agendamentos' }));
      throw new Error(error.message);
    }

    return res.json();
  },

  async getAppointment(id: string) {
    const res = await fetch(`${API_URL}/appointments/${id}`, {
      headers: getAuthHeaders(),
      credentials: 'include',
    });

    if (!res.ok) {
      const error = await res.json().catch(() => ({ message: 'Erro ao buscar agendamento' }));
      throw new Error(error.message);
    }

    return res.json();
  },

  async createAppointment(data: AppointmentCreateRequest) {
    const res = await fetch(`${API_URL}/appointments`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
      credentials: 'include',
    });

    if (!res.ok) {
      const error = await res.json().catch(() => ({ message: 'Erro ao criar agendamento' }));
      throw new Error(error.message);
    }

    return res.json();
  },

  async updateAppointment(id: string, data: AppointmentUpdateRequest) {
    const res = await fetch(`${API_URL}/appointments/${id}`, {
      method: 'PATCH',
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
      credentials: 'include',
    });

    if (!res.ok) {
      const error = await res.json().catch(() => ({ message: 'Erro ao atualizar agendamento' }));
      throw new Error(error.message);
    }

    return res.json();
  },

  async cancelAppointment(id: string, data: AppointmentCancelRequest) {
    const res = await fetch(`${API_URL}/appointments/${id}/cancel`, {
      method: 'PATCH',
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
      credentials: 'include',
    });

    if (!res.ok) {
      const error = await res.json().catch(() => ({ message: 'Erro ao cancelar agendamento' }));
      throw new Error(error.message);
    }

    return res.json();
  },

  async rescheduleAppointment(id: string, data: AppointmentRescheduleRequest) {
    const res = await fetch(`${API_URL}/appointments/${id}/reschedule`, {
      method: 'PATCH',
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
      credentials: 'include',
    });

    if (!res.ok) {
      const error = await res.json().catch(() => ({ message: 'Erro ao remarcar agendamento' }));
      throw new Error(error.message);
    }

    return res.json();
  },

  async getCalendar(startDate: string, endDate: string, view: 'day' | 'week' | 'month' = 'week', professionalId?: string) {
    const searchParams = new URLSearchParams({ startDate, endDate, view });
    if (professionalId) searchParams.set('professionalId', professionalId);

    const res = await fetch(`${API_URL}/appointments/calendar?${searchParams}`, {
      headers: getAuthHeaders(),
      credentials: 'include',
    });

    if (!res.ok) {
      const error = await res.json().catch(() => ({ message: 'Erro ao buscar calendário' }));
      throw new Error(error.message);
    }

    return res.json();
  },

  async getAvailability(appointmentTypeId: string, professionalId: string, date: string) {
    const searchParams = new URLSearchParams({ appointmentTypeId, professionalId, date });

    const res = await fetch(`${API_URL}/appointments/availability?${searchParams}`, {
      headers: getAuthHeaders(),
      credentials: 'include',
    });

    if (!res.ok) {
      const error = await res.json().catch(() => ({ message: 'Erro ao buscar disponibilidade' }));
      throw new Error(error.message);
    }

    return res.json();
  },
};

export const professionalsApi: ProfessionalsApiClient = {
  async getProfessionals() {
    const res = await fetch(`${API_URL}/professionals`, {
      headers: getAuthHeaders(),
      credentials: 'include',
    });

    if (!res.ok) {
      const error = await res.json().catch(() => ({ message: 'Erro ao buscar profissionais' }));
      throw new Error(error.message);
    }

    return res.json();
  },

  async getProfessional(id: string) {
    const res = await fetch(`${API_URL}/professionals/${id}`, {
      headers: getAuthHeaders(),
      credentials: 'include',
    });

    if (!res.ok) {
      const error = await res.json().catch(() => ({ message: 'Erro ao buscar profissional' }));
      throw new Error(error.message);
    }

    return res.json();
  },
};

export const scheduleBlocksApi: ScheduleBlocksApiClient = {
  async getScheduleBlocks(startDate?: string, endDate?: string, professionalId?: string) {
    const searchParams = new URLSearchParams();
    if (startDate) searchParams.set('startDate', startDate);
    if (endDate) searchParams.set('endDate', endDate);
    if (professionalId) searchParams.set('professionalId', professionalId);

    const res = await fetch(`${API_URL}/schedule-blocks?${searchParams}`, {
      headers: getAuthHeaders(),
      credentials: 'include',
    });

    if (!res.ok) {
      const error = await res.json().catch(() => ({ message: 'Erro ao buscar bloqueios' }));
      throw new Error(error.message);
    }

    return res.json();
  },

  async createScheduleBlock(data: ScheduleBlockCreateRequest) {
    const res = await fetch(`${API_URL}/schedule-blocks`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
      credentials: 'include',
    });

    if (!res.ok) {
      const error = await res.json().catch(() => ({ message: 'Erro ao criar bloqueio' }));
      throw new Error(error.message);
    }

    return res.json();
  },

  async deleteScheduleBlock(id: string) {
    const res = await fetch(`${API_URL}/schedule-blocks/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
      credentials: 'include',
    });

    if (!res.ok) {
      const error = await res.json().catch(() => ({ message: 'Erro ao excluir bloqueio' }));
      throw new Error(error.message);
    }
  },
};