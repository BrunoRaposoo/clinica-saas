'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import Link from 'next/link';
import { patientsApi } from '@/lib/api/patients';
import { Patient } from '@clinica-saas/contracts';

export default function PatientDetailPage() {
  const params = useParams();
  const router = useRouter();
  const queryClient = useQueryClient();
  const patientId = params.id as string;

  const [isEditing, setIsEditing] = useState(false);
  const [form, setForm] = useState<Partial<Patient>>({} as any);
  const [error, setError] = useState('');

  const { data: patient, isLoading, error: loadError } = useQuery({
    queryKey: ['patient', patientId],
    queryFn: () => patientsApi.getPatient(patientId),
  });

  const { data: contacts } = useQuery({
    queryKey: ['patientContacts', patientId],
    queryFn: () => patientsApi.getPatientContacts(patientId),
    enabled: !!patientId,
  });

  const updateMutation = useMutation({
    mutationFn: (data: Parameters<typeof patientsApi.updatePatient>[1]) =>
      patientsApi.updatePatient(patientId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['patient', patientId] });
      setIsEditing(false);
      setError('');
    },
    onError: (err: Error) => setError(err.message),
  });

  const deleteMutation = useMutation({
    mutationFn: () => patientsApi.deletePatient(patientId),
    onSuccess: () => router.push('/patients'),
    onError: (err: Error) => setError(err.message),
  });

  const handleSave = () => {
    const cleanForm = {
      name: form.name || undefined,
      email: form.email || undefined,
      phone: form.phone || undefined,
      document: form.document || undefined,
    };
    updateMutation.mutate(cleanForm);
  };

  if (isLoading) {
    return (
      <div className="p-8 text-center text-gray-500">Carregando...</div>
    );
  }

  if (loadError || !patient) {
    return (
      <div className="p-8 text-center text-red-500">Erro ao carregar paciente</div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <Link href="/patients" className="text-blue-600 hover:underline">
          ← Voltar para Pacientes
        </Link>
      </div>

      <div className="bg-white rounded-lg shadow p-8">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">Detalhes do Paciente</h2>
          <div className="flex gap-2">
            {!isEditing ? (
              <button
                onClick={() => {
                  setForm(patient);
                  setIsEditing(true);
                }}
                className="px-4 py-2 border rounded hover:bg-gray-50"
              >
                Editar
              </button>
            ) : (
              <>
                <button
                  onClick={handleSave}
                  disabled={updateMutation.isPending}
                  className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
                >
                  {updateMutation.isPending ? 'Salvando...' : 'Salvar'}
                </button>
                <button
                  onClick={() => setIsEditing(false)}
                  className="px-4 py-2 border rounded hover:bg-gray-50"
                >
                  Cancelar
                </button>
              </>
            )}
            <button
              onClick={() => {
                if (confirm('Tem certeza que deseja excluir este paciente?')) {
                  deleteMutation.mutate();
                }
              }}
              className="px-4 py-2 text-red-600 hover:text-red-800"
            >
              Excluir
            </button>
          </div>
        </div>

        {error && (
          <div className="mb-4 p-4 bg-red-100 text-red-700 rounded">{error}</div>
        )}

        <div className="grid grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-500">Nome</label>
            {isEditing ? (
              <input
                type="text"
                value={form.name ?? ''}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="w-full px-4 py-2 border rounded mt-1"
              />
            ) : (
              <p className="text-lg mt-1">{patient.name}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-500">Email</label>
            {isEditing ? (
              <input
                type="email"
                value={form.email ?? ''}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className="w-full px-4 py-2 border rounded mt-1"
              />
            ) : (
              <p className="text-lg mt-1">{patient.email ?? '-'}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-500">Telefone</label>
            {isEditing ? (
              <input
                type="text"
                value={form.phone ?? ''}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                className="w-full px-4 py-2 border rounded mt-1"
              />
            ) : (
              <p className="text-lg mt-1">{patient.phone ?? '-'}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-500">CPF</label>
            <p className="text-lg mt-1">{patient.document ?? '-'}</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-500">Data de Nascimento</label>
            <p className="text-lg mt-1">{patient.birthDate ? new Date(patient.birthDate).toLocaleDateString('pt-BR') : '-'}</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-500">Gênero</label>
            <p className="text-lg mt-1">
              {patient.gender === 'male' ? 'Masculino' : patient.gender === 'female' ? 'Feminino' : patient.gender === 'other' ? 'Outro' : '-'}
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-500">Status</label>
            <span
              className={`inline-block px-2 py-1 rounded-full text-sm mt-1 ${
                patient.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
              }`}
            >
              {patient.isActive ? 'Ativo' : 'Inativo'}
            </span>
          </div>
        </div>

        <div className="mt-6">
          <h3 className="text-lg font-semibold mb-3">Endereço</h3>
          <div className="grid grid-cols-2 gap-4 text-gray-600">
            <p>
              {patient.addressStreet}
              {patient.addressNumber && `, ${patient.addressNumber}`}
              {patient.addressComplement && `, ${patient.addressComplement}`}
            </p>
            <p>
              {patient.addressDistrict}
              {patient.addressCity && ` - ${patient.addressCity}`}
              {patient.addressState && `, ${patient.addressState}`}
              {patient.addressZipCode && ` - CEP: ${patient.addressZipCode}`}
            </p>
          </div>
        </div>

        {patient.notes && (
          <div className="mt-6">
            <h3 className="text-lg font-semibold mb-3">Observações</h3>
            <p className="text-gray-600">{patient.notes}</p>
          </div>
        )}

        {patient.tags && patient.tags.length > 0 && (
          <div className="mt-6">
            <h3 className="text-lg font-semibold mb-3">Tags</h3>
            <div className="flex gap-2">
              {patient.tags.map((tag, index) => (
                <span key={index} className="px-2 py-1 bg-gray-100 rounded text-sm">
                  {tag}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="bg-white rounded-lg shadow p-8">
        <h3 className="text-lg font-semibold mb-4">Contatos</h3>
        {contacts && contacts.length > 0 ? (
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-2 text-left text-sm font-medium text-gray-500">Nome</th>
                <th className="px-4 py-2 text-left text-sm font-medium text-gray-500">Parentesco</th>
                <th className="px-4 py-2 text-left text-sm font-medium text-gray-500">Telefone</th>
                <th className="px-4 py-2 text-left text-sm font-medium text-gray-500">Email</th>
                <th className="px-4 py-2 text-left text-sm font-medium text-gray-500">Principal</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {contacts.map((contact) => (
                <tr key={contact.id}>
                  <td className="px-4 py-2">{contact.name}</td>
                  <td className="px-4 py-2">{contact.relationship}</td>
                  <td className="px-4 py-2">{contact.phone ?? '-'}</td>
                  <td className="px-4 py-2">{contact.email ?? '-'}</td>
                  <td className="px-4 py-2">{contact.isPrimary ? 'Sim' : 'Não'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p className="text-gray-500">Nenhum contato cadastrado.</p>
        )}
      </div>
    </div>
  );
}