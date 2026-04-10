import { IsString, IsOptional, IsUUID, IsDateString, IsEnum, Min, Max } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class AppointmentTypeDto {
  @ApiPropertyOptional({ example: 'Consulta' })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiPropertyOptional({ example: 30 })
  @IsOptional()
  @Type(() => Number)
  @Min(5)
  @Max(180)
  duration?: number;

  @ApiPropertyOptional({ example: '#3B82F6' })
  @IsOptional()
  @IsString()
  color?: string;
}

export class ListAppointmentsQueryDto {
  @ApiPropertyOptional({ default: 1 })
  @IsOptional()
  @Type(() => Number)
  page?: number = 1;

  @ApiPropertyOptional({ default: 20 })
  @IsOptional()
  @Type(() => Number)
  @Max(100)
  limit?: number = 20;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  startDate?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  endDate?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  professionalId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  patientId?: string;

  @ApiPropertyOptional({ enum: ['scheduled', 'confirmed', 'in_progress', 'completed', 'cancelled', 'no_show'] })
  @IsOptional()
  @IsEnum(['scheduled', 'confirmed', 'in_progress', 'completed', 'cancelled', 'no_show'])
  status?: string;
}

export class CreateAppointmentDto {
  @ApiProperty({ example: 'uuid-do-paciente' })
  @IsUUID()
  patientId!: string;

  @ApiProperty({ example: 'uuid-do-profissional' })
  @IsUUID()
  professionalId!: string;

  @ApiPropertyOptional({ example: 'uuid-do-tipo' })
  @IsOptional()
  @IsUUID()
  appointmentTypeId?: string;

  @ApiProperty({ example: '2026-04-15T09:00:00Z' })
  @IsDateString()
  startDate!: string;

  @ApiPropertyOptional({ example: 'Paciente com dores no peito' })
  @IsOptional()
  @IsString()
  notes?: string;
}

export class UpdateAppointmentDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  appointmentTypeId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  startDate?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  notes?: string;

  @ApiPropertyOptional({ enum: ['scheduled', 'confirmed', 'in_progress', 'completed', 'cancelled', 'no_show'] })
  @IsOptional()
  @IsEnum(['scheduled', 'confirmed', 'in_progress', 'completed', 'cancelled', 'no_show'])
  status?: string;
}

export class CancelAppointmentDto {
  @ApiProperty({ example: 'Paciente感冒感冒感冒' })
  @IsString()
  @Min(1)
  reason!: string;
}

export class RescheduleAppointmentDto {
  @ApiProperty({ example: '2026-04-16T10:00:00Z' })
  @IsDateString()
  newStartDate!: string;
}

export class CalendarQueryDto {
  @ApiProperty()
  @IsDateString()
  startDate!: string;

  @ApiProperty()
  @IsDateString()
  endDate!: string;

  @ApiPropertyOptional({ enum: ['day', 'week', 'month'], default: 'week' })
  @IsOptional()
  @IsEnum(['day', 'week', 'month'])
  view?: 'day' | 'week' | 'month' = 'week';

  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  professionalId?: string;
}

export class AvailabilityQueryDto {
  @ApiProperty()
  @IsDateString()
  date!: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  professionalId?: string;
}