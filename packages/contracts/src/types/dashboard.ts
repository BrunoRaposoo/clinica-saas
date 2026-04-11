export type PeriodType = 'today' | 'yesterday' | 'current_month' | 'previous_month' | 'current_semester' | 'current_year' | 'custom';

export interface DashboardPeriod {
  start: Date;
  end: Date;
  comparisonStart?: Date;
  comparisonEnd?: Date;
}

export interface DashboardKPI {
  value: number;
  previousValue: number;
  delta: number;
  deltaPercent: number;
  trend: 'up' | 'down' | 'stable';
}

export interface FinanceKPIs {
  totalRevenue: DashboardKPI;
  pending: DashboardKPI;
  overdue: DashboardKPI;
  paid: DashboardKPI;
  averageCharge: DashboardKPI;
}

export interface ScheduleKPIs {
  total: DashboardKPI;
  confirmed: DashboardKPI;
  cancelled: DashboardKPI;
  noShow: DashboardKPI;
  occupancyRate: DashboardKPI;
}

export interface PatientKPIs {
  total: DashboardKPI;
  newPatients: DashboardKPI;
  active: DashboardKPI;
  inactive: DashboardKPI;
}

export interface CommunicationKPIs {
  sent: DashboardKPI;
  delivered: DashboardKPI;
  failed: DashboardKPI;
  deliveryRate: DashboardKPI;
}

export interface TaskKPIs {
  pending: DashboardKPI;
  inProgress: DashboardKPI;
  completed: DashboardKPI;
  overdue: DashboardKPI;
}

export interface DashboardSummary {
  finance: FinanceKPIs;
  schedule: ScheduleKPIs;
  patients: PatientKPIs;
  communications: CommunicationKPIs;
  tasks: TaskKPIs;
  period: {
    start: string;
    end: string;
    comparisonStart?: string;
    comparisonEnd?: string;
  };
}

export interface DrillDownParams {
  period: PeriodType;
  startDate?: string;
  endDate?: string;
  status?: string;
  professionalId?: string;
}