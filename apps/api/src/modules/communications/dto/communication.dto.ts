import { IsString, IsNotEmpty, IsOptional, IsEnum, IsNumber, Min, Max } from 'class-validator';
import { Type, Transform } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { MessageChannel, MessageType, CommunicationStatus } from '@clinica-saas/contracts';

export class ListCommunicationsQueryDto {
  @ApiPropertyOptional()
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  page?: number = 1;

  @ApiPropertyOptional()
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  @Max(100)
  limit?: number = 20;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  patientId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  appointmentId?: string;

  @ApiPropertyOptional({ enum: ['whatsapp', 'email', 'sms'] })
  @IsOptional()
  @IsEnum(['whatsapp', 'email', 'sms'])
  channel?: MessageChannel;

  @ApiPropertyOptional({ enum: ['pending', 'sent', 'delivered', 'failed'] })
  @IsOptional()
  @IsEnum(['pending', 'sent', 'delivered', 'failed'])
  status?: CommunicationStatus;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  startDate?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  endDate?: string;
}

export class CreateCommunicationDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  patientId: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  appointmentId?: string;

  @ApiProperty({ enum: ['whatsapp', 'email', 'sms'] })
  @IsEnum(['whatsapp', 'email', 'sms'])
  channel: MessageChannel;

  @ApiProperty({ enum: ['reminder', 'confirmation', 'cancellation', 'custom'] })
  @IsEnum(['reminder', 'confirmation', 'cancellation', 'custom'])
  type: MessageType;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  recipient: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  message: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  templateId?: string;
}