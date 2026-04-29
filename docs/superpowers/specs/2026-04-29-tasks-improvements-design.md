# SPEC: Melhorias do Módulo de Tarefas

## 1. Contexto do Problema

O módulo de tarefas (SPEC 006) foi implementado com funcionalidade básica mas apresenta várias lacunas de UX/UI:
- Não há acesso no menu de navegação (sidebar)
- Criação de tarefas usa campos de texto livre para paciente/agendamento/responsável (deveria ter dropdowns com busca)
- Kanban sem filtros avançados
- Não existe página de edição de tarefas
- UX básica sem tratamento de erros adequado

## 2. Objetivo

Melhorar o módulo de tarefas para:
- Adicionar "Tarefas" ao menu de navegação (sidebar)
- Substituir campos de texto por selectors com busca para paciente/agendamento/responsável
- Adicionar filtros avançados no Kanban (status, prioridade, responsável, data)
- Criar página de edição de tarefas (`/tasks/[id]/edit`)
- Melhorar UX com loading states e feedback visual

## 3. Escopo

### Dentro do Escopo:
- [x] Adicionar "Tarefas" ao sidebar
- [x] Selector de paciente com busca (dropdown)
- [x] Selector de agendamento com busca (dropdown)
- [x] Selector de responsável/usuário (dropdown)
- [x] Página de edição de tarefa (`/tasks/[id]/edit`)
- [x] Filtros avançados no Kanban (status, prioridade, responsável, data)
- [x] Melhorias de UX (loading, error handling)

### Fora do Escopo:
- [ ] Drag-and-drop visual melhorado
- [ ] Notificações em tempo real (WebSocket)
- [ ] Sub-tarefas
- [ ] Recorrência de tarefas
- [ ] Dependências entre tarefas

## 4. Estrutura de Alterações

### 4.1 Frontend - Menu Navigation
Arquivo: `apps/web/src/app/(authenticated)/layout.tsx`
- Adicionar item `{ href: '/tasks', label: 'Tarefas', icon: '📋' }` ao array `navItemsBase`

### 4.2 Frontend - Componentes de Selector
Criar novos componentes em `apps/web/src/components/tasks/`:
- `PatientSelect.tsx` - Dropdown com busca de pacientes
- `AppointmentSelect.tsx` - Dropdown com busca de agendamentos
- `UserSelect.tsx` - Dropdown de usuários da organização

### 4.3 Frontend - Página de Criação
Arquivo: `apps/web/src/app/(authenticated)/tasks/new/page.tsx`
- Substituir inputs de texto por componentes de selector
- Adicionar estados de loading

### 4.4 Frontend - Página de Edição
Arquivo: `apps/web/src/app/(authenticated)/tasks/[id]/edit/page.tsx` (NOVO)
- Similar ao NewTaskPage mas com dados pré-preenchidos
- Usa método PATCH /tasks/:id

### 4.5 Frontend - Kanban
Arquivo: `apps/web/src/app/(authenticated)/tasks/page.tsx`
- Adicionar componente de filtros
- Mostrar contadores por coluna
- Destacar tarefas overdue

### 4.6 Frontend - Página de Detalhes
Arquivo: `apps/web/src/app/(authenticated)/tasks/[id]/page.tsx`
- Adicionar link para editar tarefa

## 5. Componentes a Criar/Alterar

### 5.1 PatientSelect Component
```typescript
// apps/web/src/components/tasks/PatientSelect.tsx
interface PatientSelectProps {
  value?: string;
  onChange: (patientId: string | undefined) => void;
  placeholder?: string;
}

// Comportamento:
// - Search input com debounce (300ms)
// - Chama patientsApi.getPatients({ search, limit: 20 })
// - Lista dropdown com nome + documento do paciente
// - Permite limpar seleção
```

### 5.2 AppointmentSelect Component
```typescript
// apps/web/src/components/tasks/AppointmentSelect.tsx
interface AppointmentSelectProps {
  value?: string;
  onChange: (appointmentId: string | undefined) => void;
  patientId?: string;
  placeholder?: string;
}

// Comportamento:
// - Search input com debounce
// - Chama appointmentsApi.getAppointments({ patientId?, search?, limit: 20 })
// - Lista: data/hora, paciente, profissional
// - Permite limpar seleção
```

### 5.3 UserSelect Component
```typescript
// apps/web/src/components/tasks/UserSelect.tsx
interface UserSelectProps {
  value?: string;
  onChange: (userId: string | undefined) => void;
  placeholder?: string;
  excludeCurrentUser?: boolean;
}

// Comportamento:
// - Lista usuários da organização
// - Chama usersApi.listUsers({ limit: 100 })
// - Lista: nome, role
// - Permite limpar seleção
```

