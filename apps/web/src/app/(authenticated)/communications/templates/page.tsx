'use client';

import { useState } from 'react';
import { templatesApi, type MessageTemplate } from '@/lib/api/templates';
import Link from 'next/link';

export default function TemplatesPage() {
  const [templates, setTemplates] = useState<MessageTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [filter, setFilter] = useState({ channel: '', type: '' });

  useState(() => {
    loadTemplates();
  });

  const loadTemplates = async () => {
    setLoading(true);
    try {
      const response = await templatesApi.list({ page, limit: 20, ...filter });
      setTemplates(response.items);
      setTotalPages(response.pagination.totalPages);
    } catch (error) {
      console.error('Failed to load templates', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir este template?')) return;
    try {
      await templatesApi.delete(id);
      loadTemplates();
    } catch (error) {
      console.error('Failed to delete template', error);
    }
  };

  const getChannelBadge = (channel: string) => {
    const colors: Record<string, string> = {
      WHATSAPP: 'bg-green-100 text-green-800',
      EMAIL: 'bg-blue-100 text-blue-800',
      SMS: 'bg-purple-100 text-purple-800',
    };
    return colors[channel] || 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Templates de Mensagens</h1>
          <p className="text-muted-foreground">Gerencie seus modelos de mensagens</p>
        </div>
        <Link
          href="/communications/templates/new"
          className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
        >
          Novo Template
        </Link>
      </div>

      <div className="flex gap-4">
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
          value={filter.type}
          onChange={(e) => setFilter({ ...filter, type: e.target.value })}
          className="px-3 py-2 border rounded-md"
        >
          <option value="">Todos os tipos</option>
          <option value="CONFIRMATION">Confirmação</option>
          <option value="REMINDER">Lembrete</option>
          <option value="CANCELLATION">Cancelamento</option>
        </select>
      </div>

      {loading ? (
        <div className="text-center py-8">Carregando...</div>
      ) : templates.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground">
          Nenhum template encontrado
        </div>
      ) : (
        <div className="border rounded-md">
          <table className="w-full">
            <thead>
              <tr className="border-b bg-muted/50">
                <th className="px-4 py-3 text-left">Nome</th>
                <th className="px-4 py-3 text-left">Canal</th>
                <th className="px-4 py-3 text-left">Tipo</th>
                <th className="px-4 py-3 text-left">Status</th>
                <th className="px-4 py-3 text-right">Ações</th>
              </tr>
            </thead>
            <tbody>
              {templates.map((template) => (
                <tr key={template.id} className="border-b">
                  <td className="px-4 py-3">{template.name}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-1 rounded-full text-xs ${getChannelBadge(template.channel)}`}>
                      {template.channel}
                    </span>
                  </td>
                  <td className="px-4 py-3">{template.type}</td>
                  <td className="px-4 py-3">
                    {template.isActive ? (
                      <span className="text-green-600">Ativo</span>
                    ) : (
                      <span className="text-gray-400">Inativo</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-right space-x-2">
                    <Link
                      href={`/communications/templates/${template.id}`}
                      className="text-primary hover:underline"
                    >
                      Editar
                    </Link>
                    <button
                      onClick={() => handleDelete(template.id)}
                      className="text-red-600 hover:underline"
                    >
                      Excluir
                    </button>
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