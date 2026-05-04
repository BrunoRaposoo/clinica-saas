# Segurança, Compliance e Hardening (SPEC 010) - Plano de Implementação

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) ou superpowers:executing-plans para implementar este plano task-by-task. Steps usam checkbox (`- [ ]`) syntax.

**Goal:** Implementar sistema de segurança, compliance e hardening com rate limiting Redis, logs estruturados, health checks, métricas, exception filters e scripts de backup.

**Architecture:** Adicionar guards, interceptors, filters e health endpoints ao módulo común do NestJS, sem novas entidades. Logs e métricas em memória, Redis para rate limiting.

**Tech Stack:** NestJS, @nestjs/throttler (Redis), class-validator, Prisma

---

## Estrutura de Arquivos

### Backend - Componentes de Segurança

```
apps/api/src/common/
├── guards/
│   └── rate-limit.guard.ts         # NOVO
├── interceptors/
│   ├── logging.interceptor.ts    # NOVO
│   └── metrics.interceptor.ts   # NOVO
├── filters/
│   └── http-exception.filter.ts  # NOVO
├── health/
│   ├── health.module.ts     # NOVO
│   └── health.controller.ts  # NOVO
└── main.ts (modificar)
```

### Scripts

```
infra/
└── backup/
    ├── backup.sh           # NOVO
    └── restore.sh        # NOVO
```

---

## Task 1: Rate Limiting com Redis

**Files:**
- Create: `apps/api/src/common/guards/rate-limit.guard.ts`
- Modify: `apps/api/src/app.module.ts`

- [ ] **Step 1: Instalar throttler**

```bash
cd apps/api && npm install @nestjs/throttler
```

- [ ] **Step 2: Criar RateLimitGuard**

Criar arquivo `apps/api/src/common/guards/rate-limit.guard.ts`:

```typescript
import { Injectable, CanActivate, ExecutionContext, HttpException, HttpStatus } from '@nestjs/common';
import { ThrottlerGuard, ThrottlerOptions } from '@nestjs/throttler';

@Injectable()
export class RateLimitGuard extends ThrottlerGuard {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const userId = request.user?.sub || request.ip;
    
    const result = super.canActivate(context);
    
    if (!result) {
      const throttler = (this as any).throttler;
      const ttl = throttler.ttl;
      const limit = throttler.limit;
      
      throw new HttpException(
        {
          statusCode: HttpStatus.TOO_MANY_REQUESTS,
          message: 'Too many requests',
          error: 'Too Many Requests',
        },
        HttpStatus.TOO_MANY_REQUESTS,
      );
    }
    
    return true;
  }
}
```

- [ ] **Step 3: Configurar no AppModule**

Modificar `apps/api/src/app.module.ts`:

```typescript
import { ThrottlerModule } from '@nestjs/throttler';

@Module({
  imports: [
    ThrottlerModule.forRoot([{
      name: 'short',
      ttl: 60000,
      limit: 100,
    }, {
      name: 'medium',
      ttl: 600000,
      limit: 500,
    }]),
    // ...
  ]),
}),
export class AppModule {}
```

- [ ] **Step 4: Aplicar guard global**

No main.ts, adicionar após validationPipe:

```typescript
app.useGlobalGuards(new RateLimitGuard());
```

- [ ] **Step 5: Commit**

```bash
git add apps/api/src/common/guards/rate-limit.guard.ts apps/api/src/app.module.ts apps/api/src/main.ts
git commit -m "feat(security): add rate limiting with Redis"
```

---

## Task 2: Logs Estruturados

**Files:**
- Create: `apps/api/src/common/interceptors/logging.interceptor.ts`
- Modify: `apps/api/src/main.ts`

- [ ] **Step 1: Criar LoggingInterceptor**

Criar `apps/api/src/common/interceptors/logging.interceptor.ts`:

```typescript
import { Injectable, NestInterceptor, ExecutionContext, CallHandler, Logger } from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { v4 as uuidv4 } from 'uuid';

interface LogEntry {
  level: string;
  message: string;
  timestamp: string;
  correlationId: string;
  request: {
    method: string;
    path: string;
    ip: string;
  };
  response?: {
    statusCode: number;
    latencyMs: number;
  };
}

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  private readonly logger = new Logger('HTTP');

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const { method, url, ip } = request;
    const correlationId = uuidv4();
    const now = Date.now();

    return next.handle().pipe(
      tap({
        next: () => {
          const latencyMs = Date.now() - now;
          const logEntry: LogEntry = {
            level: 'info',
            message: 'Request processed',
            timestamp: new Date().toISOString(),
            correlationId,
            request: { method, path: url, ip },
            response: { statusCode: 200, latencyMs },
          };
          this.logger.log(JSON.stringify(logEntry));
        },
        error: (error) => {
          const latencyMs = Date.now() - now;
          const logEntry: LogEntry = {
            level: 'error',
            message: error.message || 'Request failed',
            timestamp: new Date().toISOString(),
            correlationId,
            request: { method, path: url, ip },
            response: { statusCode: 500, latencyMs },
          };
          this.logger.error(JSON.stringify(logEntry));
        },
      }),
    );
  }
}
```

