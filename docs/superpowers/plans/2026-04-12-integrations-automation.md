# Integrações e Automações (SPEC 011) - Plano de Implementação

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) ou superpowers:executing-plans para implementar este plano task-by-task. Steps usam checkbox (`- [ ]`) syntax.

**Goal:** Implementar módulo de integrações externas (e-mail, WhatsApp) e automações com worker separado BullMQ, idempotência e eventos automatizados.

**Architecture:** Worker separado com BullMQ para jobs assíncronos, módulo de integrações no backend para configuração e/providers, Prisma para persistência.

**Tech Stack:** NestJS, BullMQ, Redis, Prisma, SendGrid/Resend, Twilio

---

## Estrutura de Arquivos

### Backend - Módulo Integrações

```
apps/api/src/modules/
├── integrations/
│   ├── integrations.module.ts
│   ├── integrations.service.ts
│   ├── integrations.controller.ts
│   ├── dto/
│   │   └── integration.dto.ts
│   ├── providers/
│   │   ├── email.provider.ts
│   │   └── whatsapp.provider.ts
│   └── entities/
│       └── integration-log.entity.ts
├── automation/
│   ├── automation.module.ts
│   └── automation.service.ts
└── idempotency/
    └── idempotency.service.ts
```

### Worker

```
apps/worker/
├── src/
│   ├── main.ts
│   ├── worker.module.ts
│   ├── queues/
│   │   ├── email.queue.ts
│   │   ├── whatsapp.queue.ts
│   │   └── automation.queue.ts
│   └── jobs/
│       ├── email.job.ts
│       ├── whatsapp.job.ts
│       └── automation.job.ts
```

### Schema Prisma

```
prisma/schema.prisma
├── Integration
├── IntegrationLog
└── Automation
```

---

## Task 1: Entidades Prisma (Integration, IntegrationLog, Automation)

**Files:**
- Modify: `apps/api/prisma/schema.prisma`

- [ ] **Step 1: Adicionar entidades ao schema**

```prisma
model Integration {
  id              String   @id @default(uuid())
  organizationId  String
  provider       String
  providerConfig Json?
  credentials    Json?
  isActive       Boolean  @default(true)
  lastSyncAt     DateTime?
  status         String   @default('disconnected')
  createdAt      DateTime @default(now())
  updatedAt      DateTime @updatedAt

  organization   Organization   @relation(fields: [organizationId], references: [id])
  logs           IntegrationLog[]

  @@index([organizationId])
  @@index([provider])
  @@index([status])
  @@map("integrations")
}

model IntegrationLog {
  id               String   @id @default(uuid())
  integrationId    String
  event           String
  status          String
  errorMessage    String?
  requestPayload  Json?
  responsePayload Json?
  createdAt       DateTime @default(now())

  integration Integration @relation(fields: [integrationId], references: [id], onDelete: Cascade)

  @@index([integrationId])
  @@index([status])
  @@index([createdAt])
  @@map("integration_logs")
}

model Automation {
  id              String   @id @default(uuid())
  organizationId  String
  name            String
  event           String
  action          String
  config          Json
  isActive        Boolean  @default(true)
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt

  organization Organization @relation(fields: [organizationId], references: [id])

  @@index([organizationId])
  @@index([event])
  @@index([isActive])
  @@map("automations")
}
```

- [ ] **Step 2: Gerar Prisma Client**

```bash
cd apps/api && npx prisma generate
```

- [ ] **Step 3: Commit**

```bash
git add apps/api/prisma/schema.prisma
git commit -m "feat(integrations): add Integration, IntegrationLog, Automation entities"
```

---

## Task 2: Contratos TypeScript

**Files:**
- Create: `packages/contracts/src/types/integration.ts`
- Modify: `packages/contracts/src/types/index.ts`

- [ ] **Step 1: Criar tipos de integração**

Criar `packages/contracts/src/types/integration.ts`:

