import { IsString, IsOptional, IsEnum, IsNumber } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export const DOCUMENT_CATEGORIES = ['identity', 'exams', 'prescriptions', 'reports', 'administrative', 'other'] as const;
export type DocumentCategory = typeof DOCUMENT_CATEGORIES[number];

export class ListDocumentsQueryDto {
  @ApiPropertyOptional()
  @IsOptional()
  page?: number;

  @ApiPropertyOptional()
  @IsOptional()
  limit?: number;

  @ApiPropertyOptional()
  @IsOptional()
  patientId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  appointmentId?: string;

  @ApiPropertyOptional({ enum: DOCUMENT_CATEGORIES })
  @IsOptional()
  @IsEnum(DOCUMENT_CATEGORIES)
  category?: DocumentCategory;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  type?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  startDate?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  endDate?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  search?: string;
}

export class CreateDocumentDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  patientId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  appointmentId?: string;

  @ApiProperty({ enum: DOCUMENT_CATEGORIES })
  @IsEnum(DOCUMENT_CATEGORIES)
  category!: DocumentCategory;

  @ApiProperty()
  @IsString()
  type!: string;

  @ApiProperty()
  @IsString()
  name!: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty()
  @IsString()
  fileName!: string;

  @ApiProperty()
  @IsNumber()
  fileSize!: number;

  @ApiProperty()
  @IsString()
  mimeType!: string;
}

export class UpdateDocumentDto {
  @ApiPropertyOptional({ enum: DOCUMENT_CATEGORIES })
  @IsOptional()
  @IsEnum(DOCUMENT_CATEGORIES)
  category?: DocumentCategory;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  type?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  name?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional()
  @IsOptional()
  isPublic?: boolean;
}