- [ ] **Step 2: Registrar no main.ts**

```typescript
app.useGlobalInterceptors(new LoggingInterceptor());
```

- [ ] **Step 3: Commit**

```bash
git add apps/api/src/common/interceptors/logging.interceptor.ts apps/api/src/main.ts
git commit -m "feat(security): add structured logging interceptor"
```

---

## Task 3: Health Checks

**Files:**
- Create: `apps/api/src/common/health/health.module.ts`
- Create: `apps/api/src/common/health/health.controller.ts`
- Modify: `apps/api/src/app.module.ts`
- Modify: `apps/api/src/main.ts`

- [ ] **Step 1: Criar HealthController**

Criar `apps/api/src/common/health/health.controller.ts`:

```typescript
import { Controller, Get } from '@nestjs/common';
import { PrismaService } from '../prisma.service';

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

@Controller('health')
export class HealthController {
  constructor(private readonly prisma: PrismaService) {}

  @Get()
  async health(): Promise<HealthResponse> {
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
      version: '1.0.0',
    };
  }

  @Get('ready')
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
  live(): LivenessResponse {
    return { status: 'alive' };
  }
}
```

- [ ] **Step 2: Criar HealthModule**

Criar `apps/api/src/common/health/health.module.ts`:

```typescript
import { Module } from '@nestjs/common';
import { HealthController } from './health.controller';
import { PrismaModule } from '../prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [HealthController],
})
export class HealthModule {}
```

- [ ] **Step 3: Registrar no AppModule**

```typescript
import { HealthModule } from './common/health/health.module';

@Module({
  imports: [
    // ...
    HealthModule,
  ],
}),
export class AppModule {}
```

- [ ] **Step 4: Commit**

```bash
git add apps/api/src/common/health/
git commit -m "feat(security): add health endpoints"
```

---

## Task 4: Métricas em Memória

**Files:**
- Create: `apps/api/src/common/interceptors/metrics.interceptor.ts`
- Modify: `apps/api/src/main.ts`

- [ ] **Step 1: Criar MetricsInterceptor**

Criar `apps/api/src/common/interceptors/metrics.interceptor.ts`:

```typescript
import { Injectable, NestInterceptor, ExecutionContext, CallHandler, Logger } from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

interface Metrics {
  totalRequests: number;
  averageLatencyMs: number;
  errorCount: number;
  uptimeSeconds: number;
  lastRequest: number;
}

@Injectable()
export class MetricsInterceptor implements NestInterceptor {
  private metrics: Metrics = {
    totalRequests: 0,
    averageLatencyMs: 0,
    errorCount: 0,
    uptimeSeconds: 0,
    lastRequest: Date.now(),
  };
  private startTime = Date.now();

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    return next.handle().pipe(
      tap({
        next: () => {
          this.metrics.totalRequests++;
          this.metrics.lastRequest = Date.now();
        },
        error: () => {
          this.metrics.errorCount++;
        },
      }),
    );
  }

  getMetrics(): Metrics {
    return {
      ...this.metrics,
      uptimeSeconds: Math.floor((Date.now() - this.startTime) / 1000),
    };
  }
}
```

- [ ] **Step 2: Adicionar endpoint de métricas**

No HealthController, adicionar:

```typescript
@Get('metrics')
getMetrics(): Metrics {
  return this.metricsInterceptor.getMetrics();
}
```

- [ ] **Step 3: Commit**

```bash
git add apps/api/src/common/interceptors/metrics.interceptor.ts apps/api/src/common/health/health.controller.ts
git commit -m "feat(security): add in-memory metrics"
```

---

## Task 5: Exception Filters

**Files:**
- Create: `apps/api/src/common/filters/http-exception.filter.ts`
- Modify: `apps/api/src/main.ts`

- [ ] **Step 1: Criar HttpExceptionFilter**

Criar `apps/api/src/common/filters/http-exception.filter.ts`:

