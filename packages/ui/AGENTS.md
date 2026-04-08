# AGENTS.md - UI

## Objetivo

Biblioteca de componentes visuais baseados em shadcn/ui.

## Responsabilidades

- Componentes UI base (Button, Card, Input, etc)
- Exportar componentes prontos para uso
- Manter consistência visual
- Suporte a theming

## Estrutura

```
packages/ui/src/
├── components/         # Componentes
│   └── ui/            # Componentes base
│       ├── button.tsx
│       ├── card.tsx
│       ├── input.tsx
│       └── ...
├── lib/               # Utilitários internos
│   └── utils.ts       # cn() helper
├── index.ts           # Barrel export
└── index.tsx          # Entry point
```

## Regras

### Componentes
- Variants com CVA (class-variance-authority)
- Props com tipagem TypeScript
- Suporte a ref (forwardRef)
- Acessibilidade (aria-*)

### Estilo
- Tailwind CSS para styling
- cn() helper para className condicional
- Consistência com shadcn/ui

### Exports
- Exportar componentes de nível superior
- Não expor implementação interna

## Como Usar

```tsx
import { Button, Card, Input } from '@clinica-saas/ui';

<Button variant="default">Click me</Button>
<Card><CardHeader>...</CardHeader></Card>
```

## Dependencies

- react
- tailwind-merge
- clsx
- class-variance-authority
- lucide-react (ícones)

## Relacionamento

- Usado por `apps/web` para componentes visuais
- Pode ser usado por outras apps no futuro