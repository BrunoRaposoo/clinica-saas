# AGENTS.md - Comunicações e Templates

## Visão Geral

Este é o módulo de comunicações do sistema Clínica SaaS. Responsável por gerenciar templates de mensagens, envio de comunicações e abstração de providers para múltiplos canais.

## Objetivo

Gerenciar comunicações com pacientes:
- CRUD de templates
- Envio de mensagens
- Abstração de provider
- Histórico de comunicações
- Auditoria completa

## Estrutura do Repositório

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

## Responsabilidades

### O que fazer
- CRUD completo de templates
- Envio de comunicações
- Abstração de provider (WhatsApp/Email/SMS)
- Status tracking (pending, sent, delivered, failed)
- Auditoria de operações
- Isolamento por organizationId

### O que não fazer
- Processamento assíncrono (delegar ao worker)
- Integração real com providers externos
- Chatbot
- Campanhas de marketing

## Dependencies Permitidas

- @nestjs/common
- @nestjs/core
- @nestjs/swagger
- @clinica-saas/contracts
- @prisma/client

## Padrões de Código

### Módulos
- Service: lógica de negócio
- Controller: rotas REST
- DTOs: validação com class-validator
- Naming: camelCase arquivos, PascalCase classes

### Autenticação
- JWT com organizationId
- decorators: @Authenticated(), @Organization(), @Roles()

### Validação
- class-validator nos DTOs
- Swagger docs em /api/docs

### Database
- Prisma como ORM
- Soft delete quando aplicável
- Índices em campos de busca

## Canais Suportados

- `whatsapp` - Mensagens via WhatsApp
- `email` - E-mails
- `sms` - SMS

## Providers

### Interface
```typescript
interface IMessageProvider {
  channel: MessageChannel;
  send(params: SendParams): Promise<SendResult>;
  getStatus(messageId: string): Promise<MessageStatus>;
}
```

### Providers Implementados
- WhatsAppMockProvider (testes)
- EmailMockProvider (testes)

## Segurança

- Isolamento por organizationId em todas as queries
- Apenas usuários autenticados
- Auditar operações sensíveis

## Relação com Outras Parts

### Worker (apps/worker)
- Enqueue jobs para processamento assíncrono
- Job scheduler delega retry logic

### Frontend (apps/web)
- API client em lib/api/
- UI em /communications/*

## Variáveis de Ambiente

```env
MOCK_WHATSAPP_ENABLED=true
MOCK_EMAIL_ENABLED=true
```

## Rotas API

### Templates
| Método | Rota | Descrição |
|--------|-----|----------|
| GET | /templates | Listar |
| POST | /templates | Criar |
| GET | /templates/:id | Detalhar |
| PATCH | /templates/:id | Atualizar |
| DELETE | /templates/:id | Desativar |

### Comunicações
| Método | Rota | Descrição |
|--------|-----|----------|
| GET | /communications | Listar |
| POST | /communications | Enviar |
| GET | /communications/:id | Detalhar |
| GET | /communications/patient/:patientId | Histórico |

## Fora de Escopo

- Integração real WhatsApp Business
- Integração real SendGrid/Mailgun
- Chatbot
- Campanhas marketing
- Automação IA

---

## Contato

Para dúvidas, consulte a spec em `docs/specs/004-communications-reminders.md`