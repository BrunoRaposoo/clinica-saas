# Clínica SaaS

Sistema de gestão para clínicas e consultórios médicos. SaaS multi-tenant com controle de acesso baseado em papéis (RBAC).

## Visão Geral

| Aspecto | Detalhe |
|---------|---------|
| **Tipo** | SaaS de gestão de clínicas |
| **Arquitetura** | Monólito modular (monorepo) |
| **Backend** | NestJS 10.x + Prisma + PostgreSQL |
| **Frontend** | Next.js 14.x (App Router) + React 18.x |
| **Autenticação** | JWT com access/refresh tokens |
| **Multi-tenant** | Isolamento por organização |

## Stack Tecnológico

### Backend
- **Runtime**: Node.js >= 20
- **Framework**: NestJS 10.x
- **ORM**: Prisma 5.x
- **Banco**: PostgreSQL 16
- **Cache**: Redis 7
- **Auth**: Passport JWT + bcrypt
- **Docs**: Swagger/OpenAPI
- **Validação**: class-validator + Zod

### Frontend
- **Framework**: Next.js 14.x (App Router)
- **UI**: React 18.x
- **Estilização**: Tailwind CSS + shadcn/ui
- **Estado**: TanStack React Query
- **Ícones**: Lucide React

### Infraestrutura
- **Container**: Docker + Docker Compose
- **Package Manager**: Yarn 1.x

## Estrutura do Repositório

```
clinica-saas/
├── apps/
│   ├── api/                    # Backend NestJS
│   │   ├── src/
│   │   │   ├── modules/        # Módulos de domínio
│   │   │   │   ├── auth/       # Autenticação
│   │   │   │   ├── users/      # Usuários
│   │   │   │   ├── organizations/ # Organizações
│   │   │   │   ├── patients/   # Pacientes
│   │   │   │   ├── appointments/ # Agendamentos
│   │   │   │   ├── professionals/ # Profissionais
│   │   │   │   ├── schedule-blocks/ # Bloqueios de agenda
│   │   │   │   ├── communications/ # Comunicações
│   │   │   │   ├── documents/  # Documentos
│   │   │   │   ├── tasks/      # Tarefas
│   │   │   │   ├── finance/   # Financeiro
│   │   │   │   ├── dashboard/ # Dashboard
│   │   │   │   └── integrations/ # Integrações
│   │   │   ├── common/        # Componentes compartilhados
│   │   │   │   ├── prisma/    # Prisma service
│   │   │   │   ├── guards/    # Guards (JWT, Rate limit)
│   │   │   │   ├── decorators/ # Decoradores customizados
│   │   │   │   ├── interceptors/ # Interceptadores
│   │   │   │   └── filters/   # Filtros de exceção
│   │   │   └── prisma/
│   │   │       └── schema.prisma
│   │   └── package.json
│   ├── web/                    # Frontend Next.js
│   │   ├── src/
│   │   │   ├── app/           # App Router pages
│   │   │   │   ├── (authenticated)/ # Rotas protegidas
│   │   │   │   └── (public)/  # Rotas públicas
│   │   │   ├── components/   # Componentes React
│   │   │   ├── lib/          # API clients e utilitários
│   │   │   ├── hooks/        # Custom hooks
│   │   │   └── providers/    # React Context providers
│   │   └── package.json
│   └── worker/                 # Background jobs (reservado)
├── packages/
│   ├── contracts/             # Tipos, schemas Zod, enums
│   ├── shared/                # Utilitários comuns
│   └── ui/                    # Componentes UI (shadcn)
├── docs/                      # Documentação
│   ├── specs/                # Especificações de features
│   ├── ARCHITECTURE.md
│   └── DOMAIN.md
└── infra/                     # Configurações de infraestrutura
    └── docker-compose.yml
```

## Pré-requisitos

