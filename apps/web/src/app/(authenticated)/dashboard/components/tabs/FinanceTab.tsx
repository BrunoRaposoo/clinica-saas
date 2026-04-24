'use client';

import { FinanceKPIs, PeriodType } from '@clinica-saas/contracts';
import { KPICard } from '../KPICard';
import { DrillDownModal } from '../DrillDownModal';
import { getChargesDrillDown } from '@/lib/api/dashboard';
import { useState } from 'react';

interface Props {
  data: FinanceKPIs;
  period: PeriodType;
}

export function FinanceTab({ data, period }: Props) {
  const [drillDown, setDrillDown] = useState<{ status?: string } | null>(null);

  const fetchData = () => getChargesDrillDown({ period, status: drillDown?.status });

  return (
    <div>
      <div className="grid grid-cols-5 gap-4">
        <KPICard title="Receita Total" kpi={data.totalRevenue} format="currency" onClick={() => setDrillDown({})} />
        <KPICard title="Pendentes" kpi={data.pending} format="currency" onClick={() => setDrillDown({ status: 'pending' })} />
        <KPICard title="Vencidos" kpi={data.overdue} format="currency" onClick={() => setDrillDown({ status: 'overdue' })} />
        <KPICard title="Pagos" kpi={data.paid} format="currency" onClick={() => setDrillDown({ status: 'paid' })} />
        <KPICard title="Média por Cobrança" kpi={data.averageCharge} format="currency" />
      </div>
      {drillDown && (
        <DrillDownModal
          open={true}
          onClose={() => setDrillDown(null)}
          title="Cobranças"
          fetchData={fetchData}
          columns={[
            { key: 'patientName', label: 'Paciente' },
            { key: 'description', label: 'Descrição' },
            { key: 'amount', label: 'Valor' },
            { key: 'status', label: 'Status' },
            { key: 'dueDate', label: 'Vencimento' },
          ]}
          type="charges"
        />
      )}
    </div>
  );
}