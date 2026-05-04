# SPEC 011: Integrações e Automações

## 1. Contexto do Problema

O sistema de gestão de clínicas precisa de módulos de integrações externas e automaçõesworker separado para conectar provedores de serviços de terceiros, processar eventos assíncronos e automatizar fluxos operacionais. Com os 10 módulos anteriores implementados (Auth, Pacientes, Agenda, Comunicações, Documentos, Tarefas, Financeiro, Dashboard, Configurações, Segurança), há necessidade de:

- Conectar com provedores de e-mail (SendGrid/Resend)
- Conectar com provedores de WhatsApp (Twilio)
- Processar eventos assíncronos via worker
- Garantir idempotência para operações críticas
- Automatizar fluxos baseados em eventos do sistema

## 2. Objetivo do Módulo

Criar sistema de integrações completo com:
- Worker separado com BullMQ
- Integração com provedores de e-mail
- Integração com provedores de WhatsApp
- Automação baseada em eventos
- Idempotência para operações críticas
- Logs e monitoramento de integrações

## 3. Escopo da Feature

### Dentro do Escopo:
- [x] Worker separado com BullMQ para processamento assíncrono
- [x] Integração com provedor de e-mail (SendGrid/Resend)
- [x] Integração com provedor de WhatsApp (Twilio)
- [x] Idempotência para operações críticas
- [x] Automações baseadas em eventos (agendamentos, cobranças, lembretes, tarefas)
- [x] Configuração de integrações por organização
- [x] Logs de integração
- [x] Status de conexão

### Fora do Escopo:
- [ ] Webhooks customizados de entrada
- [ ] Marketplace de integrações
- [ ] Integrações contábeis avançadas
- [ ] Integrações com ERP complexos
- [ ] IA generativa em larga escala

## 4. Personas e Papéis

| Role | Permissão |
|------|-----------|
| `super_admin` | Todas |
| `org_admin` | Configurar integrações |
| `professional` | Ver status |
| `receptionist` | Ver status |
| `support` | Ver logs |

## 5. Modelo de Dados

### Entidades do Prisma

```prisma
model Integration {
  id              String   @id @default(uuid())
  organizationId  String
  provider       String   // 'email', 'whatsapp'
  providerConfig Json?
  credentials    Json?    // encrypted
  isActive       Boolean  @default(true)
  lastSyncAt      DateTime?
  status         String   @default('disconnected') // 'connected', 'disconnected', 'error'
  createdAt      DateTime  @default(now())
  updatedAt      DateTime  @updatedAt

  organization   Organization    @relation(fields: [organizationId], references: [id])
  logs            IntegrationLog[]

  @@index([organizationId])
  @@index([provider])
  @@index([status])
  @@map("integrations")
}

model IntegrationLog {
  id                String   @id @default(uuid())
  integrationId     String
  event            String
  status           String   // 'pending', 'success', 'failed'
  errorMessage     String?
  requestPayload   Json?
  responsePayload  Json?
  createdAt        DateTime @default(now())

  integration Integration @relation(fields: [integrationId], references: [id], onDelete: Cascade)

  @@index([integrationId])
  @@index([status])
  @@index([createdAt])
  @@map("integration_logs")
}

model Automation {
  id              String   @id @default(uuid())
  organizationId String
  name            String
  event           String   // 'appointment.created', 'appointment.cancelled', 'charge.overdue', etc.
  action          String   // 'send_email', 'send_whatsapp', 'create_task'
  config          Json
  isActive        Boolean  @default(true)
  createdAt      DateTime @default(now())
  updatedAt      DateTime @updatedAt

  organization Organization @relation(fields: [organizationId], references: [id])

  @@index([organizationId])
  @@index([event])
  @@index([isActive])
  @@map("automations")
}
```

### Relações
- Organization 1:N Integration
- Integration 1:N IntegrationLog
- Organization 1:N Automation

## 6. Contratos de API

### Types

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

### Rotas API

| Método | Rota | Descrição |
|--------|------|-----------|
| GET | /integrations | Listar integrações |
| GET | /integrations/:id | Detalhes |
| POST | /integrations | Conectar provedor |
| PATCH | /integrations/:id | Atualizar config |
| DELETE | /integrations/:id | Desconectar |
| GET | /integrations/:id/status | Status da conexão |
| GET | /integrations/:id/logs | Logs |
| GET | /automations | Listar automações |
| POST | /automations | Criar automação |
| PATCH | /automations/:id | Atualizar automação |
| DELETE | /automations/:id | Remover automação |

## 7. Worker de Automações

### Filas BullMQ

```typescript
// Filas do worker
const QUEUES = {
  EMAIL: 'email-queue',
  WHATSAPP: 'whatsapp-queue',
  AUTOMATION: 'automation-queue',
  IDEMPOTENCY: 'idempotency-queue',
};
```

### Jobs

- **EmailJob**: Enviar e-mails via SendGrid/Resend
- **WhatsAppJob**: Enviar mensagens via Twilio
- **AutomationJob**: Processar eventos de automação
- **RetryJob**: Reprocessar jobs falhos com backoff

### Eventos para Automação

| Evento | Ação |
|--------|------|
| `appointment.created` | Enviar confirmação |
| `appointment.cancelled` | Notificar cancelamento |
| `appointment.reminder` | Enviar lembrete |
| `charge.overdue` | Notificar cobrança vencida |
| `charge.paid` | Confirmar pagamento |
| `task.created` | Notificar nova tarefa |
| `task.due_soon` | Lembrete de tarefa |

## 8. Idempotência

### Operações Críticas com Idempotência

- Envio de e-mail
- Envio de WhatsApp
- Criação de agendamento
- Criação de cobrança

### Implementation

```typescript
interface IdempotencyKey {
  key: string;
  entityType: string;
  entityId: string;
  result?: Record<string, unknown>;
  expiresAt: Date;
}
```

## 9. Estrutura de Pastas

```
apps/worker/                          # NOVO - Worker
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

apps/api/src/modules/
├── integrations/                    # NOVO
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
├── automation/                      # NOVO
│   └── automation.module.ts
│   └── automation.service.ts
└── idempotency/                     # NOVO
    └── idempotency.service.ts

infra/
└── docker/
    └── docker-compose.worker.yml   # Worker container
```

## 10. Frontend

### Telas

| Rota | Descrição |
|------|-----------|
| /settings/integrations | Lista de integrações |
| /settings/integrations/new | Conectar provedor |
| /settings/integrations/:id | Detalhes e config |
| /settings/automations | Lista de automações |
| /settings/automations/new | Criar automação |
| /settings/automations/:id | Editar automação |

## 11. Critérios de Aceite

- [ ] Worker separado inicia corretamente
- [ ] Integração com e-mail funciona
- [ ] Integração com WhatsApp funciona
- [ ] Automação responde a eventos
- [ ] Idempotência para operações críticas
- [ ] Logs de integração gravados
- [ ] Status de conexão exibido
- [ ] Build compila

---

**Versão**: 1.0.0
**Data**: 2026-04-12
**Status**: Especificação