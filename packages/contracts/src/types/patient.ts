export interface Patient {
  id: string;
  organizationId: string;
  name: string;
  email?: string | null;
  phone?: string | null;
  document?: string | null;
  birthDate?: string | null;
  gender?: 'male' | 'female' | 'other' | null;
  addressStreet?: string | null;
  addressNumber?: string | null;
  addressComplement?: string | null;
  addressDistrict?: string | null;
  addressCity?: string | null;
  addressState?: string | null;
  addressZipCode?: string | null;
  notes?: string | null;
  tags: string[];
  isActive: boolean;
  deletedAt?: string | null;
  createdAt: string;
  updatedAt: string;
  contacts?: PatientContact[];
}

export interface PatientContact {
  id: string;
  patientId: string;
  name: string;
  relationship: string;
  phone?: string | null;
  email?: string | null;
  isPrimary: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface PatientAudit {
  id: string;
  patientId: string;
  action: 'create' | 'update' | 'delete';
  changes?: Record<string, unknown> | null;
  performedBy: string;
  performedAt: string;
}

export interface PatientListParams {
  page?: number;
  limit?: number;
  search?: string;
  document?: string;
  phone?: string;
  isActive?: boolean;
}

export interface PatientListResponse {
  items: Patient[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface PatientCreateRequest {
  name: string;
  email?: string;
  phone?: string;
  document?: string;
  birthDate?: string;
  gender?: 'male' | 'female' | 'other';
  addressStreet?: string;
  addressNumber?: string;
  addressComplement?: string;
  addressDistrict?: string;
  addressCity?: string;
  addressState?: string;
  addressZipCode?: string;
  notes?: string;
  tags?: string[];
  contacts?: PatientContactCreateRequest[];
}

export interface PatientUpdateRequest {
  name?: string;
  email?: string;
  phone?: string;
  document?: string;
  birthDate?: string;
  gender?: 'male' | 'female' | 'other';
  addressStreet?: string;
  addressNumber?: string;
  addressComplement?: string;
  addressDistrict?: string;
  addressCity?: string;
  addressState?: string;
  addressZipCode?: string;
  notes?: string;
  tags?: string[];
  isActive?: boolean;
}

export interface PatientContactCreateRequest {
  name: string;
  relationship: string;
  phone?: string;
  email?: string;
  isPrimary?: boolean;
}

export interface PatientContactUpdateRequest {
  name?: string;
  relationship?: string;
  phone?: string;
  email?: string;
  isPrimary?: boolean;
}