# SPEC: RolesGuard com Controle de Acesso por Role

## 1. Contexto do Problema

O sistema atual não possuía controle de acesso baseado em roles. Todas as rotas usam apenas `JwtAuthGuard`, permitindo que qualquer usuário autenticado (independentemente da role) acessasse operações administrativas como:
- Criar/editar/excluir usuários
- Alterar configurações da organização
- Ver logs de auditoria
- Criar/cancelar任意 agendamentos
- Acessar dados sensíveis de todos os pacientes

## 2. Objetivo

Implementar controle de acesso granular baseado em roles do sistema:
- Proteger rotas sensíveis de acessos não autorizados
- Implementar abordagem incremental para mitigar riscos
- Documentar matriz de permissões em specs

## 3. Escopo

### Dentro do Escopo:
- [x] Criar RolesGuard
- [x] Criar decorador @Roles
- [x] Aplicar controle incremental por módulo
- [x] Atualizar SPEC 001-auth-tenant-rbac.md com matriz de acesso
- [x] Atualizar apps/api/AGENTS.md com regras de guards

### Fora do Escopo:
- [ ] Permissões granulares por recurso (patients.read, patients.write)
- [ ] Controle de acesso em nível de campo
- [ ] Impersonation (admin se passar por outro usuário)

## 4. Papéis do Sistema

| Role | Descrição | Acesso |
|------|-----------|--------|
| `super_admin` | Administrador do sistema | Todas as operações |
| `org_admin` | Administrador da organização | CRUD completo exceto super_admin |
| `receptionist` | Recepcionista | CRUD completo pacientes, appointments, documents |
| `professional` | Profissional de saúde | Leituras + operações próprias |
| `support` | Suporte técnico | Somente leitura |

## 5. Matriz de Acesso

### 5.1 patients
| Role | Ler | Criar | Editar | Excluir |
|------|-----|------|-------|--------|---------|
| super_admin | ✓ | ✓ | ✓ | ✓ |
| org_admin | ✓ | ✓ | ✓ | ✓ |
| receptionist | ✓ | ✓ | ✓ | ✗ |
| professional | ✓ | ✗ | ✗ | ✗ |
| support | ✓ | ✗ | ✗ | ✗ |

### 5.2 appointments
| Role | Ler | Criar | Editar | Cancelar |
|------|-----|------|-------|-----------|
| super_admin | ✓ | ✓ | ✓ | ✓ |
| org_admin | ✓ | ✓ | ✓ | ✓ |
| receptionist | ✓ | ✓ | ✓ | ✗ |
| professional | próprios | próprios | próprios | próprios |
| support | ✓ | ✗ | ✗ | ✗ |

### 5.3 documents
| Role | Ler | Criar | Editar | Excluir |
|------|-----|------|-------|--------|---------|
| super_admin | ✓ | ✓ | ✓ | ✓ |
| org_admin | ✓ | ✓ | ✓ | ✓ |
| receptionist | ✓ | ✓ | ✓ | ✗ |
| professional | pacientes atendidos | ✗ | ✗ | ✗ |
| support | ✓ | ✗ | ✗ | ✗ |

### 5.4 tasks
| Role | Ler | Criar | Editar | Excluir |
|------|-----|------|-------|--------|---------|
| super_admin | ✓ | ✓ | ✓ | ✓ |
| org_admin | ✓ | ✓ | ✓ | ✓ |
| receptionist | ✓ | ✓ | ✓ | ✗ |
| professional | ✓ | próprias | próprias (atribuídas ou criadas) | ✗ |
| support | ✓ | ✗ | ✗ | ✗ |

### 5.5 dashboard
| Role | Acesso |
|------|--------|
| super_admin | ✓ (global) |
| org_admin | ✓ (global) |
| receptionist | ✓ (global) |
| professional | ✓ (resumo próprio) |
| support | ✓ (global) |

### 5.6 settings
| Role | Ler | Criar | Editar | Excluir |
|------|-----|------|-------|--------|---------|
| super_admin | ✓ | ✓ | ✓ | ✓ |
| org_admin | ✓ | ✓ | ✓ | ✓ |
| receptionist | ✓ | ✗ | ✗ | ✗ |
| professional | ✓ | ✗ | ✗ | ✗ |
| support | ✓ | ✗ | ✗ | ✗ |

