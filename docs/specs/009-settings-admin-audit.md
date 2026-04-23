# SPEC 009: Configurações, Administração e Auditoria

## 1. Contexto do Problema

O sistema de gestão de clínicas precisa de um módulo centralizado de configurações e administração para dar governança, manutenção e controle operacional ao SaaS. Com as 8 fases anteriores implementadas (Auth, Pacientes, Agenda, Comunicações, Documentos, Tarefas, Financeiro, Dashboard), há necessidade de:

- Controlar configurações gerais da organização
- Gerenciar unidades, profissionais e tipos de serviço
- Definir preferências operacionais, de agenda, comunicação e financeiras
- Registrar e visualizar auditoria detalhada de todas as ações administrativas
- Garantir isolamento e permissões por organização

## 2. Objetivo do Módulo

Criar sistema completo de configurações e administração com:
- CRUD de configurações organizacionais
- Gerenciamento de unidades, profissionais e tipos de serviço
- Preferências operacionais personalizáveis
- Sistema de auditoria detalhado
- Interface administrativa centralizada

## 3. Escopo da Feature

### Dentro do Escopo:
- [x] Configurações gerais da organização (nome, logo, timezone, locale)
- [x] Gerenciamento de unidades (CRUD completo)
- [x] Gerenciamento de profissionais (CRUD, vinculação com usuários)
- [x] Gerenciamento de tipos de serviço (CRUD,pricing)
- [x] Preferências operacionais globais
- [x] Parâmetros de agenda (duração padrão,intervalos,bloqueios)
- [x] Preferências de comunicação (templates padrão,canais)
- [x] Preferências financeiras básicas (moeda,forma de pagamento)
- [x] Auditoria detalhada de ações administrativas
- [x] Visualização de logs de auditoria com filtros
- [x] Controle por organização e permissões
- [x] Contratos compartilhados entre backend e frontend

### Fora do Escopo:
- [ ] Feature flags avançadas (futuro)
- [ ] Cobrança recorrente (futuro)
- [ ] Integrações externas complexas (futuro)
- [ ] Painel de segurança corporativa avançado (futuro)
- [ ] Gestão de múltiplas organizações por único usuário ( além do previsto no tenant)
- [ ] Workflows automáticos sofisticados (futuro)

## 4. Personas e Papéis

| Role | Permissão |
|------|-----------|
| `super_admin` | Todas, incluindo configurações globais |
| `org_admin` | CRUD completo de configurações da organização |
| `professional` | Apenas visualização |
| `receptionist` | Apenas visualização |
| `support` | Apenas leitura de auditoria |

## 5. Modelo de Dados

### Entidades do Prisma

```prisma
OrganizationSettings
├── id (UUID, PK)
├── organizationId (UUID, FK, unique)
├── businessName (string)
├── tradeName (string, nullable)
├── logo (string, nullable)
├── email (string)
├── phone (string, nullable)
├── address (string, nullable)
├── city (string, nullable)
├── state (string, nullable)
├── zipCode (string, nullable)
├── timezone (string)
├── locale (string)
├── currency (string)

Unit
├── id (UUID, PK)
├── organizationId (UUID, FK)
├── name (string)
├── address (string, nullable)
├── phone (string, nullable)
├── isActive (boolean)

ServiceType
├── id (UUID, PK)
├── organizationId (UUID, FK)
├── name (string)
├── description (string, nullable)
├── duration (int)
├── price (decimal, nullable)
├── color (string, nullable)
├── isActive (boolean)

SchedulePreferences
├── id (UUID, PK)
├── organizationId (UUID, FK, unique)
├── defaultDuration (int)
├── minInterval (int)
├── maxAdvanceDays (int)
├── allowOverbooking (boolean)
├── requireConfirmation (boolean)
├── startWorkHour (string)
├── endWorkHour (string)
├── workDays (json)

CommunicationPreferences
├── id (UUID, PK)
├── organizationId (UUID, FK, unique)
├── defaultChannel (string)
├── sendAppointmentReminder (boolean)
├── reminderHoursBefore (int)
├── sendPaymentReminder (boolean)
├── reminderDaysBefore (int)
├── defaultEmailTemplate (string, nullable)
├── defaultSmsTemplate (string, nullable)

AuditLog
├── id (UUID, PK)
├── organizationId (UUID, FK)
├── userId (UUID, FK)
├── action (string)
├── entity (string)
├── entityId (UUID, nullable)
├── changes (json, nullable)
├── ipAddress (string, nullable)
├── userAgent (string, nullable)
├── createdAt (datetime)
```

## 6. Contratos de API

### Rotas API

| Método | Rota | Descrição |
|--------|------|-----------|
| GET | /settings | Buscar configurações |
| PATCH | /settings | Atualizar configurações |
| GET | /settings/units | Listar unidades |
| POST | /settings/units | Criar unidade |
| GET | /settings/units/:id | Detalhar |
| PATCH | /settings/units/:id | Atualizar |
| DELETE | /settings/units/:id | Desativar |
| GET | /settings/service-types | Listar |
| POST | /settings/service-types | Criar |
| GET | /settings/service-types/:id | Detalhar |
| PATCH | /settings/service-types/:id | Atualizar |
| DELETE | /settings/service-types/:id | Desativar |
| GET | /settings/professionals | Listar |
| POST | /settings/professionals | Criar |
| GET | /settings/professionals/:id | Detalhar |
| PATCH | /settings/professionals/:id | Atualizar |
| DELETE | /settings/professionals/:id | Desativar |
| GET | /settings/schedule-preferences | Buscar |
| PATCH | /settings/schedule-preferences | Atualizar |
| GET | /settings/communication-preferences | Buscar |
| PATCH | /settings/communication-preferences | Atualizar |
| GET | /audit/logs | Listar logs |
| GET | /audit/logs/:id | Detalhar log |

## 7. Estrutura de Pastas

### Backend
```
apps/api/src/modules/settings/
├── settings.module.ts
├── settings.service.ts
├── settings.controller.ts
├── dto/settings.dto.ts
└── AGENTS.md

apps/api/src/modules/audit/
├── audit.module.ts
├── audit.service.ts
├── audit.controller.ts
└── AGENTS.md
```

### Frontend
```
apps/web/src/app/(authenticated)/settings/
├── page.tsx
├── general/page.tsx
├── units/
│   ├── page.tsx
│   └── new/page.tsx
├── service-types/page.tsx
├── professionals/page.tsx
├── schedule/page.tsx
└── communication/page.tsx

apps/web/src/app/(authenticated)/audit/
└── page.tsx
```

## 8. Critérios de Aceite

- [x] CRUD completo de configurações
- [x] CRUD de unidades
- [x] CRUD de tipos de serviço
- [x] CRUD de profissionais
- [x] Preferências de agenda
- [x] Preferências de comunicação
- [x] Listagem de auditoria com filtros
- [x] Isolamento por organização

---

**Versão**: 1.1.0
**Data**: 2026-04-23
**Status**: Implementado

**Changelog:**
- v1.1.0: Adicionada página units/new com formulário completo de criação de unidade