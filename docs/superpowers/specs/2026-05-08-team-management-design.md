# SPEC: Gestão de Equipe (Team Management)

## 1. Contexto do Problema

O sistema atual permite cadastrar profissionais de saúde através de uma página isolada (`/settings/professionals`) com campo livre para especialidade, o que causa:
- Inconsistências de digitação (ex: "Cardiologia", "Cardiologia ", "cardiologia")
- Criação de profissionais fora do ramo de saúde
- Ausência de gestão de recepcionistas no mesmo fluxo

## 2. Objetivo do Módulo

Criar uma página unificada de "Gestão de Equipe" que:
- Consolide cadastro de profissionais e recepcionistas
- Padronize especialidades com dropdown estruturado
- Permita expansão de especialidades pelo admin
- Melhore UX com abas, busca e filtros

## 3. Escopo da Feature

### Dentro do Escopo:
- [x] Página única `/settings/team` com abas
- [x] Aba Profissionais (role: professional)
- [x] Aba Recepcionistas (role: receptionist)
- [x] Lista de especialidades por categoria
- [x] Seed de especialidades padrão
- [x] CRUD de especialidades (admin)
- [x] Modal de criação de profissional completo
- [x] Modal de criação de recepcionista
- [x] Busca e filtro nas listas

### Fora do Escopo:
- [ ] Gestão de unidades (já existe em /settings/units)
- [ ] Edição de profissionais via modal (MVP)
- [ ] Upload de foto de perfil
- [ ] Agenda individual por usuário

## 4. Modelo de Dados

### Entidade: Specialty
| Campo | Tipo | Descrição |
|-------|------|-----------|
| id | UUID | PK |
| organizationId | UUID | FK Organization |
| category | string | medical, dental, psychology, nutrition, physiotherapy, complementary, technical, admin |
| name | string | Nome da especialidade |
| isActive | boolean | Status |
| createdAt | datetime | Criação |
| updatedAt | datetime | Atualização |

### Atualizar Professional
Adicionar campo `specialtyId` (UUID, opcional, FK Specialty)

### Atualizar User
Adicionar campo `phone` (string, opcional)

## 5. Categorias e Especialidades

### Categorias
| Categoria | slug | Descrição |
|-----------|------|-----------|
| Médica | `medical` | Médicos de todas as especialidades |
| Odontológica | `dental` | Dentistas e especialidades odontológicas |
| Psicologia | `psychology` | Psicólogos e áreas da psicologia |
| Nutrição | `nutrition` | Nutricionistas |
| Fisioterapia | `physiotherapy` | Fisioterapeutas |
| Saúde Complementar | `complementary` | Acupuntura, yoga, etc |
| Técnico em Saúde | `technical` | Técnicos de enfermagem, radiologia, etc |
| Administrativo | `admin` | Recepcionistas, coordenadores |

### Especialidades Padrão (Seed)

**Médica:**
- Clínica Geral
- Cardiologia
- Dermatologia
- Endocrinologia
- Gastroenterologia
- Geriatria
- Ginecologia
- Neurologia
- Oftalmologia
- Ortopedia
- Pediatria
- Psiquiatria
- Pneumologia
- Reumatologia
- Urologia

**Odontológica:**
- Ortodontia
- Periodontia
- Endodontia
- Cirurgia Oral
- Implantodontia
- Prótese Dentária
- Odontopediatria

**Psicologia:**
- Psicologia Clínica
- Psicologia Escolar
- Psicologia Organizacional
- Neuropsicologia
- Psicologia Infantil
- Psicologia da Saúde

**Nutrição:**
- Nutrição Clínica
- Nutrição Esportiva
- Nutrição Pediátrica
- Nutrição Gerontológica
- Nutrição Oncológica

**Fisioterapia:**
- Fisioterapia Ortopédica
- Fisioterapia Neurológica
- Fisioterapia Respiratória
- Fisioterapia Pediátrica
- Fisioterapia Geriátrica
- Fisioterapia Esportiva
- RPG / Souchard

**Técnico em Saúde:**
- Técnico em Enfermagem
- Técnico em Radiologia
- Técnico em Análises Clínicas
- Técnico em Saúde Bucal

**Administrativo:**
- Recepção
- Coordenação
- Administrativo Geral

## 6. Endpoints de API

### Specialty Module (novo)
| Método | Endpoint | Descrição | Access |
|--------|----------|-----------|--------|
| GET | `/specialties` | Listar especialidades | super_admin, org_admin, receptionist |
| GET | `/specialties/:id` | Detalhar especialidade | super_admin, org_admin |
| POST | `/specialties` | Criar especialidade | org_admin |
| PATCH | `/specialties/:id` | Editar especialidade | org_admin |
| DELETE | `/specialties/:id` | Inativar especialidade | org_admin |

