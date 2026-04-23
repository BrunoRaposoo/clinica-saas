# SPEC: Cadastro de Profissionais via Interface Web

**Data:** 2026-04-17
**Status:** Aprovado
**Abordagem:** A - Tudo em um passo

---

## 1. Contexto

O sistema já possui:
- Backend API para criar usuários (`POST /users`)
- Backend API para criar profissionais (`POST /settings/professionals`)
- Frontend para configurações gerais

**Falta:** Página de cadastro de profissionais no frontend.

---

## 2. Objetivo

Criar interface web para cadastro de profissionais da clínica, criando usuário e profissional em um único passo.

---

## 3. Escopo

### Dentro do Escopo:
- [x] Página `/settings/professionals` com listagem
- [x] Formulário para criar profissional + usuário
- [x] Campos: nome, email, senha, specialty, registro, cor, tipo atendimento
- [x] Validações no frontend
- [x] Feedback visual (sucesso/erro)

### Fora do Escopo:
- [ ] Edição de profissionais (futuro)
- [ ] Exclusão de profissionais (futuro)
- [ ] Gestão de permissões granulares (futuro)

---

## 4. Fluxo de Uso

```
1. Usuário acessa /settings/professionals
2. Vê lista de profissionais existentes
3. Clica em "Novo Profissional"
4. Preenche formulário:
   - Nome completo
   - Email (para login)
   - Senha (primeiro acesso)
   - Specialty (opcional)
   - Registro profissional (opcional)
   - Cor (para agenda)
   - Tipo de atendimento (opcional)
5. Clica em "Salvar"
6. Sistema cria User + Professional
7. Feedback de sucesso
8. Profissional aparece na lista
```

---

## 5. Campos do Formulário

| Campo | Tipo | Obrigatório | Validação | Default |
|-------|------|-------------|-----------|---------|
| name | text | ✅ | Min 2, Max 255 | - |
| email | email | ✅ | Email válido, único | - |
| password | password | ✅ | Min 6 | - |
| specialty | text | ❌ | Max 100 | "" |
| registerNumber | text | ❌ | Max 50 | null |
| color | color | ❌ | Formato hex | "#3B82F6" |
| appointmentTypeId | select | ❌ | Válido service type | null |
| isActive | boolean | ❌ | - | true |

---

## 6. Estrutura de Arquivos

### Frontend (apps/web/src/app/(authenticated)/settings/)
```
professionals/
└── page.tsx          # Listagem + formulário
```

### API Utilizada:
- `settingsApi.listProfessionals()` - Buscar lista
- `usersApi.createUser()` ou `authApi.register()` - Criar usuário
- `settingsApi.createProfessional()` - Criar profissional

---

## 7. Contratos de API

### Criar Usuário (Backend)
```
POST /api/v1/users
Body: {
  email: string,
  password: string,
  name: string,
  roleId: "00000000-0000-0000-0000-000000000003" // professional
}
Response: { id, email, name, roleId, ... }
```

### Criar Profissional (Backend)
```
POST /api/v1/settings/professionals
Body: {
  userId: string,  // ID do usuário criado acima
  specialty?: string,
  registerNumber?: string,
  color?: string,
  appointmentTypeId?: string
}
Response: { id, userId, ... }
```

---

## 8. Tratamento de Erros

| Cenário | Mensagem |
|--------|---------|
| Email já existe | "Este email já está em uso" |
| Email inválido | "Email inválido" |
| Senha muito curta | "Senha deve ter pelo menos 6 caracteres" |
| Erro no servidor | "Erro ao criar profissional. Tente novamente." |

---

## 9. Critérios de Aceite

- [ ] Página listando profissionais existentes
- [ ] Formulário com todos os campos definidos
- [ ] Criação de usuário + profissional em um passo
- [ ] Validações de campos obrigatórios
- [ ] Feedback visual de sucesso
- [ ] Feedback visual de erro
- [ ] Profissional aparece na lista após criação
- [ ] Profissional selecionável em agendamentos

---

## 10. Segurança

- Apenas `org_admin` pode criar profissionais
- Validar email único antes de criar
- Senha deve atender requisitos mínimos
- Profissional recebe role `professional` automaticamente