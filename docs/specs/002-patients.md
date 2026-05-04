# SPEC 002: Módulo de Pacientes

## 1. Contexto do Problema

O sistema de gestão de clínicas precisa gerenciar pacientes como entidade central do negócio. Cada paciente deve estar associado a uma organização (tenant) e ter seus dados protegidos por isolamento. O módulo deve suportar múltiplos contatos por paciente (responsável, emergência, etc.), busca eficiente e auditoria completa de operações.

## 2. Objetivo do Módulo

Criar sistema completo de gestão de pacientes com:
- CRUD completo com paginação
- Múltiplos contatos por paciente
- Busca por nome, documento (CPF) e telefone
- Soft delete para preservação de dados
- Auditoria de todas as operações
- Isolamento por organização

## 3. Escopo da Feature

### Dentro do Escopo:
- [x] CRUD completo de pacientes
- [x] Múltiplos contatos por paciente (emergência, responsável, etc)
- [x] Busca por nome (parcial), documento (CPF), telefone (parcial)
- [x] Paginação com filtros (status, data de criação)
- [x] Soft delete (deletedAt)
- [x] Auditoria (criação, edição, exclusão)
- [x] Tags básica para categorização
- [x] Endereço estruturado

### Fora do Escopo:
- [ ] Agenda e agendamentos
- [ ] Mensagens e notificações
- [ ] Upload de documentos
- [ ] Prontuário clínico
- [ ] Histórico financeiro
- [ ] Integrações externas (WhatsApp, etc)

## 4. Personas e Papéis

### Papéis que podem gerenciar pacientes:
| Role | Permissão |
|------|-----------|
| `super_admin` | Todas |
| `org_admin` | CRUD completo |
| `professional` | Leitura e edição básica |
| `receptionist` | CRUD completo |
| `support` | Apenas leitura |

## 5. Fluxos Principais

### Fluxo 1: Criar Paciente
```
1. Usuário acessa /patients/new
2. Preenche formulário com dados do paciente
3. Adiciona um ou mais contatos
4. Submete formulário
5. Backend valida dados
6. Backend cria paciente + contatos
7. Backend registra auditoria (create)
8. Retorna paciente criado
9. Frontend redireciona para detalhes
```

### Fluxo 2: Buscar Pacientes
```
1. Usuário acessa /patients
2. Digita termo na busca
3. Backend pesquisa por nome, documento ou telefone
4. Retorna resultados paginados
5. Frontend exibe lista
```

### Fluxo 3: Editar Paciente
```
1. Usuário acessa /patients/[id]/edit
2. Modifica dados do formulário
3. Adiciona/remove contatos
4. Submete formulário
5. Backend valida dados
6. Backend atualiza paciente + contatos
7. Backend registra auditoria (update)
8. Retorna paciente atualizado
```

### Fluxo 4: Excluir Paciente (Soft Delete)
```
1. Usuário clica em excluir
2. Backend marca deletedAt = now()
3. Backend registra auditoria (delete)
4. Paciente não aparece mais na listagem
5. Detail mostra status "excluído"
```

## 6. Requisitos Funcionais

### Patients Module
- `GET /patients` - Listar pacientes (paginado, filtrado)
  - Query params: page, limit, search, document, phone, isActive, createdAtFrom, createdAtTo
- `GET /patients/:id` - Detalhar paciente com contatos
- `POST /patients` - Criar paciente com contatos
- `PATCH /patients/:id` - Atualizar paciente e contatos
- `DELETE /patients/:id` - Soft delete paciente

### Patient Contacts Module
- `GET /patients/:id/contacts` - Listar contatos do paciente
- `POST /patients/:id/contacts` - Criar contato
- `PATCH /contacts/:id` - Atualizar contato
- `DELETE /contacts/:id` - Excluir contato

### Audit
- `GET /patients/:id/audit` - Ver histórico de alterações

## 7. Requisitos Não Funcionais

- **Performance**: Busca < 200ms
- **Validação**: Todos inputs com class-validator + Zod
- **Segurança**: Isolamento por organizationId em todas queries
- **Documentação**: Swagger documentado

## 8. Modelo de Dados

### Entidade: Patient
| Campo | Tipo | Descrição |
|-------|------|-----------|
| id | UUID | PK |
| organizationId | UUID | FK Organization (obrigatório) |
| name | string | Nome completo (obrigatório) |
| email | string? | Email |
| phone | string? | Telefone principal |
| document | string? | CPF |
| birthDate | date? | Data de nascimento |
| gender | enum? | male, female, other |
| addressStreet | string? | Rua |
| addressNumber | string? | Número |
| addressComplement | string? | Complemento |
| addressDistrict | string? | Bairro |
| addressCity | string? | Cidade |
| addressState | string? | Estado |
| addressZipCode | string? | CEP |
| notes | string? | Observações |
| tags | string[] | Tags (array) |
| isActive | boolean | Status (padrão true) |
| deletedAt | datetime? | Soft delete |
| createdAt | datetime | Criação |
| updatedAt | datetime | Atualização |

### Entidade: PatientContact
| Campo | Tipo | Descrição |
|-------|------|-----------|
| id | UUID | PK |
| patientId | UUID | FK Patient (obrigatório) |
| name | string | Nome do contato (obrigatório) |
| relationship | string | Parentesco/Relação (obrigatório) |
| phone | string? | Telefone |
| email | string? | Email |
| isPrimary | boolean | Contato principal (padrão false) |
| createdAt | datetime | Criação |
| updatedAt | datetime | Atualização |

