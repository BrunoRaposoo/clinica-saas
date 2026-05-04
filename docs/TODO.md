# Roadmap de Implementação

## Fase 1: Fundação (Concluído)
- [x] Estrutura de monorepo
- [x] Configuração TypeScript
- [x] Configuração ESLint + Prettier
- [x] Backend base (NestJS)
- [x] Frontend base (Next.js)
- [x] Pacote de contratos compartilhados
- [x] Pacote de utilitários compartilhados
- [x] Pacote de UI components
- [x] Docker Compose (PostgreSQL + Redis)
- [x] Documentação inicial

## Fase 2: Autenticação (Próxima)
- [ ] Módulo de autenticação JWT
- [ ] Login/Logout
- [ ] Registro de usuários
- [ ] Middleware de autenticação
- [ ] Guards de autorização por role

## Fase 3: Gestão de Clínicas
- [ ] CRUD de clínicas
- [ ] Cadastro de clínica no registro
- [ ] Configurações da clínica

## Fase 4: Gestão de Usuários
- [ ] CRUD de usuários
- [ ] Atribuição de roles
- [ ] Vinculação com clínica

## Fase 5: Gestão de Profissionais
- [ ] CRUD de profissionais
- [ ] Especialidades
- [ ] Vinculação com usuário

## Fase 6: Gestão de Pacientes
- [ ] CRUD de pacientes
- [ ] Busca de pacientes
- [ ] Cadastro básico

## Fase 7: Agenda
- [ ] Agendamento de consultas
- [ ] Calendário
- [ ] Status de agendamento

## Fase 8: Mensagens (Reservado)
- [ ] Sistema de mensagens (futuro)

## Fase 9: Financeiro (Reservado)
- [ ] Módulo financeiro (futuro)

### Financeiro - ToDo Automação
- [ ] Job automatizado para atualizar status overdue (endpoint manual implementado, para automatizar instalar @nestjs/schedule e configurar cron job)

---

## Tarefas Técnicas Pendentes

### Banco de Dados
- [ ] Executar migrations
- [ ] Seed de dados iniciais

### Infraestrutura
- [ ] Configurar variáveis de ambiente
- [ ] Verificar conexão com PostgreSQL
- [ ] Verificar conexão com Redis

### Desenvolvimento
- [ ] Instalar dependências em todos os pacotes
- [ ] Testar compilação TypeScript
- [ ] Testar build de produção

---

## Como Adicionar Nova Feature

1. **Defina o domínio:** Adicione tipos/enums em `@clinica-saas/contracts`
2. **Crie o módulo backend:** `apps/api/src/modules/<feature>`
3. **Crie o módulo frontend:** `apps/web/src/components/<feature>`
4. **Atualize testes:** Adicione testes unitários

## Prioridades

1. Autenticação (essencial para qualquer sistema)
2. Gestão de clínicas (primeira entidade de negócio)
3. Gestão de pacientes (核心 do sistema)
4. Agenda (funcionalidade principal)