# Team Management Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Criar página unificada `/settings/team` com abas para gerenciar profissionais e recepcionistas, com dropdown de especialidades estruturadas por categoria.

**Architecture:** Nova tabela `Specialty` no Prisma com seed de especialidades padrão. Backend expõe endpoints CRUD para specialties. Frontend cria página unificada com abas e modais de criação.

**Tech Stack:** NestJS (backend), Next.js (frontend), Prisma (ORM), React Query (data fetching)

---

## Task 1: Atualizar Schema do Prisma

**Files:**
- Modify: `apps/api/prisma/schema.prisma:830-838` (adicionar ao final)
- Run: `cd apps/api && npx prisma generate`

- [ ] **Step 1: Adicionar modelo Specialty ao schema.prisma**

```prisma
model Specialty {
  id            String   @id @default(uuid())
  organizationId String
  category      String
  name          String
  isActive      Boolean  @default(true)
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt

  organization Organization @relation(fields: [organizationId], references: [id], onDelete: Cascade)
  professionals Professional[]

  @@unique([organizationId, name])
  @@index([organizationId])
  @@index([category])
  @@map("specialties")
}
```

- [ ] **Step 2: Adicionar campo specialtyId ao modelo Professional**

```prisma
model Professional {
  // ... campos existentes ...
  
  specialtyId    String?
  specialty      Specialty? @relation(fields: [specialtyId], references: [id])

  // ... resto ...
}
```

- [ ] **Step 3: Adicionar campo phone ao modelo User**

```prisma
model User {
  // ... campos existentes ...
  
  phone          String?

  // ... resto ...
}
```

- [ ] **Step 4: Gerar migration e client Prisma**

```bash
cd apps/api && npx prisma migrate dev --name add_specialties
```

---

## Task 2: Atualizar Seed Service

**Files:**
- Modify: `apps/api/src/common/seed.service.ts:1-111`

- [ ] **Step 1: Adicionar método seedSpecialties ao SeedService**

```typescript
private async seedSpecialties() {
  const defaultSpecialties = [
    // Medical
    { category: 'medical', name: 'Clínica Geral' },
    { category: 'medical', name: 'Cardiologia' },
    { category: 'medical', name: 'Dermatologia' },
    { category: 'medical', name: 'Endocrinologia' },
    { category: 'medical', name: 'Gastroenterologia' },
    { category: 'medical', name: 'Geriatria' },
    { category: 'medical', name: 'Ginecologia' },
    { category: 'medical', name: 'Neurologia' },
    { category: 'medical', name: 'Oftalmologia' },
    { category: 'medical', name: 'Ortopedia' },
    { category: 'medical', name: 'Pediatria' },
    { category: 'medical', name: 'Psiquiatria' },
    { category: 'medical', name: 'Pneumologia' },
    { category: 'medical', name: 'Reumatologia' },
    { category: 'medical', name: 'Urologia' },
    // Dental
    { category: 'dental', name: 'Ortodontia' },
    { category: 'dental', name: 'Periodontia' },
    { category: 'dental', name: 'Endodontia' },
    { category: 'dental', name: 'Cirurgia Oral' },
    { category: 'dental', name: 'Implantodontia' },
    { category: 'dental', name: 'Prótese Dentária' },
    { category: 'dental', name: 'Odontopediatria' },
    // Psychology
    { category: 'psychology', name: 'Psicologia Clínica' },
    { category: 'psychology', name: 'Psicologia Escolar' },
    { category: 'psychology', name: 'Psicologia Organizacional' },
    { category: 'psychology', name: 'Neuropsicologia' },
    { category: 'psychology', name: 'Psicologia Infantil' },
    { category: 'psychology', name: 'Psicologia da Saúde' },
    // Nutrition
    { category: 'nutrition', name: 'Nutrição Clínica' },
    { category: 'nutrition', name: 'Nutrição Esportiva' },
    { category: 'nutrition', name: 'Nutrição Pediátrica' },
    { category: 'nutrition', name: 'Nutrição Gerontológica' },
    { category: 'nutrition', name: 'Nutrição Oncológica' },
    // Physiotherapy
    { category: 'physiotherapy', name: 'Fisioterapia Ortopédica' },
    { category: 'physiotherapy', name: 'Fisioterapia Neurológica' },
    { category: 'physiotherapy', name: 'Fisioterapia Respiratória' },
    { category: 'physiotherapy', name: 'Fisioterapia Pediátrica' },
    { category: 'physiotherapy', name: 'Fisioterapia Geriátrica' },
    { category: 'physiotherapy', name: 'Fisioterapia Esportiva' },
    { category: 'physiotherapy', name: 'RPG / Souchard' },
    // Technical
    { category: 'technical', name: 'Técnico em Enfermagem' },
    { category: 'technical', name: 'Técnico em Radiologia' },
    { category: 'technical', name: 'Técnico em Análises Clínicas' },
    { category: 'technical', name: 'Técnico em Saúde Bucal' },
    // Admin
    { category: 'admin', name: 'Recepção' },
    { category: 'admin', name: 'Coordenação' },
    { category: 'admin', name: 'Administrativo Geral' },
  ];

  const orgId = '00000000-0000-0000-0000-000000000010';

  for (const specialty of defaultSpecialties) {
    await this.prisma.specialty.upsert({
      where: {
        organizationId_name: {
          organizationId: orgId,
          name: specialty.name,
        },
      },
      update: {},
      create: {
        organizationId: orgId,
        category: specialty.category,
        name: specialty.name,
        isActive: true,
      },
    });
  }
}
```

