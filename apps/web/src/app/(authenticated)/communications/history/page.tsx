'use client';

import { useState } from 'react';
import { communicationsApi, type Communication } from '@/lib/api/communications';

export default function HistoryPage() {
  const [communications, setCommunications] = useState<Communication[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [filter, setFilter] = useState({
    patientId: '',
    channel: '',
    status: '',
    startDate: '',
    endDate: '',
  });

  useState(() => {
    loadCommunications();
  });

  const loadCommunications = async () => {
    setLoading(true);
    try {
      const response = await communicationsApi.list({ page, limit: 20, ...filter });
      setCommunications(response.items);
      setTotalPages(response.pagination.totalPages);
    } catch (error) {
      console.error('Failed to load communications', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const colors: Record<string, string> = {
      pending: 'bg-yellow-100 text-yellow-800',
      sent: 'bg-green-100 text-green-800',
      delivered: 'bg-blue-100 text-blue-800',
      failed: 'bg-red-100 text-red-800',
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const getChannelBadge = (channel: string) => {
    const colors: Record<string, string> = {
      WHATSAPP: 'bg-green-100 text-green-800',
      EMAIL: 'bg-blue-100 text-blue-800',
      SMS: 'bg-purple-100 text-purple-800',
    };
    return colors[channel] || 'bg-gray-100 text-gray-800';
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Histórico de Comunicações</h1>
        <p className="text-muted-foreground">Veja todas as mensagens enviadas</p>
      </div>

      <div className="flex flex-wrap gap-4">
        <input
          type="text"
          placeholder="ID do paciente"
          value={filter.patientId}
          onChange={(e) => setFilter({ ...filter, patientId: e.target.value })}
          className="px-3 py-2 border rounded-md"
        />

        <select
          value={filter.channel}
          onChange={(e) => setFilter({ ...filter, channel: e.target.value })}
          className="px-3 py-2 border rounded-md"
        >
          <option value="">Todos os canais</option>
          <option value="WHATSAPP">WhatsApp</option>
          <option value="EMAIL">Email</option>
          <option value="SMS">SMS</option>
        </select>

        <select
          value={filter.status}
          onChange={(e) => setFilter({ ...filter, status: e.target.value })}
          className="px-3 py-2 border rounded-md"
        >
          <option value="">Todos os status</option>
          <option value="pending">Pendente</option>
          <option value="sent">Enviado</option>
          <option value="delivered">Entregue</option>
          <option value="failed">Falhou</option>
        </select>

        <input
          type="date"
          value={filter.startDate}
          onChange={(e) => setFilter({ ...filter, startDate: e.target.value })}
          className="px-3 py-2 border rounded-md"
          placeholder="Data inicial"
        />

        <input
          type="date"
          value={filter.endDate}
          onChange={(e) => setFilter({ ...filter, endDate: e.target.value })}
          className="px-3 py-2 border rounded-md"
          placeholder="Data final"
        />

        <button
          onClick={loadCommunications}
          className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
        >
          Filtrar
        </button>
      </div>

      {loading ? (
        <div className="text-center py-8">Carregando...</div>
      ) : communications.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground">
          Nenhuma comunicação encontrada
        </div>
      ) : (
        <div className="border rounded-md">
          <table className="w-full">
            <thead>
              <tr className="border-b bg-muted/50">
                <th className="px-4 py-3 text-left">Data</th>
                <th className="px-4 py-3 text-left">Canal</th>
                <th className="px-4 py-3 text-left">Tipo</th>
                <th className="px-4 py-3 text-left">Destinatário</th>
                <th className="px-4 py-3 text-left">Mensagem</th>
                <th className="px-4 py-3 text-left">Status</th>
              </tr>
            </thead>
            <tbody>
              {communications.map((comm) => (
                <tr key={comm.id} className="border-b">
                  <td className="px-4 py-3 text-sm">{formatDate(comm.createdAt)}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-1 rounded-full text-xs ${getChannelBadge(comm.channel)}`}>
                      {comm.channel}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm">{comm.type}</td>
                  <td className="px-4 py-3 text-sm">{comm.recipient}</td>
                  <td className="px-4 py-3 text-sm max-w-xs truncate">{comm.message}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-1 rounded-full text-xs ${getStatusBadge(comm.status)}`}>
                      {comm.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {totalPages > 1 && (
        <div className="flex justify-center gap-2">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            className="px-3 py-1 border rounded-md disabled:opacity-50"
          >
            Anterior
          </button>
          <span className="px-3 py-1">
            Página {page} de {totalPages}
          </span>
          <button
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            className="px-3 py-1 border rounded-md disabled:opacity-50"
          >
            Próxima
          </button>
        </div>
      )}
    </div>
  );
}