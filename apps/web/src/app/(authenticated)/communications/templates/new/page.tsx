'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { templatesApi } from '@/lib/api/templates';

export default function NewTemplatePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    name: '',
    channel: 'WHATSAPP',
    type: 'CONFIRMATION',
    subject: '',
    body: '',
  });
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await templatesApi.create({
        name: form.name,
        channel: form.channel,
        type: form.type,
        subject: form.subject || undefined,
        body: form.body,
      });
      router.push('/communications/templates');
    } catch (err) {
      setError('Failed to create template');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Novo Template</h1>
        <p className="text-muted-foreground">Crie um modelo de mensagem</p>
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
            placeholder="Ex: Lembrete de consulta"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Canal</label>
            <select
              value={form.channel}
              onChange={(e) => setForm({ ...form, channel: e.target.value })}
              className="w-full px-3 py-2 border rounded-md"
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
              placeholder="Ex: Lembrete de sua consulta"
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
            placeholder="Digite sua mensagem... Use {{patient_name}}, {{appointment_date}}, {{appointment_time}}, {{professional_name}}, {{service_name}} para placeholders"
          />
          <p className="text-xs text-muted-foreground mt-1">
            Placeholders disponíveis: {'{{patient_name}}'}, {'{{appointment_date}}'}, {'{{appointment_time}}'}, {'{{professional_name}}'}, {'{{service_name}}'}
          </p>
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