- **Node.js**: >= 20.0.0
- **Yarn**: 1.x (package manager do projeto)
- **Docker**: >= 20.x
- **Docker Compose**: >= 2.x
- **PostgreSQL**: 16 (fornecido via Docker)
- **Redis**: 7 (fornecido via Docker)

## Instalação

### 1. Clone do Repositório

```bash
git clone <repositorio>
cd clinica-saas
```

### 2. Instalação de Dependências

```bash
yarn install
```

Este comando instala todas as dependências do monorepo (apps + packages) usando workspaces do Yarn.

### 3. Variáveis de Ambiente

O projeto já inclui um arquivo `.env` com configurações padrão. Para desenvolvimento local:

```bash
# Backend (.env)
DATABASE_URL="postgresql://postgres:postgres@localhost:5433/clinica_saas?schema=public"
REDIS_URL="redis://localhost:6379"
NODE_ENV="development"
PORT=3001
```

**Nota**: A porta do PostgreSQL foi alterada para 5433 para evitar conflito com instalações locais.

### 4. Infraestrutura (Docker)

```bash
cd infra && docker compose up -d
```

Serviços iniciados:
- **PostgreSQL**: `localhost:5433`
- **Redis**: `localhost:6379`

### 5. Banco de Dados

```bash
# Gerar Prisma Client
npm run db:push

# Criar tabelas no banco
npm run db:generate
```

### 6. Build

```bash
# Build completo (packages + apps)
npm run build

# Ou individualmente
npm run build:api
npm run build:web
```

## Execução

### Desenvolvimento

```bash
# Terminal 1 - Backend (porta 3001)
npm run dev:api

# Terminal 2 - Frontend (porta 3000)
npm run dev:web
```

### Produção

```bash
# Backend
cd apps/api && npm run start

# Frontend
cd apps/web && npm run start
```

## URLs de Acesso

| Serviço | URL |
|---------|-----|
| Frontend | http://localhost:3000 |
| Backend API | http://localhost:3001/api/v1 |
| Swagger Docs | http://localhost:3001/api/docs |
| Health Check | http://localhost:3001/api/v1/health |

## Funcionalidades

### Módulos Implementados

| Módulo | Descrição | Status |
|--------|-----------|--------|
| **Auth** | Login, registro, recuperação de senha, JWT | ✅ |
| **Users** | CRUD de usuários, roles | ✅ |
| **Organizations** | CRUD de organizações (clinicas) | ✅ |
| **Roles/Permissions** | RBAC completo | ✅ |
| **Patients** | Gestão de pacientes + contatos | ✅ |
| **Appointments** | Agendamentos com calendário | ✅ |
| **Professionals** | Profissionais de saúde | ✅ |
| **Schedule Blocks** | Bloqueios de agenda | ✅ |
| **Communications** | Mensagens e templates | ✅ |
| **Documents** | Upload e gestão de arquivos | ✅ |
| **Tasks** | Gestão de tarefas | ✅ |
| **Finance** | Cobranças e pagamentos | ✅ |
| **Dashboard** | Métricas e relatórios | ✅ |
| **Integrations** | Integrações externas | ✅ |

### Entidades do Domínio

- **Organization** - Clínica/organização (tenant)
- **User** - Usuários do sistema
- **Role** - Papéis (super_admin, org_admin, professional, receptionist, support)
- **Permission** - Permissões granulares
- **Patient** - Pacientes com contatos
- **Professional** - Profissionais de saúde
- **Appointment** - Agendamentos
- **AppointmentType** - Tipos de atendimento

### API Endpoints

O backend expõe API RESTful em `/api/v1/` com os seguintes módulos:

- `GET /health` - Health check
- `POST /auth/login` - Login
- `POST /auth/register` - Registro
- `POST /auth/refresh` - Refresh token
- `GET /users` - Listar usuários
- `GET /organizations` - Listar organizações
- `GET /patients` - Listar pacientes
- `GET /appointments` - Listar agendamentos
- `GET /appointments/calendar` - Calendário
- `GET /professionals` - Listar profissionais
- `GET /documents` - Listar documentos
- `GET /tasks` - Listar tarefas
- `GET /finance/charges` - Listar cobranças
- `GET /dashboard/summary` - Métricas

