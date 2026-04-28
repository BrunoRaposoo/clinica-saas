# RolesGuard Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implementar RolesGuard com controle de acesso por role, seguindo abordagem incremental por módulo.

**Architecture:** Criar RolesGuard + decorador @Roles, aplicar em controllers seguindo ordem de prioridade (Fase 1: segurança crítica → Fase 2 → Fase 3).

**Tech Stack:** NestJS, TypeScript, Guards e Decorators do NestJS.

---

## File Structure

### Novos Arquivos
- `apps/api/src/common/guards/roles.guard.ts`
- `apps/api/src/common/decorators/roles.decorator.ts`

### Arquivos Existentes a Modificar
- `apps/api/src/modules/settings/settings.controller.ts`
- `apps/api/src/modules/organizations/organizations.controller.ts`
- `apps/api/src/modules/roles/roles.controller.ts`
- `apps/api/src/modules/users/users.controller.ts`
- `apps/api/src/modules/patients/patients.controller.ts`
- `apps/api/src/modules/appointments/appointments.controller.ts`
- `apps/api/src/modules/documents/documents.controller.ts`
- `apps/api/src/modules/dashboard/dashboard.controller.ts`
- `apps/api/src/modules/tasks/tasks.controller.ts`
- `apps/api/src/modules/professionals/professionals.controller.ts`

---

## FASE 1: SEGURANÇA CRÍTICA (Priority Alta)

### Task 1: Criar RolesGuard

**Files:**
- Create: `apps/api/src/common/guards/roles.guard.ts`
- Test: `apps/api/src/common/guards/roles.guard.spec.ts` (manual via curl)

- [ ] **Step 1: Criar RolesGuard**

```typescript
import { Injectable, CanActivate, ExecutionContext, ForbiddenException, Inject } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { SetMetadata } from '@nestjs/common';

export const ROLES_KEY = 'roles';
export const Roles = (...roles: string[]) => SetMetadata(ROLES_KEY, roles);

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<string[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!requiredRoles || requiredRoles.length === 0) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user || !user.roleName) {
      throw new ForbiddenException('Usuário não autenticado.');
    }

    if (requiredRoles.includes(user.roleName)) {
      return true;
    }

    throw new ForbiddenException(
      `Acesso não autorizado. Roles permitidos: ${requiredRoles.join(', ')}`
    );
  }
}
```

- [ ] **Step 2: Exportar no common module**

Verificar se `RolesGuard` está exportado no `common/common.module.ts`

---

### Task 2: Criar Decorador @Roles

**Files:**
- Modify: `apps/api/src/common/decorators/roles.decorator.ts` (criar se não existir)

- [ ] **Step 1: Criar decorador**

```typescript
import { SetMetadata } from '@nestjs/common';

export const ROLES_KEY = 'roles';

/**
 * Decorador para definir roles permitidas em um controller ou endpoint.
 * Uso: @Roles('org_admin', 'receptionist')
 */
export const Roles = (...roles: string[]) => SetMetadata(ROLES_KEY, roles);
```

---

### Task 3: settings/* → só org_admin+

**Files:**
- Modify: `apps/api/src/modules/settings/settings.controller.ts`

- [ ] **Step 1: Adicionar RolesGuard + decorator**

No controller, adicionar:
```typescript
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';

@ApiTags('Settings')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('super_admin', 'org_admin')
@Controller('settings')
export class SettingsController { }
```

- [ ] **Step 2: Testar endpoint**

```bash
# Login como professional (deve retornar 403)
curl -X GET http://localhost:3000/api/v1/settings \
  -H "Authorization: Bearer <token_professional>"
# Expected: 403 Forbidden

# Login como org_admin (deve retornar 200)
curl -X GET http://localhost:3000/api/v1/settings \
  -H "Authorization: Bearer <token_org_admin>"
# Expected: 200 OK
```

---

### Task 4: organizations/* → só super_admin

**Files:**
- Modify: `apps/api/src/modules/organizations/organizations.controller.ts`

- [ ] **Step 1: Adicionar RolesGuard + decorator**

```typescript
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('super_admin')
@Controller('organizations')
```

- [ ] **Step 2: Testar**

```bash
# org_admin accessing organizations (deve retornar 403)
curl -X GET http://localhost:3000/api/v1/organizations \
  -H "Authorization: Bearer <token_org_admin>"
# Expected: 403 Forbidden
```

---

### Task 5: roles/* → só super_admin

**Files:**
- Modify: `apps/api/src/modules/roles/roles.controller.ts`

- [ ] **Step 1: Adicionar RolesGuard + decorator**

```typescript
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('super_admin')
@Controller('roles')
```

---

## FASE 2: DADOS SENSÍVEIS (Priority Média)