- [ ] **Step 2: Adicionar chamada ao método no onModuleInit**

```typescript
async onModuleInit() {
  await this.seedRoles();
  await this.seedPermissions();
  await this.seedOrganization();
  await this.seedSpecialties(); // NOVA LINHA
  await this.seedUsers();
}
```

---

## Task 3: Atualizar DTOs

**Files:**
- Modify: `apps/api/src/modules/users/dto/user.dto.ts:1-61`
- Modify: `apps/api/src/modules/settings/dto/settings.dto.ts:1-307`

- [ ] **Step 1: Adicionar campo phone ao CreateUserDto**

```typescript
export class CreateUserDto {
  @ApiProperty({ example: 'user@clinica.com' })
  @IsEmail({}, { message: 'Email inválido. Use o formato: nome@exemplo.com' })
  email: string;

  @ApiProperty({ example: 'Senha123' })
  @IsString()
  @MinLength(6, { message: 'Senha deve ter pelo menos 6 caracteres' })
  password: string;

  @ApiProperty({ example: 'João Silva' })
  @IsString()
  @MinLength(2, { message: 'Nome deve ter pelo menos 2 caracteres' })
  name: string;

  @ApiPropertyOptional({ example: '(11) 99999-9999' })
  @IsOptional()
  @IsString()
  @MaxLength(20)
  phone?: string;

  @ApiPropertyOptional()
  @IsOptional()
  organizationId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  roleId?: string;
}
```

- [ ] **Step 2: Adicionar Importações necessárias no user.dto.ts**

```typescript
import { MaxLength } from 'class-validator';
```

- [ ] **Step 3: Adicionar SpecialtyDto e atualizar ProfessionalDto no settings.dto.ts**

```typescript
export class CreateSpecialtyDto {
  @ApiProperty({ example: 'medical' })
  @IsString()
  @IsNotEmpty()
  category: string;

  @ApiProperty({ example: 'Cardiologia' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  name: string;
}

export class UpdateSpecialtyDto {
  @ApiPropertyOptional({ example: 'medical' })
  @IsOptional()
  @IsString()
  category?: string;

  @ApiPropertyOptional({ example: 'Cardiologia' })
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  name?: string;

  @ApiPropertyOptional()
  @IsOptional()
  isActive?: boolean;
}

export class ProfessionalDto {
  @ApiProperty({ example: 'uuid-do-usuario' })
  @IsString()
  @IsNotEmpty()
  userId: string;

  @ApiPropertyOptional({ example: 'uuid-da-especialidade' })
  @IsOptional()
  @IsUUID()
  specialtyId?: string;

  @ApiPropertyOptional({ example: 'CRM/SP 123456' })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  registerNumber?: string;

  @ApiPropertyOptional({ example: '#3B82F6' })
  @IsOptional()
  @IsString()
  color?: string;

  @ApiPropertyOptional({ example: 'uuid-do-tipo-de-atendimento' })
  @IsOptional()
  @IsString()
  appointmentTypeId?: string;
}
```