### Users Module (atualizar)
- Adicionar campo `role` na resposta
- Suporte a filtrar por role: `GET /users?role=professional|receptionist`

### Settings Module (atualizar)
- GET `/settings/professionals` → continua funcionando
- POST `/settings/professionals` → permanece

## 7. Frontend - Página /settings/team

### Layout
```
┌─────────────────────────────────────────────────┐
│ ← Voltar  │  Gestão de Equipe                    │
├─────────────────────────────────────────────────┤
│ ┌─────────────┬──────────────┐                   │
│ │Profissionais│ Recepcionistas│                  │
│ └─────────────┴──────────────┘                   │
├─────────────────────────────────────────────────┤
│ [🔍 Buscar...] [+ Novo Membro]                  │
├─────────────────────────────────────────────────┤
│ ┌─────────────────────────────────────────────┐ │
│ │ Nome    │ Função    │ Status │ Ações        │ │
│ │ ─────── │ ───────── │ ────── │ ──────────── │ │
│ │ Dr. João│ Cardiologia│ Ativo  │ ✏️ 🗑️       │ │
│ │ Maria   │ Recepcionista│ Ativo│ ✏️ 🗑️       │ │
│ └─────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────┘
```

### Modal - Novo Profissional
- Nome completo * (text)
- Email * (email)
- Senha * (password)
- Telefone (tel)
- Especialidade * (select com categories)
- Registro Profissional (text, ex: CRM/SP 123456)
- Cor na agenda (color picker)
- Tipo de Atendimento (select ServiceType)
- Unidade (select Unit)

### Modal - Novo Recepcionista
- Nome completo * (text)
- Email * (email)
- Senha * (password)
- Telefone (tel)
- Função (select: Recepção, Coordenação, Administrativo Geral)
- Unidade (select Unit)

## 8. Fluxos

### Fluxo 1: Criar Profissional
1. Usuário acessa `/settings/team`
2. Clica na aba "Profissionais"
3. Clica em "+ Novo Membro"
4. Preenche dados no modal
5. Submit → API cria User (role: professional) + Professional (specialtyId)
6. Retorna sucesso, atualiza lista

### Fluxo 2: Criar Recepcionista
1. Usuário acessa `/settings/team`
2. Clica na aba "Recepcionistas"
3. Clica em "+ Novo Membro"
4. Preenche dados no modal
5. Submit → API cria User (role: receptionist)
6. Opcional: cria Professional com category=admin se precisar de agenda
7. Retorna sucesso, atualiza lista

### Fluxo 3: Adicionar Nova Especialidade
1. Admin acessa config de especialidades (ouvia modal de criar profissional)
2. Clica em "+Nova Especialidade"
3. Seleciona categoria
4. Define nome
5. Submit → cria specialty

## 9. Validações

### User
- Email único no sistema
- Senha: mínimo 6 caracteres
- Nome: mínimo 2 caracteres

### Specialty
- Nome único por organização
- Categoria válida

## 10. Seed

No `SeedService`, após criar roles e organização:

```typescript
private async seedSpecialties() {
  const defaultSpecialties = [
    // Medical
    { category: 'medical', name: 'Clínica Geral' },
    { category: 'medical', name: 'Cardiologia' },
    { category: 'medical', name: 'Dermatologia' },
    { category: 'medical', name: 'Endocrinologia' },
    // ... todas as outras
  ];

  for (const specialty of defaultSpecialties) {
    await this.prisma.specialty.upsert({
      where: {
        organizationId_name: {
          organizationId: '00000000-0000-0000-0000-000000000010',
          name: specialty.name,
        },
      },
      update: {},
      create: {
        organizationId: '00000000-0000-0000-0000-000000000010',
        ...specialty,
        isActive: true,
      },
    });
  }
}
```

## 11. Critérios de Aceite

- [ ] Página `/settings/team` acessível para org_admin+
- [ ] Abas alternam entre profissionais e recepcionistas
- [ ] Dropdown de especialidades filtra por categoria
- [ ] Criação de profissional cria User + Professional
- [ ] Criação de recepcionista cria User (role receptionist)
- [ ] Seed popula especialidades padrão
- [ ] Busca filtra por nome/email
- [ ] Lista mostra status (ativo/inativo)
- [ ] API de specialties funciona (CRUD)
- [ ] UI responsiva e acessível

## 12. Histórico de Versões

| Versão | Data | Descrição |
|--------|------|------------|
| 1.0.0 | 2026-05-08 | Initial spec - Team Management com abas e especialidades estruturadas |