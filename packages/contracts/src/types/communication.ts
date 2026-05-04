export type MessageChannel = 'whatsapp' | 'email' | 'sms';
export type MessageType = 'reminder' | 'confirmation' | 'cancellation' | 'custom';
export type CommunicationStatus = 'pending' | 'sent' | 'delivered' | 'failed';
export type JobType = 'reminder' | 'confirmation' | 'cancellation';
export type JobStatus = 'pending' | 'processing' | 'completed' | 'failed';

export interface MessageTemplate {
  id: string;
  organizationId: string;
  name: string;
  channel: MessageChannel;
  type: MessageType;
  subject?: string;
  body: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface MessageTemplateListParams {
  page?: number;
  limit?: number;
  channel?: MessageChannel;
  type?: MessageType;
  isActive?: boolean;
}

export interface MessageTemplateListResponse {
  items: MessageTemplate[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface MessageTemplateCreateRequest {
  name: string;
  channel: MessageChannel;
  type: MessageType;
  subject?: string;
  body: string;
}

export interface MessageTemplateUpdateRequest {
  name?: string;
  subject?: string;
  body?: string;
  isActive?: boolean;
}

export interface Communication {
  id: string;
  organizationId: string;
  patientId: string;
  appointmentId?: string;
  templateId?: string;
  channel: MessageChannel;
  type: string;
  recipient: string;
  message: string;
  status: CommunicationStatus;
  provider?: string;
  providerMessageId?: string;
  errorMessage?: string;
  scheduledAt: string;
  sentAt?: string;
  deliveredAt?: string;
  createdAt: string;
  patient?: {
    id: string;
    name: string;
  };
  appointment?: {
    id: string;
    startDate: string;
  };
}

export interface CommunicationListParams {
  page?: number;
  limit?: number;
  patientId?: string;
  appointmentId?: string;
  channel?: MessageChannel;
  status?: CommunicationStatus;
  startDate?: string;
  endDate?: string;
}

export interface CommunicationListResponse {
  items: Communication[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface CommunicationCreateRequest {
  patientId: string;
  appointmentId?: string;
  channel: MessageChannel;
  type: MessageType;
  recipient: string;
  message: string;
  templateId?: string;
}

export interface CommunicationAudit {
  id: string;
  communicationId: string;
  action: string;
  changes?: Record<string, unknown> | null;
  performedBy: string;
  performedAt: string;
}

export interface MessageJob {
  id: string;
  organizationId: string;
  type: JobType;
  appointmentId: string;
  scheduledFor: string;
  status: JobStatus;
  retryCount: number;
  lastError?: string;
  createdAt: string;
  processedAt?: string;
}

export interface MessageJobListParams {
  page?: number;
  limit?: number;
  type?: JobType;
  status?: JobStatus;
  appointmentId?: string;
}

export interface MessageJobListResponse {
  items: MessageJob[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface SendParams {
  to: string;
  subject?: string;
  body: string;
  appointmentId?: string;
}

export interface SendResult {
  success: boolean;
  providerMessageId?: string;
  error?: string;
}

export interface IMessageProvider {
  channel: MessageChannel;
  send(params: SendParams): Promise<SendResult>;
  getStatus(messageId: string): Promise<CommunicationStatus>;
}