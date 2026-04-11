# SPEC 007: Módulo Financeiro

## 1. Contexto do Problema

O sistema de gestão de clínicas precisa controlar cobranças, pagamentos e status financeiro das serviços prestados. Com as fases anteriores implementadas (Auth, Pacientes, Agenda, Comunicações, Documentos, Tarefas), há necessidade de:

- Registrar cobranças para pacientes
- Acompanhar status de pagamento
- Visualizar resumo financeiro (pendente, pago, vencido)
- Registrar pagamentos manualmente
- Controlar por organização

## 2. Objetivo do Módulo

Criar sistema financeiro básico com:
- Dashboard com indicadores
- CRUD de cobranças
- Registro de pagamento
- Status: Pendente, Pago, Vencido, Cancelado
- Vinculação opcional com paciente/agendamento
- Auditoria de operações

## 3. Escopo da Feature

### Dentro do Escopo:
- [x] Dashboard com indicadores
- [x] CRUD de cobranças
- [x] Registro de pagamento
- [x] Status: pending, paid, overdue, cancelled
- [x] Métodos: cash, credit, debit, pix, transfer
- [x] Vinculação automática com agendamento
- [x] Filtros por período, status, paciente
- [x] Auditoria

### Fora do Escopo:
- [ ] Integração com gateway de pagamento
- [ ] Emissão fiscal/NF
- [ ] Boletos automáticos
- [ ] PIX automático
- [ ] Repasses avançados
- [ ] Contabilidade completa

## 4. Personas e Papéis

| Role | Permissão |
|------|-----------|
| `super_admin` | Todas |
| `org_admin` | CRUD completo |
| `professional` | Ver |
| `receptionist` | Criar, registrar pagamento |
| `support` | Apenas leitura |

## 5. Modelo de Dados

### Entidades do Prisma

```
Charge
├── id (UUID, PK)
├── organizationId (UUID, FK)
├── patientId (UUID, FK, nullable)
├── appointmentId (UUID, FK, nullable)
├── description (string)
├── amount (decimal)
├── dueDate (datetime)
├── status (enum: pending, paid, overdue, cancelled)
├── paidAt (datetime, nullable)
├── paymentMethod (string, nullable)
├── notes (string, nullable)
├── createdBy (UUID, FK)
├── createdAt (datetime)
└── updatedAt (datetime)

ChargeAudit
├── id (UUID, PK)
├── chargeId (UUID, FK)
├── action (enum: create, update, payment, cancel)
├── changes (json, nullable)
├── performedBy (UUID, FK)
└── performedAt (datetime)
```

### Relações
- Organization 1:N Charge
- Patient 1:N Charge (optional)
- Appointment 1:N Charge (optional)
- User createdBy → Charge
- Charge 1:N ChargeAudit

### Índices
- organizationId (filtro principal)
- patientId (busca por paciente)
- appointmentId (busca por agendamento)
- status (filtro)
- dueDate (ordenação)
- createdBy (criador)

## 6. Contratos de API

### Types

```typescript
export type ChargeStatus = 'pending' | 'paid' | 'overdue' | 'cancelled';
export type PaymentMethod = 'cash' | 'credit' | 'debit' | 'pix' | 'transfer';

export interface Charge {
  id: string;
  organizationId: string;
  patientId?: string;
  appointmentId?: string;
  description: string;
  amount: number;
  dueDate: string;
  status: ChargeStatus;
  paidAt?: string;
  paymentMethod?: PaymentMethod;
  notes?: string;
  createdBy: { id: string; name: string };
  createdAt: string;
  updatedAt: string;
}

export interface ChargeListParams {
  page?: number;
  limit?: number;
  status?: ChargeStatus;
  patientId?: string;
  appointmentId?: string;
  dueDateFrom?: string;
  dueDateTo?: string;
  search?: string;
}

export interface ChargeListResponse {
  items: Charge[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface ChargeCreateRequest {
  description: string;
  amount: number;
  dueDate: string;
  patientId?: string;
  appointmentId?: string;
  notes?: string;
}

export interface ChargeUpdateRequest {
  description?: string;
  amount?: number;
  dueDate?: string;
  notes?: string;
}

export interface ChargePaymentRequest {
  paymentMethod: PaymentMethod;
}

export interface FinanceDashboard {
  totalPending: number;
  totalPaid: number;
  totalOverdue: number;
  pendingCount: number;
}
```

### Rotas API

| Método | Rota | Descrição |
|--------|------|-----------|
| GET | /finance/charges | Listar cobranças |
| GET | /finance/charges/:id | Detalhar cobrança |
| POST | /finance/charges | Criar cobrança |
| PATCH | /finance/charges/:id | Editar cobrança |
| POST | /finance/charges/:id/pay | Registrar pagamento |
| DELETE | /finance/charges/:id | Cancelar cobrança |
| GET | /finance/dashboard | Indicadores |

## 7. Dashboard

### Indicadores

| Indicador | Descrição |
|-----------|-----------|
| totalPending | Soma de status "pending" |
| totalPaid | Soma de status "paid" no período |
| totalOverdue | Soma de status "overdue" |
| pendingCount | Contagem de pendentes |

## 8. Validações

### Criação
- description: 3-200 caracteres
- amount: > 0, até 2 decimais
- dueDate: hoje ou futura

### Pagamento
- paymentMethod: obrigatório
- status = paid, paidAt = agora

## 9. Telas Frontend

| Rota | Descrição |
|------|-----------|
| /finance | Dashboard + Listagem |
| /finance/new | Criar cobrança |
| /finance/:id | Detalhes |

## 10. Estrutura de Pastas

```
apps/api/src/modules/finance/
├── finance.module.ts
├── finance.service.ts
├── finance.controller.ts
├── dto/charge.dto.ts
└── AGENTS.md

apps/web/src/app/(authenticated)/finance/
├── page.tsx
├── new/page.tsx
└── [id]/page.tsx

packages/contracts/src/types/
└── charge.ts
```

## 11. Critérios de Aceite

- [ ] Dashboard com indicadores
- [ ] CRUD completo de cobranças
- [ ] Registro de pagamento
- [ ] Filtros funcionado
- [ ] Build compila
- [ ] Isolamento org

---

**Versão**: 1.0.0
**Data**: 2026-04-11
**Status**: Aprovado para implementação