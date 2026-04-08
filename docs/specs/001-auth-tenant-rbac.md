# SPEC 001: Autenticação, Tenant e RBAC

## 1. Contexto do Problema

O sistema precisa de uma fundação de segurança que suporte:
- Autenticação de usuários com credenciais seguras
- Sessão persistente com JWT
- Multi-tenant (múltiplas organizações isoladas)
- Controle de acesso baseado em papéis (RBAC)

## 2. Objetivo do Módulo

Criar a infraestrutura de identidade e acesso do sistema:
- autenticação e autorização
- gestão de usuários
- gestão de organizações
- gestão de papéis e permissões
- isolamento de dados por organização

## 3. Escopo da Feature

### Dentro do Escopo:
- [x] Login com email/senha
- [x] Logout (invalidação de token)
- [x] Registro de novo usuário
- [x] Recuperação de senha (token por email)
- [x] Redefinição de senha
- [x] CRUD de usuários
- [x] CRUD de organizações
- [x] CRUD de roles
- [x] CRUD de permissions
- [x] Atribuição de roles a usuários
- [x] Verificação de permissões em rotas
- [x] Isolamento de dados por organização

### Fora do Escopo:
- [ ] Autenticação OAuth (Google, etc)
- [ ] SSO corporativo
- [ ] 2FA/MFA
- [ ] Impersonation (fazer-se passar por outro usuário)
- [ ] Log de auditoria completo
- [ ] Notificações por email (implementar depois)
- [ ] Pacientes, agenda, documentos, financeiro

## 4. Personas e Papéis

### Papéis do Sistema (UserRole):
| Role | Descrição | Permissões |
|------|-----------|------------|
| `super_admin` | Administrador do sistema | Todas |
| `org_admin` | Administrador da organização | Gerenciar usuários, configurações |
| `professional` | Profissional de saúde | Ver pacientes, atender |
| `receptionist` | Recepcionista | Agendar, gerenciar agenda |
| `support` | Suporte técnico | Somente leitura |

### Permissões (Permission):
```
users.read, users.write, users.delete
organizations.read, organizations.write, organizations.delete
roles.read, roles.write
appointments.read, appointments.write
patients.read, patients.write
reports.read
settings.read, settings.write
```

## 5. Fluxos Principais

### Fluxo 1: Login
```
1. Usuário acessa /login
2. Insere email e senha
3. Backend valida credenciais
4. Gera JWT (access + refresh)
5. Frontend armazena tokens
6. Redireciona para /dashboard
```

### Fluxo 2: Recuperação de Senha
```
1. Usuário acessa /forgot-password
2. Insere email
3. Backend gera token de reset
4. Backend envia email (mock)
5. Usuário acessa link no email
6. Nova senha definida
7. Token invalidado
```

### Fluxo 3: Isolamento por Tenant
```
1. Usuário autenticado tem organizationId no token
2. Guard verifica token e extrai organizationId
3. Queries automaticamente filtram por organizationId
4. Usuário só vê dados da sua organização
```

## 6. Requisitos Funcionais

### Auth Module
- POST `/auth/login` - Login com credenciais
- POST `/auth/logout` - Logout (invalida refresh token)
- POST `/auth/register` - Registrar novo usuário
- POST `/auth/refresh` - Atualizar access token
- POST `/auth/forgot-password` - Solicitar reset de senha
- POST `/auth/reset-password` - Definir nova senha
- GET `/auth/me` - Obter usuário atual

### Users Module
- GET `/users` - Listar usuários (paginado, filtrado por organization)
- GET `/users/:id` - Detalhar usuário
- POST `/users` - Criar usuário
- PATCH `/users/:id` - Atualizar usuário
- DELETE `/users/:id` - Inativar usuário

### Organizations Module
- GET `/organizations` - Listar organizações
- GET `/organizations/:id` - Detalhar organização
- POST `/organizations` - Criar organização
- PATCH `/organizations/:id` - Atualizar organização
- DELETE `/organizations/:id` - Inativar organização

### Roles Module
- GET `/roles` - Listar roles
- GET `/roles/:id` - Detalhar role com permissões
- POST `/roles` - Criar role
- PATCH `/roles/:id` - Atualizar role
- DELETE `/roles/:id` - Inativar role
- POST `/roles/:id/permissions` - Atribuir permissões

