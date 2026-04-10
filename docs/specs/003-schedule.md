# SPEC 003: Agenda e Agendamentos

## 1. Contexto do Problema

O sistema de gestão de clínicas precisa gerenciar a agenda de atendimentos de forma eficiente. Profissionais precisam ter sua disponibilidade controlada, pacientes precisam de agendamentos organizados, e a recepção precisa de uma visão clara dos horários. O módulo deve suportar múltiplos profissionais, tipos de atendimento, bloqueios de agenda e auditoria completa.

## 2. Objetivo do Módulo

Criar sistema completo de gestão de agenda com:
- Agendamentos (consultas, retornos, procedimentos)
- Gestão de profissionais e suas especialidades
- Tipos de atendimento com durações definidas
- Bloqueios de horário (férias, folgas, reuniões)
- Validação de conflitos de horário
- Visões diária, semanal e mensal
- Fila de espera básica
- Auditoria de todas as operações

## 3. Escopo da Feature

### Dentro do Escopo:
- [x] CRUD de agendamentos
- [x] Tipos de atendimento com durações
- [x] Status: scheduled, confirmed, in_progress, completed, cancelled, no_show
- [x] Cancelamento com motivo
- [x] Reagendamento
- [x] Bloqueios de horário (férias, folga)
- [x] Validação de conflitos
- [x] Visão diária, semanal, mensal
- [x] Auditoria completa
- [x] Profissional com especialidade e cor

### Fora do Escopo:
- [ ] Lembretes automáticos (WhatsApp/email)
- [ ] Comunicação com pacientes
- [ ] Triagem/check-in avançado
- [ ] Prescrições
- [ ] Financeiro
- [ ] Sala de espera virtual

## 4. Personas e Papéis

### Papéis que podem gerenciar agenda:
| Role | Permissão |
|------|-----------|
| `super_admin` | Todas |
| `org_admin` | CRUD completo |
| `professional` | Ver própria agenda, agendar para si |
| `receptionist` | CRUD completo |
| `support` | Apenas leitura |

## 5. Fluxos Principais

### Fluxo 1: Criar Agendamento
```
1. Usuário acessa /appointments/new
2. Seleciona paciente (buscar por nome/documento)
3. Seleciona profissional
4. Seleciona tipo de atendimento
5. Seleciona data e horário
6. Sistema valida conflitos
7. Se válido, cria agendamento
8. Registra auditoria
9. Retorna sucesso
```

### Fluxo 2: Cancelar Agendamento
```
1. Usuário clica em cancelar
2. Informa motivo (obrigatório)
3. Sistema marca como cancelled
4. Registra auditoria com motivo
5. Agendamento não aparece mais como disponível
```

### Fluxo 3: Reagendar
```
1. Usuário clica em reagendar
2. Seleciona nova data/horário
3. Sistema valida conflitos
4. Se válido:
   - Cancela agendamento original (registra auditoria)
   - Cria novo agendamento (registra auditoria)
5. Histórico preservado
```

### Fluxo 4: Bloquear Agenda
```
1. Usuário acessa /schedule-blocks/new
2. Seleciona profissional
3. Define período de início e fim
4. Define motivo
5. Sistema bloqueia horários
6. Agendamentos não podem ser criados no período
```

## 6. Requisitos Funcionais

### Appointments Module
- `GET /appointments` - Listar (paginado, filtrado)
  - Query params: page, limit, startDate, endDate, professionalId, patientId, status
- `GET /appointments/:id` - Detalhar
- `POST /appointments` - Criar
- `PATCH /appointments/:id` - Editar
- `PATCH /appointments/:id/cancel` - Cancelar (motivo obrigatório)
- `PATCH /appointments/:id/reschedule` - Reagendar
- `GET /appointments/calendar` - Calendário
  - Query params: startDate, endDate, view (day, week, month), professionalId

### Professionals Module
- `GET /professionals` - Listar profissionais ativos
- `GET /professionals/:id` - Detalhar
- `GET /professionals/:id/availability` - Verificar disponibilidade

### Appointment Types Module
- `GET /appointment-types` - Listar tipos ativos

### Schedule Blocks Module
- `GET /schedule-blocks` - Listar bloqueios
- `POST /schedule-blocks` - Criar bloqueio
- `DELETE /schedule-blocks/:id` - Remover bloqueio

