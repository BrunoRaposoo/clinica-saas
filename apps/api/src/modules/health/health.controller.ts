import { Controller, Get } from '@nestjs/common';
import { PrismaService } from '../../common/prisma.service';
import { ApiTags, ApiOperation } from '@nestjs/swagger';

interface HealthResponse {
  status: 'ok' | 'error';
  timestamp: string;
  version: string;
}

interface ReadinessResponse {
  status: 'ready' | 'not_ready';
  checks: {
    db: 'up' | 'down';
    redis: 'unavailable';
  };
}

interface LivenessResponse {
  status: 'alive';
}

@ApiTags('Health')
@Controller('health')
export class HealthController {
  constructor(private readonly prisma: PrismaService) {}

  @Get()
  @ApiOperation({ summary: 'Verificar saúde da API' })
  check(): HealthResponse {
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
      version: '1.0.0',
    };
  }

  @Get('ready')
  @ApiOperation({ summary: 'Verificar readiness (DB)' })
  async ready(): Promise<ReadinessResponse> {
    let dbStatus: 'up' | 'down' = 'down';
    
    try {
      await this.prisma.$connect();
      dbStatus = 'up';
    } catch {
      dbStatus = 'down';
    }

    return {
      status: dbStatus === 'up' ? 'ready' : 'not_ready',
      checks: {
        db: dbStatus,
        redis: 'unavailable',
      },
    };
  }

  @Get('live')
  @ApiOperation({ summary: 'Verificar liveness' })
  live(): LivenessResponse {
    return { status: 'alive' };
  }
}