Consulte a documentação Swagger em http://localhost:3001/api/docs para todos os endpoints.

## Roles e Permissões

| Role | Descrição | Permissões |
|------|-----------|-----------|
| **super_admin** | Administrador do sistema | Todas - acesso global |
| **org_admin** | Administrador da organização | CRUD completo da organização |
| **professional** | Profissional de saúde | Ver pacientes, atender |
| **receptionist** | Recepcionista | Agendar, gerenciar agenda |
| **support** | Suporte técnico | Apenas leitura |

### Permissões Granulares

```
users.read, users.write, users.delete
organizations.read, organizations.write, organizations.delete
roles.read, roles.write
appointments.read, appointments.write
patients.read, patients.write
reports.read
settings.read, settings.write
```

## Credenciais de Teste (Seed)

O sistema inclui dados de teste criados automaticamente na inicialização:

| Email | Senha | Nome | Role |
|-------|-------|------|------|
| admin@clinicademo.com.br | Admin123 | Administrador Demo | org_admin |
| suporte@clinicademo.com.br | Support123 | Suporte Demo | support |

### Organização Seedada

- **Nome**: Clínica Demo
- **CNPJ**: 00.000.000/0001-00

## Scripts Disponíveis

### Desenvolvimento
```bash
npm run dev:api        # Inicia backend
npm run dev:web        # Inicia frontend
npm run dev:kill       # Para servidores de dev
```

### Build
```bash
npm run build          # Build completo
npm run build:api      # Build backend
npm run build:web      # Build frontend
```

### Database
```bash
npm run db:generate    # Gera Prisma Client
npm run db:push        # Cria tabelas no banco
npm run db:migrate     # Executa migrations
```

### Qualidade
```bash
npm run lint           # Executa ESLint
npm run lint:fix       # Corrige problemas de lint
npm run format         # Prettier formatação
npm run typecheck      # Verificação de tipos
npm run test           # Executa testes
```

## Path Aliases

O projeto usa path aliases para importações mais limpas:

```json
{
  "@clinica-saas/contracts": "packages/contracts/src",
  "@clinica-saas/shared": "packages/shared/src",
  "@clinica-saas/ui": "packages/ui/src"
}
```

## Padrões de Código

- **TypeScript**: Strict mode
- **Linting**: ESLint + Prettier
- **Nomenclatura**:
  - Variáveis: camelCase
  - Classes/Componentes: PascalCase
  - Arquivos: kebab-case
- **Commits**: Conventional commits (feat:, fix:, docs:, refactor:)
- **Feature branch**: Uma feature por branch, squash ao merge

## Documentação

- `docs/ARCHITECTURE.md` - Arquitetura detalhada
- `docs/DOMAIN.md` - Modelo de domínio
- `docs/specs/` - Especificações de cada feature
- Swagger em `/api/docs`

## Configuração de Porta

Se houver conflito de porta, você pode alterar:

```bash
# Backend
# Editar apps/api/.env -> PORT=3002

# PostgreSQL
# Editar infra/docker-compose.yml -> ports: "5434:5432"
```

## Troubleshooting

### PostgreSQL não inicia
```bash
# Verificar se há conflito com instalação local
sudo systemctl stop postgresql  # Linux
# ou alterar porta no docker-compose.yml
```

### Erro de conexão com banco
```bash
# Verificar se o container está rodando
docker ps

# Ver logs do container
docker logs clinica-saas-postgres

# Testar conexão
psql -h localhost -p 5433 -U postgres -d clinica_saas
```

### Build falha
```bash
# Limpar cache e reinstallar
rm -rf node_modules apps/*/node_modules
yarn install
npm run build
```

## Licença

Privado - Todos os direitos reservados