- [ ] **Step 4: Adicionar importações no settings.dto.ts**

```typescript
import { IsUUID } from 'class-validator';
```

---

## Task 4: Criar Specialties Module (Backend)

**Files:**
- Create: `apps/api/src/modules/specialties/specialties.module.ts`
- Create: `apps/api/src/modules/specialties/specialties.service.ts`
- Create: `apps/api/src/modules/specialties/specialties.controller.ts`
- Create: `apps/api/src/modules/specialties/dto/specialty.dto.ts`

- [ ] **Step 1: Criar specialties.module.ts**

```typescript
import { Module } from '@nestjs/common';
import { SpecialtiesController } from './specialties.controller';
import { SpecialtiesService } from './specialties.service';

@Module({
  controllers: [SpecialtiesController],
  providers: [SpecialtiesService],
  exports: [SpecialtiesService],
})
export class SpecialtiesModule {}
```

- [ ] **Step 2: Criar specialties.service.ts**

```typescript
import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../common/prisma.service';
import { CreateSpecialtyDto, UpdateSpecialtyDto } from './dto/specialty.dto';

@Injectable()
export class SpecialtiesService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(organizationId: string, category?: string) {
    const where = {
      organizationId,
      ...(category && { category }),
    };

    const items = await this.prisma.specialty.findMany({
      where,
      orderBy: { name: 'asc' },
    });

    return { items };
  }

  async findOne(organizationId: string, id: string) {
    const specialty = await this.prisma.specialty.findFirst({
      where: { id, organizationId },
    });

    if (!specialty) {
      throw new NotFoundException('Especialidade não encontrada');
    }

    return specialty;
  }

  async create(organizationId: string, dto: CreateSpecialtyDto) {
    return this.prisma.specialty.create({
      data: {
        organizationId,
        category: dto.category,
        name: dto.name,
        isActive: true,
      },
    });
  }

  async update(organizationId: string, id: string, dto: UpdateSpecialtyDto) {
    await this.findOne(organizationId, id);

    return this.prisma.specialty.update({
      where: { id },
      data: {
        ...(dto.category && { category: dto.category }),
        ...(dto.name && { name: dto.name }),
        ...(dto.isActive !== undefined && { isActive: dto.isActive }),
      },
    });
  }

  async delete(organizationId: string, id: string) {
    await this.findOne(organizationId, id);

    return this.prisma.specialty.update({
      where: { id },
      data: { isActive: false },
    });
  }
}
```

- [ ] **Step 3: Criar specialties.controller.ts**

```typescript
import { Controller, Get, Post, Patch, Delete, Body, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { SpecialtiesService } from './specialties.service';
import { CreateSpecialtyDto, UpdateSpecialtyDto } from './dto/specialty.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/guards/roles.guard';
import { CurrentOrganization } from '../../common/decorators/current-organization.decorator';

@ApiTags('Specialties')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('specialties')
export class SpecialtiesController {
  constructor(private readonly specialtiesService: SpecialtiesService) {}

  @Get()
  @ApiOperation({ summary: 'Listar especialidades' })
  @ApiQuery({ name: 'category', required: false, enum: ['medical', 'dental', 'psychology', 'nutrition', 'physiotherapy', 'complementary', 'technical', 'admin'] })
  async findAll(
    @CurrentOrganization() organizationId: string,
    @Query('category') category?: string,
  ) {
    return this.specialtiesService.findAll(organizationId, category);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Detalhar especialidade' })
  async findOne(
    @CurrentOrganization() organizationId: string,
    @Param('id') id: string,
  ) {
    return this.specialtiesService.findOne(organizationId, id);
  }

  @Post()
  @Roles('org_admin', 'super_admin')
  @ApiOperation({ summary: 'Criar especialidade' })
  async create(
    @CurrentOrganization() organizationId: string,
    @Body() dto: CreateSpecialtyDto,
  ) {
    return this.specialtiesService.create(organizationId, dto);
  }

  @Patch(':id')
  @Roles('org_admin', 'super_admin')
  @ApiOperation({ summary: 'Atualizar especialidade' })
  async update(
    @CurrentOrganization() organizationId: string,
    @Param('id') id: string,
    @Body() dto: UpdateSpecialtyDto,
  ) {
    return this.specialtiesService.update(organizationId, id, dto);
  }

  @Delete(':id')
  @Roles('org_admin', 'super_admin')
  @ApiOperation({ summary: 'Inativar especialidade' })
  async delete(
    @CurrentOrganization() organizationId: string,
    @Param('id') id: string,
  ) {
    return this.specialtiesService.delete(organizationId, id);
  }
}
```

