# AGENTS.md - Shared

## Objetivo

Utilitários comuns compartilhados entre frontend e backend.

## Responsabilidades

- Funções utilitárias (datas, strings, validação)
- Constantes compartilhadas (paginação, limites, etc)
- Funções de formatação
- Validadores customizados

## Estrutura

```
packages/shared/src/
├── utils/              # Funções utilitárias
│   ├── index.ts
│   ├── date.ts
│   └── string.ts
├── validators/         # Validadores customizados
│   └── index.ts
├── constants/          # Constantes
│   ├── index.ts
│   └── pagination.ts
└── index.ts           # Barrel export
```

## Regras

### Naming
- Arquivos em kebab-case: `date-utils.ts`
- Funções em camelCase: `formatDate()`, `generateRandomCode()`
- Constantes em UPPER_SNAKE_CASE: `DEFAULT_PAGE_SIZE`

### Utils
-Funções puras (sem side effects)
- Tipagem TypeScript estrita
- Documentação JSDoc para funções complexas

### Constantes
- Agrupar por domínio
- Nomes descritivos

## Dependencies

- Apenas type definitions (sem código de implementaçãoheavy)

## Exemplos

```typescript
import { formatDateLocale, DEFAULT_PAGE_SIZE } from '@clinica-saas/shared';
import { isValidCPF } from '@clinica-saas/shared/validators';
```

## Relacionamento

- Usado por todas as apps e packages
- Sem dependências externas