# SPEC: Detalhamento de Agendamentos na Agenda

**Data:** 2026-04-27
**Status:** Aprovado
**Abordagem:**Modal com Details

---

## 1. Contexto

O sistema já possui página de agenda em `/schedule` que exibe dias com slots de horários. Cada slot mostra se há agendamento, blockage ou está disponível.

**Falta:** Informações detalhadas dos agendamentos do dia - contador e modal com detalhes.

---

## 2. Objetivo

Ao visualizar a agenda, o usuário deve ver:
1. Contador de agendamentos no cabeçalho de cada dia
2. Ao clicar no dia, abrir modal com lista detalada de todos os atendimentos

---

## 3. Escopo

### Dentro do Escopo:
- [x] Contador de agendamentos no cabeçalho de cada dia
- [x] Badge azul quando há agendamentos
- [x] Modal com detalhes ao clicar
- [x] Modal mostra: horário, paciente, profissional, cor, especialidade, tipo, status
- [x] Funciona com múltiplos profissionais no mesmo dia
- [x] Mensagem quando dia sem agendamentos

### Fora do Escopo:
- [ ] Edição de agendamento pelo modal (futuro)
- [ ] Cancelamento pelo modal (futuro)

---

## 4. Mudanças Implementadas

### 4.1 Backend (appointments.service.ts)
Retorno do calendar agora inclui:
```typescript
appointment: {
  patient: { name: string };
  professional: {
    name: string;
    specialty: string;
    color: string;
  };
  appointmentType?: { name: string };
  status: AppointmentStatus;
  startDate: string;
  endDate: string;
}
```

### 4.2 Frontend (DayDetailsModal.tsx)
- Novo componente em `apps/web/src/components/schedule/`
- Modal com lista de cards de agendamento
- Badge colorida do profissional
- Especialidade e tipo de atendimento

### 4.3 Frontend (schedule/page.tsx)
- Estado `selectedDay` para controlar modal
- Contador no cabeçalho do dia
- Click no dia abre modal

---

## 5. Arquivos Modificados

| Arquivo | Ação |
|--------|------|
| `apps/api/src/modules/appointments/appointments.service.ts` | Adicionar campos specialty/color/appointmentType |
| `apps/web/src/components/schedule/DayDetailsModal.tsx` | Novo componente |
| `apps/web/src/app/(authenticated)/schedule/page.tsx` | Adicionar contador + modal |

---

## 6. Critérios de Aceite

- [x] Contador aparece no cabeçalho de cada dia
- [x] Badge azul mostra quantidade
- [x] Ao clicar no dia, modal abre
- [x] Modal lista todos os agendamentos do dia
- [x] Cada card mostra horário, paciente, profissional, cor, especialidade, tipo, status
- [x] Múltiplos profissionais no mesmo dia funciona
- [x] Dia sem agendamentos mostra mensagem
- [x] Modal fecha ao clicar X ou fora

---

## 7. Teste Visual

```
┌─────────────────────────────────────────┐
│  sex 03 (3) [3 agendamentos]           │  ← Cabeçalho clicável
├─────────────────────────────────────────┤
│  08:00 │ 09:00 │ 10:00 │ ...      │
└─────────────────────────────────────────┘

[Clique no dia abre modal]

┌─────────────────────────────────────────┐
│  Agendamentos - sexta-feira, 3 de abril   │
│  de 2026                         ✕       │
├─────────────────────────────────────────┤
│  ┌───────────────────────────────┐    │
│  │ 09:00  Maria Silva        │    │
│  │ Nutricionista(verde) • │    │
│  │                Confirmado │    │
│  └───────────────────────────────┘    │
│  ┌───────────────────────────────┐    │
│  │ 10:00  João Santos         │    │
│  │ Psicólogo(rosa) •          │    │
│  │                Agendado   │    │
│  └───────────────────────────────┘    │
│  ┌───────────────────────────────┐    │
│  │ 14:00  Ana Pereira         │    │
│  │ Nutricionista(verde) •      │    │
│  │                Agendado   │    │
│  └───────────────────────────────┘    │
│                                     │
│  Total: 3 agendamentos      [Fechar] │
└─────────────────────────────────────┘
```

---

## 8. Notas

- Tipos em `packages/contracts` já tinham a estrutura necesaria
- Backend apenas precisou retornar mais campos
- Frontend reutilizou tipos existentes
- Modal suporta múltiplos profissionais no mesmo dia