- [ ] **Step 4: Criar dto/specialty.dto.ts**

```typescript
import { IsString, IsOptional, IsNotEmpty, MaxLength, IsUUID, IsBoolean } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateSpecialtyDto {
  @ApiProperty({ example: 'medical', enum: ['medical', 'dental', 'psychology', 'nutrition', 'physiotherapy', 'complementary', 'technical', 'admin'] })
  @IsString()
  @IsNotEmpty()
  category: string;

  @ApiProperty({ example: 'Cardiologia' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  name: string;
}

export class UpdateSpecialtyDto {
  @ApiPropertyOptional({ example: 'medical', enum: ['medical', 'dental', 'psychology', 'nutrition', 'physiotherapy', 'complementary', 'technical', 'admin'] })
  @IsOptional()
  @IsString()
  category?: string;

  @ApiPropertyOptional({ example: 'Cardiologia' })
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  name?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
```

- [ ] **Step 5: Registrar SpecialtiesModule no app.module.ts**

Adicionar ao imports do AppModule:
```typescript
import { SpecialtiesModule } from './modules/specialties/specialties.module';

@Module({
  imports: [
    // ... outros módulos
    SpecialtiesModule,
  ],
})
export class AppModule {}
```

---

## Task 5: Atualizar Users Service e Controller

**Files:**
- Modify: `apps/api/src/modules/users/users.service.ts`
- Modify: `apps/api/src/modules/users/users.controller.ts`

- [ ] **Step 1: Adicionar phone ao create no users.service.ts**

No método create, adicionar:
```typescript
const user = await this.prisma.user.create({
  data: {
    email: dto.email,
    password: hashedPassword,
    name: dto.name,
    phone: dto.phone, // NOVO CAMPO
    organizationId,
    roleId: dto.roleId || '00000000-0000-0000-0000-000000000003', // default: professional
  },
});
```

- [ ] **Step 2: Adicionar filtro por role no users.controller.ts**

```typescript
@Get()
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@ApiOperation({ summary: 'Listar usuários' })
async findAll(
  @CurrentOrganization() organizationId: string,
  @Query('page') page?: number,
  @Query('limit') limit?: number,
  @Query('role') role?: string,
) {
  return this.usersService.findAll(organizationId, Number(page) || 1, Number(limit) || 20, role);
}
```

- [ ] **Step 3: Atualizar users.service.ts para filtrar por role**

Modificar o método findAll para aceitar role como parâmetro opcional:
```typescript
async findAll(organizationId: string, page = 1, limit = 20, role?: string) {
  const where = {
    organizationId,
    ...(role && { role: { name: role } }),
  };

  const [items, total] = await Promise.all([
    this.prisma.user.findMany({
      where,
      skip: (page - 1) * limit,
      take: limit,
      include: { role: true },
      orderBy: { createdAt: 'desc' },
    }),
    this.prisma.user.count({ where }),
  ]);

  return {
    items: items.map(user => ({
      id: user.id,
      email: user.email,
      name: user.name,
      phone: user.phone,
      role: user.role.name,
      isActive: user.isActive,
      createdAt: user.createdAt,
    })),
    pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
  };
}
```

- [ ] **Step 4: Atualizar resposta do create para incluir role**

No método create do users.service.ts, após criar o usuário:
```typescript
const createdUser = await this.prisma.user.findUnique({
  where: { id: user.id },
  include: { role: true },
});

return {
  id: createdUser.id,
  email: createdUser.email,
  name: createdUser.name,
  phone: createdUser.phone,
  role: createdUser.role.name,
  isActive: createdUser.isActive,
};
```

---

## Task 6: Atualizar Settings Service para Supportar specialtyId

**Files:**
- Modify: `apps/api/src/modules/settings/settings.service.ts`

- [ ] **Step 1: Atualizar método createProfessional para aceitar specialtyId**

