import { Injectable, OnModuleInit } from '@nestjs/common';
import { PrismaService } from '../common/prisma.service';
import * as bcrypt from 'bcrypt';

@Injectable()
export class SeedService implements OnModuleInit {
  private readonly BCRYPT_ROUNDS = 12;

  constructor(private readonly prisma: PrismaService) {}

  async onModuleInit() {
    await this.seedRoles();
    await this.seedPermissions();
    await this.seedOrganization();
    await this.seedSpecialties();
    await this.seedUsers();
  }

  private async seedRoles() {
    const defaultRoles = [
      { id: '00000000-0000-0000-0000-000000000001', name: 'super_admin', description: 'Administrador do sistema', isSystem: true },
      { id: '00000000-0000-0000-0000-000000000002', name: 'org_admin', description: 'Administrador da organização', isSystem: true },
      { id: '00000000-0000-0000-0000-000000000003', name: 'professional', description: 'Profissional de saúde', isSystem: true },
      { id: '00000000-0000-0000-0000-000000000004', name: 'receptionist', description: 'Recepcionista', isSystem: true },
      { id: '00000000-0000-0000-0000-000000000005', name: 'support', description: 'Suporte técnico', isSystem: true },
    ];

    for (const role of defaultRoles) {
      await this.prisma.role.upsert({
        where: { id: role.id },
        update: {},
        create: role,
      });
    }
  }

  private async seedPermissions() {
    const defaultPermissions = [
      { name: 'users.read', description: 'Visualizar usuários' },
      { name: 'users.write', description: 'Criar/editar usuários' },
      { name: 'users.delete', description: 'Excluir usuários' },
      { name: 'organizations.read', description: 'Visualizar organizações' },
      { name: 'organizations.write', description: 'Criar/editar organizações' },
      { name: 'organizations.delete', description: 'Excluir organizações' },
      { name: 'roles.read', description: 'Visualizar roles' },
      { name: 'roles.write', description: 'Criar/editar roles' },
      { name: 'roles.delete', description: 'Excluir roles' },
      { name: 'appointments.read', description: 'Visualizar agendamentos' },
      { name: 'appointments.write', description: 'Criar/editar agendamentos' },
      { name: 'patients.read', description: 'Visualizar pacientes' },
      { name: 'patients.write', description: 'Criar/editar pacientes' },
      { name: 'reports.read', description: 'Visualizar relatórios' },
      { name: 'settings.read', description: 'Visualizar configurações' },
      { name: 'settings.write', description: 'Editar configurações' },
    ];

    for (const permission of defaultPermissions) {
      await this.prisma.permission.upsert({
        where: { name: permission.name },
        update: {},
        create: permission,
      });
    }
  }

  private async seedOrganization() {
    await this.prisma.organization.upsert({
      where: { document: '00.000.000/0001-00' },
      update: {},
      create: {
        id: '00000000-0000-0000-0000-000000000010',
        name: 'Clínica Demo',
        document: '00.000.000/0001-00',
        email: 'contato@clinicademo.com.br',
        phone: '(11) 99999-9999',
        address: 'Rua Exemplo, 123 - São Paulo, SP',
        isActive: true,
      },
    });
  }

  private async seedUsers() {
    const hashedPassword = await bcrypt.hash('Admin123', this.BCRYPT_ROUNDS);

    await this.prisma.user.upsert({
      where: { email: 'admin@clinicademo.com.br' },
      update: {},
      create: {
        email: 'admin@clinicademo.com.br',
        password: hashedPassword,
        name: 'Administrador Demo',
        organizationId: '00000000-0000-0000-0000-000000000010',
        roleId: '00000000-0000-0000-0000-000000000002',
        isActive: true,
      },
    });

    const hashedPasswordSupport = await bcrypt.hash('Support123', this.BCRYPT_ROUNDS);
    await this.prisma.user.upsert({
      where: { email: 'suporte@clinicademo.com.br' },
      update: {},
      create: {
        email: 'suporte@clinicademo.com.br',
        password: hashedPasswordSupport,
        name: 'Suporte Demo',
        organizationId: '00000000-0000-0000-0000-000000000010',
        roleId: '00000000-0000-0000-0000-000000000005',
        isActive: true,
      },
    });
  }

  private async seedSpecialties() {
    const defaultSpecialties = [
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
      { category: 'dental', name: 'Ortodontia' },
      { category: 'dental', name: 'Periodontia' },
      { category: 'dental', name: 'Endodontia' },
      { category: 'dental', name: 'Cirurgia Oral' },
      { category: 'dental', name: 'Implantodontia' },
      { category: 'dental', name: 'Prótese Dentária' },
      { category: 'dental', name: 'Odontopediatria' },
      { category: 'psychology', name: 'Psicologia Clínica' },
      { category: 'psychology', name: 'Psicologia Escolar' },
      { category: 'psychology', name: 'Psicologia Organizacional' },
      { category: 'psychology', name: 'Neuropsicologia' },
      { category: 'psychology', name: 'Psicologia Infantil' },
      { category: 'psychology', name: 'Psicologia da Saúde' },
      { category: 'nutrition', name: 'Nutrição Clínica' },
      { category: 'nutrition', name: 'Nutrição Esportiva' },
      { category: 'nutrition', name: 'Nutrição Pediátrica' },
      { category: 'nutrition', name: 'Nutrição Gerontológica' },
      { category: 'nutrition', name: 'Nutrição Oncológica' },
      { category: 'physiotherapy', name: 'Fisioterapia Ortopédica' },
      { category: 'physiotherapy', name: 'Fisioterapia Neurológica' },
      { category: 'physiotherapy', name: 'Fisioterapia Respiratória' },
      { category: 'physiotherapy', name: 'Fisioterapia Pediátrica' },
      { category: 'physiotherapy', name: 'Fisioterapia Geriátrica' },
      { category: 'physiotherapy', name: 'Fisioterapia Esportiva' },
      { category: 'physiotherapy', name: 'RPG / Souchard' },
      { category: 'technical', name: 'Técnico em Enfermagem' },
      { category: 'technical', name: 'Técnico em Radiologia' },
      { category: 'technical', name: 'Técnico em Análises Clínicas' },
      { category: 'technical', name: 'Técnico em Saúde Bucal' },
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
}