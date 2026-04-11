import type { PeriodType, DashboardSummary, DrillDownParams } from '@clinica-saas/contracts';

const API_BASE = '/api/v1/dashboard';

export async function getDashboardSummary(
  organizationId: string,
  period: PeriodType,
  startDate?: string,
  endDate?: string
): Promise<DashboardSummary> {
  const params = new URLSearchParams({ period, organizationId });
  if (startDate) params.append('startDate', startDate);
  if (endDate) params.append('endDate', endDate);

  const res = await fetch(`${API_BASE}/summary?${params}`);
  if (!res.ok) throw new Error('Failed to fetch dashboard');
  return res.json();
}

export async function getChargesDrillDown(organizationId: string, params: DrillDownParams & { page?: number; limit?: number }) {
  const searchParams = new URLSearchParams({ period: params.period, organizationId });
  if (params.status) searchParams.append('status', params.status);
  if (params.startDate) searchParams.append('startDate', params.startDate);
  if (params.endDate) searchParams.append('endDate', params.endDate);
  if (params.page) searchParams.append('page', String(params.page));
  if (params.limit) searchParams.append('limit', String(params.limit));

  const res = await fetch(`${API_BASE}/charges?${searchParams}`);
  if (!res.ok) throw new Error('Failed to fetch charges');
  return res.json();
}

export async function getAppointmentsDrillDown(organizationId: string, params: DrillDownParams & { page?: number; limit?: number }) {
  const searchParams = new URLSearchParams({ period: params.period, organizationId });
  if (params.status) searchParams.append('status', params.status);
  if (params.professionalId) searchParams.append('professionalId', params.professionalId);
  if (params.startDate) searchParams.append('startDate', params.startDate);
  if (params.endDate) searchParams.append('endDate', params.endDate);
  if (params.page) searchParams.append('page', String(params.page));
  if (params.limit) searchParams.append('limit', String(params.limit));

  const res = await fetch(`${API_BASE}/appointments?${searchParams}`);
  if (!res.ok) throw new Error('Failed to fetch appointments');
  return res.json();
}

export async function getPatientsDrillDown(organizationId: string, params: DrillDownParams & { page?: number; limit?: number }) {
  const searchParams = new URLSearchParams({ period: params.period, organizationId });
  if (params.status) searchParams.append('status', params.status);
  if (params.startDate) searchParams.append('startDate', params.startDate);
  if (params.endDate) searchParams.append('endDate', params.endDate);
  if (params.page) searchParams.append('page', String(params.page));
  if (params.limit) searchParams.append('limit', String(params.limit));

  const res = await fetch(`${API_BASE}/patients?${searchParams}`);
  if (!res.ok) throw new Error('Failed to fetch patients');
  return res.json();
}

export async function getCommunicationsDrillDown(organizationId: string, params: DrillDownParams & { page?: number; limit?: number }) {
  const searchParams = new URLSearchParams({ period: params.period, organizationId });
  if (params.status) searchParams.append('status', params.status);
  if (params.startDate) searchParams.append('startDate', params.startDate);
  if (params.endDate) searchParams.append('endDate', params.endDate);
  if (params.page) searchParams.append('page', String(params.page));
  if (params.limit) searchParams.append('limit', String(params.limit));

  const res = await fetch(`${API_BASE}/communications?${searchParams}`);
  if (!res.ok) throw new Error('Failed to fetch communications');
  return res.json();
}

export async function getTasksDrillDown(organizationId: string, params: DrillDownParams & { page?: number; limit?: number }) {
  const searchParams = new URLSearchParams({ period: params.period, organizationId });
  if (params.status) searchParams.append('status', params.status);
  if (params.startDate) searchParams.append('startDate', params.startDate);
  if (params.endDate) searchParams.append('endDate', params.endDate);
  if (params.page) searchParams.append('page', String(params.page));
  if (params.limit) searchParams.append('limit', String(params.limit));

  const res = await fetch(`${API_BASE}/tasks?${searchParams}`);
  if (!res.ok) throw new Error('Failed to fetch tasks');
  return res.json();
}