### 5.7 organizations
| Role | Ler | Criar | Editar | Excluir |
|------|-----|------|-------|--------|---------|
| super_admin | ✓ | ✓ | ✓ | ✓ |
| org_admin | ✗ | ✗ | ✗ | ✗ |
| receptionist | ✗ | ✗ | ✗ | ✗ |
| professional | ✗ | ✗ | ✗ | ✗ |
| support | ✗ | ✗ | ✗ | ✗ |

### 5.8 users
| Role | Ler | Criar | Editar | Excluir |
|------|-----|------|-------|--------|---------|
| super_admin | ✓ | ✓ | ✓ | ✓ |
| org_admin | ✓ | ✓ | ✓ | ✗ |
| receptionist | ✓ | ✓ | ✗ | ✗ |
| professional | ✗ | ✗ | ✗ | ✗ |
| support | ✗ | ✗ | ✗ | ✗ |

### 5.9 roles
| Role | Ler | Criar | Editar | Excluir |
|------|-----|------|-------|--------|---------|
| super_admin | ✓ | ✓ | ✓ | ✓ |
| org_admin | ✗ | ✗ | ✗ | ✗ |
| receptionist | ✗ | ✗ | ✗ | ✗ |
| professional | ✗ | ✗ | ✗ | ✗ |
| support | ✗ | ✗ | ✗ | ✗ |

## 6. Ordem de Implementação Incremental

### Fase 1: Segurança Crítica (priority alta)
1. `settings/*` → só org_admin+
2. `organizations/*` → só super_admin
3. `roles/*` → só super_admin

### Fase 2: Dados Sensíveis (priority média)
4. `users/*` → receptionist+
5. `patients/*` → receptionist+ (professional só leitura)
6. `appointments/*` → receptionist+, professional próprios

### Fase 3: Recursos (priority baixa)
7. `documents/*` → receptionist+, professional pacientes atendidos
8. `dashboard/*` → professional filtrado
9. `tasks/*` → professional próprias

## 7. Componentes a Criar

### 7.1 RolesGuard
```typescript
// apps/api/src/common/guards/roles.guard.ts
@Injectable()
export class RolesGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const userRole = request.user?.roleName;
    
    const requiredRoles = this.reflector.get<string[]>('roles', context.getClass());
    const handlerRoles = this.reflector.get<string[]>('roles', context.getHandler());
    
    const roles = handlerRoles || requiredRoles;
    
    if (!roles?.length) return true;
    if (roles.includes(userRole)) return true;
    
    throw new ForbiddenException('Acesso não autorizado para esta operação.');
  }
}
```

### 7.2 Decorador @Roles
```typescript
// apps/api/src/common/decorators/roles.decorator.ts
export const Roles = (...roles: string[]) => SetMetadata('roles', roles);
```

### 7.3 Aplicação em Controllers
```typescript
@Controller('patients')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('super_admin', 'org_admin', 'receptionist')
export class PatientsController { }
```

## 8. Atualização de Specs e AGENTS

### 8.1 docs/specs/001-auth-tenant-rbac.md
Adicionar seção 5 com matriz de acesso completa.

### 8.2 apps/api/AGENTS.md
Adicionar regra sobre uso de RolesGuard:
- Todas as rotas devem usar RolesGuard além de JwtAuthGuard
- Decorador @Roles obrigatório em cada controller
- Ordem incremental conforme Fase 1, 2, 3

## 9. Critérios de Aceite

### Funcional:
- [ ] RolesGuard valida roleName do token JWT
- [ ] Decorador @Roles limita acesso por role
- [ ] Professional não consegue criar pacientes
- [ ] Professional só vê próprios appointments
- [ ] Settings só acessível por org_admin+

### Técnica:
- [ ] RolesGuard implementado
- [ ] Decorador @Roles criado
- [ ] Controllers atualizados com decorators
- [ ] SPEC atualizada com matriz
- [ ] AGENTS.md atualizado com regras

## 10. Histórico de Versões

| Versão | Data | Descrição |
|--------|------|-----------|
| 1.0.0 | 2026-04-28 | Initial spec - RolesGuard com controle de acesso |