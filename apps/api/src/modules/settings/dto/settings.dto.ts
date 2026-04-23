import { IsString, IsEmail, IsOptional, IsNotEmpty, MaxLength, IsDateString } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';

export class UpdateOrganizationSettingsDto {
  @ApiPropertyOptional({ example: 'Clínica Médica Ltda' })
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  businessName?: string;

  @ApiPropertyOptional({ example: 'Clínica Médica' })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  tradeName?: string;

  @ApiPropertyOptional({ example: 'logo.png' })
  @IsOptional()
  @IsString()
  logo?: string;

  @ApiPropertyOptional({ example: 'contato@clinica.com.br' })
  @IsOptional()
  @IsEmail()
  email?: string;

  @ApiPropertyOptional({ example: '(11) 99999-9999' })
  @IsOptional()
  @IsString()
  @MaxLength(20)
  phone?: string;

  @ApiPropertyOptional({ example: 'Rua Teste, 123' })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  address?: string;

  @ApiPropertyOptional({ example: 'São Paulo' })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  city?: string;

  @ApiPropertyOptional({ example: 'SP' })
  @IsOptional()
  @IsString()
  @MaxLength(2)
  state?: string;

  @ApiPropertyOptional({ example: '01234-567' })
  @IsOptional()
  @IsString()
  @MaxLength(10)
  zipCode?: string;

  @ApiPropertyOptional({ example: 'America/Sao_Paulo' })
  @IsOptional()
  @IsString()
  timezone?: string;

  @ApiPropertyOptional({ example: 'pt-BR' })
  @IsOptional()
  @IsString()
  locale?: string;

  @ApiPropertyOptional({ example: 'BRL' })
  @IsOptional()
  @IsString()
  @MaxLength(3)
  currency?: string;
}

export class UnitDto {
  @ApiProperty({ example: 'Unidade Centro' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  name: string;

  @ApiPropertyOptional({ example: 'Rua Teste, 123' })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  address?: string;

  @ApiPropertyOptional({ example: '(11) 99999-9999' })
  @IsOptional()
  @IsString()
  @MaxLength(20)
  phone?: string;
}

export class UpdateUnitDto {
  @ApiPropertyOptional({ example: 'Unidade Centro' })
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  name?: string;

  @ApiPropertyOptional({ example: 'Rua Teste, 123' })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  address?: string;

  @ApiPropertyOptional({ example: '(11) 99999-9999' })
  @IsOptional()
  @IsString()
  @MaxLength(20)
  phone?: string;

  @ApiPropertyOptional()
  @IsOptional()
  isActive?: boolean;
}

export class ServiceTypeDto {
  @ApiProperty({ example: 'Consulta' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  name: string;

  @ApiPropertyOptional({ example: 'Consulta médica geral' })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  description?: string;

  @ApiProperty({ example: 30 })
  @IsNotEmpty()
  duration: number;

  @ApiPropertyOptional({ example: 150.00 })
  @IsOptional()
  @IsString()
  price?: string;

  @ApiPropertyOptional({ example: '#3B82F6' })
  @IsOptional()
  @IsString()
  color?: string;
}

export class UpdateServiceTypeDto {
  @ApiPropertyOptional({ example: 'Consulta' })
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  name?: string;

  @ApiPropertyOptional({ example: 'Consulta médica geral' })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  description?: string;

  @ApiPropertyOptional({ example: 30 })
  @IsOptional()
  duration?: number;

  @ApiPropertyOptional({ example: 150.00 })
  @IsOptional()
  @IsString()
  price?: string;

  @ApiPropertyOptional({ example: '#3B82F6' })
  @IsOptional()
  @IsString()
  color?: string;

  @ApiPropertyOptional()
  @IsOptional()
  isActive?: boolean;
}

export class ProfessionalDto {
  @ApiProperty({ example: 'uuid-do-usuario' })
  @IsString()
  @IsNotEmpty()
  userId: string;

  @ApiPropertyOptional({ example: 'Cardiologia' })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  specialty?: string;

  @ApiPropertyOptional({ example: 'CRM/SP 123456' })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  registerNumber?: string;

  @ApiPropertyOptional({ example: '#3B82F6' })
  @IsOptional()
  @IsString()
  color?: string;

  @ApiPropertyOptional({ example: 'uuid-do-tipo-de-atendimento' })
  @IsOptional()
  @IsString()
  appointmentTypeId?: string;
}

export class UpdateProfessionalSettingsDto {
  @ApiPropertyOptional({ example: 'Cardiologia' })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  specialty?: string;

  @ApiPropertyOptional({ example: 'CRM/SP 123456' })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  registerNumber?: string;

  @ApiPropertyOptional()
  @IsOptional()
  isActive?: boolean;

  @ApiPropertyOptional({ example: '#3B82F6' })
  @IsOptional()
  @IsString()
  color?: string;

  @ApiPropertyOptional({ example: 'uuid-do-tipo-de-atendimento' })
  @IsOptional()
  @IsString()
  appointmentTypeId?: string;
}

export class SchedulePreferencesDto {
  @ApiPropertyOptional({ example: 30 })
  @IsOptional()
  defaultDuration?: number;

  @ApiPropertyOptional({ example: 15 })
  @IsOptional()
  minInterval?: number;

  @ApiPropertyOptional({ example: 60 })
  @IsOptional()
  maxAdvanceDays?: number;

  @ApiPropertyOptional()
  @IsOptional()
  allowOverbooking?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  requireConfirmation?: boolean;

  @ApiPropertyOptional({ example: '08:00' })
  @IsOptional()
  @IsString()
  startWorkHour?: string;

  @ApiPropertyOptional({ example: '18:00' })
  @IsOptional()
  @IsString()
  endWorkHour?: string;

  @ApiPropertyOptional({ example: [1, 2, 3, 4, 5] })
  @IsOptional()
  @IsString()
  workDays?: string;
}

export class CommunicationPreferencesDto {
  @ApiPropertyOptional({ enum: ['email', 'sms', 'whatsapp'] })
  @IsOptional()
  @IsString()
  defaultChannel?: string;

  @ApiPropertyOptional()
  @IsOptional()
  sendAppointmentReminder?: boolean;

  @ApiPropertyOptional({ example: 24 })
  @IsOptional()
  reminderHoursBefore?: number;

  @ApiPropertyOptional()
  @IsOptional()
  sendPaymentReminder?: boolean;

  @ApiPropertyOptional({ example: 3 })
  @IsOptional()
  reminderDaysBefore?: number;

  @ApiPropertyOptional({ example: 'template-id' })
  @IsOptional()
  @IsString()
  defaultEmailTemplate?: string;

  @ApiPropertyOptional({ example: 'template-id' })
  @IsOptional()
  @IsString()
  defaultSmsTemplate?: string;
}