### Permissions Module
- GET `/permissions` - Listar todas as permissões

## 7. Requisitos Não Funcionais

- **Performance**: Login < 200ms
- **Segurança**: Senhas hasheadas com bcrypt (cost 12)
- **JWT**: Access token 15min, Refresh token 7 dias
- **Validação**: Todos os inputs com class-validator + Zod
- **Documentação**: Swagger com exemplos

## 8. Modelo de Dados

### Entidade: Organization
| Campo | Tipo | Descrição |
|-------|------|-----------|
| id | UUID | PK |
| name | string | Nome da organização |
| document | string | CNPJ/CPF |
| email | string? | Email de contato |
| phone | string? | Telefone |
| address | string? | Endereço |
| isActive | boolean | Status |
| createdAt | datetime | Criação |
| updatedAt | datetime | Atualização |

### Entidade: User
| Campo | Tipo | Descrição |
|-------|------|-----------|
| id | UUID | PK |
| email | string | Email único |
| password | string | Senha hasheada |
| name | string | Nome completo |
| organizationId | UUID | FK Organization |
| roleId | UUID | FK Role |
| isActive | boolean | Status |
| lastLoginAt | datetime? | Último login |
| createdAt | datetime | Criação |
| updatedAt | datetime | Atualização |

### Entidade: Role
| Campo | Tipo | Descrição |
|-------|------|-----------|
| id | UUID | PK |
| name | string | Nome único (super_admin, org_admin, etc) |
| description | string? | Descrição |
| isSystem | boolean | Role do sistema (não pode deletar) |
| createdAt | datetime | Criação |
| updatedAt | datetime | Atualização |

### Entidade: Permission
| Campo | Tipo | Descrição |
|-------|------|-----------|
| id | UUID | PK |
| name | string | Nome único (users.read, etc) |
| description | string? | Descrição |
| createdAt | datetime | Criação |

### Entidade: UserRole (M-N between User and Role)
| Campo | Tipo | Descrição |
|-------|------|-----------|
| userId | UUID | FK User |
| roleId | UUID | FK Role |

### Entidade: RolePermission (M-N between Role and Permission)
| Campo | Tipo | Descrição |
|-------|------|-----------|
| roleId | UUID | FK Role |
| permissionId | UUID | FK Permission |

### Entidade: PasswordResetToken
| Campo | Tipo | Descrição |
|-------|------|-----------|
| id | UUID | PK |
| userId | UUID | FK User |
| token | string | Token de reset |
| expiresAt | datetime | Expiração |
| usedAt | datetime? | Quando foi usado |
| createdAt | datetime | Criação |

### Entidade: RefreshToken
| Campo | Tipo | Descrição |
|-------|------|-----------|
| id | UUID | PK |
| userId | UUID | FK User |
| token | string | Refresh token |
| expiresAt | datetime | Expiração |
| revokedAt | datetime? | Quando foi revogado |
| createdAt | datetime | Criação |

## 9. Contratos de API

### POST /api/v1/auth/login
Request:
```json
{ "email": "user@clinica.com", "password": "senha123" }
```
Response (200):
```json
{
  "accessToken": "eyJhbG...",
  "refreshToken": "eyJhbG...",
  "expiresIn": 900,
  "user": { "id": "...", "email": "...", "name": "...", "role": "org_admin" }
}
```

### POST /api/v1/auth/register
Request:
```json
{
  "email": "user@clinica.com",
  "password": "Senha123",
  "name": "João Silva",
  "organizationId": "uuid"
}
```

### POST /api/v1/auth/refresh
Headers: `Cookie: refreshToken=<refresh_token>`
Response (200):
```json
{
  "accessToken": "eyJhbG...",
  "expiresIn": 900
}
```

### POST /api/v1/auth/logout
Headers: `Authorization: Bearer <accessToken>`
Response (200): `{ "success": true }`

### POST /api/v1/auth/forgot-password
Request: `{ "email": "user@clinica.com" }`
Response (200): `{ "success": true, "message": "Email de recuperação enviado" }`

### POST /api/v1/auth/reset-password
Request:
```json
{
  "token": "abc123token",
  "newPassword": "NovaSenha123"
}
```

