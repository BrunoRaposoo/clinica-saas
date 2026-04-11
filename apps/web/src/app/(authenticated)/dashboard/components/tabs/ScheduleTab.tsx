'use client';

import { ScheduleKPIs, PeriodType } from '@clinica-saas/contracts';
import { KPICard } from '../KPICard';
import { DrillDownModal } from '../DrillDownModal';
import { getAppointmentsDrillDown } from '@/lib/api/dashboard';
import { useState } from 'react';

interface Props {
  data: ScheduleKPIs;
  organizationId: string;
  period: PeriodType;
}

export function ScheduleTab({ data, organizationId, period }: Props) {
  const [drillDown, setDrillDown] = useState<{ status?: string } | null>(null);

  const fetchData = () => getAppointmentsDrillDown(organizationId, { period, status: drillDown?.status });

  return (
    <div>
      <div className="grid grid-cols-5 gap-4">
        <KPICard title="Total" kpi={data.total} onClick={() => setDrillDown({})} />
        <KPICard title="Confirmados" kpi={data.confirmed} onClick={() => setDrillDown({ status: 'confirmed' })} />
        <KPICard title="Cancelados" kpi={data.cancelled} onClick={() => setDrillDown({ status: 'cancelled' })} />
        <KPICard title="No-show" kpi={data.noShow} onClick={() => setDrillDown({ status: 'no_show' })} />
        <KPICard title="Taxa Ocupação" kpi={data.occupancyRate} format="percent" />
      </div>
      {drillDown && (
        <DrillDownModal
          open={true}
          onClose={() => setDrillDown(null)}
          title="Agendamentos"
          fetchData={fetchData}
          columns={[
            { key: 'patientName', label: 'Paciente' },
            { key: 'professionalName', label: 'Profissional' },
            { key: 'specialty', label: 'Especialidade' },
            { key: 'startDate', label: 'Data' },
            { key: 'status', label: 'Status' },
          ]}
          type="appointments"
        />
      )}
    </div>
  );
}