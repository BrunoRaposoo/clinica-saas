import type {
  Patient,
  PatientListParams,
  PatientListResponse,
  PatientCreateRequest,
  PatientUpdateRequest,
  PatientContactCreateRequest,
  PatientContactUpdateRequest,
} from '@clinica-saas/contracts';

import { getAuthHeaders, authenticatedFetch } from './client';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1';

export interface PatientsApiClient {
  getPatients(params?: PatientListParams): Promise<PatientListResponse>;
  getPatient(id: string): Promise<Patient>;
  createPatient(data: PatientCreateRequest): Promise<Patient>;
  updatePatient(id: string, data: PatientUpdateRequest): Promise<Patient>;
  deletePatient(id: string): Promise<void>;
  getPatientContacts(patientId: string): Promise<Patient['contacts']>;
  createPatientContact(patientId: string, data: PatientContactCreateRequest): Promise<Patient['contacts']>;
  updatePatientContact(patientId: string, contactId: string, data: PatientContactUpdateRequest): Promise<Patient['contacts']>;
  deletePatientContact(patientId: string, contactId: string): Promise<void>;
  getPatientAudit(patientId: string): Promise<Patient['contacts']>;
}

export const patientsApi: PatientsApiClient = {
  async getPatients(params?: PatientListParams) {
    const searchParams = new URLSearchParams();
    if (params) {
      if (params.page) searchParams.set('page', String(params.page));
      if (params.limit) searchParams.set('limit', String(params.limit));
      if (params.search) searchParams.set('search', params.search);
      if (params.document) searchParams.set('document', params.document);
      if (params.phone) searchParams.set('phone', params.phone);
      if (params.isActive !== undefined) searchParams.set('isActive', String(params.isActive));
    }

    const res = await authenticatedFetch(`${API_URL}/patients?${searchParams}`, {
      headers: getAuthHeaders(),
      credentials: 'include',
    });

    if (!res.ok) {
      const error = await res.json().catch(() => ({ message: 'Erro ao buscar pacientes' }));
      throw new Error(error.message);
    }

    return res.json();
  },

  async getPatient(id: string) {
    const res = await authenticatedFetch(`${API_URL}/patients/${id}`, {
      headers: getAuthHeaders(),
      credentials: 'include',
    });

    if (!res.ok) {
      const error = await res.json().catch(() => ({ message: 'Erro ao buscar paciente' }));
      throw new Error(error.message);
    }

    return res.json();
  },

  async createPatient(data: PatientCreateRequest) {
    console.log('[Patients API] Payload sendo enviado:', {
      name: data.name,
      email: data.email,
      phone: data.phone,
      document: data.document,
      addressZipCode: data.addressZipCode,
      contacts: data.contacts?.map(c => ({ name: c.name, phone: c.phone })),
    });

    const res = await authenticatedFetch(`${API_URL}/patients`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
      credentials: 'include',
    });

    if (!res.ok) {
      const error = await res.json().catch(() => ({ message: 'Erro ao criar paciente' }));
      console.error('[Patients API] Erro na resposta:', error);
      throw new Error(error.message);
    }

    return res.json();
  },

  async updatePatient(id: string, data: PatientUpdateRequest) {
    const res = await authenticatedFetch(`${API_URL}/patients/${id}`, {
      method: 'PATCH',
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
      credentials: 'include',
    });

    if (!res.ok) {
      const error = await res.json().catch(() => ({ message: 'Erro ao atualizar paciente' }));
      throw new Error(error.message);
    }

    return res.json();
  },

  async deletePatient(id: string) {
    const res = await authenticatedFetch(`${API_URL}/patients/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
      credentials: 'include',
    });

    if (!res.ok) {
      const error = await res.json().catch(() => ({ message: 'Erro ao excluir paciente' }));
      throw new Error(error.message);
    }
  },

  async getPatientContacts(patientId: string) {
    const res = await authenticatedFetch(`${API_URL}/patients/${patientId}/contacts`, {
      headers: getAuthHeaders(),
    });

    if (!res.ok) {
      const error = await res.json().catch(() => ({ message: 'Erro ao buscar contatos' }));
      throw new Error(error.message);
    }

    return res.json();
  },

  async createPatientContact(patientId: string, data: PatientContactCreateRequest) {
    const res = await authenticatedFetch(`${API_URL}/patients/${patientId}/contacts`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });

    if (!res.ok) {
      const error = await res.json().catch(() => ({ message: 'Erro ao criar contato' }));
      throw new Error(error.message);
    }

    return res.json();
  },

  async updatePatientContact(patientId: string, contactId: string, data: PatientContactUpdateRequest) {
    const res = await authenticatedFetch(`${API_URL}/patients/contacts/${contactId}`, {
      method: 'PATCH',
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });

    if (!res.ok) {
      const error = await res.json().catch(() => ({ message: 'Erro ao atualizar contato' }));
      throw new Error(error.message);
    }

    return res.json();
  },

  async deletePatientContact(patientId: string, contactId: string) {
    const res = await authenticatedFetch(`${API_URL}/patients/contacts/${contactId}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });

    if (!res.ok) {
      const error = await res.json().catch(() => ({ message: 'Erro ao excluir contato' }));
      throw new Error(error.message);
    }
  },

  async getPatientAudit(patientId: string) {
    const res = await authenticatedFetch(`${API_URL}/patients/${patientId}/audit`, {
      headers: getAuthHeaders(),
    });

    if (!res.ok) {
      const error = await res.json().catch(() => ({ message: 'Erro ao buscar auditoria' }));
      throw new Error(error.message);
    }

    return res.json();
  },
};