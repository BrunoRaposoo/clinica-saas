import { IsEnum, IsOptional, IsObject, IsBoolean, IsString, IsNumber } from 'class-validator';

export class CreateIntegrationDto {
  @IsEnum(['email', 'whatsapp'])
  provider!: 'email' | 'whatsapp';

  @IsOptional()
  @IsObject()
  providerConfig?: Record<string, unknown>;

  @IsOptional()
  @IsObject()
  credentials?: Record<string, unknown>;
}

export class UpdateIntegrationDto {
  @IsOptional()
  @IsObject()
  providerConfig?: Record<string, unknown>;

  @IsOptional()
  @IsObject()
  credentials?: Record<string, unknown>;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

export class IntegrationQueryDto {
  @IsOptional()
  @IsNumber()
  page?: number;

  @IsOptional()
  @IsNumber()
  limit?: number;

  @IsOptional()
  @IsEnum(['email', 'whatsapp'])
  provider?: 'email' | 'whatsapp';

  @IsOptional()
  @IsEnum(['connected', 'disconnected', 'error'])
  status?: 'connected' | 'disconnected' | 'error';
}

export class IntegrationLogQueryDto {
  @IsOptional()
  @IsNumber()
  page?: number;

  @IsOptional()
  @IsNumber()
  limit?: number;

  @IsOptional()
  @IsEnum(['pending', 'success', 'failed'])
  status?: 'pending' | 'success' | 'failed';
}

export class CreateAutomationDto {
  @IsString()
  name!: string;

  @IsString()
  event!: string;

  @IsString()
  action!: string;

  @IsObject()
  config!: Record<string, unknown>;
}

export class UpdateAutomationDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  event?: string;

  @IsOptional()
  @IsString()
  action?: string;

  @IsOptional()
  @IsObject()
  config?: Record<string, unknown>;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

export class AutomationQueryDto {
  @IsOptional()
  @IsNumber()
  page?: number;

  @IsOptional()
  @IsNumber()
  limit?: number;

  @IsOptional()
  @IsString()
  event?: string;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}