```typescript
async createProfessional(organizationId: string, dto: ProfessionalDto) {
  // Validar que o user pertence à organização
  const user = await this.prisma.user.findFirst({
    where: { id: dto.userId, organizationId },
  });

  if (!user) {
    throw new NotFoundException('Usuário não encontrado');
  }

  // Validar specialtyId se fornecido
  if (dto.specialtyId) {
    const specialty = await this.prisma.specialty.findFirst({
      where: { id: dto.specialtyId, organizationId, isActive: true },
    });

    if (!specialty) {
      throw new NotFoundException('Especialidade não encontrada');
    }
  }

  return this.prisma.professional.create({
    data: {
      userId: dto.userId,
      organizationId,
      specialtyId: dto.specialtyId || null,
      specialty: dto.specialty || '',
      registerNumber: dto.registerNumber || null,
      color: dto.color || '#3B82F6',
      appointmentTypeId: dto.appointmentTypeId || null,
      isActive: true,
    },
    include: {
      user: true,
      specialty: true,
    },
  });
}
```

- [ ] **Step 2: Adicionar specialties ao findAllProfessionals**

No método findAll, adicionar include specialty:
```typescript
async findAllProfessionals(organizationId: string) {
  const professionals = await this.prisma.professional.findMany({
    where: { organizationId },
    include: {
      user: true,
      specialty: true,
      appointmentType: true,
    },
  });
  return { items: professionals };
}
```

---

## Task 7: Atualizar Frontend - API Client

**Files:**
- Modify: `apps/web/src/lib/api/settings.ts`

- [ ] **Step 1: Adicionar métodos para specialties**

```typescript
export const specialtiesApi = {
  list: async (params?: { category?: string }) => {
    const searchParams = new URLSearchParams();
    if (params?.category) searchParams.set('category', params.category);
    const query = searchParams.toString();
    return api.get<{ items: Specialty[] }>(`/specialties${query ? `?${query}` : ''}`);
  },

  create: async (data: { category: string; name: string }) => {
    return api.post<Specialty>('/specialties', data);
  },

  update: async (id: string, data: { name?: string; category?: string; isActive?: boolean }) => {
    return api.patch<Specialty>(`/specialties/${id}`, data);
  },

  delete: async (id: string) => {
    return api.delete<void>(`/specialties/${id}`);
  },
};

export interface Specialty {
  id: string;
  organizationId: string;
  category: string;
  name: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}
```

- [ ] **Step 2: Atualizar interface Professional no settings.ts**

```typescript
export interface Professional {
  id: string;
  userId: string;
  organizationId: string;
  specialty: string;
  specialtyId?: string;
  registerNumber?: string;
  color: string;
  isActive: boolean;
  user: {
    id: string;
    name: string;
    email: string;
    phone?: string;
  };
  specialty?: Specialty;
  appointmentType?: ServiceType;
}
```

- [ ] **Step 3: Adicionar SpecialtyCategory ao exports**

```typescript
export type SpecialtyCategory = 'medical' | 'dental' | 'psychology' | 'nutrition' | 'physiotherapy' | 'complementary' | 'technical' | 'admin';

export const SPECIALTY_CATEGORIES: { value: SpecialtyCategory; label: string }[] = [
  { value: 'medical', label: 'Médica' },
  { value: 'dental', label: 'Odontológica' },
  { value: 'psychology', label: 'Psicologia' },
  { value: 'nutrition', label: 'Nutrição' },
  { value: 'physiotherapy', label: 'Fisioterapia' },
  { value: 'complementary', label: 'Saúde Complementar' },
  { value: 'technical', label: 'Técnico em Saúde' },
  { value: 'admin', label: 'Administrativo' },
];
```

---

## Task 8: Criar Página /settings/team no Frontend

**Files:**
- Create: `apps/web/src/app/(authenticated)/settings/team/page.tsx`

- [ ] **Step 1: Criar página team com abas**

