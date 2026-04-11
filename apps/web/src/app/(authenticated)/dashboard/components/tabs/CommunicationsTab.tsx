'use client';

import { CommunicationKPIs, PeriodType } from '@clinica-saas/contracts';
import { KPICard } from '../KPICard';
import { DrillDownModal } from '../DrillDownModal';
import { getCommunicationsDrillDown } from '@/lib/api/dashboard';
import { useState } from 'react';

interface Props {
  data: CommunicationKPIs;
  organizationId: string;
  period: PeriodType;
}

export function CommunicationsTab({ data, organizationId, period }: Props) {
  const [drillDown, setDrillDown] = useState<{ status?: string } | null>(null);

  const fetchData = () => getCommunicationsDrillDown(organizationId, { period, status: drillDown?.status });

  return (
    <div>
      <div className="grid grid-cols-4 gap-4">
        <KPICard title="Enviadas" kpi={data.sent} onClick={() => setDrillDown({})} />
        <KPICard title="Entregues" kpi={data.delivered} onClick={() => setDrillDown({ status: 'delivered' })} />
        <KPICard title="Falhas" kpi={data.failed} onClick={() => setDrillDown({ status: 'failed' })} />
        <KPICard title="Taxa Entrega" kpi={data.deliveryRate} format="percent" />
      </div>
      {drillDown && (
        <DrillDownModal
          open={true}
          onClose={() => setDrillDown(null)}
          title="Comunicações"
          fetchData={fetchData}
          columns={[
            { key: 'patientName', label: 'Paciente' },
            { key: 'channel', label: 'Canal' },
            { key: 'type', label: 'Tipo' },
            { key: 'status', label: 'Status' },
            { key: 'createdAt', label: 'Enviado em' },
          ]}
          type="communications"
        />
      )}
    </div>
  );
}