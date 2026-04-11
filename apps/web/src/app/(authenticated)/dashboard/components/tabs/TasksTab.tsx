'use client';

import { TaskKPIs, PeriodType } from '@clinica-saas/contracts';
import { KPICard } from '../KPICard';
import { DrillDownModal } from '../DrillDownModal';
import { getTasksDrillDown } from '@/lib/api/dashboard';
import { useState } from 'react';

interface Props {
  data: TaskKPIs;
  organizationId: string;
  period: PeriodType;
}

export function TasksTab({ data, organizationId, period }: Props) {
  const [drillDown, setDrillDown] = useState<{ status?: string } | null>(null);

  const fetchData = () => getTasksDrillDown(organizationId, { period, status: drillDown?.status });

  return (
    <div>
      <div className="grid grid-cols-4 gap-4">
        <KPICard title="Pendentes" kpi={data.pending} onClick={() => setDrillDown({ status: 'pending' })} />
        <KPICard title="Em Progresso" kpi={data.inProgress} onClick={() => setDrillDown({ status: 'in_progress' })} />
        <KPICard title="Concluídas" kpi={data.completed} onClick={() => setDrillDown({ status: 'completed' })} />
        <KPICard title="Atrasadas" kpi={data.overdue} onClick={() => setDrillDown({ status: 'overdue' })} />
      </div>
      {drillDown && (
        <DrillDownModal
          open={true}
          onClose={() => setDrillDown(null)}
          title="Tarefas"
          fetchData={fetchData}
          columns={[
            { key: 'title', label: 'Título' },
            { key: 'status', label: 'Status' },
            { key: 'priority', label: 'Prioridade' },
            { key: 'assignedToName', label: 'Responsável' },
            { key: 'dueDate', label: 'Prazo' },
          ]}
          type="tasks"
        />
      )}
    </div>
  );
}