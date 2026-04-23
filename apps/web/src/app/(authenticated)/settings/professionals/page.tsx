'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import Link from 'next/link';
import { settingsApi, type Professional, type ServiceType } from '@/lib/api/settings';
import { usersApi } from '@/lib/api/users';
import { PasswordInput } from '@/components/forms/password-input';

interface ProfessionalForm {
  name: string;
  email: string;
  password: string;
  specialty: string;
  registerNumber: string;
  color: string;
  appointmentTypeId: string;
}

function validateEmail(email: string): { valid: boolean; message: string } {
  if (!email) return { valid: false, message: '' };
  
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  
  if (!emailRegex.test(email)) {
    return { valid: false, message: 'Email inválido. Use o formato: nome@exemplo.com' };
  }
  
  return { valid: true, message: '' };
}

export default function ProfessionalsPage() {
  const queryClient = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState<ProfessionalForm>({
    name: '',
    email: '',
    password: '',
    specialty: '',
    registerNumber: '',
    color: '#3B82F6',
    appointmentTypeId: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [success, setSuccess] = useState('');

  const { data: professionals, isLoading: loadingProfessionals } = useQuery({
    queryKey: ['professionals'],
    queryFn: () => settingsApi.listProfessionals(),
  });

  const { data: serviceTypes, isLoading: loadingTypes } = useQuery({
    queryKey: ['serviceTypes'],
    queryFn: () => settingsApi.listServiceTypes({ isActive: true }),
  });

  const createMutation = useMutation({
    mutationFn: async (data: ProfessionalForm) => {
      const user = await usersApi.createUser({
        email: data.email,
        password: data.password,
        name: data.name,
        roleId: '00000000-0000-0000-0000-000000000003',
      });

      await settingsApi.createProfessional({
        userId: user.id,
        specialty: data.specialty || undefined,
        registerNumber: data.registerNumber || undefined,
        color: data.color,
        appointmentTypeId: data.appointmentTypeId || undefined,
      });
    },
    onSuccess: () => {
      setSuccess('Profissional criado com sucesso!');
      setForm({
        name: '',
        email: '',
        password: '',
        specialty: '',
        registerNumber: '',
        color: '#3B82F6',
        appointmentTypeId: '',
      });
      setShowForm(false);
      setErrors({});
      queryClient.invalidateQueries({ queryKey: ['professionals'] });
    },
    onError: (err: Error) => {
      setErrors({ form: err.message });
    },
  });

  const handleEmailChange = (email: string) => {
    setForm({ ...form, email });
    
    if (email) {
      const validation = validateEmail(email);
      if (!validation.valid) {
        setErrors({ ...errors, email: validation.message });
      } else {
        setErrors({ ...errors, email: '' });
      }
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};
    
    if (!form.name || form.name.trim().length < 2) {
      newErrors.name = 'Nome deve ter pelo menos 2 caracteres';
    }
    
    const emailValidation = validateEmail(form.email);
    if (!form.email || !emailValidation.valid) {
      newErrors.email = emailValidation.message || 'Email é obrigatório';
    }
    
    if (!form.password || form.password.length < 6) {
      newErrors.password = 'Senha deve ter pelo menos 6 caracteres';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    setSuccess('');

    if (!validateForm()) return;

    createMutation.mutate(form);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex justify-between items-center">
        <Link href="/settings" className="text-blue-600 hover:underline">
          ← Voltar para Configurações
        </Link>
        <button
          onClick={() => setShowForm(!showForm)}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          {showForm ? 'Cancelar' : 'Novo Profissional'}
        </button>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <h1 className="text-2xl font-bold mb-6">Profissionais</h1>

        {showForm && (
          <form onSubmit={handleSubmit} className="mb-8 p-4 bg-gray-50 rounded-lg">
            <h2 className="text-lg font-semibold mb-4">Novo Profissional</h2>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Nome completo *</label>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="w-full px-3 py-2 border rounded"
                  required
                />
                {errors.name && <p className="text-sm text-red-600 mt-1">{errors.name}</p>}
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Email *</label>
                <input
                  type="email"
                  value={form.email}
                  onChange={(e) => handleEmailChange(e.target.value)}
                  onBlur={() => {
                    const validation = validateEmail(form.email);
                    if (!validation.valid) {
                      setErrors({ ...errors, email: validation.message });
                    }
                  }}
                  className="w-full px-3 py-2 border rounded"
                  placeholder="nome@clinica.com.br"
                />
                {errors.email && <p className="text-sm text-red-600 mt-1">{errors.email}</p>}
              </div>
              
              <div>
                <PasswordInput
                  label="Senha de acesso *"
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  error={errors.password}
                  className="w-full"
                  required
                  minLength={6}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Especialidade</label>
                <input
                  type="text"
                  value={form.specialty}
                  onChange={(e) => setForm({ ...form, specialty: e.target.value })}
                  className="w-full px-3 py-2 border rounded"
                  placeholder="Ex: Cardiologia"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Registro Profissional</label>
                <input
                  type="text"
                  value={form.registerNumber}
                  onChange={(e) => setForm({ ...form, registerNumber: e.target.value })}
                  className="w-full px-3 py-2 border rounded"
                  placeholder="Ex: CRM/SP 123456"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Cor na agenda</label>
                <input
                  type="color"
                  value={form.color}
                  onChange={(e) => setForm({ ...form, color: e.target.value })}
                  className="w-full h-10 border rounded"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Tipo de Atendimento</label>
                <select
                  value={form.appointmentTypeId}
                  onChange={(e) => setForm({ ...form, appointmentTypeId: e.target.value })}
                  className="w-full px-3 py-2 border rounded"
                  disabled={loadingTypes}
                >
                  <option value="">Selecione</option>
                  {serviceTypes?.items.map((st) => (
                    <option key={st.id} value={st.id}>
                      {st.name} ({st.duration}min)
                    </option>
                  ))}
                </select>
                {loadingTypes && <p className="text-sm text-gray-500">Carregando...</p>}
              </div>
            </div>

            {errors.form && <p className="text-red-600 mt-2">{errors.form}</p>}
            {success && <p className="text-green-600 mt-2">{success}</p>}

            <button
              type="submit"
              disabled={createMutation.isPending}
              className="mt-4 bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
            >
              {createMutation.isPending ? 'Salvando...' : 'Salvar'}
            </button>
          </form>
        )}

        {loadingProfessionals ? (
          <p>Carregando...</p>
        ) : professionals?.items.length === 0 ? (
          <p className="text-gray-500">Nenhum profissional cadastrado.</p>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="text-left border-b">
                <th className="pb-2">Nome</th>
                <th className="pb-2">Email</th>
                <th className="pb-2">Especialidade</th>
                <th className="pb-2">Status</th>
              </tr>
            </thead>
            <tbody>
              {professionals?.items.map((p) => (
                <tr key={p.id} className="border-b">
                  <td className="py-2">{p.user.name}</td>
                  <td className="py-2">{p.user.email}</td>
                  <td className="py-2">{p.specialty || '-'}</td>
                  <td className="py-2">
                    <span className="px-2 py-1 bg-green-100 text-green-800 rounded text-sm">
                      Ativo
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}