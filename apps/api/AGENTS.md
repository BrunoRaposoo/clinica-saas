# AGENTS.md - Backend (NestJS)

## Objetivo

Fornecer API RESTful para o sistema de gestão de clínicas.

## Responsabilidades

- Expor endpoints RESTful para todas as funcionalidades
- Validar input com class-validator/Zod
- Documentar API com Swagger/OpenAPI
- Autenticação e autorização com JWT
- Conexão com banco de dados via Prisma
- Logging estruturado de requisições

## Estrutura de Pastas

```
apps/api/src/
├── modules/              # Módulos de domínio (auth, users, organizations, roles)
│   └── [module]/
│       ├── [module].module.ts
│       ├── [module].controller.ts
│       ├── [module].service.ts
│       ├── dto/
│       └── entities/
├── common/              # Componentes compartilhados
│   ├── guards/          # Guards de autenticação/autorização
│   │   ├── jwt-auth.guard.ts   # Obrigatório em todas rotas não-públicas
│   │   ├── roles.guard.ts    # Obrigatório além de JwtAuthGuard
│   │   └── rate-limit.guard.ts
│   ├── decorators/     # Decoradores customizados
│   │   ├── roles.decorator.ts  # @Roles('org_admin', 'receptionist')
│   │   ├── current-user.decorator.ts
│   │   └── current-organization.decorator.ts
│   ├── strategies/     # Passport strategies
│   ├── filters/        # Filtros de exceção
│   ├── interceptors/   # Interceptadores
│   ├── interfaces/     # Interfaces de serviço
│   └── dto/            # DTOs comuns
├── prisma/              # Schema do banco
│   └── schema.prisma
└── main.ts              # Entry point
```

## Regras de Código

### Módulos
- Cada domínio deve ser um módulo NestJS separado
- Controller expõe endpoints, Service contém lógica de negócio
- Usar DTOs para entrada/saída de dados
- Naming: `[domain].controller.ts`, `[domain].service.ts`

### Autenticação
- JWT com access/refresh tokens
- Access token: 15min, Refresh token: 7 dias
- Password hasheada com bcrypt (cost 12)
- Rate limiting in-memory (5 tentativas/15min)

### Controle de Acesso (RolesGuard)
- TODAS as rotas não-públicas DEVEM usar RolesGuard além de JwtAuthGuard
- Decorador @Roles é.obrigatório em cada controller
- Ver docs/superpowers/specs/2026-04-28-rolesguard-access-control-design.md

**Ordem de implementação incremental:**
1. Fase 1 (alta): settings, organizations, roles
2. Fase 2 (média): users, patients, appointments
3. Fase 3 (baixa): documents, dashboard, tasks

**Roles válidas:** super_admin, org_admin, receptionist, professional, support

### Validação
- Usar class-validator nos DTOs
- Usar Zod para validação em camadas de transformação
- Whitelist enabled no ValidationPipe

### Documentação
- Swagger em `/api/docs`
- Tags por módulo
- Schema de resposta padronizado
- Exemplos para endpoints principais

### Banco de Dados
- Prisma como ORM
- Foreign keys com delete/update cascade onde aplicável
- Timestamps (createdAt, updatedAt) em todas as entidades
- UUID como tipo de ID primário

## Dependencies Permitidas

- @nestjs/* (core modules)
- @clinica-saas/contracts
- @clinica-saas/shared
- @prisma/client
- class-validator/class-transformer
- passport + passport-jwt
- bcrypt
- zod

## Fora de Escopo

- Renderização de UI
- WebSocket (futuro)
- Filas/jobs (apps/worker)

## Relacionamento

- Expõe API REST em `/api/v1`
- Frontend (`apps/web`) consome esta API
- Tipos compartilhados via `@clinica-saas/contracts`