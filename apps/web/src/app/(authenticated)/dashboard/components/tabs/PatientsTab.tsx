'use client';

import { PatientKPIs, PeriodType } from '@clinica-saas/contracts';
import { KPICard } from '../KPICard';
import { DrillDownModal } from '../DrillDownModal';
import { getPatientsDrillDown } from '@/lib/api/dashboard';
import { useState } from 'react';

interface Props {
  data: PatientKPIs;
  period: PeriodType;
}

export function PatientsTab({ data, period }: Props) {
  const [drillDown, setDrillDown] = useState<{ status?: string } | null>(null);

  const fetchData = () => getPatientsDrillDown({ period, status: drillDown?.status });

  return (
    <div>
      <div className="grid grid-cols-4 gap-4">
        <KPICard title="Total Pacientes" kpi={data.total} onClick={() => setDrillDown({})} />
        <KPICard title="Novos no Período" kpi={data.newPatients} onClick={() => setDrillDown({ status: 'new' })} />
        <KPICard title="Ativos" kpi={data.active} onClick={() => setDrillDown({ status: 'active' })} />
        <KPICard title="Inativos" kpi={data.inactive} onClick={() => setDrillDown({ status: 'inactive' })} />
      </div>
      {drillDown && (
        <DrillDownModal
          open={true}
          onClose={() => setDrillDown(null)}
          title="Pacientes"
          fetchData={fetchData}
          columns={[
            { key: 'name', label: 'Nome' },
            { key: 'email', label: 'Email' },
            { key: 'phone', label: 'Telefone' },
            { key: 'isActive', label: 'Ativo' },
            { key: 'createdAt', label: 'Criado em' },
          ]}
          type="patients"
        />
      )}
    </div>
  );
}