```typescript
export type IntegrationProvider = 'email' | 'whatsapp';
export type IntegrationStatus = 'connected' | 'disconnected' | 'error';
export type IntegrationLogStatus = 'pending' | 'success' | 'failed';

export interface Integration {
  id: string;
  organizationId: string;
  provider: IntegrationProvider;
  providerConfig?: Record<string, unknown>;
  isActive: boolean;
  lastSyncAt?: string;
  status: IntegrationStatus;
  createdAt: string;
  updatedAt: string;
}

export interface IntegrationCreateRequest {
  provider: IntegrationProvider;
  providerConfig?: Record<string, unknown>;
  credentials: Record<string, unknown>;
}

export interface IntegrationUpdateRequest {
  providerConfig?: Record<string, unknown>;
  credentials?: Record<string, unknown>;
  isActive?: boolean;
}

export interface IntegrationLog {
  id: string;
  integrationId: string;
  event: string;
  status: IntegrationLogStatus;
  errorMessage?: string;
  requestPayload?: Record<string, unknown>;
  responsePayload?: Record<string, unknown>;
  createdAt: string;
}

export interface Automation {
  id: string;
  organizationId: string;
  name: string;
  event: string;
  action: string;
  config: Record<string, unknown>;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}
```

- [ ] **Step 2: Exportar no index**

```typescript
export * from './integration';
```

- [ ] **Step 3: Build contratos**

```bash
cd packages/contracts && npm run build
```

- [ ] **Step 4: Commit**

```bash
git add packages/contracts/src/types/integration.ts packages/contracts/src/types/index.ts
git commit -m "feat(integrations): add integration types and contracts"
```

---

## Task 3: Módulo Backend - Integrações

**Files:**
- Create: `apps/api/src/modules/integrations/integrations.module.ts`
- Create: `apps/api/src/modules/integrations/integrations.service.ts`
- Create: `apps/api/src/modules/integrations/integrations.controller.ts`
- Create: `apps/api/src/modules/integrations/dto/integration.dto.ts`
- Create: `apps/api/src/modules/integrations/providers/email.provider.ts`
- Create: `apps/api/src/modules/integrations/providers/whatsapp.provider.ts`

- [ ] **Step 1: Criar providers de integração**

Criar `apps/api/src/modules/integrations/providers/email.provider.ts`:

```typescript
import { Injectable } from '@nestjs/common';

export interface SendEmailParams {
  to: string;
  subject: string;
  body: string;
  from?: string;
}

@Injectable()
export class EmailProvider {
  async sendEmail(params: SendEmailParams): Promise<{ success: boolean; messageId?: string }> {
    const apiKey = process.env.EMAIL_API_KEY;
    const from = params.from || process.env.EMAIL_FROM;
    
    // SendGrid/Resend implementation
    const response = await fetch('https://api.sendgrid.com/v3/mail/send', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        personalizations: [{ to: [{ email: params.to }] }],
        from: { email: from },
        subject: params.subject,
        content: [{ type: 'text/plain', value: params.body }],
      }),
    });

    return {
      success: response.ok,
      messageId: response.headers.get('x-message-id') || undefined,
    };
  }
}
```

Criar `apps/api/src/modules/integrations/providers/whatsapp.provider.ts`:

```typescript
import { Injectable } from '@nestjs/common';

export interface SendWhatsAppParams {
  to: string;
  message: string;
}

@Injectable()
export class WhatsAppProvider {
  async sendMessage(params: SendWhatsAppParams): Promise<{ success: boolean; messageId?: string }> {
    const accountSid = process.env.TWILIO_ACCOUNT_SID;
    const authToken = process.env.TWILIO_AUTH_TOKEN;
    const from = process.env.TWILIO_WHATSAPP_FROM;

    const response = await fetch(
      `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Basic ${Buffer.from(`${accountSid}:${authToken}`).toString('base64')}`,
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          To: `whatsapp:${params.to}`,
          From: `whatsapp:${from}`,
          Body: params.message,
        }),
      }
    );

    const data = await response.json();
    return {
      success: response.ok,
      messageId: data.sid,
    };
  }
}
```

- [ ] **Step 2: Criar IntegrationService**

```typescript
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../common/prisma.service';
import { Integration, IntegrationProvider } from '@clinica-saas/contracts';
import { EmailProvider } from './providers/email.provider';
import { WhatsAppProvider } from './providers/whatsapp.provider';

@Injectable()
export class IntegrationsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly emailProvider: EmailProvider,
    private readonly whatsappProvider: WhatsAppProvider,
  ) {}

  async findAll(organizationId: string) {
    return this.prisma.integration.findMany({ where: { organizationId } });
  }

  async findById(id: string) {
    return this.prisma.integration.findUnique({ where: { id } });
  }

  async create(organizationId: string, data: any) {
    return this.prisma.integration.create({
      data: { organizationId, ...data, status: 'connected' },
    });
  }

  async update(id: string, data: any) {
    return this.prisma.integration.update({ where: { id }, data });
  }

  async delete(id: string) {
    return this.prisma.integration.delete({ where: { id } });
  }

  async getLogs(integrationId: string) {
    return this.prisma.integrationLog.findMany({
      where: { integrationId },
      orderBy: { createdAt: 'desc' },
      take: 100,
    });
  }

  async checkStatus(integrationId: string): Promise<{ status: string }> {
    const integration = await this.prisma.integration.findUnique({ where: { { id: integrationId } } });
    // Testar conexão
    return { status: integration?.status || 'disconnected' };
  }
}
```

