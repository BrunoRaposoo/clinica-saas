# SPEC 004: Comunicações e Lembretes

## 1. Contexto do Problema

O sistema de gestão de clínicas precisa de comunicação proativa com pacientes para reduzir no-shows e melhorar a experiência do paciente. Com o módulo de pacientes (SPEC 002) e agenda (SPEC 003) implementados, temos a base necessária para enviar lembretes e confirmações automaticamente.

O módulo atual não contempla:
- Envio automático de lembretes antes das consultas
- Confirmação automática após agendamento
- Histórico de comunicações enviadas
- Templates reutilizáveis para mensagens
- Rastreamento de status de entrega

## 2. Objetivo do Módulo

Criar sistema de comunicação com:
- Gerenciamento de templates de mensagens
- Histórico completo de comunicações
- Confirmação automática de consultas
- Lembrete automático (24h antes)
- Notificação de cancelamento
- Abstração de provider para suportar múltiplos canais
- Fila assíncrona com BullMQ/Redis
- Worker separado para processamento

## 3. Escopo da Feature

### Dentro do Escopo:
- [x] CRUD de templates de mensagem
- [x] Envio manual de mensagens operacionais
- [x] Histórico de comunicações por paciente
- [x] Confirmação automática ao agendar
- [x] Lembrete automático 24h antes
- [x] Notificação de cancelamento
- [x] Status: pending, sent, delivered, failed
- [x] Abstração de provider (WhatsApp/Email)
- [x] Tenant isolation completo
- [x] Auditoria de operações sensíveis
- [x] Worker separado com BullMQ
- [x] Retry logic

### Fora do Escopo:
- [ ] Integração real WhatsApp Business API
- [ ] Integração real SendGrid/Mailgun
- [ ] Chatbot
- [ ] Comunicação clínica sensível (prontuário)
- [ ] Campanhas de marketing
- [ ] Automação com IA
- [ ] Webhooks de providers externos

## 4. Personas e Papéis

### Papéis que podem gerenciar comunicações:
| Role | Permissão |
|------|-----------|
| `super_admin` | Todas |
| `org_admin` | CRUD completo, ver histórico |
| `professional` | Ver histórico próprio |
| `receptionist` | Enviar, ver histórico |
| `support` | Apenas leitura |

## 5. Modelo de Dados

### Entidades do Prisma

```
MessageTemplate
├── id (UUID, PK)
├── organizationId (UUID, FK)
├── name (string)
├── channel (enum: whatsapp, email, sms)
├── type (enum: reminder, confirmation, cancellation, custom)
├── subject (string,nullable, para email)
├── body (string, com placeholders)
├── isActive (boolean)
├── createdAt (datetime)
└── updatedAt (datetime)

Communication
├── id (UUID, PK)
├── organizationId (UUID, FK)
├── patientId (UUID, FK)
├── appointmentId (UUID, FK, nullable)
├── templateId (UUID, FK, nullable)
├── channel (enum: whatsapp, email, sms)
├── type (string)
├── recipient (string)
├── message (string)
├── status (enum: pending, sent, delivered, failed)
├── provider (string)
├── providerMessageId (string,nullable)
├── errorMessage (string,nullable)
├── scheduledAt (datetime)
├── sentAt (datetime,nullable)
├── deliveredAt (datetime,nullable)
└── createdAt (datetime)

CommunicationAudit
├── id (UUID, PK)
├── communicationId (UUID, FK)
├── action (string)
├── changes (json,nullable)
├── performedBy (UUID, FK)
└── performedAt (datetime)

MessageJob
├── id (UUID, PK)
├── organizationId (UUID, FK)
├── type (enum: reminder, confirmation, cancellation)
├── appointmentId (UUID, FK)
├── scheduledFor (datetime)
├── status (enum: pending, processing, completed, failed)
├── retryCount (int)
├── lastError (string,nullable)
├── createdAt (datetime)
└── processedAt (datetime,nullable)
```

### Índices Recomendados
- Communication: [organizationId, patientId], [appointmentId], [status], [createdAt]
- MessageJob: [status, scheduledFor], [appointmentId]
- CommunicationAudit: [communicationId], [performedAt]

## 6. Fluxos Principais

### Fluxo 1: Criar Template
```
1. Usuário acessa /templates
2. Clica em "Novo Template"
3. Preenche nome, canal, tipo, assunto (email), corpo
4. Usa placeholders: {{patient_name}}, {{appointment_date}}, {{appointment_time}}, {{professional_name}}
5. Sistema salva template
6. Retorna sucesso
```

### Fluxo 2: Envio Manual
```
1. Usuário acessa /communications/send
2. Seleciona paciente
3. Seleciona canal (WhatsApp/Email/SMS)
4. Escreve ou usa template
5. Sistema cria Communication (pending)
6. Worker processa envio
7. Atualiza status para sent/delivered/failed
```

