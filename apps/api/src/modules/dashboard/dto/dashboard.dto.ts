import { IsEnum, IsOptional, IsDateString, IsString, IsNumber } from 'class-validator';
import { PeriodType } from '@clinica-saas/contracts';

export class DashboardPeriodDto {
  @IsEnum([
    'today',
    'yesterday',
    'current_month',
    'previous_month',
    'current_semester',
    'current_year',
    'custom',
  ])
  period!: PeriodType;

  @IsOptional()
  @IsDateString()
  startDate?: string;

  @IsOptional()
  @IsDateString()
  endDate?: string;
}

export class DrillDownQueryDto {
  @IsEnum([
    'today',
    'yesterday',
    'current_month',
    'previous_month',
    'current_semester',
    'current_year',
    'custom',
  ])
  period!: PeriodType;

  @IsOptional()
  @IsDateString()
  startDate?: string;

  @IsOptional()
  @IsDateString()
  endDate?: string;

  @IsOptional()
  @IsString()
  status?: string;

  @IsOptional()
  @IsString()
  professionalId?: string;

  @IsOptional()
  @IsNumber()
  page?: number;

  @IsOptional()
  @IsNumber()
  limit?: number;
}