## 7. Requisitos Não Funcionais

- **Performance**: Busca de agenda < 200ms
- **Validação**: Todos inputs com class-validator + Zod
- **Segurança**: Isolamento por organizationId
- **Conflitos**: Validar sobreposição em tempo real

## 8. Modelo de Dados

### Entidade: Professional
| Campo | Tipo | Descrição |
|-------|------|-----------|
| id | UUID | PK |
| userId | UUID | FK User (obrigatório) |
| organizationId | UUID | FK Organization |
| specialty | string | Especialidade |
| appointmentTypeId | UUID? | Tipo padrão de atendimento |
| color | string | Cor no calendário (hex) |
| isActive | boolean | Status |
| createdAt | datetime | Criação |
| updatedAt | datetime | Atualização |

### Entidade: AppointmentType
| Campo | Tipo | Descrição |
|-------|------|-----------|
| id | UUID | PK |
| organizationId | UUID | FK Organization |
| name | string | Nome (Consulta, Retorno, etc) |
| duration | int | Duração em minutos |
| color | string | Cor (hex) |
| isActive | boolean | Status |
| createdAt | datetime | Criação |
| updatedAt | datetime | Atualização |

### Entidade: Appointment (expandida)
| Campo | Tipo | Descrição |
|-------|------|-----------|
| id | UUID | PK |
| organizationId | UUID | FK Organization |
| patientId | UUID | FK Patient |
| professionalId | UUID | FK Professional |
| appointmentTypeId | UUID? | FK AppointmentType |
| status | enum | scheduled, confirmed, in_progress, completed, cancelled, no_show |
| startDate | datetime | Início |
| endDate | datetime | Fim |
| duration | int | Duração em minutos |
| notes | text? | Observações |
| cancellationReason | text? | Motivo do cancelamento |
| cancelledBy | UUID? | FK User |
| cancelledAt | datetime? | Data do cancelamento |
| createdAt | datetime | Criação |
| updatedAt | datetime | Atualização |

### Entidade: ScheduleBlock
| Campo | Tipo | Descrição |
|-------|------|-----------|
| id | UUID | PK |
| organizationId | UUID | FK Organization |
| professionalId | UUID | FK Professional |
| startDate | datetime | Início |
| endDate | datetime | Fim |
| reason | string | Motivo |
| createdAt | datetime | Criação |
| updatedAt | datetime | Atualização |

### Entidade: AppointmentAudit
| Campo | Tipo | Descrição |
|-------|------|-----------|
| id | UUID | PK |
| appointmentId | UUID | FK Appointment |
| action | enum | create, update, cancel, reschedule, complete |
| changes | jsonb | Alterações |
| performedBy | UUID | FK User |
| performedAt | datetime | Data |

### Entidade: WaitingList
| Campo | Tipo | Descrição |
|-------|------|-----------|
| id | UUID | PK |
| organizationId | UUID | FK Organization |
| patientId | UUID | FK Patient |
| professionalId | UUID | FK Professional |
| preferredDate | date | Data preferencial |
| notes | text? | Observações |
| status | enum | waiting, scheduled, cancelled |
| createdAt | datetime | Criação |
| updatedAt | datetime | Atualização |

### Índices:
```prisma
@@index([organizationId])
@@index([startDate])
@@index([endDate])
@@index([professionalId])
@@index([patientId])
@@index([status])
@@index([professionalId, startDate])
```

## 9. Contratos de API

### GET /api/v1/appointments
Query params:
- `page`: número da página (padrão 1)
- `limit`: itens por página (padrão 20, máx 100)
- `startDate`: filtro data início (ISO)
- `endDate`: filtro data fim (ISO)
- `professionalId`: filtro por profissional
- `patientId`: filtro por paciente
- `status`: filtro por status

Response (200):
```json
{
  "items": [
    {
      "id": "uuid",
      "patient": { "id": "uuid", "name": "João Silva" },
      "professional": { "id": "uuid", "name": "Dr. Paulo", "specialty": "Cardiologia" },
      "appointmentType": { "id": "uuid", "name": "Consulta", "duration": 30 },
      "status": "scheduled",
      "startDate": "2026-04-15T09:00:00Z",
      "endDate": "2026-04-15T09:30:00Z",
      "duration": 30,
      "notes": "Check-up",
      "createdAt": "2026-04-10T10:00:00Z"
    }
  ],
  "pagination": { "page": 1, "limit": 20, "total": 50, "totalPages": 3 }
}
```

