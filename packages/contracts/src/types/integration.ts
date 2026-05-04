export type IntegrationProvider = 'email' | 'whatsapp';
export type IntegrationStatus = 'connected' | 'disconnected' | 'error';
export type IntegrationLogStatus = 'pending' | 'success' | 'failed';

export interface Integration {
  id: string;
  organizationId: string;
  provider: IntegrationProvider;
  providerConfig?: Record<string, unknown>;
  isActive: boolean;
  lastSyncAt?: string;
  status: IntegrationStatus;
  createdAt: string;
  updatedAt: string;
}

export interface IntegrationListParams {
  page?: number;
  limit?: number;
  provider?: IntegrationProvider;
  status?: IntegrationStatus;
}

export interface IntegrationListResponse {
  items: Integration[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface IntegrationCreateRequest {
  provider: IntegrationProvider;
  providerConfig?: Record<string, unknown>;
  credentials: Record<string, unknown>;
}

export interface IntegrationUpdateRequest {
  providerConfig?: Record<string, unknown>;
  credentials?: Record<string, unknown>;
  isActive?: boolean;
}

export interface IntegrationLog {
  id: string;
  integrationId: string;
  event: string;
  status: IntegrationLogStatus;
  errorMessage?: string;
  requestPayload?: Record<string, unknown>;
  responsePayload?: Record<string, unknown>;
  createdAt: string;
}

export interface IntegrationLogListParams {
  page?: number;
  limit?: number;
  status?: IntegrationLogStatus;
}

export interface IntegrationLogListResponse {
  items: IntegrationLog[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface Automation {
  id: string;
  organizationId: string;
  name: string;
  event: string;
  action: string;
  config: Record<string, unknown>;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface AutomationListParams {
  page?: number;
  limit?: number;
  event?: string;
  isActive?: boolean;
}

export interface AutomationListResponse {
  items: Automation[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface AutomationCreateRequest {
  name: string;
  event: string;
  action: string;
  config: Record<string, unknown>;
}

export interface AutomationUpdateRequest {
  name?: string;
  event?: string;
  action?: string;
  config?: Record<string, unknown>;
  isActive?: boolean;
}