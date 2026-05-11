import { IsString, IsOptional, IsNotEmpty, MaxLength, IsBoolean } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateSpecialtyDto {
  @ApiProperty({ example: 'medical', enum: ['medical', 'dental', 'psychology', 'nutrition', 'physiotherapy', 'complementary', 'technical', 'admin'] })
  @IsString()
  @IsNotEmpty()
  category: string;

  @ApiProperty({ example: 'Cardiologia' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  name: string;
}

export class UpdateSpecialtyDto {
  @ApiPropertyOptional({ example: 'medical', enum: ['medical', 'dental', 'psychology', 'nutrition', 'physiotherapy', 'complementary', 'technical', 'admin'] })
  @IsOptional()
  @IsString()
  category?: string;

  @ApiPropertyOptional({ example: 'Cardiologia' })
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  name?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}