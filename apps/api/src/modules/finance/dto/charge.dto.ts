import { IsString, IsOptional, IsEnum, IsUUID, IsDateString, IsNumber, Min, MaxLength, MinLength, IsPositive } from 'class-validator';
import { Expose } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ChargeStatus, PaymentMethod } from '@clinica-saas/contracts';

export class CreateChargeDto {
  @ApiProperty({ minLength: 3, maxLength: 200 })
  @IsString()
  @MinLength(3)
  @MaxLength(200)
  @Expose()
  description!: string;

  @ApiProperty({ minimum: 0.01 })
  @IsNumber()
  @IsPositive()
  @Expose()
  amount!: number;

  @ApiProperty()
  @IsDateString()
  @Expose()
  dueDate!: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  @Expose()
  patientId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  @Expose()
  appointmentId?: string;

  @ApiPropertyOptional({ maxLength: 1000 })
  @IsOptional()
  @IsString()
  @MaxLength(1000)
  @Expose()
  notes?: string;
}

export class UpdateChargeDto {
  @ApiPropertyOptional({ minLength: 3, maxLength: 200 })
  @IsOptional()
  @IsString()
  @MinLength(3)
  @MaxLength(200)
  @Expose()
  description?: string;

  @ApiPropertyOptional({ minimum: 0.01 })
  @IsOptional()
  @IsNumber()
  @IsPositive()
  @Expose()
  amount?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  @Expose()
  dueDate?: string;

  @ApiPropertyOptional({ maxLength: 1000 })
  @IsOptional()
  @IsString()
  @MaxLength(1000)
  @Expose()
  notes?: string;
}

export class ChargePaymentDto {
  @ApiProperty({ enum: ['cash', 'credit', 'debit', 'pix', 'transfer'] })
  @IsEnum(['cash', 'credit', 'debit', 'pix', 'transfer'])
  @Expose()
  paymentMethod!: PaymentMethod;
}

export class ListChargesQueryDto {
  @ApiPropertyOptional({ default: 1 })
  @IsOptional()
  page?: number;

  @ApiPropertyOptional({ default: 20 })
  @IsOptional()
  limit?: number;

  @ApiPropertyOptional({ enum: ['pending', 'paid', 'overdue', 'cancelled'] })
  @IsOptional()
  status?: ChargeStatus;

  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  patientId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  appointmentId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  dueDateFrom?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  dueDateTo?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  search?: string;
}