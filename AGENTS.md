# AGENTS.md - Clínica SaaS

## Visão Geral

Este é um repositório de monorepo para sistema de gestão de clínicas e consultórios médicos. O desenvolvimento segue abordagem **feature-driven** com spec-driven development.

## Estrutura do Repositório

```
clinica-saas/
├── apps/           # Aplicações principais
│   ├── api/        # Backend (NestJS)
│   ├── web/        # Frontend (Next.js)
│   └── worker/     # Background jobs (reservado)
├── packages/       # Pacotes compartilhados
│   ├── contracts/  # Tipos, schemas Zod, enums
│   ├── shared/     # Utilitários comuns
│   └── ui/         # Componentes UI
├── docs/           # Documentação
│   └── specs/      # Especificações de features
└── infra/          # Configurações de infraestrutura
```

## Regras de Git

**NÃO fazer operações de git diretamente no projeto.**

- Não executar comandos git (push, pull, merge, rebase, etc)
- Não criar worktrees no projeto
- Todas as operações de git devem ser Feitas manualmente pelo usuário

Se precisar de alguma operação git, informe o usuário e aguarde instrução.

## Regras Gerais

### Padrões de Código
- TypeScript strict mode
- ESLint + Prettier
- Nomenclatura: camelCase (variáveis), PascalCase (classes/componentes), kebab-case (arquivos)
- Importações absolutas usando path aliases (@clinica-saas/*)


### Revisões
- Todas as mudanças precisam de review
- Checklist de code review no PR

## Recursos dos Agentes

### Ferramentas Disponíveis
- grep: busca em código
- glob: encontrar arquivos
- read: ler arquivos
- edit: editar arquivos
- write: criar arquivos
- bash: executar comandos
- task: agente especializado em exploratory tasks

### Quando Usar Cada Ferramenta
- glob + grep: encontrar arquivos e padrões
- read: entender código existente antes de editar
- write: criar novos arquivos
- edit: modificar código existente
- bash: operações de terminal, builds, testes

## Contato

Para dúvidas sobre este repositório, consulte a documentação em docs/