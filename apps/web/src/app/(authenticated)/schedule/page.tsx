'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import { appointmentsApi, professionalsApi, scheduleBlocksApi } from '@/lib/api/appointments';
import { CalendarResponse, AppointmentStatus } from '@clinica-saas/contracts';

const statusLabels: Record<AppointmentStatus, string> = {
  scheduled: 'Agendado',
  confirmed: 'Confirmado',
  in_progress: 'Em andamento',
  completed: 'Concluído',
  cancelled: 'Cancelado',
  no_show: 'Não compareceu',
};

const statusColors: Record<AppointmentStatus, string> = {
  scheduled: 'bg-blue-100 text-blue-800',
  confirmed: 'bg-green-100 text-green-800',
  in_progress: 'bg-yellow-100 text-yellow-800',
  completed: 'bg-gray-100 text-gray-800',
  cancelled: 'bg-red-100 text-red-800',
  no_show: 'bg-orange-100 text-orange-800',
};

export default function SchedulePage() {
  const [view, setView] = useState<'day' | 'week' | 'month'>('week');
  const [currentDate, setCurrentDate] = useState(new Date().toISOString().split('T')[0]);
  const [professionalId, setProfessionalId] = useState<string>('');

  const getDateRange = () => {
    const date = new Date(currentDate);
    let startDate: string;
    let endDate: string;

    if (view === 'day') {
      startDate = date.toISOString().split('T')[0];
      endDate = date.toISOString().split('T')[0];
    } else if (view === 'week') {
      const day = date.getDay();
      const start = new Date(date);
      start.setDate(date.getDate() - day);
      startDate = start.toISOString().split('T')[0];
      const end = new Date(start);
      end.setDate(start.getDate() + 6);
      endDate = end.toISOString().split('T')[0];
    } else {
      const firstDay = new Date(date.getFullYear(), date.getMonth(), 1);
      const lastDay = new Date(date.getFullYear(), date.getMonth() + 1, 0);
      startDate = firstDay.toISOString().split('T')[0];
      endDate = lastDay.toISOString().split('T')[0];
    }

    return { startDate, endDate };
  };

  const { startDate, endDate } = getDateRange();

  const { data: calendar, isLoading: calendarLoading } = useQuery({
    queryKey: ['calendar', startDate, endDate, view, professionalId],
    queryFn: () => appointmentsApi.getCalendar(startDate, endDate, view, professionalId || undefined),
  });

  const { data: professionals } = useQuery({
    queryKey: ['professionals'],
    queryFn: () => professionalsApi.getProfessionals(),
  });

  const changePeriod = (delta: number) => {
    const date = new Date(currentDate);
    if (view === 'day') {
      date.setDate(date.getDate() + delta);
    } else if (view === 'week') {
      date.setDate(date.getDate() + delta * 7);
    } else {
      date.setMonth(date.getMonth() + delta);
    }
    setCurrentDate(date.toISOString().split('T')[0]);
  };

  const today = () => {
    setCurrentDate(new Date().toISOString().split('T')[0]);
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('pt-BR', { weekday: 'short', day: 'numeric', month: 'short' });
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Agenda</h1>
        <div className="flex gap-2">
          <select
            value={view}
            onChange={(e) => setView(e.target.value as typeof view)}
            className="px-4 py-2 border rounded"
          >
            <option value="day">Dia</option>
            <option value="week">Semana</option>
            <option value="month">Mês</option>
          </select>
          <select
            value={professionalId}
            onChange={(e) => setProfessionalId(e.target.value)}
            className="px-4 py-2 border rounded"
          >
            <option value="">Todos os profissionais</option>
            {professionals?.map((p) => (
              <option key={p.id} value={p.id}>
                {p.user?.name || p.id}
              </option>
            ))}
          </select>
          <Link
            href="/appointments/new"
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            + Novo Agendamento
          </Link>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex gap-4 items-center">
          <button onClick={() => changePeriod(-1)} className="px-3 py-1 border rounded">
            ←
          </button>
          <input
            type="date"
            value={currentDate}
            onChange={(e) => setCurrentDate(e.target.value)}
            className="px-4 py-2 border rounded"
          />
          <button onClick={() => changePeriod(1)} className="px-3 py-1 border rounded">
            →
          </button>
          <button onClick={today} className="px-4 py-2 border rounded">
            Hoje
          </button>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        {calendarLoading ? (
          <div className="p-8 text-center">Carregando...</div>
        ) : calendar?.days && calendar.days.length > 0 ? (
          calendar.days.map((day) => (
            <div key={day.date} className="border-b p-4">
              <h3 className="font-semibold mb-3">
                {formatDate(day.date)} ({day.slots.length} horários)
              </h3>
              <div className="grid grid-cols-4 gap-2">
                {day.slots.map((slot) => (
                  <div
                    key={slot.time}
                    className={`p-2 rounded text-sm ${
                      slot.appointment
                        ? 'bg-blue-50 border border-blue-200'
                        : slot.blocked
                        ? 'bg-red-50 border border-red-200'
                        : 'bg-green-50 border border-green-200'
                    }`}
                  >
                    <div className="font-medium">{slot.time}</div>
                    {slot.appointment && (
                      <div className="text-xs mt-1">
                        <div className="truncate">{slot.appointment.patient?.name}</div>
                        <div className="text-gray-500">{slot.appointment.professional?.name}</div>
                        <span className={statusColors[slot.appointment.status]}>
                          {statusLabels[slot.appointment.status]}
                        </span>
                      </div>
                    )}
                    {slot.blocked && (
                      <div className="text-xs text-red-500 mt-1">{slot.blocked.reason}</div>
                    )}
                    {!slot.appointment && !slot.blocked && (
                      <div className="text-xs text-green-500 mt-1">Disponível</div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))
        ) : (
          <div className="p-8 text-center text-gray-500">Nenhum agendamento neste período.</div>
        )}
      </div>
    </div>
  );
}