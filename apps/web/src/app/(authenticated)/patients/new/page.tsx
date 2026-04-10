'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useMutation } from '@tanstack/react-query';
import Link from 'next/link';
import { patientsApi } from '@/lib/api/patients';
import { PatientContactCreateRequest } from '@clinica-saas/contracts';

interface ContactForm {
  name: string;
  relationship: string;
  phone: string;
  isPrimary: boolean;
}

export default function NewPatientPage() {
  const router = useRouter();
  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    document: '',
    birthDate: '',
    gender: '' as '' | 'male' | 'female' | 'other',
    addressStreet: '',
    addressNumber: '',
    addressComplement: '',
    addressDistrict: '',
    addressCity: '',
    addressState: '',
    addressZipCode: '',
    notes: '',
  });
  const [tagsInput, setTagsInput] = useState('');
  const [contacts, setContacts] = useState<ContactForm[]>([]);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const createMutation = useMutation({
    mutationFn: (data: Parameters<typeof patientsApi.createPatient>[0]) =>
      patientsApi.createPatient(data),
    onSuccess: () => {
      setSuccess('Paciente salvo com sucesso!');
      setTimeout(() => router.push('/patients'), 1500);
    },
    onError: (err: Error) => setError(err.message),
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    const tags = tagsInput
      .split(',')
      .map((t) => t.trim())
      .filter((t) => t);

    const payload = {
      ...form,
      birthDate: form.birthDate ? new Date(form.birthDate).toISOString() : undefined,
      gender: form.gender || undefined,
      tags,
      contacts: contacts.filter((c) => c.name && c.relationship) as PatientContactCreateRequest[],
    };

    createMutation.mutate(payload);
  };

  const addContact = () => {
    setContacts([...contacts, { name: '', relationship: '', phone: '', isPrimary: false }]);
  };

  const removeContact = (index: number) => {
    setContacts(contacts.filter((_, i) => i !== index));
  };

  const updateContact = (index: number, field: keyof ContactForm, value: string | boolean) => {
    const updated = [...contacts];
    updated[index] = { ...updated[index], [field]: value };
    setContacts(updated);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <Link href="/patients" className="text-blue-600 hover:underline">
          ← Voltar para Pacientes
        </Link>
      </div>

      <div className="bg-white rounded-lg shadow p-8">
        <h2 className="text-2xl font-bold mb-6">Novo Paciente</h2>

        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-2 gap-6 mb-6">
            <div>
              <label className="block text-sm font-medium mb-2">Nome *</label>
              <input
                type="text"
                required
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="w-full px-4 py-2 border rounded"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Email</label>
              <input
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className="w-full px-4 py-2 border rounded"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Telefone</label>
              <input
                type="text"
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                className="w-full px-4 py-2 border rounded"
                placeholder="11999999999"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">CPF</label>
              <input
                type="text"
                value={form.document}
                onChange={(e) => setForm({ ...form, document: e.target.value })}
                className="w-full px-4 py-2 border rounded"
                placeholder="12345678900"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Data de Nascimento</label>
              <input
                type="date"
                value={form.birthDate}
                onChange={(e) => setForm({ ...form, birthDate: e.target.value })}
                className="w-full px-4 py-2 border rounded"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Gênero</label>
              <select
                value={form.gender}
                onChange={(e) => setForm({ ...form, gender: e.target.value as typeof form.gender })}
                className="w-full px-4 py-2 border rounded"
              >
                <option value="">Selecione</option>
                <option value="male">Masculino</option>
                <option value="female">Feminino</option>
                <option value="other">Outro</option>
              </select>
            </div>
          </div>

          <h3 className="text-lg font-semibold mb-4">Endereço</h3>
          <div className="grid grid-cols-3 gap-4 mb-6">
            <div className="col-span-2">
              <label className="block text-sm font-medium mb-2">Rua</label>
              <input
                type="text"
                value={form.addressStreet}
                onChange={(e) => setForm({ ...form, addressStreet: e.target.value })}
                className="w-full px-4 py-2 border rounded"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Número</label>
              <input
                type="text"
                value={form.addressNumber}
                onChange={(e) => setForm({ ...form, addressNumber: e.target.value })}
                className="w-full px-4 py-2 border rounded"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Complemento</label>
              <input
                type="text"
                value={form.addressComplement}
                onChange={(e) => setForm({ ...form, addressComplement: e.target.value })}
                className="w-full px-4 py-2 border rounded"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Bairro</label>
              <input
                type="text"
                value={form.addressDistrict}
                onChange={(e) => setForm({ ...form, addressDistrict: e.target.value })}
                className="w-full px-4 py-2 border rounded"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Cidade</label>
              <input
                type="text"
                value={form.addressCity}
                onChange={(e) => setForm({ ...form, addressCity: e.target.value })}
                className="w-full px-4 py-2 border rounded"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Estado</label>
              <input
                type="text"
                value={form.addressState}
                onChange={(e) => setForm({ ...form, addressState: e.target.value })}
                className="w-full px-4 py-2 border rounded"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">CEP</label>
              <input
                type="text"
                value={form.addressZipCode}
                onChange={(e) => setForm({ ...form, addressZipCode: e.target.value })}
                className="w-full px-4 py-2 border rounded"
              />
            </div>
          </div>

          <div className="mb-6">
            <label className="block text-sm font-medium mb-2">Observações</label>
            <textarea
              value={form.notes}
              onChange={(e) => setForm({ ...form, notes: e.target.value })}
              rows={3}
              className="w-full px-4 py-2 border rounded"
            />
          </div>

          <div className="mb-6">
            <label className="block text-sm font-medium mb-2">Tags (separadas por vírgula)</label>
            <input
              type="text"
              value={tagsInput}
              onChange={(e) => setTagsInput(e.target.value)}
              className="w-full px-4 py-2 border rounded"
              placeholder="prioridade, retorno"
            />
          </div>

          <h3 className="text-lg font-semibold mb-4">Contatos</h3>
          {contacts.map((contact, index) => (
            <div key={index} className="grid grid-cols-5 gap-4 mb-4 p-4 bg-gray-50 rounded">
              <div className="col-span-2">
                <label className="block text-xs text-gray-500 mb-1">Nome</label>
                <input
                  type="text"
                  value={contact.name}
                  onChange={(e) => updateContact(index, 'name', e.target.value)}
                  className="w-full px-3 py-2 border rounded"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">Parentesco</label>
                <input
                  type="text"
                  value={contact.relationship}
                  onChange={(e) => updateContact(index, 'relationship', e.target.value)}
                  className="w-full px-3 py-2 border rounded"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">Telefone</label>
                <input
                  type="text"
                  value={contact.phone}
                  onChange={(e) => updateContact(index, 'phone', e.target.value)}
                  className="w-full px-3 py-2 border rounded"
                />
              </div>
              <div className="flex items-end gap-2">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={contact.isPrimary}
                    onChange={(e) => updateContact(index, 'isPrimary', e.target.checked)}
                    className="mr-1"
                  />
                  Principal
                </label>
                <button
                  type="button"
                  onClick={() => removeContact(index)}
                  className="text-red-600 hover:text-red-800"
                >
                  ✕
                </button>
              </div>
            </div>
          ))}
          <button
            type="button"
            onClick={addContact}
            className="text-blue-600 hover:underline mb-6"
          >
            + Adicionar Contato
          </button>

          <div className="flex gap-4">
            <button
              type="submit"
              disabled={createMutation.isPending}
              className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
            >
              {createMutation.isPending ? 'Salvando...' : 'Salvar'}
            </button>
            <Link href="/patients" className="px-6 py-2 border rounded">
              Cancelar
            </Link>
          </div>

          {error && (
            <div className="mt-4 p-4 bg-red-100 text-red-700 rounded">{error}</div>
          )}
          {success && (
            <div className="mt-4 p-4 bg-green-100 text-green-700 rounded">{success}</div>
          )}
        </form>
      </div>
    </div>
  );
}