'use client';

import { PeriodType } from '@clinica-saas/contracts';

interface Props {
  value: PeriodType;
  onChange: (period: PeriodType) => void;
  customStart?: string;
  customEnd?: string;
  onCustomStartChange?: (date: string) => void;
  onCustomEndChange?: (date: string) => void;
}

const periods: { value: PeriodType; label: string }[] = [
  { value: 'today', label: 'Hoje' },
  { value: 'yesterday', label: 'Ontem' },
  { value: 'current_month', label: 'Mês Atual' },
  { value: 'previous_month', label: 'Mês Anterior' },
  { value: 'current_semester', label: 'Semestre Atual' },
  { value: 'current_year', label: 'Ano Atual' },
  { value: 'custom', label: 'Personalizado' },
];

export function PeriodSelector({ value, onChange, customStart, customEnd, onCustomStartChange, onCustomEndChange }: Props) {
  return (
    <div className="flex items-center gap-4">
      <select
        value={value}
        onChange={(e) => onChange(e.target.value as PeriodType)}
        className="px-3 py-2 border rounded-lg"
      >
        {periods.map((p) => (
          <option key={p.value} value={p.value}>
            {p.label}
          </option>
        ))}
      </select>
      {value === 'custom' && (
        <>
          <input
            type="date"
            value={customStart}
            onChange={(e) => onCustomStartChange?.(e.target.value)}
            className="px-3 py-2 border rounded-lg"
          />
          <span>até</span>
          <input
            type="date"
            value={customEnd}
            onChange={(e) => onCustomEndChange?.(e.target.value)}
            className="px-3 py-2 border rounded-lg"
          />
        </>
      )}
    </div>
  );
}