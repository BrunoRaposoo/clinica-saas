'use client';

import { useState, useEffect } from 'react';
import { PeriodSelector } from './components/PeriodSelector';
import { FinanceTab } from './components/tabs/FinanceTab';
import { ScheduleTab } from './components/tabs/ScheduleTab';
import { PatientsTab } from './components/tabs/PatientsTab';
import { CommunicationsTab } from './components/tabs/CommunicationsTab';
import { TasksTab } from './components/tabs/TasksTab';
import { getDashboardSummary } from '@/lib/api/dashboard';
import type { DashboardSummary, PeriodType } from '@clinica-saas/contracts';

type Tab = 'finance' | 'schedule' | 'patients' | 'communications' | 'tasks';

export default function DashboardPage() {
  const [period, setPeriod] = useState<PeriodType>('current_month');
  const [data, setData] = useState<DashboardSummary | null>(null);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<Tab>('finance');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    console.log('[Dashboard] Fetching dashboard, period:', period);
    setLoading(true);
    setError(null);
    
    getDashboardSummary(period)
      .then((response) => {
        console.log('[Dashboard] Response received:', response);
        setData(response);
      })
      .catch((err) => {
        console.error('[Dashboard] Error:', err);
        setError(err.message || 'Erro ao buscar dados do dashboard');
      })
      .finally(() => {
        setLoading(false);
      });
  }, [period]);

  const tabs: { key: Tab; label: string }[] = [
    { key: 'finance', label: 'Financeiro' },
    { key: 'schedule', label: 'Agenda' },
    { key: 'patients', label: 'Pacientes' },
    { key: 'communications', label: 'Comunicações' },
    { key: 'tasks', label: 'Tarefas' },
  ];

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Dashboard Operacional</h1>
        <PeriodSelector value={period} onChange={setPeriod} />
      </div>

      <div className="flex gap-2 mb-6 border-b">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`px-4 py-2 -mb-px ${activeTab === tab.key ? 'border-b-2 border-blue-500 font-semibold' : 'text-gray-500'}`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {loading ? (
        <p>Carregando...</p>
      ) : error ? (
        <div className="p-4 bg-red-100 text-red-700 rounded">
          <p className="font-semibold">Erro ao carregar dashboard:</p>
          <p>{error}</p>
        </div>
) : data ? (
        <div>
          {activeTab === 'finance' && <FinanceTab data={data.finance} period={period} />}
          {activeTab === 'schedule' && <ScheduleTab data={data.schedule} period={period} />}
          {activeTab === 'patients' && <PatientsTab data={data.patients} period={period} />}
          {activeTab === 'communications' && <CommunicationsTab data={data.communications} period={period} />}
          {activeTab === 'tasks' && <TasksTab data={data.tasks} period={period} />}
        </div>
      ) : (
        <p>Dados não disponíveis</p>
      )}
    </div>
  );
}