### POST /api/v1/appointments
Request:
```json
{
  "patientId": "uuid",
  "professionalId": "uuid",
  "appointmentTypeId": "uuid",
  "startDate": "2026-04-15T09:00:00Z",
  "notes": "Paciente dores no peito"
}
```

### GET /api/v1/appointments/calendar
Query params:
- `startDate`: data início
- `endDate`: data fim
- `view`: day | week | month
- `professionalId`: (opcional)

Response (200):
```json
{
  "view": "week",
  "startDate": "2026-04-14",
  "endDate": "2026-04-20",
  "days": [
    {
      "date": "2026-04-14",
      "slots": [
        { "time": "09:00", "appointment": {...} },
        { "time": "10:00", "available": true }
      ]
    }
  ]
}
```

### POST /api/v1/appointments/:id/cancel
Request:
```json
{ "reason": "Paciente感冒感冒感冒感冒感冒" }
```

### POST /api/v1/appointments/:id/reschedule
Request:
```json
{ "newStartDate": "2026-04-16T10:00:00Z" }
```

### GET /api/v1/professionals
Response (200):
```json
[
  {
    "id": "uuid",
    "user": { "id": "uuid", "name": "Dr. Paulo" },
    "specialty": "Cardiologia",
    "color": "#FF5722",
    "isActive": true
  }
]
```

### GET /api/v1/professionals/:id/availability
Response (200):
```json
{
  "date": "2026-04-15",
  "availableSlots": ["09:00", "09:30", "10:00", "14:00", "14:30"],
  "blockedSlots": [{ "start": "12:00", "end": "13:00", "reason": "Almoço" }]
}
```

## 10. Rotas do Frontend

| Rota | Descrição | Acesso |
|------|-----------|--------|
| `/schedule.html` | Calendário completo | Autenticado |
| `/appointments.html` | Lista de agendamentos | Autenticado |
| `/appointments-new.html` | Criar agendamento | Receptionist+ |
| `/appointments-detail.html?id=` | Detalhes do agendamento | Autenticado |
| `/professionals.html` | Lista de profissionais | Org Admin+ |

## 11. Validações e Regras de Negócio

### Appointment:
1. **StartDate**: Obrigatório, não pode ser no passado (< now)
2. **EndDate**: Calculado automaticamente se appointmentType especificado
3. **Professional**: Precisa existir e estar ativo
4. **Patient**: Precisa existir e não estar deletado
5. **Conflito**: Não permitir sobreposição de horários
6. **Cancelamento**: Motivo obrigatório se status != scheduled
7. **Reagendamento**: Cria novo registro, mantém histórico

### ScheduleBlock:
1. **Período**: startDate < endDate
2. **Não sobrepor**: Bloqueios não podem se sobrepor
3. **Afeta agenda**: Bloqueios impedem agendamentos

### Regras de Negócio:
1. Apenas um agendamento por profissional no mesmo horário
2. Professional com bloqueio não pode receber agendamento no período
3. Agendamentocancelado não conta para fila
4. Fila de espera considera data preferencial e ordem de chegada

## 12. Segurança

- Todas queries filtram por organizationId
- Apenas profissional pode ver própria agenda (com filtro adicional)
- Auditoria registra performedBy com ID do usuário logado

## 13. Critérios de Aceite

### Funcional:
- [ ] Criar agendamento com sucesso
- [ ] Validar conflitos impede sobreposição
- [ ] Cancelamento registra motivo
- [ ] Reagendamento mantém histórico
- [ ] Calendário mostra visões dia/semana/mês
- [ ] Bloqueios impedem agendamentos no período
- [ ] Lista de espera funcional

### Técnica:
- [ ] API documentada no Swagger
- [ ] DTOs validados com class-validator
- [ ] Schemas Zod em contratos
- [ ] Isolamento por organização funciona

## 14. Histórico de Versões

| Versão | Data | Descrição |
|--------|------|-----------|
| 1.0.0 | 2026-04-09 | Initial spec - Agenda e Agendamentos |