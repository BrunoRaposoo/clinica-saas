# AGENTS.md - Módulo de Auditoria

## Escopo

Módulo de auditoria de ações administrativas.

## Estrutura

apps/api/src/modules/audit/
├── audit.module.ts
├── audit.service.ts
└── AGENTS.md

## Responsabilidades

### O que fazer
- Listar logs de auditoria
- Filtrar por usuário, ação, entidade, data
- Detalhar log específico

### O que não fazer
- Auditoria em tempo real (futuro)
- Exportação de logs

---

Contato: docs/specs/009-settings-admin-audit.md