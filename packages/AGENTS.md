# AGENTS.md - Pacotes Compartilhados

## Escopo

Este arquivo define as regras para todos os pacotes compartilhados (`packages/*`).

## Regras Gerais

### Propósito
- Cada pacote deve ter propósito claro e único
- Exportar apenas interfaces públicas necessárias
- Evitar dependências externas quando possível

### Publicação
- Pacotes são privados (não publicados em npm registry)
- Usar workspace para compartilhamento interno
- Path aliases em `tsconfig.json` do root

### Tipos
- TypeScript strict mode
- Exportar tipos, schemas, enums, utilitários
- Evitar código de implementação em packages (exceto utilitários)

## Subpastas

- `packages/contracts/AGENTS.md` - Tipos, schemas Zod, enums
- `packages/shared/AGENTS.md` - Utilitários comuns
- `packages/ui/AGENTS.md` - Componentes UI