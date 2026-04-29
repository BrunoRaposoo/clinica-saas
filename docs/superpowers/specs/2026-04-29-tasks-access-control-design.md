# SPEC: Controle de Acesso em Tarefas

## 1. Contexto do Problema

O sistema atual permite que qualquer usuário autenticado visualize todas as tarefas da organização, independente de ser o criador ou responsável. Isso causa:
- Profissionais visualizando tarefas de outros profissionais
- Falha de privacidade entre equipes
- Inconsistência com a matriz de acesso definida

## 2. Objetivo

Implementar controle de acesso granular nas tarefas:
- `super_admin` e `org_admin` → acesso total
- `receptionist` → acesso total (pode criar, editar próprias, excluir não)
- `professional` → acesso restrito (apenas tarefas criadas por ele ou atribuídas a ele)
- `support` → sem acesso

## 3. Escopo

### Dentro do Escopo:
- [x] Atualizar `findAll()` para filtrar tarefas por usuário
- [x] Atualizar `findById()` para validar acesso
- [x] Verificar que `update()`, `delete()`, `updateStatus()` já têm validação
- [x] Atualizar matriz de acesso na documentação

### Fora do Escopo:
- [ ] Notificações de acesso negado
- [ ] Auditoria de tentativas de acesso

## 4. Matriz de Acesso Atualizada

### tasks
| Role        | Ler | Criar | Editar | Excluir |
|-------------|-----|-------|--------|---------|
| super_admin | Todas | ✓ | Todas | ✓ |
| org_admin   | Todas | ✓ | Todas | ✓ |
| receptionist| Todas | ✓ | Próprias | ✗ |
| professional| **Próprias ou atribuídas** | Próprias | Próprias | ✗ |
| support     | ✗ | ✗ | ✗ | ✗ |

## 5. Implementação Backend

### 5.1 TasksService - findAll()
```typescript
async findAll(params: TaskListParams, organizationId: string, userId: string, roleName: string): Promise<TaskListResponse> {
  const where: any = { organizationId };

  // Para professional: filtrar tarefas próprias ou atribuídas
  if (roleName === 'professional') {
    where.OR = [
      { createdBy: userId },
      { assignedTo: userId }
    ];
  }

  // ... resto da lógica
}
```

### 5.2 TasksService - findById()
```typescript
async findById(id: string, organizationId: string, userId: string, roleName: string): Promise<Task> {
  const task = await this.prisma.task.findFirst({
    where: { id, organizationId },
    // ... includes
  });

  if (!task) {
    throw new NotFoundException('Tarefa não encontrada');
  }

  // Para professional: verificar se tem acesso
  if (roleName === 'professional' && 
      task.createdBy !== userId && 
      task.assignedTo !== userId) {
    throw new NotFoundException('Tarefa não encontrada'); // 404 para segurança
  }

  return this.mapTaskWithComments(task);
}
```

### 5.3 Controller Updates
O controller precisa passar `roleName` para o service:
```typescript
// TasksController
async findAll(@CurrentUser() user: any) {
  return this.tasksService.findAll(query, user.organizationId!, user.sub, user.roleName);
}
```

## 6. Critérios de Aceite

### Funcional:
- [ ] org_admin vê todas as tarefas da organização
- [ ] receptionist vê todas as tarefas da organização
- [ ] professional vê apenas tarefas criadas por ele
- [ ] professional vê apenas tarefas atribuídas a ele
- [ ] professional não consegue acessar detalhes de outras tarefas (retorna 404)
- [ ] professional não consegue editar/excluir tarefas de outros
- [ ] support não consegue acessar tarefas

### Técnica:
- [ ] Código compila sem erros
- [ ] Testes passam (se existirem)

---

## 7. Histórico de Versões

| Versão | Data | Descrição |
|--------|------|-----------|
| 1.0.0 | 2026-04-29 | Initial spec - Controle de acesso em tarefas |

---

**Contato**: docs/superpowers/specs/2026-04-28-rolesguard-access-control-design.md