### Fluxo 3: Confirmação Automática
```
1. Appointment é criado
2. Backend enqueue ConfirmationJob
3. Worker processa job
4. Busca template de confirmação
5. Substitui placeholders
6. Envia via provider abstrato
7. Cria Communication com status
8. Atualiza status final
```

### Fluxo 4: Lembrete Automático
```
1. Job scheduler detecta appointments em 24h
2. Enqueue ReminderJob para cada appointment
3. Worker processa
4. Busca template de reminder
5. Substitui placeholders
6. Envia via provider abstrato
7. Cria Communication
8. Atualiza status
```

### Fluxo 5: Cancelamento
```
1. Appointment cancelado
2. Backend enqueue CancellationJob
3. worker processa
4. Envia notificação de cancelamento
5. Atualiza status
```

## 7. Contratos de API

### Tipos (packages/contracts)

```typescript
export type MessageChannel = 'whatsapp' | 'email' | 'sms';
export type MessageType = 'reminder' | 'confirmation' | 'cancellation' | 'custom';
export type CommunicationStatus = 'pending' | 'sent' | 'delivered' | 'failed';
export type JobStatus = 'pending' | 'processing' | 'completed' | 'failed';

export interface MessageTemplate {
  id: string;
  organizationId: string;
  name: string;
  channel: MessageChannel;
  type: MessageType;
  subject?: string;
  body: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface MessageTemplateListParams {
  page?: number;
  limit?: number;
  channel?: MessageChannel;
  type?: MessageType;
  isActive?: boolean;
}

export interface MessageTemplateCreateRequest {
  name: string;
  channel: MessageChannel;
  type: MessageType;
  subject?: string;
  body: string;
}

export interface MessageTemplateUpdateRequest {
  name?: string;
  subject?: string;
  body?: string;
  isActive?: boolean;
}

export interface Communication {
  id: string;
  organizationId: string;
  patientId: string;
  appointmentId?: string;
  templateId?: string;
  channel: MessageChannel;
  type: string;
  recipient: string;
  message: string;
  status: CommunicationStatus;
  provider?: string;
  providerMessageId?: string;
  errorMessage?: string;
  scheduledAt: string;
  sentAt?: string;
  deliveredAt?: string;
  createdAt: string;
  patient?: { id: string; name: string };
  appointment?: { id: string; startDate: string };
}

export interface CommunicationListParams {
  page?: number;
  limit?: number;
  patientId?: string;
  appointmentId?: string;
  channel?: MessageChannel;
  status?: CommunicationStatus;
  startDate?: string;
  endDate?: string;
}

export interface CommunicationCreateRequest {
  patientId: string;
  appointmentId?: string;
  channel: MessageChannel;
  type: MessageType;
  recipient: string;
  message: string;
  templateId?: string;
}

export interface MessageJob {
  id: string;
  organizationId: string;
  type: JobType;
  appointmentId: string;
  scheduledFor: string;
  status: JobStatus;
  retryCount: number;
  lastError?: string;
  createdAt: string;
  processedAt?: string;
}
```

### Rotas Backend

| Método | Rota | Descrição |
|--------|-----|----------|
| GET | /templates | Listar templates (paginado) |
| POST | /templates | Criar template |
| GET | /templates/:id | Detalhar template |
| PATCH | /templates/:id | Atualizar template |
| DELETE | /templates/:id | Desativar template |
| GET | /communications | Listar comunicações |
| POST | /communications | Enviar mensagem |
| GET | /communications/:id | Detalhar comunicação |
| GET | /communications/patient/:patientId | Histórico do paciente |
| GET | /communications/appointment/:appointmentId | Comunicações do appointment |
| GET | /jobs | Listar jobs |
| GET | /jobs/pending | Jobs pendentes |

## 8. Arquitetura de provider

### Interface Abstrata

```typescript
export interface IMessageProvider {
  channel: MessageChannel;
  send(params: SendParams): Promise<SendResult>;
  getStatus(messageId: string): Promise<MessageStatus>;
}

export interface SendParams {
  to: string;
  subject?: string;
  body: string;
  appointmentId?: string;
}

export interface SendResult {
  success: boolean;
  providerMessageId?: string;
  error?: string;
}
```

### Providers Concretos
- `WhatsAppMockProvider` (implementação mock para testar)
- `EmailMockProvider` (implementação mock para testar)
- Futuros: `WhatsAppBusinessProvider`, `SendGridProvider`

## 9. Estrutura de Pastas

### Backend
```
apps/api/src/modules/
├── templates/
│   ├── templates.module.ts
│   ├── templates.service.ts
│   ├── templates.controller.ts
│   └── dto/
│       └── template.dto.ts
└── communications/
    ├── communications.module.ts
    ├── communications.service.ts
    ├── communications.controller.ts
    ├── dto/
    │   └── communication.dto.ts
    └── providers/
        ├── message-provider.interface.ts
        ├── whatsapp.mock-provider.ts
        └── email.mock-provider.ts
```