### Entidade: PatientAudit
| Campo | Tipo | Descrição |
|-------|------|-----------|
| id | UUID | PK |
| patientId | UUID | FK Patient |
| action | enum | create, update, delete |
| changes | jsonb | Alterações realizadas |
| performedBy | UUID | FK User |
| performedAt | datetime | Data da operação |

### Índices:
```prisma
@@index([organizationId])
@@index([name])
@@index([document])
@@index([phone])
@@index([isActive])
@@index([deletedAt])
@@index([createdAt])
```

## 9. Contratos de API

### GET /api/v1/patients
Query params:
- `page`: número da página (padrão 1)
- `limit`: itens por página (padrão 20, máx 100)
- `search`: termo de busca (nome parcial)
- `document`: filtro por CPF
- `phone`: filtro por telefone
- `isActive`: filtro por status

Response (200):
```json
{
  "items": [
    {
      "id": "uuid",
      "name": "João Silva",
      "email": "joao@email.com",
      "phone": "11999999999",
      "document": "12345678900",
      "birthDate": "1990-01-15",
      "isActive": true,
      "createdAt": "2026-04-01T10:00:00Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 150,
    "totalPages": 8
  }
}
```

### GET /api/v1/patients/:id
Response (200):
```json
{
  "id": "uuid",
  "organizationId": "uuid",
  "name": "João Silva",
  "email": "joao@email.com",
  "phone": "11999999999",
  "document": "12345678900",
  "birthDate": "1990-01-15",
  "gender": "male",
  "addressStreet": "Rua Example",
  "addressNumber": "123",
  "addressCity": "São Paulo",
  "addressState": "SP",
  "addressZipCode": "01234567",
  "notes": "Alergia a dipirona",
  "tags": ["prioridade", "retorno"],
  "isActive": true,
  "createdAt": "2026-04-01T10:00:00Z",
  "updatedAt": "2026-04-01T10:00:00Z",
  "contacts": [
    {
      "id": "uuid",
      "name": "Maria Silva",
      "relationship": "Mãe",
      "phone": "11988888888",
      "email": "maria@email.com",
      "isPrimary": true
    }
  ]
}
```

### POST /api/v1/patients
Request:
```json
{
  "name": "João Silva",
  "email": "joao@email.com",
  "phone": "11999999999",
  "document": "12345678900",
  "birthDate": "1990-01-15",
  "gender": "male",
  "addressStreet": "Rua Example",
  "addressNumber": "123",
  "addressCity": "São Paulo",
  "addressState": "SP",
  "addressZipCode": "01234567",
  "notes": "Observações",
  "tags": ["prioridade"],
  "contacts": [
    {
      "name": "Maria Silva",
      "relationship": "Mãe",
      "phone": "11988888888",
      "email": "maria@email.com",
      "isPrimary": true
    }
  ]
}
```

### POST /api/v1/patients/:id/contacts
Request:
```json
{
  "name": "Pedro Silva",
  "relationship": "Irmão",
  "phone": "11977777777",
  "isPrimary": false
}
```

## 10. Rotas do Frontend

| Rota | Descrição | Acesso |
|------|-----------|--------|
| `/patients` | Lista de pacientes | Autenticado |
| `/patients/new` | Criar paciente | Receptionist+ |
| `/patients/[id]` | Detalhes do paciente | Autenticado |
| `/patients/[id]/edit` | Editar paciente | Receptionist+ |

## 11. Validações e Regras de Negócio

### Patient:
1. **Nome**: Obrigatório, 2-255 caracteres
2. **Email**: Formato válido (opcional)
3. **Documento**: CPF válido (opcional), único na organização
4. **Telefone**: 10-11 dígitos (opcional)
5. **Data nascimento**: Não pode ser futura
6. **Endereço**: Campos opcionais, mas CEP deve ter 8 dígitos se informado
7. **Contato primário**: Apenas um por paciente (isPrimary = true)

### PatientContact:
1. **Nome**: Obrigatório, 2-255 caracteres
2. **Relationship**: Obrigatório, 2-100 caracteres
3. **Telefone**: 10-11 dígitos (opcional)
4. **Email**: Formato válido (opcional)
5. **isPrimary**: Se true, desmarca outros contatos do paciente

### Regras de Negócio:
1. Apenas um contato com isPrimary = true por paciente
2. Ao criar/editar contato como primary, anteriores são desmarcadas
3. Soft delete não remove contatos (mantêm-se vinculados)
4. Buscar por nome faz LIKE% (parcial)
5. Buscar por documento é exato
6. Buscar por telefone faz LIKE% (parcial)
7.organizationId sempre vem do token JWT

## 12. Segurança

- Todas as queries filtram por organizationId do token
- Soft delete filtra deletedAt = null por padrão
- Auditoria registra performedBy com ID do usuário logado
- CORS permitido apenas para frontend

## 13. Critérios de Aceite

### Funcional:
- [ ] Criar paciente com sucesso
- [ ] Criar paciente com múltiplos contatos
- [ ] Listar pacientes com paginação
- [ ] Filtrar por busca (nome)
- [ ] Filtrar por documento (CPF)
- [ ] Filtrar por telefone
- [ ] Editar paciente
- [ ] Adicionar/editar/remover contatos
- [ ] Soft delete funciona
- [ ] Detalhes mostram contatos

### Técnica:
- [ ] API documentada no Swagger
- [ ] DTOs validados com class-validator
- [ ] Schemas Zod em contratos
- [ ] Tipos TypeScript compartilhados
- [ ] Isolamento por organização funciona

## 14. Histórico de Versões

| Versão | Data | Descrição |
|--------|------|-----------|
| 1.0.0 | 2026-04-08 | Initial spec - Módulo de Pacientes |