export type ChargeStatus = 'pending' | 'paid' | 'overdue' | 'cancelled';
export type PaymentMethod = 'cash' | 'credit' | 'debit' | 'pix' | 'transfer';
export type ChargeAction = 'create' | 'update' | 'payment' | 'cancel';

export interface Charge {
  id: string;
  organizationId: string;
  patientId?: string;
  appointmentId?: string;
  description: string;
  amount: number;
  dueDate: string;
  status: ChargeStatus;
  paidAt?: string;
  paymentMethod?: PaymentMethod;
  notes?: string;
  createdBy: { id: string; name: string };
  createdAt: string;
  updatedAt: string;
}

export interface ChargeListParams {
  page?: number;
  limit?: number;
  status?: ChargeStatus;
  patientId?: string;
  appointmentId?: string;
  dueDateFrom?: string;
  dueDateTo?: string;
  search?: string;
}

export interface ChargeListResponse {
  items: Charge[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface ChargeCreateRequest {
  description: string;
  amount: number;
  dueDate: string;
  patientId?: string;
  appointmentId?: string;
  notes?: string;
}

export interface ChargeUpdateRequest {
  description?: string;
  amount?: number;
  dueDate?: string;
  notes?: string;
}

export interface ChargePaymentRequest {
  paymentMethod: PaymentMethod;
}

export interface FinanceDashboard {
  totalPending: number;
  totalPaid: number;
  totalOverdue: number;
  pendingCount: number;
}