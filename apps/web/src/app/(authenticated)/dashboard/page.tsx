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
  const [organizationId, setOrganizationId] = useState('');
  const [period, setPeriod] = useState<PeriodType>('current_month');
  const [data, setData] = useState<DashboardSummary | null>(null);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<Tab>('finance');

  useEffect(() => {
    const orgId = localStorage.getItem('organizationId');
    if (orgId) setOrganizationId(orgId);
  }, []);

  useEffect(() => {
    if (organizationId) {
      setLoading(true);
      getDashboardSummary(organizationId, period)
        .then(setData)
        .finally(() => setLoading(false));
    }
  }, [organizationId, period]);

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
      ) : data ? (
        <div>
          {activeTab === 'finance' && <FinanceTab data={data.finance} organizationId={organizationId} period={period} />}
          {activeTab === 'schedule' && <ScheduleTab data={data.schedule} organizationId={organizationId} period={period} />}
          {activeTab === 'patients' && <PatientsTab data={data.patients} organizationId={organizationId} period={period} />}
          {activeTab === 'communications' && <CommunicationsTab data={data.communications} organizationId={organizationId} period={period} />}
          {activeTab === 'tasks' && <TasksTab data={data.tasks} organizationId={organizationId} period={period} />}
        </div>
      ) : (
        <p>Dados não disponíveis</p>
      )}
    </div>
  );
}