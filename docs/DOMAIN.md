# Domínio do Sistema

Este documento define os conceitos e entidades do domínio do sistema de gestão de clínicas.

## Entidades Principais

### Clinic (Clínica)
Representa uma clínica ou consultório no sistema.

**Atributos:**
- `id`: UUID único
- `name`: Nome da clínica
- `document`: CNPJ/CPF
- `email`: Email de contato
- `phone`: Telefone
- `address`: Endereço
- `createdAt`: Data de criação
- `updatedAt`: Data de atualização

**Relacionamentos:**
- Pertence a múltiplos `User`
- Pertence a múltiplos `Professional`
- Pertence a múltiplos `Patient`
- Pertence a múltiplos `Appointment`

### User (Usuário)
Usuários do sistema (admin, proprietários, profissionais, recepção).

**Atributos:**
- `id`: UUID único
- `email`: Email único
- `name`: Nome completo
- `password`: Senha hash
- `role`: Função no sistema
- `clinicId`: Clínica vinculada (opcional)
- `createdAt`: Data de criação
- `updatedAt`: Data de atualização

**Roles:**
- `admin`: Administrador do sistema
- `clinic_owner`: Proprietário de clínica
- `professional`: Profissional de saúde
- `receptionist`: Recepcionista

**Relacionamentos:**
- Pertence a uma `Clinic` (opcional)
- Pode ter um `Professional` associado

### Professional (Profissional)
Profissionais de saúde vinculados a uma clínica.

**Atributos:**
- `id`: UUID único
- `userId`: Referência ao User
- `clinicId`: Clínica vinculada
- `specialty`: Especialidade
- `document`: Registro profissional (CRM, CRP, etc)
- `createdAt`: Data de criação
- `updatedAt`: Data de atualização

**Specialties:**
- `nutritionist`: Nutricionista
- `psychologist`: Psicólogo
- `physiotherapist`: Fisioterapeuta
- `dentist`: Dentista
- `general_practitioner`: Clínico geral
- `other`: Outro

**Relacionamentos:**
- Pertence a uma `Clinic`
- Tem um `User` associado
- Pode ter múltiplos `Appointment`

### Patient (Paciente)
Pacientes atendidos nas clínicas.

**Atributos:**
- `id`: UUID único
- `clinicId`: Clínica vinculada
- `name`: Nome completo
- `email`: Email (opcional)
- `phone`: Telefone
- `document`: CPF (opcional)
- `birthDate`: Data de nascimento
- `createdAt`: Data de criação
- `updatedAt`: Data de atualização

**Relacionamentos:**
- Pertence a uma `Clinic`
- Pode ter múltiplos `Appointment`

### Appointment (Agendamento)
Agendamentos de consultas/atendimentos.

**Atributos:**
- `id`: UUID único
- `clinicId`: Clínica vinculada
- `patientId`: Paciente
- `professionalId`: Profissional
- `status`: Status do agendamento
- `startDate`: Data/hora de início
- `endDate`: Data/hora de término
- `notes`: Observações
- `createdAt`: Data de criação
- `updatedAt`: Data de atualização

**Status:**
- `scheduled`: Agendado
- `confirmed`: Confirmado
- `in_progress`: Em andamento
- `completed`: Concluído
- `cancelled`: Cancelado
- `no_show`: Não compareceu

**Relacionamentos:**
- Pertence a uma `Clinic`
- Pertence a um `Patient`
- Pertence a um `Professional`

## Módicos do Sistema

### 1. Autenticação e Autorização
- Login/Logout
- JWT tokens
- Roles e permissões

### 2. Gestão de Clínicas
- Cadastro de clínicas
- Configurações da clínica

### 3. Gestão de Usuários
- Cadastro de usuários
- Atribuição de roles

### 4. Gestão de Profissionais
- Cadastro de profissionais
- Especialidades

### 5. Gestão de Pacientes
- Cadastro de pacientes
- Histórico (reservado)

### 6. Agenda
- Agendamento de consultas
- Calendário (reservado)

### 7. Mensagens
- Comunicação com pacientes (reservado)

### 8. Financeiro
- Cobranças, pagamentos (reservado)

## Regras de Negócio Iniciais

1. Uma clínica pode ter múltiplos profissionais
2. Um profissional pertence a uma única clínica
3. Um usuário pode estar associado a um profissional
4. Um paciente pertence a uma única clínica
5. Um agendamento envolve um paciente e um profissional
6. Os status de agendamento controlam o fluxo da consulta

## Notas de Implementação

- Esta é a fundação do sistema
- Entidades estão definidas mas regras de negócio serão implementadas feature por feature
- O schema Prisma está pronto para todas as entidades
- Tipos e schemas Zod compartilhados em `@clinica-saas/contracts`