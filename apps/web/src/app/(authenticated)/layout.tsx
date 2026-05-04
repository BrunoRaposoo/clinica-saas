'use client';

import { useEffect, useState, useMemo } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { useSession } from '@/providers/session-provider';
import { useRole } from '@/hooks/use-role';

const navItemsBase = [
  { href: '/dashboard', label: 'Dashboard', icon: '📊', allowedRoles: ['super_admin', 'org_admin', 'receptionist', 'professional', 'support'] },
  { href: '/patients', label: 'Pacientes', icon: '👥', allowedRoles: ['super_admin', 'org_admin', 'receptionist', 'professional', 'support'] },
  { href: '/schedule', label: 'Agenda', icon: '📅', allowedRoles: ['super_admin', 'org_admin', 'receptionist', 'professional', 'support'] },
  { href: '/appointments', label: 'Agendamentos', icon: '🗓️', allowedRoles: ['super_admin', 'org_admin', 'receptionist', 'professional', 'support'] },
  { href: '/tasks', label: 'Tarefas', icon: '📋', allowedRoles: ['super_admin', 'org_admin', 'receptionist', 'professional', 'support'] },
];

const bottomNavItems = [
  { href: '/settings', label: 'Configurações', icon: '⚙️', allowedRoles: ['super_admin', 'org_admin', 'receptionist'] },
];

export default function AuthenticatedLayout({ children }: { children: React.ReactNode }) {
  const { user, isLoading, isAuthenticated } = useSession();
  const { hasRole } = useRole();
  const router = useRouter();
  const pathname = usePathname();
  const [isInitialized, setIsInitialized] = useState(false);

  const navItems = useMemo(() => {
    return navItemsBase.filter(item => hasRole(item.allowedRoles));
  }, [hasRole]);

  const filteredBottomNavItems = useMemo(() => {
    return bottomNavItems.filter(item => hasRole(item.allowedRoles));
  }, [hasRole]);

  useEffect(() => {
    if (!isLoading) {
      setIsInitialized(true);
      if (!isAuthenticated) {
        router.push('/login');
      }
    }
  }, [isLoading, isAuthenticated, router]);

  if (!isInitialized || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Carregando...</div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <aside className="w-64 bg-white shadow-md min-h-screen flex flex-col">
        <div className="p-4 border-b">
          <h1 className="text-xl font-bold text-blue-600">Clínica SaaS</h1>
        </div>
        <nav className="flex-1 mt-4">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`block px-4 py-2 text-gray-700 hover:bg-gray-100 ${
                pathname === item.href || pathname.startsWith(item.href + '/')
                  ? 'bg-blue-50 text-blue-600'
                  : ''
              }`}
            >
              <span className="mr-2">{item.icon}</span>
              {item.label}
            </Link>
          ))}
        </nav>
        
        <div className="border-t mt-auto">
          {filteredBottomNavItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`block px-4 py-2 text-gray-700 hover:bg-gray-100 ${
                pathname === item.href || pathname.startsWith(item.href + '/')
                  ? 'bg-blue-50 text-blue-600'
                  : ''
              }`}
            >
              <span className="mr-2">{item.icon}</span>
              {item.label}
            </Link>
          ))}
          <div className="p-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white">
                {user?.name?.charAt(0).toUpperCase() || 'U'}
              </div>
              <div>
                <p className="text-sm font-medium">{user?.name}</p>
                <button
                  onClick={() => {
                    localStorage.clear();
                    router.push('/login');
                  }}
                  className="text-xs text-gray-500 hover:text-red-600"
                >
                  Sair
                </button>
              </div>
            </div>
          </div>
        </div>
      </aside>
      <main className="flex-1 p-8">
        {children}
      </main>
    </div>
  );
}