### Worker
```
apps/worker/
├── src/
│   ├── main.ts
│   ├── app.module.ts
│   ├── modules/
│   │   ├── jobs/
│   │   │   ├── reminder.job.ts
│   │   │   ├── confirmation.job.ts
│   │   │   └── cancellation.job.ts
│   │   ├── queues/
│   │   │   └── notification.queue.ts
│   │   └── processors/
│   │       └── message.processor.ts
│   └── common/
│       └── redis.service.ts
├── package.json
├── nest-cli.json
└── tsconfig.json
```

### Frontend
```
apps/web/src/app/(authenticated)/
├── communications/
│   ├── templates/
│   │   ├── page.tsx
│   │   └── new/
│   │       └── page.tsx
│   ├── history/
│   │   └── page.tsx
│   └── send/
│       └── page.tsx
```

## 10. Validações e Regras de Negócio

### Templates
- Nome único por organização
- Corpo obrigatória
- Placeholders válidos: `{{patient_name}}`, `{{appointment_date}}`, `{{appointment_time}}`, `{{professional_name}}`, `{{clinic_name}}`
- Canal e tipo obrigatórios

### Comunicações
- Recipient válido para o canal
- Appointment deve existir se referenced
- Patient deve pertencer à organização

### Jobs
- Lembrete: 24h antes do appointment
- Confirmação: imediato após criar appointment
- Cancelamento: imediato após cancelar
- Retry: máximo 3 tentativas

### Segurança
- Isolamento por organizationId em todas as operações
- Apenas usuários autenticados
- Auditoria em create/update/delete de templates
- Auditoria em envío manual

## 11. Critérios de Aceite

### Templates
- [ ] Template pode ser criado com todos os campos
- [ ] Template pode ser editado
- [ ] Template pode ser desativado (soft delete)
- [ ] Lista paginada com filtros
- [ ] Isolamento por organização

### Comunicações
- [ ] Mensagem pode ser enviada manualmente
- [ ] Histórico visível por paciente
- [ ] Lista paginada com filtros
- [ ] Status atualizado após envio
- [ ] Erro shown se falhar
- [ ] Isolamento por organização

### Automação
- [ ] Confirmação enviada ao criar appointment
- [ ] Lembrete enviado 24h antes
- [ ] Cancelamento enviado ao cancelar
- [ ] Retry em falhas (3x)
- [ ] Jobs processados corretamente

### Auditoria
- [ ] Create de template logado
- [ ] Update de template logado
- [ ] Delete de template logado
- [ ] Envio manual logado

## 12. Plano de Implementação

### Fase 1: Base (Esta spec)
- [x] Spec completa
- [ ] Prisma schema atualizado
- [ ] Types em packages/contracts

### Fase 2: Backend - Templates
- [ ] Módulo templates completo
- [ ] CRUD com validações
- [ ] Rotas API

### Fase 3: Backend - Comunicações
- [ ] Módulo communications completo
- [ ] Abstração de provider
- [ ] Envio manual
- [ ] Auditoria

### Fase 4: Worker
- [ ] apps/worker criado
- [ ] BullMQ configurado
- [ ] Jobs (reminder, confirmation, cancellation)
- [ ] Processors

### Fase 5: Frontend
- [ ] API clients
- [ ] Página templates
- [ ] Página histórico
- [ ] Página envío

### Fase 6: Integração
- [ ] Hook no appointment creation
- [ ] Hook no appointment cancellation
- [ ] Scheduler para lembretes

## 13. Dependências Técnicas

### Backend (apps/api)
```json
"dependencies": {
  "@nestjs/common": "^10.3.0",
  "@nestjs/core": "^10.3.0",
  "@clinica-saas/contracts": "*"
}
```

### Worker (apps/worker)
```json
"dependencies": {
  "@nestjs/common": "^10.3.0",
  "@nestjs/core": "^10.3.0",
  "@nestjs/bullmq": "^10.3.0",
  "bullmq": "^4.14.0",
  "ioredis": "^5.3.0",
  "@clinica-saas/contracts": "*"
}
```

### Frontend (apps/web)
```json
"dependencies": {
  "@tanstack/react-query": "^5.17.0",
  "@clinica-saas/contracts": "*"
}
```

## 14. Variáveis de Ambiente

### Backend
```
# Já existentes
DATABASE_URL=postgresql://...
JWT_SECRET=...

# Communnications (mock para testar)
MOCK_WHATSAPP_ENABLED=true
MOCK_EMAIL_ENABLED=true
```

### Worker
```
# Redis
REDIS_HOST=localhost
REDIS_PORT=6379

# Database
DATABASE_URL=postgresql://...
```

---

## 15. Histórico de Versões

| Versão | Data | Descrição |
|--------|------|------------|
| 1.0.0 | 2026-04-10 | Versão inicial |

---

## 16. Referências

- SPEC 001: Auth, Tenant e RBAC
- SPEC 002: Pacientes
- SPEC 003: Agenda e Agendamentos
- apps/api/AGENTS.md
- apps/worker/AGENTS.md (a criar)