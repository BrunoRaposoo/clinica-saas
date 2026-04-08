import { IsString, IsOptional, IsBoolean, IsArray, IsUUID } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class CreateRoleDto {
  @ApiPropertyOptional({ example: 'gerente' })
  @IsString()
  name: string;

  @ApiPropertyOptional({ example: 'Gerente da clínica' })
  @IsOptional()
  @IsString()
  description?: string;
}

export class UpdateRoleDto {
  @ApiPropertyOptional({ example: 'gerente' })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiPropertyOptional({ example: 'Gerente da clínica' })
  @IsOptional()
  @IsString()
  description?: string;
}

export class AssignPermissionsDto {
  @ApiPropertyOptional({ example: ['users.read', 'users.write'] })
  @IsArray()
  @IsUUID('4', { each: true })
  permissionIds: string[];
}