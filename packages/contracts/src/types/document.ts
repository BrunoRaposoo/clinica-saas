export type MessageChannel = 'WHATSAPP' | 'EMAIL' | 'SMS';
export type MessageType = 'CONFIRMATION' | 'REMINDER' | 'CANCELLATION' | 'CUSTOM';
export type CommunicationStatus = 'pending' | 'sent' | 'delivered' | 'failed';

export type DocumentCategory = 'identity' | 'exams' | 'prescriptions' | 'reports' | 'administrative' | 'other';
export type DocumentAction = 'create' | 'read' | 'update' | 'delete' | 'download';
export type StorageProvider = 's3' | 'local';

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
  type: MessageType;
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
  changes?: Record<string, unknown>;
  performedBy: string;
  performedAt: string;
}

export interface MessageJob {
  id: string;
  organizationId: string;
  type: MessageType;
  appointmentId: string;
  scheduledFor: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  retryCount: number;
  lastError?: string;
  createdAt: string;
  processedAt?: string;
}

export interface SendParams {
  to: string;
  channel: MessageChannel;
  message: string;
  subject?: string;
}

export interface SendResult {
  success: boolean;
  messageId?: string;
  error?: string;
}

export interface IMessageProvider {
  channel: MessageChannel;
  send(params: SendParams): Promise<SendResult>;
  getStatus(messageId: string): Promise<CommunicationStatus>;
}

export interface Document {
  id: string;
  organizationId: string;
  patientId?: string;
  appointmentId?: string;
  category: DocumentCategory;
  type: string;
  name: string;
  description?: string;
  fileName: string;
  fileSize: number;
  mimeType: string;
  storageProvider: StorageProvider;
  isPublic: boolean;
  expiresAt?: string;
  uploadedBy: { id: string; name: string };
  createdAt: string;
  updatedAt: string;
}

export interface DocumentListParams {
  page?: number;
  limit?: number;
  patientId?: string;
  appointmentId?: string;
  category?: DocumentCategory;
  type?: string;
  startDate?: string;
  endDate?: string;
  search?: string;
}

export interface DocumentListResponse {
  items: Document[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface DocumentCreateRequest {
  patientId?: string;
  appointmentId?: string;
  category: DocumentCategory;
  type: string;
  name: string;
  description?: string;
  fileName: string;
  fileSize: number;
  mimeType: string;
}

export interface DocumentUpdateRequest {
  category?: DocumentCategory;
  type?: string;
  name?: string;
  description?: string;
  isPublic?: boolean;
}

export interface DocumentAudit {
  id: string;
  documentId: string;
  action: DocumentAction;
  changes?: Record<string, unknown>;
  performedBy: string;
  performedAt: string;
}

export interface StorageOptions {
  contentType: string;
  maxAge?: number;
}

export interface StoredFile {
  key: string;
  url: string;
  size: number;
  contentType: string;
}