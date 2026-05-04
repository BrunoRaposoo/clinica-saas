'use client';

import { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import Link from 'next/link';
import { patientsApi } from '@/lib/api/patients';

export default function CommunicationsSendPage() {
  const [form, setForm] = useState({
    patientId: '',
    channel: 'whatsapp' as 'whatsapp' | 'email' | 'sms',
    subject: '',
    message: '',
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const { data: patientsData, isLoading: loadingPatients } = useQuery({
    queryKey: ['patients'],
    queryFn: () => patientsApi.getPatients({ limit: 100 }),
  });

  const patients = patientsData?.items || [];

  const sendMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1'}/communications`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
        },
        body: JSON.stringify({
          patientId: form.patientId,
          channel: form.channel,
          type: 'custom',
          recipient: form.channel === 'email' 
            ? patients.find(p => p.id === form.patientId)?.email || ''
            : patients.find(p => p.id === form.patientId)?.phone || '',
          message: form.message,
          subject: form.channel === 'email' ? form.subject : undefined,
        }),
      });
      if (!res.ok) throw new Error('Erro ao enviar mensagem');
      return res.json();
    },
    onSuccess: () => {
      setSuccess('Mensagem enviada com sucesso!');
      setError('');
    },
    onError: (err: Error) => {
      setError(err.message);
      setSuccess('');
    },
  });

  const selectedPatient = patients.find(p => p.id === form.patientId);

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <Link href="/communications/history" className="text-blue-600 hover:underline">
          ← Voltar
        </Link>
      </div>

      <div className="bg-white rounded-lg shadow p-8">
        <h2 className="text-2xl font-bold mb-6">Enviar Mensagem</h2>

        <form onSubmit={(e) => { e.preventDefault(); sendMutation.mutate(); }}>
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium mb-2">Paciente *</label>
              <select
                required
                value={form.patientId}
                onChange={(e) => setForm({ ...form, patientId: e.target.value })}
                className="w-full px-4 py-2 border rounded"
                disabled={loadingPatients}
              >
                <option value="">Selecione um paciente</option>
                {patients.map((patient) => (
                  <option key={patient.id} value={patient.id}>
                    {patient.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Canal *</label>
              <select
                value={form.channel}
                onChange={(e) => setForm({ ...form, channel: e.target.value as typeof form.channel })}
                className="w-full px-4 py-2 border rounded"
              >
                <option value="whatsapp">WhatsApp</option>
                <option value="email">E-mail</option>
                <option value="sms">SMS</option>
              </select>
            </div>

            {form.channel === 'email' && (
              <div>
                <label className="block text-sm font-medium mb-2">Assunto</label>
                <input
                  type="text"
                  value={form.subject}
                  onChange={(e) => setForm({ ...form, subject: e.target.value })}
                  className="w-full px-4 py-2 border rounded"
                />
              </div>
            )}

            <div>
              <label className="block text-sm font-medium mb-2">Mensagem *</label>
              <textarea
                required
                value={form.message}
                onChange={(e) => setForm({ ...form, message: e.target.value })}
                rows={6}
                className="w-full px-4 py-2 border rounded"
                placeholder="Digite sua mensagem..."
              />
              <p className="text-xs text-gray-500 mt-1">
                Você pode usar placeholders: {'{{patient_name}}'}, {'{{appointment_date}}'}, {'{{appointment_time}}'}
              </p>
            </div>
          </div>

          <div className="flex gap-4 mt-6">
            <button
              type="submit"
              disabled={sendMutation.isPending}
              className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
            >
              {sendMutation.isPending ? 'Enviando...' : 'Enviar'}
            </button>
          </div>

          {error && <div className="mt-4 p-4 bg-red-100 text-red-700 rounded">{error}</div>}
          {success && <div className="mt-4 p-4 bg-green-100 text-green-700 rounded">{success}</div>}
        </form>
      </div>
    </div>
  );
}