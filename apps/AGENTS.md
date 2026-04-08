# AGENTS.md - Aplicações

## Escopo

Este arquivo define as regras para todas as aplicações (`apps/*`).

## Regras

### Estrutura
- Cada app deve ter seu próprio `package.json` com scripts padrão
- Apps só podem importar de `packages/*` e de outras apps se necessário
- Dependencies entre apps devem ser evitadas

### Desenvolvimento
- Cada app pode ter seu próprio ESLint/Prettier configurado
- Tests devem estar no diretório `tests/` ou `__tests__/`
- Scripts de dev: `dev`, `build`, `start`, `lint`, `typecheck`, `test`

### Padrões de Código
- TypeScript strict mode obrigatório
- Nomenclatura: PascalCase para arquivos de componente, camelCase para utilitários
- Arquivos de módulo: `*.module.ts`, `*.controller.ts`, `*.service.ts`, `*.dto.ts`
- Pastas de domínio em `src/modules/` ou `src/domain/`

### Dependencies
- Dependencies compartilhadas devem estar no root `package.json`
- Cada app pode ter devDependencies específicas

## Subpastas

- `apps/api/AGENTS.md` - Backend (NestJS)
- `apps/web/AGENTS.md` - Frontend (Next.js)
- `apps/worker/AGENTS.md` - Background jobs (reservado)