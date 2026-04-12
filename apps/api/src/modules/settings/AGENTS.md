# AGENTS.md - Módulo de Configurações

## Escopo

Módulo de configurações e administração do sistema - Settings e Audit.

## Objetivo

Criar sistema de configurações e administração com:
- Configurações gerais da organização
- Gerenciamento de unidades
- Gerenciamento de profissionais
- Gerenciamento de tipos de serviço
- Preferências de agenda
- Preferências de comunicação
- Auditoria detalhada

## Estrutura

apps/api/src/modules/settings/
├── settings.module.ts
├── settings.service.ts
├── settings.controller.ts
├── dto/
│   └── settings.dto.ts
└── AGENTS.md

apps/api/src/modules/audit/
├── audit.module.ts
├── audit.service.ts
├── audit.controller.ts
└── AGENTS.md

## Responsabilidades

### O que fazer
- CRUD de configurações organizacionais
- CRUD de unidades, profissionais, tipos de serviço
- Preferências de agenda e comunicação
- Logs de auditoria

### O que não fazer
- Feature flags avançadas
- Cobrança recorrente
- Integrações externas

## ROTAS API

| Método | Rota | Descrição |
|--------|------|-----------|
| GET | /settings | Buscar configurações |
| PATCH | /settings | Atualizar configurações |
| GET | /settings/units | Listar unidades |
| POST | /settings/units | Criar unidade |
| PATCH | /settings/units/:id | Atualizar unidade |
| DELETE | /settings/units/:id | Desativar unidade |
| GET | /settings/service-types | Listar tipos |
| POST | /settings/service-types | Criar tipo |
| PATCH | /settings/service-types/:id | Atualizar tipo |
| DELETE | /settings/service-types/:id | Desativar tipo |
| GET | /settings/professionals | Listar profissionais |
| POST | /settings/professionals | Criar profissional |
| PATCH | /settings/professionals/:id | Atualizar profissional |
| DELETE | /settings/professionals/:id | Desativar profissional |
| GET | /settings/schedule-preferences | Preferências de agenda |
| PATCH | /settings/schedule-preferences | Atualizar preferências |
| GET | /settings/communication-preferences | Preferências de comunicação |
| PATCH | /settings/communication-preferences | Atualizar preferências |
| GET | /audit/logs | Listar logs |
| GET | /audit/logs/:id | Detalhar log |

---

Contato: docs/specs/009-settings-admin-audit.md