### 5.4 TaskFilters Component
```typescript
// apps/web/src/components/tasks/TaskFilters.tsx
interface TaskFiltersProps {
  onFilterChange: (filters: TaskListParams) => void;
  initialValues?: TaskListParams;
}

// Filtros:
// - Status: dropdown (all, pending, in_progress, completed)
// - Priority: dropdown (all, low, medium, high)
// - AssignedTo: dropdown (all, ou selecionar usuário)
// - DueDateFrom/To: date pickers
// - Search: text input
```

### 5.5 Edit Page
```typescript
// apps/web/src/app/(authenticated)/tasks/[id]/edit/page.tsx
// - GET /tasks/:id para obter dados
// - Form com campos editáveis
// - Botão "Salvar" → PATCH /tasks/:id
// - Botão "Cancelar" → back()
// - Se não tem permissão → mostrar erro ou redirect
```

## 6. Contratos de API

### Backend - Endpoints existentes que serão usados:
| Método | Rota | Uso |
|--------|------|-----|
| GET | /patients?search=X | Buscar pacientes |
| GET | /appointments?patientId=X | Buscar agendamentos |
| GET | /users?limit=100 | Buscar usuários |
| GET | /tasks?status=X&priority=X... | Listar com filtros |
| GET | /tasks/:id | Detalhar tarefa |
| PATCH | /tasks/:id | Atualizar tarefa |

### Frontend - tasks.ts já tem métodos necessários:
- `list(params)` - suporta todos os filtros
- `getById(id)`
- `create(data)`
- `update(id, data)`
- `updateStatus(id, data)`

## 7. Fluxos de Usuário

### Fluxo 1: Criar tarefa com selectors
1. Usuário acessa `/tasks`
2. Clica "Nova Tarefa"
3. Preenche título (obrigatório)
4. Opcional: seleciona descrição, prioridade, prazo
5. Opcional: busca e seleciona paciente
6. Opcional: busca e seleciona agendamento
7. Opcional: seleciona responsável
8. Clica "Criar Tarefa"
9. API retorna tarefa criada
10. Redirect para `/tasks`

### Fluxo 2: Editar tarefa
1. Usuário acessa `/tasks/[id]`
2. Clica botão "Editar" (adicionar)
3. Acessa `/tasks/[id]/edit` com dados pré-preenchidos
4. Altera campos necessários
5. Clica "Salvar"
6. API atualiza tarefa
7. Redirect para `/tasks/[id]` com dados atualizados

### Fluxo 3: Kanban com filtros
1. Usuário acessa `/tasks`
2. Vê Kanban com todas as tarefas (sem filtros)
3. Clica no painel de filtros
4. Seleciona "priority: high"
5. Kanban atualiza mostrando só tarefas de alta prioridade
6. Adiciona filtro "assignedTo: Maria"
7. Kanban mostra tarefas de alta prioridade atribuídas à Maria
8. Limpa filtros → volta a mostrar todas

### Fluxo 4: Overdue no Kanban
1. Usuário vê tarefas no Kanban
2. Tarefas com dueDate menor que hoje e status != completed
3. São destacadas com borda vermelha ou ícone de alerta
4. Contador da coluna considera overdue

## 8. UI/UX Guidelines

### Cores e Estilos (seguir existente)
- Priority high: bg-red-100 text-red-800
- Priority medium: bg-yellow-100 text-yellow-800
- Priority low: bg-green-100 text-green-800
- Status pending: border-yellow-500
- Status in_progress: border-blue-500
- Status completed: border-green-500

### Loading States
- Skeleton loading nas listas
- Spinner no botão durante submit
- Desabilitar inputs durante loading

### Error Handling
- Toast de erro em operações que falham
- Manter estado do formulário em caso de erro
- Mostrar mensagens de erro específicas da API

### Responsividade
- Kanban: 3 colunas em desktop, 1 coluna em mobile
- Selectors: funcionam bem em mobile (touch)

## 9. Critérios de Aceite

### Funcional:
- [ ] Menu mostra "Tarefas" e navega para /tasks
- [ ] Criar tarefa permite buscar e selecionar paciente via dropdown
- [ ] Criar tarefa permite buscar e selecionar agendamento via dropdown
- [ ] Criar tarefa permite selecionar responsável via dropdown
- [ ] Página /tasks/[id]/edit permite editar todos os campos da tarefa
- [ ] Kanban tem filtros funcionais por status, priority, responsável, data
- [ ] Loading states aparecem durante operações de fetch
- [ ] Erros são tratados e mostrados ao usuário

### Visual:
- [ ] Dropdowns funcionam com busca (debounced, 300ms)
- [ ] Filtros mantêm estado durante navegação
- [ ] Tarefas overdue são destacadas visualmente
- [ ] Contadores nas colunas do Kanban

### Técnica:
- [ ] Build compila sem erros (`npm run build`)
- [ ] TypeScript strict passa (`npm run typecheck`)
- [ ] ESLint não tem erros críticos

## 10. Histórico de Versões

| Versão | Data | Descrição |
|--------|------|-----------|
| 1.0.0 | 2026-04-29 | Initial spec - Melhorias do módulo de tarefas |

---

**Contato**: docs/specs/006-tasks.md (spec original)