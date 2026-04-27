'use client';

import { CalendarSlot, AppointmentStatus } from '@clinica-saas/contracts';

interface DayDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  date: string;
  slots: CalendarSlot[];
}

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

function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleDateString('pt-BR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

export function DayDetailsModal({ isOpen, onClose, date, slots }: DayDetailsModalProps) {
  if (!isOpen) return null;

  const appointments = slots.filter((s) => s.appointment);

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={onClose}>
      <div
        className="bg-white rounded-lg w-full max-w-2xl max-h-[80vh] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-4 border-b flex justify-between items-center">
          <h2 className="text-lg font-semibold">Agendamentos - {formatDate(date)}</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700 text-xl">
            ✕
          </button>
        </div>

        <div className="p-4 overflow-auto max-h-[60vh]">
          {appointments.length === 0 ? (
            <p className="text-center text-gray-500 py-8">Nenhum agendamento neste dia.</p>
          ) : (
            <div className="space-y-3">
              {slots.map((slot) => {
                const apt = slot.appointment;
                if (!apt || !apt.patient) return null;
                return (
                  <div key={slot.time} className="border rounded-lg p-4">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <span className="text-lg font-medium">{slot.time}</span>
                        <span className="text-gray-600 ml-2">{apt.patient.name}</span>
                      </div>
                      <span className={`px-2 py-1 rounded text-xs ${statusColors[apt.status]}`}>
                        {statusLabels[apt.status]}
                      </span>
                    </div>
                    <div className="flex items-center gap-3 text-sm">
                      <div className="flex items-center gap-2">
                        <span
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: apt.professional?.color || '#3B82F6' }}
                        />
                        <span className="font-medium">{apt.professional?.name}</span>
                        {apt.professional?.specialty && (
                          <span className="text-gray-500">({apt.professional.specialty})</span>
                        )}
                      </div>
                      {apt.appointmentType?.name && (
                        <span className="text-gray-500">• {apt.appointmentType.name}</span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div className="p-4 border-t flex justify-between items-center">
          <span className="text-sm text-gray-500">
            Total: {appointments.length} agendamento{appointments.length !== 1 ? 's' : ''}
          </span>
          <button onClick={onClose} className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded">
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
}