'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { templatesApi, type MessageTemplate } from '@/lib/api/templates';

export default function EditTemplatePage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [template, setTemplate] = useState<MessageTemplate | null>(null);
  const [form, setForm] = useState({
    name: '',
    channel: 'WHATSAPP',
    type: 'CONFIRMATION',
    subject: '',
    body: '',
    isActive: true,
  });
  const [error, setError] = useState('');

  useEffect(() => {
    loadTemplate();
  }, [id]);

  const loadTemplate = async () => {
    setFetching(true);
    try {
      const data = await templatesApi.getById(id);
      setTemplate(data);
      setForm({
        name: data.name,
        channel: data.channel,
        type: data.type,
        subject: data.subject || '',
        body: data.body,
        isActive: data.isActive,
      });
    } catch (err) {
      setError('Template não encontrado');
    } finally {
      setFetching(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await templatesApi.update(id, {
        name: form.name,
        subject: form.subject || undefined,
        body: form.body,
        isActive: form.isActive,
      });
      router.push('/communications/templates');
    } catch (err) {
      setError('Failed to update template');
    } finally {
      setLoading(false);
    }
  };

  if (fetching) {
    return <div className="text-center py-8">Carregando...</div>;
  }

  if (!template) {
    return <div className="text-center py-8 text-red-600">{error || 'Template não encontrado'}</div>;
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Editar Template</h1>
        <p className="text-muted-foreground">Atualize o modelo de mensagem</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-md text-red-600">
            {error}
          </div>
        )}

        <div>
          <label className="block text-sm font-medium mb-1">Nome</label>
          <input
            type="text"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            className="w-full px-3 py-2 border rounded-md"
            required
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Canal</label>
            <select
              value={form.channel}
              onChange={(e) => setForm({ ...form, channel: e.target.value })}
              className="w-full px-3 py-2 border rounded-md"
              disabled
            >
              <option value="WHATSAPP">WhatsApp</option>
              <option value="EMAIL">Email</option>
              <option value="SMS">SMS</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Tipo</label>
            <select
              value={form.type}
              onChange={(e) => setForm({ ...form, type: e.target.value })}
              className="w-full px-3 py-2 border rounded-md"
              disabled
            >
              <option value="CONFIRMATION">Confirmação</option>
              <option value="REMINDER">Lembrete</option>
              <option value="CANCELLATION">Cancelamento</option>
            </select>
          </div>
        </div>

        {form.channel === 'EMAIL' && (
          <div>
            <label className="block text-sm font-medium mb-1">Assunto</label>
            <input
              type="text"
              value={form.subject}
              onChange={(e) => setForm({ ...form, subject: e.target.value })}
              className="w-full px-3 py-2 border rounded-md"
            />
          </div>
        )}

        <div>
          <label className="block text-sm font-medium mb-1">Mensagem</label>
          <textarea
            value={form.body}
            onChange={(e) => setForm({ ...form, body: e.target.value })}
            className="w-full px-3 py-2 border rounded-md"
            rows={6}
            required
          />
        </div>

        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            id="isActive"
            checked={form.isActive}
            onChange={(e) => setForm({ ...form, isActive: e.target.checked })}
            className="w-4 h-4"
          />
          <label htmlFor="isActive" className="text-sm">Template ativo</label>
        </div>

        <div className="flex gap-4">
          <button
            type="submit"
            disabled={loading}
            className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 disabled:opacity-50"
          >
            {loading ? 'Salvando...' : 'Salvar'}
          </button>
          <button
            type="button"
            onClick={() => router.back()}
            className="px-4 py-2 border rounded-md hover:bg-muted"
          >
            Cancelar
          </button>
        </div>
      </form>
    </div>
  );
}