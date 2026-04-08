'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@clinica-saas/ui';
import { useSession } from '@/providers/session-provider';

export default function DashboardPage() {
  const { user } = useSession();

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Dashboard</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Bem-vindo</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600">
              Olá, <span className="font-semibold">{user?.name}</span>!
            </p>
            <p className="text-sm text-gray-500 mt-2">
              Você está logado como {user?.roleName}
            </p>
          </CardContent>
        </Card>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Funcionalidades</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-600">
            Esta é a base do sistema. Em breve mais funcionalidades estarán disponíveis.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}