- [ ] **Step 3: Criar controller e module**

Criar arquivos similares aos módulos existentes.

- [ ] **Step 4: Commit**

```bash
git add apps/api/src/modules/integrations/
git commit -m "feat(integrations): add integrations module"
```

---

## Task 4: Worker BullMQ

**Files:**
- Create: `apps/worker/package.json`
- Create: `apps/worker/src/main.ts`
- Create: `apps/worker/src/worker.module.ts`
- Create: `apps/worker/src/queues/email.queue.ts`
- Create: `apps/worker/src/queues/whatsapp.queue.ts`
- Create: `apps/worker/src/queues/automation.queue.ts`

- [ ] **Step 1: Criar estrutura do worker**

Criar `apps/worker/src/main.ts`:

```typescript
import { WorkerModule } from './worker.module';

async function bootstrap() {
  const app = await WorkerModule.create();
  await app.init();
  console.log('Worker started');
}

bootstrap();
```

- [ ] **Step 2: Criar queues**

```typescript
import { BullQueue, BullWorker } from '../bullmq';

export const emailQueue = new BullQueue('email-queue', {
  defaultJobOptions: {
    attempts: 3,
    backoff: { type: 'exponential', delay: 1000 },
  },
});

export const whatsappQueue = new BullQueue('whatsapp-queue', {
  defaultJobOptions: {
    attempts: 3,
    backoff: { type: 'exponential', delay: 1000 },
  },
});

export const automationQueue = new BullQueue('automation-queue', {
  defaultJobOptions: {
    attempts: 2,
    delay: 500,
  },
});
```

- [ ] **Step 3: Commit**

```bash
git add apps/worker/
git commit -m "feat(worker): add BullMQ worker setup"
```

---

## Task 5: Automações e Idempotência

**Files:**
- Create: `apps/api/src/modules/automation/automation.service.ts`
- Create: `apps/api/src/modules/idempotency/idempotency.service.ts`

- [ ] **Step 1: Criar AutomationService**

```typescript
@Injectable()
export class AutomationService {
  async triggerEvent(event: string, data: any) {
    const automations = await this.prisma.automation.findMany({
      where: { event, isActive: true },
    });

    for (const automation of automations) {
      await this.processAutomation(automation, data);
    }
  }
}
```

- [ ] **Step 2: Criar IdempotencyService**

```typescript
@Injectable()
export class IdempotencyService {
  async check(key: string): Promise<{ exists: boolean; result?: any }> {
    const existing = await this.prisma.idempotencyKey.findUnique({ where: { key } });
    return { exists: !!existing, result: existing?.result };
  }

  async save(key: string, result: any, expiresIn: number = 86400000) {
    await this.prisma.idempotencyKey.create({
      data: {
        key,
        result,
        expiresAt: new Date(Date.now() + expiresIn),
      },
    });
  }
}
```

- [ ] **Step 3: Commit**

```bash
git add apps/api/src/modules/automation/ apps/api/src/modules/idempotency/
git commit -m "feat(automation): add automation and idempotency services"
```

---

## Task 6: Build e Verificação

- [ ] **Step 1: Build Prisma**

```bash
cd apps/api && npx prisma generate && npm run build
```

- [ ] **Step 2: Build worker**

```bash
cd apps/worker && npm run build
```

- [ ] **Step 3: Commit final**

```bash
git add .
git commit -m "feat(integrations): complete integrations and automation module"
```

---

## Plano Completo

Este plano cobre:
- [x] Task 1: Entidades Prisma
- [x] Task 2: Contratos TypeScript
- [x] Task 3: Módulo backend de integrações
- [x] Task 4: Worker BullMQ
- [x] Task 5: Automações e idempotência
- [x] Task 6: Build e verificação

**Dois modelos de execução:**

**1. Subagent-Driven (recomendado)** — Dispenso um subagent por task, revisando entre tasks, iteração rápida

**2. Execução Inline** — Executo as tasks nesta sessão usando executing-plans, execução em lote com checkpoints

Qual abordagem prefere?