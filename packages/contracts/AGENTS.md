# AGENTS.md - Contracts

## Objetivo

Pacote de tipos TypeScript, schemas Zod e enums compartilhados entre frontend e backend.

## Responsabilidades

- Exportar tipos TypeScript para entidades do domínio
- Exportar schemas Zod para validação
- Exportar enums para valores fixos
- Manter consistência entre API e UI

## Estrutura

```
packages/contracts/src/
├── types/          # Interfaces TypeScript
│   ├── index.ts
│   ├── user.ts
│   ├── auth.ts
│   └── ...
├── schemas/        # Schemas Zod
│   ├── index.ts
│   ├── user.ts
│   └── ...
├── enums/          # Enums TypeScript
│   ├── index.ts
│   ├── user.ts
│   └── ...
└── index.ts        # Barrel export
```

## Regras

### Tipos
- Nomes em PascalCase (User, Organization)
- Propriedades em camelCase
- UUID para IDs
- Date para timestamps

### Schemas Zod
- Nome: `SomethingSchema`
- Tipos derivados: `Something`, `SomethingInput` (infer types)
- Validações: .min(), .max(), .email(), .uuid(), .enum()

### Enums
- Preferir const enum quando possível
- Nome: UserRole, PermissionAction, etc.
- Valores em snake_case

### Exports
- Usar barrel export em index.ts
- Exportar tipos e schemas separadamente quando necessário

## Dependencies

- zod (para schemas)

## Como Usar

```typescript
// Tipos
import type { User, Organization } from '@clinica-saas/contracts';

// Schemas
import { UserSchema, OrganizationSchema } from '@clinica-saas/contracts';
import { z } from 'zod';
type User = z.infer<typeof UserSchema>;

// Enums
import { UserRole } from '@clinica-saas/contracts';
```

## Relacionamento

- Consumido por `apps/api` e `apps/web`
- Build deve ser executado antes das apps dependentes
- Alterações requerem rebuild dos pacotes