export enum UserRole {
  ADMIN = 'admin',
  CLINIC_OWNER = 'clinic_owner',
  PROFESSIONAL = 'professional',
  RECEPTIONIST = 'receptionist',
}

export enum SystemRole {
  SUPER_ADMIN = 'super_admin',
  ORG_ADMIN = 'org_admin',
  PROFESSIONAL = 'professional',
  RECEPTIONIST = 'receptionist',
  SUPPORT = 'support',
}

export enum ProfessionalSpecialty {
  NUTRITIONIST = 'nutritionist',
  PSYCHOLOGIST = 'psychologist',
  PHYSIOTHERAPIST = 'physiotherapist',
  DENTIST = 'dentist',
  GENERAL_PRACTITIONER = 'general_practitioner',
  OTHER = 'other',
}

export enum AppointmentStatus {
  SCHEDULED = 'scheduled',
  CONFIRMED = 'confirmed',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
  NO_SHOW = 'no_show',
}

export enum PaymentStatus {
  PENDING = 'pending',
  PAID = 'paid',
  OVERDUE = 'overdue',
  REFUNDED = 'refunded',
}

export enum MessageStatus {
  PENDING = 'pending',
  SENT = 'sent',
  FAILED = 'failed',
}