```tsx
'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import Link from 'next/link';
import { usersApi, SPECIALTY_CATEGORIES, type Specialty, type SpecialtyCategory } from '@/lib/api/settings';
import { usersApi as globalUsersApi } from '@/lib/api/users';
import { PasswordInput } from '@/components/forms/password-input';
import { useRole } from '@/hooks/use-role';

type Tab = 'professionals' | 'receptionists';

interface TeamMemberForm {
  name: string;
  email: string;
  password: string;
  phone: string;
  specialtyId: string;
  registerNumber: string;
  color: string;
  appointmentTypeId: string;
  role: 'professional' | 'receptionist';
  function: string;
}

export default function TeamPage() {
  const { canManageSettings } = useRole();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<Tab>('professionals');
  const [showForm, setShowForm] = useState(false);
  const [search, setSearch] = useState('');
  const [form, setForm] = useState<TeamMemberForm>({
    name: '',
    email: '',
    password: '',
    phone: '',
    specialtyId: '',
    registerNumber: '',
    color: '#3B82F6',
    appointmentTypeId: '',
    role: 'professional',
    function: 'Recepção',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [success, setSuccess] = useState('');

  if (!canManageSettings) {
    return (
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold mb-6">Gestão de Equipe</h1>
        <p className="text-gray-500">Você não tem acesso a esta página.</p>
        <Link href="/settings" className="text-blue-600 hover:underline mt-4 block">
          ← Voltar para Configurações
        </Link>
      </div>
    );
  }

  const { data: users, isLoading } = useQuery({
    queryKey: ['users', activeTab],
    queryFn: () => globalUsersApi.listUsers({ role: activeTab === 'professionals' ? 'professional' : 'receptionist' }),
  });

  const { data: specialties } = useQuery({
    queryKey: ['specialties'],
    queryFn: () => usersApi.specialtiesApi.list(),
  });

  const { data: serviceTypes } = useQuery({
    queryKey: ['serviceTypes'],
    queryFn: () => usersApi.settingsApi.listServiceTypes({ isActive: true }),
  });

  const createMutation = useMutation({
    mutationFn: async (data: TeamMemberForm) => {
      if (activeTab === 'professionals') {
        const user = await globalUsersApi.createUser({
          email: data.email,
          password: data.password,
          name: data.name,
          phone: data.phone || undefined,
          roleId: '00000000-0000-0000-0000-000000000003',
        });

        await usersApi.settingsApi.createProfessional({
          userId: user.id,
          specialtyId: data.specialtyId || undefined,
          registerNumber: data.registerNumber || undefined,
          color: data.color,
          appointmentTypeId: data.appointmentTypeId || undefined,
        });
      } else {
        await globalUsersApi.createUser({
          email: data.email,
          password: data.password,
          name: data.name,
          phone: data.phone || undefined,
          roleId: '00000000-0000-0000-0000-000000000004',
        });
      }
    },
    onSuccess: () => {
      setSuccess(activeTab === 'professionals' ? 'Profissional criado com sucesso!' : 'Recepcionista criado com sucesso!');
      setForm({
        name: '',
        email: '',
        password: '',
        phone: '',
        specialtyId: '',
        registerNumber: '',
        color: '#3B82F6',
        appointmentTypeId: '',
        role: 'professional',
        function: 'Recepção',
      });
      setShowForm(false);
      setErrors({});
      queryClient.invalidateQueries({ queryKey: ['users'] });
    },
    onError: (err: Error) => {
      setErrors({ form: err.message });
    },
  });

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};
    
    if (!form.name || form.name.trim().length < 2) {
      newErrors.name = 'Nome deve ter pelo menos 2 caracteres';
    }
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!form.email || !emailRegex.test(form.email)) {
      newErrors.email = 'Email inválido';
    }
    
    if (!form.password || form.password.length < 6) {
      newErrors.password = 'Senha deve ter pelo menos 6 caracteres';
    }

    if (activeTab === 'professionals' && !form.specialtyId) {
      newErrors.specialtyId = 'Selecione uma especialidade';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    setSuccess('');
    if (validateForm()) {
      createMutation.mutate(form);
    }
  };

  const filteredMembers = users?.items.filter(member => 
    member.name.toLowerCase().includes(search.toLowerCase()) ||
    member.email.toLowerCase().includes(search.toLowerCase())
  ) || [];

  const getCategoryLabel = (category: string) => {
    return SPECIALTY_CATEGORIES.find(c => c.value === category)?.label || category;
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex justify-between items-center">
        <Link href="/settings" className="text-blue-600 hover:underline">
          ← Voltar para Configurações
        </Link>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <h1 className="text-2xl font-bold mb-6">Gestão de Equipe</h1>

        {/* Abas */}
        <div className="flex border-b mb-6">
          <button
            onClick={() => { setActiveTab('professionals'); setShowForm(false); }}
            className={`px-4 py-2 -mb-px border-b-2 ${activeTab === 'professionals' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
          >
            Profissionais
          </button>
          <button
            onClick={() => { setActiveTab('receptionists'); setShowForm(false); }}
            className={`px-4 py-2 -mb-px border-b-2 ${activeTab === 'receptionists' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
          >
            Recepcionistas
          </button>
        </div>

        {/* Busca e botão */}
        <div className="flex justify-between items-center mb-4">
          <input
            type="text"
            placeholder="Buscar por nome ou email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-64 px-3 py-2 border rounded"
          />
          <button
            onClick={() => setShowForm(!showForm)}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            {showForm ? 'Cancelar' : `+ Novo ${activeTab === 'professionals' ? 'Profissional' : 'Recepcionista'}`}
          </button>
        </div>

        {/* Formulário */}
        {showForm && (
          <form onSubmit={handleSubmit} className="mb-8 p-4 bg-gray-50 rounded-lg">
            <h2 className="text-lg font-semibold mb-4">
              Novo {activeTab === 'professionals' ? 'Profissional' : 'Recepcionista'}
            </h2>
            
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Nome completo *</label>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="w-full px-3 py-2 border rounded"
                  required
                />
                {errors.name && <p className="text-sm text-red-600 mt-1">{errors.name}</p>}
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Email *</label>
                <input
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  className="w-full px-3 py-2 border rounded"
                  required
                />
                {errors.email && <p className="text-sm text-red-600 mt-1">{errors.email}</p>}
              </div>
              
              <div>
                <PasswordInput
                  label="Senha *"
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  error={errors.password}
                  className="w-full"
                  required
                  minLength={6}
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Telefone</label>
                <input
                  type="tel"
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  className="w-full px-3 py-2 border rounded"
                  placeholder="(11) 99999-9999"
                />
              </div>

              {activeTab === 'professionals' && (
                <>
                  <div>
                    <label className="block text-sm font-medium mb-1">Especialidade *</label>
                    <select
                      value={form.specialtyId}
                      onChange={(e) => setForm({ ...form, specialtyId: e.target.value })}
                      className="w-full px-3 py-2 border rounded"
                      required
                    >
                      <option value="">Selecione</option>
                      {SPECIALTY_CATEGORIES.map(cat => (
                        <optgroup key={cat.value} label={cat.label}>
                          {specialties?.items.filter(s => s.category === cat.value).map(s => (
                            <option key={s.id} value={s.id}>{s.name}</option>
                          ))}
                        </optgroup>
                      ))}
                    </select>
                    {errors.specialtyId && <p className="text-sm text-red-600 mt-1">{errors.specialtyId}</p>}
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-1">Registro Profissional</label>
                    <input
                      type="text"
                      value={form.registerNumber}
                      onChange={(e) => setForm({ ...form, registerNumber: e.target.value })}
                      className="w-full px-3 py-2 border rounded"
                      placeholder="CRM/SP 123456"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-1">Cor na agenda</label>
                    <input
                      type="color"
                      value={form.color}
                      onChange={(e) => setForm({ ...form, color: e.target.value })}
                      className="w-full h-10 border rounded"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-1">Tipo de Atendimento</label>
                    <select
                      value={form.appointmentTypeId}
                      onChange={(e) => setForm({ ...form, appointmentTypeId: e.target.value })}
                      className="w-full px-3 py-2 border rounded"
                    >
                      <option value="">Selecione</option>
                      {serviceTypes?.items.map(st => (
                        <option key={st.id} value={st.id}>{st.name} ({st.duration}min)</option>
                      ))}
                    </select>
                  </div>
                </>
              )}

              {activeTab === 'receptionists' && (
                <div>
                  <label className="block text-sm font-medium mb-1">Função</label>
                  <select
                    value={form.function}
                    onChange={(e) => setForm({ ...form, function: e.target.value })}
                    className="w-full px-3 py-2 border rounded"
                  >
                    <option value="Recepção">Recepção</option>
                    <option value="Coordenação">Coordenação</option>
                    <option value="Administrativo Geral">Administrativo Geral</option>
                  </select>
                </div>
              )}
            </div>

            {errors.form && <p className="text-red-600 mt-2">{errors.form}</p>}
            {success && <p className="text-green-600 mt-2">{success}</p>}

            <button
              type="submit"
              disabled={createMutation.isPending}
              className="mt-4 bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
            >
              {createMutation.isPending ? 'Salvando...' : 'Salvar'}
            </button>
          </form>
        )}

        {/* Lista */}
        {isLoading ? (
          <p>Carregando...</p>
        ) : filteredMembers.length === 0 ? (
          <p className="text-gray-500">Nenhum {activeTab === 'professionals' ? 'profissional' : 'recepcionista'} cadastrado.</p>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="text-left border-b">
                <th className="pb-2">Nome</th>
                <th className="pb-2">Email</th>
                <th className="pb-2">Telefone</th>
                <th className="pb-2">Status</th>
              </tr>
            </thead>
            <tbody>
              {filteredMembers.map((member) => (
                <tr key={member.id} className="border-b">
                  <td className="py-2">{member.name}</td>
                  <td className="py-2">{member.email}</td>
                  <td className="py-2">{member.phone || '-'}</td>
                  <td className="py-2">
                    <span className="px-2 py-1 bg-green-100 text-green-800 rounded text-sm">
                      Ativo
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Adicionar método listUsers ao usersApi**

Em `apps/web/src/lib/api/users.ts`:
```typescript
listUsers: async (params?: { role?: string; page?: number; limit?: number }) => {
  const searchParams = new URLSearchParams();
  if (params?.role) searchParams.set('role', params.role);
  if (params?.page) searchParams.set('page', params.page.toString());
  if (params?.limit) searchParams.set('limit', params.limit.toString());
  const query = searchParams.toString();
  return api.get<{ items: UserWithRole[]; pagination: Pagination }>(`/users${query ? `?${query}` : ''}`);
},
```

Adicionar tipo:
```typescript
export interface UserWithRole {
  id: string;
  email: string;
  name: string;
  phone?: string;
  role: string;
  isActive: boolean;
  createdAt: string;
}
```

---

## Task 9: Adicionar Rota no Sidebar

**Files:**
- Modify: `apps/web/src/components/layout/sidebar.tsx`

- [ ] **Step 1: Adicionar item de menu para Team**

```typescript
{
  href: '/settings/team',
  label: 'Equipe',
  icon: UsersIcon,
  allowedRoles: ['super_admin', 'org_admin'],
},
```

---

## Task 10: Testar e Verificar

**Files:**
- Test: API endpoints com curl ou Postman
- Test: Frontend navigate to /settings/team

- [ ] **Step 1: Testar API de specialties**

```bash
# Listar specialties
curl -H "Authorization: Bearer <token>" http://localhost:3001/api/v1/specialties
```

- [ ] **Step 2: Testar criação de profissional via API**

```bash
# Criar usuário professional
curl -X POST -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{"email":"dr@teste.com","password":"Teste123","name":"Dr Teste","roleId":"00000000-0000-0000-0000-000000000003"}' \
  http://localhost:3001/api/v1/users
```

- [ ] **Step 3: Testar frontend**

Acessar: http://localhost:3000/settings/team

- [ ] **Step 4: Verificar seed de especialidades**

Consultar tabela specialties no banco de dados

---

## Resumo de Arquivos

### Criar
- `apps/api/src/modules/specialties/specialties.module.ts`
- `apps/api/src/modules/specialties/specialties.service.ts`
- `apps/api/src/modules/specialties/specialties.controller.ts`
- `apps/api/src/modules/specialties/dto/specialty.dto.ts`
- `apps/web/src/app/(authenticated)/settings/team/page.tsx`

### Modificar
- `apps/api/prisma/schema.prisma`
- `apps/api/src/common/seed.service.ts`
- `apps/api/src/modules/users/dto/user.dto.ts`
- `apps/api/src/modules/settings/dto/settings.dto.ts`
- `apps/api/src/modules/users/users.service.ts`
- `apps/api/src/modules/users/users.controller.ts`
- `apps/api/src/modules/settings/settings.service.ts`
- `apps/api/src/app.module.ts`
- `apps/web/src/lib/api/settings.ts`
- `apps/web/src/lib/api/users.ts`
- `apps/web/src/components/layout/sidebar.tsx`