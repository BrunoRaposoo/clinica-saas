import { IsString, IsEmail, IsOptional, IsBoolean, IsDateString, IsArray, Min, Max, IsUUID, IsEnum } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';

export class PatientContactCreateDto {
  @ApiProperty({ example: 'Maria Silva' })
  @IsString()
  @Min(2)
  @Max(255)
  name: string;

  @ApiProperty({ example: 'Mãe' })
  @IsString()
  @Min(2)
  @Max(100)
  relationship: string;

  @ApiPropertyOptional({ example: '11988888888' })
  @IsOptional()
  @IsString()
  @Min(10)
  @Max(11)
  phone?: string;

  @ApiPropertyOptional({ example: 'maria@email.com' })
  @IsOptional()
  @IsEmail()
  email?: string;

  @ApiPropertyOptional({ default: false })
  @IsOptional()
  @IsBoolean()
  isPrimary?: boolean;
}

export class PatientContactUpdateDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @Min(2)
  @Max(255)
  name?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @Min(2)
  @Max(100)
  relationship?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @Min(10)
  @Max(11)
  phone?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsEmail()
  email?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  isPrimary?: boolean;
}

export class CreatePatientDto {
  @ApiProperty({ example: 'João Silva' })
  @IsString({ message: 'Nome deve ser uma string' })
  @Min(2, { message: 'Nome deve ter pelo menos 2 caracteres' })
  @Max(255, { message: 'Nome deve ter no máximo 255 caracteres' })
  name!: string;

  @ApiPropertyOptional({ example: 'joao@email.com' })
  @IsOptional()
  @IsEmail()
  email?: string;

  @ApiPropertyOptional({ example: '11999999999' })
  @IsOptional()
  @IsString()
  @Min(10)
  @Max(11)
  phone?: string;

  @ApiPropertyOptional({ example: '12345678900' })
  @IsOptional()
  @IsString()
  document?: string;

  @ApiPropertyOptional({ example: '1990-01-15' })
  @IsOptional()
  @IsDateString()
  birthDate?: string;

  @ApiPropertyOptional({ enum: ['male', 'female', 'other'] })
  @IsOptional()
  @IsEnum(['male', 'female', 'other'])
  gender?: 'male' | 'female' | 'other';

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  addressStreet?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  addressNumber?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  addressComplement?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  addressDistrict?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  addressCity?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  addressState?: string;

  @ApiPropertyOptional({ example: '01234567' })
  @IsOptional()
  @IsString()
  @Min(8)
  @Max(8)
  addressZipCode?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  notes?: string;

  @ApiPropertyOptional({ type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];

  @ApiPropertyOptional({ type: [PatientContactCreateDto] })
  @IsOptional()
  @Type(() => PatientContactCreateDto)
  contacts?: PatientContactCreateDto[];
}

export class UpdatePatientDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @Min(2)
  @Max(255)
  name?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsEmail()
  email?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @Min(10)
  @Max(11)
  phone?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  document?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  birthDate?: string;

  @ApiPropertyOptional({ enum: ['male', 'female', 'other'] })
  @IsOptional()
  @IsEnum(['male', 'female', 'other'])
  gender?: 'male' | 'female' | 'other';

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  addressStreet?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  addressNumber?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  addressComplement?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  addressDistrict?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  addressCity?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  addressState?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @Min(8)
  @Max(8)
  addressZipCode?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  notes?: string;

  @ApiPropertyOptional({ type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

export class ListPatientsQueryDto {
  @ApiPropertyOptional({ default: 1 })
  @IsOptional()
  @Type(() => Number)
  @Transform(({ value }) => parseInt(value, 10))
  page?: number = 1;

  @ApiPropertyOptional({ default: 20 })
  @IsOptional()
  @Type(() => Number)
  @Transform(({ value }) => parseInt(value, 10))
  limit?: number = 20;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  document?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  phone?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @Transform(({ value }) => value === 'true')
  isActive?: boolean;
}