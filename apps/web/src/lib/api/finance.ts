import {
  Charge,
  ChargeListParams,
  ChargeListResponse,
  ChargeCreateRequest,
  ChargeUpdateRequest,
  ChargePaymentRequest,
  FinanceDashboard,
} from '@clinica-saas/contracts';

import { authenticatedFetch } from './client';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1';

export const financeApi = {
  getDashboard: async (periodFrom?: string, periodTo?: string): Promise<FinanceDashboard> => {
    const params = new URLSearchParams();
    if (periodFrom) params.set('periodFrom', periodFrom);
    if (periodTo) params.set('periodTo', periodTo);
    const response = await authenticatedFetch(`${API_URL}/finance/dashboard?${params}`);
    if (!response.ok) throw new Error('Failed to fetch dashboard');
    return response.json();
  },

  listCharges: async (params?: ChargeListParams): Promise<ChargeListResponse> => {
    const searchParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== '') {
          searchParams.append(key, String(value));
        }
      });
    }
    const response = await authenticatedFetch(`${API_URL}/finance/charges?${searchParams}`);
    if (!response.ok) throw new Error('Failed to fetch charges');
    return response.json();
  },

  getCharge: async (id: string): Promise<Charge> => {
    const response = await authenticatedFetch(`${API_URL}/finance/charges/${id}`);
    if (!response.ok) throw new Error('Failed to fetch charge');
    return response.json();
  },

  createCharge: async (data: ChargeCreateRequest): Promise<Charge> => {
    const response = await authenticatedFetch(`${API_URL}/finance/charges`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error('Failed to create charge');
    return response.json();
  },

  updateCharge: async (id: string, data: ChargeUpdateRequest): Promise<Charge> => {
    const response = await authenticatedFetch(`${API_URL}/finance/charges/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error('Failed to update charge');
    return response.json();
  },

  processPayment: async (id: string, data: ChargePaymentRequest): Promise<Charge> => {
    const response = await authenticatedFetch(`${API_URL}/finance/charges/${id}/pay`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error('Failed to process payment');
    return response.json();
  },

  deleteCharge: async (id: string): Promise<void> => {
    const response = await authenticatedFetch(`${API_URL}/finance/charges/${id}`, { method: 'DELETE' });
    if (!response.ok) throw new Error('Failed to delete charge');
  },
};