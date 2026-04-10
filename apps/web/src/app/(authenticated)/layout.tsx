'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { useSession } from '@/providers/session-provider';

const navItems = [
  { href: '/dashboard', label: 'Dashboard', icon: '📊' },
  { href: '/patients', label: 'Pacientes', icon: '👥' },
  { href: '/schedule', label: 'Agenda', icon: '📅' },
  { href: '/appointments', label: 'Agendamentos', icon: '🗓️' },
];

export default function AuthenticatedLayout({ children }: { children: React.ReactNode }) {
  const { user, isLoading, isAuthenticated } = useSession();
  const router = useRouter();
  const pathname = usePathname();
  const [isInitialized, setIsInitialized] = useState(false);

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
      <aside className="w-64 bg-white shadow-md min-h-screen">
        <div className="p-4 border-b">
          <h1 className="text-xl font-bold text-blue-600">Clínica SaaS</h1>
        </div>
        <nav className="mt-4">
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
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="absolute bottom-0 w-64 p-4 border-t">
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
      </aside>
      <main className="flex-1 p-8">
        {children}
      </main>
    </div>
  );
}