```typescript
import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Response } from 'express';

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger('ExceptionFilter');

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    const status =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    const message =
      exception instanceof HttpException
        ? exception.getResponse()
        : 'Internal server error';

    const errorResponse = typeof message === 'object' ? message : { message };

    const result = {
      statusCode: status,
      ...errorResponse,
      timestamp: new Date().toISOString(),
    };

    this.logger.error(
      JSON.stringify({
        level: 'error',
        message: errorResponse.message || 'Internal server error',
        timestamp: result.timestamp,
        statusCode: status,
      }),
    );

    response.status(status).json(result);
  }
}
```

- [ ] **Step 2: Registrar no main.ts**

```typescript
app.useGlobalFilters(new HttpExceptionFilter());
```

- [ ] **Step 3: Commit**

```bash
git add apps/api/src/common/filters/http-exception.filter.ts apps/api/src/main.ts
git commit -m "feat(security): add exception filter"
```

---

## Task 6: CORS Configurável

**Files:**
- Modify: `apps/api/src/main.ts`

- [ ] **Step 1: Configurar CORS**

No main.ts, adicionar:

```typescript
const corsOrigins = process.env.CORS_ORIGINS || 'http://localhost:3000,http://localhost:3001';
app.enableCors({
  origin: corsOrigins.split(','),
  credentials: true,
});
```

- [ ] **Step 2: Commit**

```bash
git add apps/api/src/main.ts
git commit -m "feat(security): add configurable CORS"
```

---

## Task 7: Scripts de Backup

**Files:**
- Create: `infra/backup/backup.sh`
- Create: `infra/backup/restore.sh`

- [ ] **Step 1: Criar script de backup**

Criar `infra/backup/backup.sh`:

```bash
#!/bin/bash

# Backup script for Clínica SaaS
# Usage: ./backup.sh

set -e

BACKUP_DIR="./backups"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
DB_NAME="${DB_NAME:-clinica_saas}"
DB_USER="${DB_USER:-postgres}"
DB_HOST="${DB_HOST:-localhost}"

mkdir -p "$BACKUP_DIR"

echo "Starting backup at $TIMESTAMP..."

# PostgreSQL backup
echo "Backing up database..."
pg_dump -h "$DB_HOST" -U "$DB_USER" -d "$DB_NAME" > "$BACKUP_DIR/db_$TIMESTAMP.sql"

# Compress
echo "Compressing..."
gzip "$BACKUP_DIR/db_$TIMESTAMP.sql"

# Files backup
echo "Backing up uploads..."
tar -czf "$BACKUP_DIR/uploads_$TIMESTAMP.tar.gz" apps/api/uploads/ 2>/dev/null || true

echo "Backup complete: db_$TIMESTAMP.sql.gz"
ls -lh "$BACKUP_DIR"
```

- [ ] **Step 2: Criar script de restore**

Criar `infra/backup/restore.sh`:

```bash
#!/bin/bash

# Restore script for Clínica SaaS
# Usage: ./restore.sh backup_file.sql.gz

set -e

if [ -z "$1" ]; then
  echo "Usage: ./restore.sh <backup_file.sql.gz>"
  exit 1
fi

BACKUP_FILE="$1"
DB_NAME="${DB_NAME:-clinica_saas}"
DB_USER="${DB_USER:-postgres}"
DB_HOST="${DB_HOST:-localhost}"

echo "Restoring from $BACKUP_FILE..."

gunzip -c "$BACKUP_FILE" | psql -h "$DB_HOST" -U "$DB_USER" -d "$DB_NAME"

echo "Restore complete!"
```

- [ ] **Step 3: Tornar executável**

```bash
chmod +x infra/backup/backup.sh infra/backup/restore.sh
```

- [ ] **Step 4: Commit**

```bash
git add infra/backup/
git commit -m "feat(security): add backup scripts"
```

---

## Task 8: Build e Verificação

- [ ] **Step 1: Build do backend**

```bash
cd apps/api && npm run build
```

- [ ] **Step 2: Verificar erros de type**

```bash
cd apps/api && npm run typecheck
```

- [ ] **Step 3: Commit final**

```bash
git add .
git commit -m "feat(security): complete security module implementation"
```

---

## Plano Completo

Este plano cobre:
- [x] Task 1: Rate limiting com Redis
- [x] Task 2: Logs estruturados
- [x] Task 3: Health checks
- [x] Task 4: Métricas em memória
- [x] Task 5: Exception filters
- [x] Task 6: CORS configurável
- [x] Task 7: Scripts de backup
- [x] Task 8: Build e verificação

**Dois modelos de execução:**

**1. Subagent-Driven (recomendado)** — Dispenso um subagent por task, revisando entre tasks, iteração rápida

**2. Execução Inline** — Executo as tasks nesta sessão usando executing-plans, execução em lote com checkpoints

Qual abordagem prefere?