import {
  Charge,
  ChargeListParams,
  ChargeListResponse,
  ChargeCreateRequest,
  ChargeUpdateRequest,
  ChargePaymentRequest,
  FinanceDashboard,
} from '@clinica-saas/contracts';

const BASE_URL = '/finance';

export const financeApi = {
  getDashboard: async (): Promise<FinanceDashboard> => {
    const response = await fetch(`${BASE_URL}/dashboard`);
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
    const response = await fetch(`${BASE_URL}/charges?${searchParams}`);
    if (!response.ok) throw new Error('Failed to fetch charges');
    return response.json();
  },

  getCharge: async (id: string): Promise<Charge> => {
    const response = await fetch(`${BASE_URL}/charges/${id}`);
    if (!response.ok) throw new Error('Failed to fetch charge');
    return response.json();
  },

  createCharge: async (data: ChargeCreateRequest): Promise<Charge> => {
    const response = await fetch(`${BASE_URL}/charges`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error('Failed to create charge');
    return response.json();
  },

  updateCharge: async (id: string, data: ChargeUpdateRequest): Promise<Charge> => {
    const response = await fetch(`${BASE_URL}/charges/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error('Failed to update charge');
    return response.json();
  },

  processPayment: async (id: string, data: ChargePaymentRequest): Promise<Charge> => {
    const response = await fetch(`${BASE_URL}/charges/${id}/pay`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error('Failed to process payment');
    return response.json();
  },

  deleteCharge: async (id: string): Promise<void> => {
    const response = await fetch(`${BASE_URL}/charges/${id}`, { method: 'DELETE' });
    if (!response.ok) throw new Error('Failed to delete charge');
  },
};