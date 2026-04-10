'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function UploadDocumentPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [form, setForm] = useState({
    category: 'administrative',
    type: 'Outro',
    name: '',
    description: '',
    patientId: '',
    appointmentId: '',
  });
  const [error, setError] = useState('');

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (!selected) return;

    const maxSize = 10 * 1024 * 1024;
    if (selected.size > maxSize) {
      setError('Arquivo deve ter no máximo 10MB');
      return;
    }

    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf'];
    if (!allowedTypes.includes(selected.type)) {
      setError('Tipo de arquivo não permitido. Use JPEG, PNG, WebP ou PDF');
      return;
    }

    setFile(selected);
    setError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) {
      setError('Selecione um arquivo');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('category', form.category);
      formData.append('type', form.type);
      formData.append('name', form.name || file.name);
      formData.append('description', form.description);
      if (form.patientId) formData.append('patientId', form.patientId);
      if (form.appointmentId) formData.append('appointmentId', form.appointmentId);

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/documents`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
        },
        body: formData,
      });

      if (!response.ok) throw new Error('Failed to upload');

      router.push('/documents');
    } catch (err) {
      setError('Erro ao fazer upload');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Upload de Documento</h1>
        <p className="text-muted-foreground">Adicione arquivos ao sistema</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-md text-red-600">
            {error}
          </div>
        )}

        <div>
          <label className="block text-sm font-medium mb-1">Arquivo</label>
          <input
            type="file"
            onChange={handleFileChange}
            className="w-full px-3 py-2 border rounded-md"
            accept="image/jpeg,image/png,image/webp,application/pdf"
          />
          <p className="text-xs text-muted-foreground mt-1">
            Máximo 10MB. JPEG, PNG, WebP ou PDF
          </p>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Categoria</label>
            <select
              value={form.category}
              onChange={(e) => setForm({ ...form, category: e.target.value })}
              className="w-full px-3 py-2 border rounded-md"
            >
              <option value="identity">Identidade</option>
              <option value="exams">Exames</option>
              <option value="prescriptions">Receitas</option>
              <option value="reports">Laudos</option>
              <option value="administrative">Administrativo</option>
              <option value="other">Outro</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Tipo</label>
            <input
              type="text"
              value={form.type}
              onChange={(e) => setForm({ ...form, type: e.target.value })}
              className="w-full px-3 py-2 border rounded-md"
              placeholder="Ex: RG, CPF, Laudo"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Nome</label>
          <input
            type="text"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            className="w-full px-3 py-2 border rounded-md"
            placeholder="Nome do documento"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Descrição (opcional)</label>
          <textarea
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            className="w-full px-3 py-2 border rounded-md"
            rows={3}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">ID do Paciente (opcional)</label>
            <input
              type="text"
              value={form.patientId}
              onChange={(e) => setForm({ ...form, patientId: e.target.value })}
              className="w-full px-3 py-2 border rounded-md"
              placeholder="UUID"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">ID do Agendamento (opcional)</label>
            <input
              type="text"
              value={form.appointmentId}
              onChange={(e) => setForm({ ...form, appointmentId: e.target.value })}
              className="w-full px-3 py-2 border rounded-md"
              placeholder="UUID"
            />
          </div>
        </div>

        <div className="flex gap-4">
          <button
            type="submit"
            disabled={loading || !file}
            className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 disabled:opacity-50"
          >
            {loading ? 'Enviando...' : 'Enviar'}
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