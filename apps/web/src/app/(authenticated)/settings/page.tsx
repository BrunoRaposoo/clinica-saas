'use client';

import Link from 'next/link';

const settingsItems = [
  { href: '/settings/general', label: 'Configurações Gerais', description: 'Dados da clínica, logo, contato' },
  { href: '/settings/units', label: 'Unidades', description: 'Filiais e locais de atendimento' },
  { href: '/settings/professionals', label: 'Profissionais', description: 'Cadastro de profissionais da clínica' },
];

export default function SettingsPage() {
  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Configurações</h1>
      
      <div className="grid grid-cols-2 gap-4">
        {settingsItems.map((item) => (
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