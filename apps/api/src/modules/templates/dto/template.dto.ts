import { IsString, IsNotEmpty, IsOptional, IsBoolean, IsEnum, IsNumber, Min, Max } from 'class-validator';
import { Type, Transform } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { MessageChannel, MessageType } from '@clinica-saas/contracts';

export class ListTemplatesQueryDto {
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

  @ApiPropertyOptional({ enum: ['whatsapp', 'email', 'sms'] })
  @IsOptional()
  @IsEnum(['whatsapp', 'email', 'sms'])
  channel?: MessageChannel;

  @ApiPropertyOptional({ enum: ['reminder', 'confirmation', 'cancellation', 'custom'] })
  @IsOptional()
  @IsEnum(['reminder', 'confirmation', 'cancellation', 'custom'])
  type?: MessageType;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  @Transform(({ value }) => value === 'true' || value === true)
  isActive?: boolean;
}

export class CreateTemplateDto {
  @ApiProperty({ example: 'Lembrete 24h antes' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ enum: ['whatsapp', 'email', 'sms'] })
  @IsEnum(['whatsapp', 'email', 'sms'])
  channel: MessageChannel;

  @ApiProperty({ enum: ['reminder', 'confirmation', 'cancellation', 'custom'] })
  @IsEnum(['reminder', 'confirmation', 'cancellation', 'custom'])
  type: MessageType;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  subject?: string;

  @ApiProperty({ example: 'Olá {{patient_name}}, sua consulta está marcada para {{appointment_date}} às {{appointment_time}}.' })
  @IsString()
  @IsNotEmpty()
  body: string;
}

export class UpdateTemplateDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  name?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  subject?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  body?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}