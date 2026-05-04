'use client';

import type { DashboardKPI } from '@clinica-saas/contracts';

interface Props {
  title: string;
  kpi: DashboardKPI;
  onClick?: () => void;
  format?: 'number' | 'currency' | 'percent';
}

export function KPICard({ title, kpi, onClick, format = 'number' }: Props) {
  const formatValue = (val: number) => {
    if (format === 'currency') return `R$ ${val.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`;
    if (format === 'percent') return `${val.toFixed(1)}%`;
    return val.toLocaleString('pt-BR');
  };

  const trendIcon = kpi.trend === 'up' ? '↑' : kpi.trend === 'down' ? '↓' : '→';
  const trendColor = kpi.trend === 'up' ? 'text-green-600' : kpi.trend === 'down' ? 'text-red-600' : 'text-gray-500';

  return (
    <div
      onClick={onClick}
      className={`p-4 bg-white rounded-lg shadow ${onClick ? 'cursor-pointer hover:shadow-md' : ''}`}
    >
      <p className="text-sm text-gray-500">{title}</p>
      <p className="text-2xl font-bold mt-1">{formatValue(kpi.value)}</p>
      <div className={`flex items-center gap-1 mt-2 text-sm ${trendColor}`}>
        <span>{trendIcon}</span>
        <span>{kpi.deltaPercent > 0 ? '+' : ''}{kpi.deltaPercent.toFixed(1)}%</span>
        <span className="text-gray-400">vs período anterior</span>
      </div>
    </div>
  );
}