### GET /api/v1/users
Headers: `Authorization: Bearer <accessToken>`
Response (200):
```json
{
  "items": [
    { "id": "...", "email": "...", "name": "...", "role": "...", "isActive": true }
  ],
  "pagination": { "page": 1, "limit": 20, "total": 100, "totalPages": 5 }
}
```

## 10. Rotas do Frontend

| Rota | Descrição | Acesso |
|------|-----------|--------|
| `/login` | Login | Público |
| `/forgot-password` | Recuperar senha | Público |
| `/reset-password/[token]` | Nova senha | Público |
| `/dashboard` | Dashboard | Autenticado |
| `/users` | Gestão de usuários | Autenticado |
| `/organizations` | Gestão de organizações | Org Admin+ |
| `/roles` | Gestão de roles | Super Admin |
| `/settings` | Configurações | Org Admin+ |

## 11. Validações e Regras de Negócio

1. **Email único**: Não permitir dois usuários com mesmo email no sistema
2. **Senha mínima**: Mínimo 8 caracteres, 1 maiúscula, 1 número
3. **Token reset**: Válido por 1 hora, usado apenas uma vez
4. **Refresh token**: Válido por 7 dias, pode ser revogado
5. **Tentativas**: Bloquear após 5 tentativas falhas por 15 min (in-memory)
6. **Isolamento**: Toda query deve filtrar por organizationId (exceto super_admin)

## 12. Segurança

- `bcrypt` cost 12 para hash de senhas
- JWT com `jti` (JWT ID) para revogação
- Rate limiting no endpoint de login (5 tentativas/15min)
- Headers: `X-Content-Type-Options: nosniff`, `X-Frame-Options: DENY`
- CORS configurado para frontend apenas
- Todos os endpoints de usuário filtram por organização

## 13. Estratégia de Sessão

- Access Token: 15 minutos, armazenado em memória (não localStorage)
- Refresh Token: 7 dias, stored em httpOnly cookie
- Logout: Refresh token marcado como revoked no DB
- Simultâneos: Permitir múltiplos dispositivos

## 14. Critérios de Aceite

### Funcional:
- [ ] Login com credenciais corretas retorna tokens
- [ ] Login com credenciais incorretas retorna 401
- [ ] Access token expirado retorna 401
- [ ] Refresh token renova access token
- [ ] Logout invalida refresh token
- [ ] Recuperação de senha funciona (token gerado)
- [ ] Reset de senha altera senha corretamente
- [ ] Usuário só vê dados da sua organização
- [ ] Routes protegida redireciona para login

### Técnica:
- [ ] Password hasheada com bcrypt
- [ ] Tokens JWT com payload correto
- [ ] Swagger documentado
- [ ] DTOs validados
- [ ] Types compartilhados no contracts
- [ ] Testes unitários para auth e users

## 15. Plano de Testes

1. **Unitários**: Service de auth, service de users
2. **Integração**: Endpoints de auth (login, refresh, logout)
3. **E2E**: Fluxo completo login -> dashboard

## 16. Sequência de Implementação

### Fase 1: Database e Contracts
1. Atualizar schema Prisma
2. Atualizar packages/contracts
3. Gerar Prisma Client

### Fase 2: Backend Auth
4. Criar auth module (login, register, logout)
5. Criar JWT strategy
6. Criar guards (JwtAuthGuard, RolesGuard)
7. Implementar forgot/reset password

### Fase 3: Backend CRUDs
8. Criar users module (CRUD)
9. Criar organizations module (CRUD)
10. Criar roles/permissions module

### Fase 4: Frontend Auth
11. Criar página /login
12. Criar SessionProvider
13. Implementar proteção de rotas

### Fase 5: Frontend Layout
14. Criar layout (authenticated)
15. Criar sidebar/header
16. Criar página /dashboard básica

## 17. Decisões Técnicas

- **Rate Limiting**: In-memory com interface para Redis futuro
- **Email**: Mock via interface IEmailService (console.log + arquivo local)
- **Testes**: Jest (backend)
- **Estilo**: TypeScript strict + ESLint + Prettier

## 18. Histórico de Versões

| Versão | Data | Descrição |
|--------|------|------------|
| 1.0.0 | 2026-04-08 | Initial spec - Auth, Tenant, RBAC |