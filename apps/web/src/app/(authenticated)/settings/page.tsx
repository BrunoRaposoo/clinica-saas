'use client';

import Link from 'next/link';
import { useRole } from '@/hooks/use-role';

const settingsItems = [
  { href: '/settings/general', label: 'Configurações Gerais', description: 'Dados da clínica, logo, contato', allowedRoles: ['org_admin', 'super_admin'] },
  { href: '/settings/units', label: 'Unidades', description: 'Filiais e locais de atendimento', allowedRoles: ['org_admin', 'super_admin'] },
  { href: '/settings/team', label: 'Equipe', description: 'Profissionais e recepcionistas', allowedRoles: ['org_admin', 'super_admin'] },
];

export default function SettingsPage() {
  const { hasRole } = useRole();

  const visibleItems = settingsItems.filter(item => hasRole(item.allowedRoles));

  if (visibleItems.length === 0) {
    return (
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold mb-6">Configurações</h1>
        <p className="text-gray-500">Você não tem acesso às configurações.</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Configurações</h1>
      
      <div className="grid grid-cols-2 gap-4">
        {visibleItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="block p-6 bg-white rounded-lg shadow hover:shadow-md transition-shadow"
          >
            <h2 className="text-lg font-semibold text-gray-800">{item.label}</h2>
            <p className="text-sm text-gray-500 mt-1">{item.description}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}