# AGENTS.md - Worker (BullMQ/Jobs)

## Visão Geral

Este é o módulo de processamento assíncrono do sistema Clínica SaaS. Responsável por processar jobs de comunicação, lembretes e notificações em background, isolando a lógica pesada da API principal.

## Objetivo

Processar jobs assíncronos de forma robusta:
- Filas com BullMQ
- Retry logic em falhas
- Logging estruturado
- Escalabilidade horizontal

## Estrutura do Repositório

```
apps/worker/src/
├── main.ts                    # Entry point
├── app.module.ts             # Módulo principal
├── modules/
│   ├── jobs/              # Definições de jobs
│   ├── queues/            # Configuração de filas
│   └── processors/         # Processadores BullMQ
└── common/               # Utilitários comuns
    └── redis.service.ts
```

## Responsabilidades

### O que fazer
- Processar jobs de lembrete (24h antes)
- Processar jobs de confirmação
- Processar jobs de cancelamento
- Implementar retry logic (máximo 3x)
- Logs de execução
- Notificar falhas

### O que não fazer
- Expor API REST
- Acessar diretamente via HTTP
- Processar dados sensíveis sem validação

## Dependencies Permitidas

- @nestjs/common
- @nestjs/core
- @nestjs/config
- @nestjs/bullmq
- bullmq
- ioredis
- @clinica-saas/contracts
- @prisma/client

## Padrões de Código

### Módulos
- Cada tipo de job em arquivo separado
- Naming: `*.job.ts`, `*.processor.ts`
- Classes com sufixo Job/Processor

### Filas
- Usar BullMQ com Redis
- Connection única
- retry com backoff

### Logging
- Estruturado (JSON)
- Incluir jobId, appointmentId, patientId
- Trace de erros

## Segurança

- Não expor endpoints externos
- Validar dados do job antes de processar
- Isolamento por organizationId

## Relação com Outras Parts

### Backend (apps/api)
- Enqueue jobs via API
- Shared database (Prisma)

### Frontend (apps/web)
- Não se comunica diretamente
- Apenas via API

## Variáveis de Ambiente

```env
REDIS_HOST=localhost
REDIS_PORT=6379
DATABASE_URL=postgresql://...
```

## Scripts

```json
{
  "dev": "nest start --watch",
  "build": "nest build",
  "start": "node dist/apps/worker/src/main.js"
}
```

## Fora de Escopo

- API REST
- WebSocket
- UI/Frontend
- Autenticação de usuários (herda do contexto)

---

## Contato

Para dúvidas, consulte a spec em `docs/specs/004-communications-reminders.md`