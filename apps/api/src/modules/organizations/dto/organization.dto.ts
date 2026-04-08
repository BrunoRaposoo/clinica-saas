import { IsString, IsOptional, IsBoolean, MinLength } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class CreateOrganizationDto {
  @ApiPropertyOptional({ example: 'Clínica Saúde' })
  @IsString()
  @MinLength(1)
  name: string;

  @ApiPropertyOptional({ example: '12.345.678/0001-90' })
  @IsString()
  @MinLength(1)
  document: string;

  @ApiPropertyOptional({ example: 'contato@clinica.com' })
  @IsOptional()
  @IsString()
  email?: string;

  @ApiPropertyOptional({ example: '(11) 99999-9999' })
  @IsOptional()
  @IsString()
  phone?: string;

  @ApiPropertyOptional({ example: 'Rua Example, 123' })
  @IsOptional()
  @IsString()
  address?: string;
}

export class UpdateOrganizationDto {
  @ApiPropertyOptional({ example: 'Clínica Saúde' })
  @IsOptional()
  @IsString()
  @MinLength(1)
  name?: string;

  @ApiPropertyOptional({ example: 'contato@clinica.com' })
  @IsOptional()
  @IsString()
  email?: string;

  @ApiPropertyOptional({ example: '(11) 99999-9999' })
  @IsOptional()
  @IsString()
  phone?: string;

  @ApiPropertyOptional({ example: 'Rua Example, 123' })
  @IsOptional()
  @IsString()
  address?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}