### Task 6: users/* → receptionist+

**Files:**
- Modify: `apps/api/src/modules/users/users.controller.ts`

- [ ] **Step 1: Adicionar RolesGuard**

```typescript
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('super_admin', 'org_admin', 'receptionist')
@Controller('users')
```

---

### Task 7: patients/* → receptionist+ (professional só leitura)

**Files:**
- Modify: `apps/api/src/modules/patients/patients.controller.ts`

- [ ] **Step 1: Adicionar RolesGuard (leitura)**

```typescript
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('super_admin', 'org_admin', 'receptionist')
@Controller('patients')
```

- Observação: Professional tem acesso apenas para ler (GET), não para criar/editar (POST/PATCH/DELETE)

---

### Task 8: appointments/* → receptionist+, professional próprios

**Files:**
- Modify: `apps/api/src/modules/appointments/appointments.controller.ts`

- [ ] **Step 1: Adicionar RolesGuard base**

```typescript
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('super_admin', 'org_admin', 'receptionist', 'professional')
@Controller('appointments')
```

- [ ] **Step 2: No service, filtrar por professionalId**

No `appointments.service.ts`, adicionar lógica para filtrar appointments quando role = professional:
```typescript
async findAll(organizationId: string, query: any, user: TokenPayload) {
  const where: any = { organizationId };
  
  // Se for professional, filtrar apenas os próprios
  if (user.roleName === 'professional') {
    const professional = await this.prisma.professional.findFirst({
      where: { userId: user.sub }
    });
    if (professional) {
      where.professionalId = professional.id;
    }
  }
  // ... resto da lógica
}
```

---

## FASE 3: RECURSOS (Priority Baixa)

### Task 9: documents/* → receptionist+, professional pacientes atendidos

**Files:**
- Modify: `apps/api/src/modules/documents/documents.controller.ts`

- [ ] **Step 1: Adicionar RolesGuard**

```typescript
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('super_admin', 'org_admin', 'receptionist', 'professional')
@Controller('documents')
```

- [ ] **Step 2: No service, filtrar pacientes atendidos (futuro)**

---

### Task 10: dashboard/* → professional filtrado

**Files:**
- Modify: `apps/api/src/modules/dashboard/dashboard.controller.ts`

- [ ] **Step 1: Adicionar RolesGuard**

```typescript
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('super_admin', 'org_admin', 'receptionist', 'professional', 'support')
@Controller('dashboard')
```

- [ ] **Step 2: No service, filtrar dados por role**

No dashboard, quando role = professional, retornar apenas dados relacionados ao professional.

---

### Task 11: tasks/* → professional próprias

**Files:**
- Modify: `apps/api/src/modules/tasks/tasks.controller.ts`

- [ ] **Step 1: Adicionar RolesGuard**

```typescript
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('super_admin', 'org_admin', 'receptionist', 'professional')
@Controller('tasks')
```

- [ ] **Step 2: No service, filtrar tarefas**

Quando role = professional:
- Ler: todas as tarefas
- Criar/Editar: apenas criadas ou atribuídas ao próprio

---

## Testes Manuais

### Teste 1: Professional tenta acessar settings

```bash
# 1. Fazer login como professional
curl -X POST http://localhost:3000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "professional@clinica.com", "password": "senha123"}'

# 2. Acessar settings (deve falhar)
curl -X GET http://localhost:3000/api/v1/settings \
  -H "Authorization: Bearer <access_token>"
# Esperado: 403 Forbidden
```

### Teste 2: Professional tenta criar usuário

```bash
curl -X POST http://localhost:3000/api/v1/users \
  -H "Authorization: Bearer <access_token_professional>" \
  -H "Content-Type: application/json" \
  -d '{"email": "new@user.com", "name": "New User", "password": "Pass123"}'
# Esperado: 403 Forbidden
```

### Teste 3: Professional listar appointments

```bash
# Professional deve ver apenas os próprios
curl -X GET http://localhost:3000/api/v1/appointments \
  -H "Authorization: Bearer <access_token_professional>"
# Esperado: 200 OK, apenas appointments do professional
```

### Teste 4: Receptionist cria paciente (ok)

```bash
curl -X POST http://localhost:3000/api/v1/patients \
  -H "Authorization: Bearer <access_token_receptionist>" \
  -H "Content-Type: application/json" \
  -d '{"name": "Paciente Teste", "phone": "11999999999"}'
# Esperado: 201 Created
```

---

## Checklist Final

- [ ] RolesGuard criado e funcionando
- [ ] Decorador @Roles criado
- [ ] Fase 1: settings, organizations, roles protegidos
- [ ] Fase 2: users, patients, appointments protegidos
- [ ] Fase 3: documents, dashboard, tasks protegidos
- [ ] Testes manuais passando