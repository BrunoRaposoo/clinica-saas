# AGENTS.md - Módulo Financeiro

## Escopo

Módulo de controle financeiro operacional - cobranças, pagamentos e indicadores.

## Objetivo

Criar sistema financeiro com:
- Dashboard com indicadores
- CRUD de cobranças
- Registro de pagamentos
- Status: pending, paid, overdue, cancelled

## Estrutura

apps/api/src/modules/finance/
├── finance.module.ts
├── finance.service.ts
├── finance.controller.ts
├── dto/charge.dto.ts
└── AGENTS.md

## Responsabilidades

### O que fazer
- CRUD completo de cobranças
- Registro de pagamento
- Dashboard com indicadores
- Auditoria

### O que não fazer
- Integração com gateway (futuro)
- Emissão fiscal (futuro)
- Boletos automáticos (futuro)

## ROTAS API

| Método | Rota | Descrição |
|--------|------|-----------|
| GET | /finance/dashboard | Indicadores |
| GET | /finance/charges | Listar |
| GET | /finance/charges/:id | Detalhar |
| POST | /finance/charges | Criar |
| PATCH | /finance/charges/:id | Editar |
| POST | /finance/charges/:id/pay | Pagamento |
| DELETE | /finance/charges/:id | Cancelar |

---

Contato: docs/specs/007-finance.md