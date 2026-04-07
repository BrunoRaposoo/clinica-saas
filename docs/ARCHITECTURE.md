# Arquitetura do Projeto

## Visão Geral

Este é um SaaS para gestão de clínicas e consultórios médicos. O projeto segue uma arquitetura de **monólito modular** com separação clara entre frontend, backend e pacotes compartilhados.

## Estrutura do Repositório

```
clinica-saas/
├── apps/                  # Aplicações principais
│   ├── api/              # Backend (NestJS)
│   ├── web/              # Frontend (Next.js)
│   └── worker/           # Workers/Background jobs (reservado)
├── packages/             # Pacotes compartilhados
│   ├── contracts/        # Tipos, schemas Zod, enums
│   ├── shared/           # Utilitários comuns
│   └── ui/               # Componentes UI (shadcn)
├── docs/                 # Documentação
└── infra/                # Configurações de infraestrutura
```

## Backend (NestJS)

### Estrutura de Módulos

```
apps/api/src/
├── modules/              # Módulos de domínio
│   └── health/          #/health endpoint
├── common/              # Componentes compartilhados
│   ├── filters/         # Filtros de exceção
│   ├── interceptors/    # Interceptadores
│   ├── pipes/          # Pipes de validação
│   ├── decorators/      # Decoradores customizados
│   └── dto/             # DTOs comuns
└── prisma/              # Schema do banco
```

### Technology Stack
- NestJS 10.x
- Prisma (ORM)
- PostgreSQL (Banco)
- Redis (Cache/Sessions)
- Swagger (Documentação)

## Frontend (Next.js)

### Estrutura de Pastas

```
apps/web/src/
├── app/                 # Next.js App Router
├── components/         # Componentes React
│   ├── ui/             # Componentes base
│   └── layout/         # Componentes de layout
├── lib/                # Utilitários e configurações
├── hooks/              # Custom hooks
└── styles/            # Estilos globais
```

### Technology Stack
- Next.js 14.x (App Router)
- React 18.x
- Tailwind CSS
- shadcn/ui

## Pacotes Compartilhados

### @clinica-saas/contracts
Contém tipos TypeScript, schemas Zod e enums compartilhados entre frontend e backend.

**Uso:**
```typescript
import { UserSchema, UserRole, type User } from '@clinica-saas/contracts';
import { ApiResponseSchema } from '@clinica-saas/contracts/zod';
```

### @clinica-saas/shared
Utilitários comuns (datas, strings, validadores, constantes).

**Uso:**
```typescript
import { formatDateLocale, generateRandomCode, DEFAULT_PAGE_SIZE } from '@clinica-saas/shared';
```

### @clinica-saas/ui
Biblioteca de componentes UI reutilizáveis baseados em shadcn.

**Uso:**
```typescript
import { Button, Card } from '@clinica-saas/ui';
```

## Comunicação API

O frontend se comunica com o backend via REST API:

- **Base URL:** `http://localhost:3001/api/v1`
- **Swagger:** `http://localhost:3001/api/docs`
- **Formato:** JSON
- **Autenticação:** Bearer token (a implementar)

## Environment Variables

### Backend (.env)
```
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/clinica_saas
REDIS_URL=redis://localhost:6379
NODE_ENV=development
PORT=3001
```

## Path Aliases

O projeto usa path aliases para importações mais limpas:

```json
{
  "@clinica-saas/contracts": "packages/contracts/src",
  "@clinica-saas/shared": "packages/shared/src",
  "@clinica-saas/ui": "packages/ui/src"
}
```

## Scripts Disponíveis

```bash
# Desenvolvimento
npm run dev:api     # Inicia backend
npm run dev:web     # Inicia frontend

# Build
npm run build       # Build completo
npm run build:api   # Build backend
npm run build:web  # Build frontend

# Database
npm run db:generate # Gera Prisma Client
npm run db:push     # Push schema para banco
npm run db:migrate  # Executa migrations

# Qualidade
npm run lint        # Executa lint
npm run format      # Formata código
npm run typecheck   # Verificação de tipos
```

## Ambiente de Desenvolvimento (WSL2)

Para rodar o projeto no WSL2:

1. Inicie os serviços auxiliares:
   ```bash
   cd infra && docker compose up -d
   ```

2. Backend:
   ```bash
   cd apps/api && npm install && npm run dev
   ```

3. Frontend:
   ```bash
   cd apps/web && npm install && npm run dev
   ```

## Próximos Passos

- Implementar autenticação JWT
- Configurar Prisma para PostgreSQL local
- Criar módulo de clínicas
- Criar módulo de usuários