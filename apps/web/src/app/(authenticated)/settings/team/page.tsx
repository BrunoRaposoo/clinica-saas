'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import Link from 'next/link';
import { SPECIALTY_CATEGORIES, type Specialty, specialtiesApi, settingsApi } from '@/lib/api/settings';
import { usersApi, type User } from '@/lib/api/users';
import { PasswordInput } from '@/components/forms/password-input';
import { PhoneInput } from '@/components/forms/phone-input';
import { useRole } from '@/hooks/use-role';

type Tab = 'professionals' | 'receptionists';

interface TeamMemberForm {
  name: string;
  email: string;
  password: string;
  phone: string;
  specialtyId: string;
  registerNumber: string;
  color: string;
  appointmentTypeId: string;
  role: 'professional' | 'receptionist';
  function: string;
}

export default function TeamPage() {
  const { canManageSettings } = useRole();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<Tab>('professionals');
  const [showForm, setShowForm] = useState(false);
  const [search, setSearch] = useState('');
  const [form, setForm] = useState<TeamMemberForm>({
    name: '',
    email: '',
    password: '',
    phone: '',
    specialtyId: '',
    registerNumber: '',
    color: '#3B82F6',
    appointmentTypeId: '',
    role: 'professional',
    function: 'Recepção',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [success, setSuccess] = useState('');

  if (!canManageSettings) {
    return (
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold mb-6">Gestão de Equipe</h1>
        <p className="text-gray-500">Você não tem acesso a esta página.</p>
        <Link href="/settings" className="text-blue-600 hover:underline mt-4 block">
          ← Voltar para Configurações
        </Link>
      </div>
    );
  }

  const { data: users, isLoading } = useQuery({
    queryKey: ['users', activeTab],
    queryFn: () => usersApi.listUsers({ role: activeTab === 'professionals' ? 'professional' : 'receptionist' }),
  });

  const { data: specialties } = useQuery({
    queryKey: ['specialties'],
    queryFn: () => specialtiesApi.list(),
  });

  const { data: serviceTypes } = useQuery({
    queryKey: ['serviceTypes'],
    queryFn: () => settingsApi.listServiceTypes({ isActive: true }),
  });

  const createMutation = useMutation({
    mutationFn: async (data: TeamMemberForm) => {
      if (activeTab === 'professionals') {
        const user = await usersApi.createUser({
          email: data.email,
          password: data.password,
          name: data.name,
          phone: data.phone || undefined,
          roleId: '00000000-0000-0000-0000-000000000003',
        });

        await settingsApi.createProfessional({
          userId: user.id,
          specialtyId: data.specialtyId || undefined,
          registerNumber: data.registerNumber || undefined,
          color: data.color,
          appointmentTypeId: data.appointmentTypeId || undefined,
        });
      } else {
        await usersApi.createUser({
          email: data.email,
          password: data.password,
          name: data.name,
          phone: data.phone || undefined,
          roleId: '00000000-0000-0000-0000-000000000004',
        });
      }
    },
    onSuccess: () => {
      setSuccess(activeTab === 'professionals' ? 'Profissional criado com sucesso!' : 'Recepcionista criado com sucesso!');
      setForm({
        name: '',
        email: '',
        password: '',
        phone: '',
        specialtyId: '',
        registerNumber: '',
        color: '#3B82F6',
        appointmentTypeId: '',
        role: 'professional',
        function: 'Recepção',
      });
      setShowForm(false);
      setErrors({});
      queryClient.invalidateQueries({ queryKey: ['users'] });
    },
    onError: (err: Error) => {
      setErrors({ form: err.message });
    },
  });

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};
    
    if (!form.name || form.name.trim().length < 2) {
      newErrors.name = 'Nome deve ter pelo menos 2 caracteres';
    }
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!form.email || !emailRegex.test(form.email)) {
      newErrors.email = 'Email inválido';
    }
    
    if (!form.password || form.password.length < 6) {
      newErrors.password = 'Senha deve ter pelo menos 6 caracteres';
    }

    if (activeTab === 'professionals' && !form.specialtyId) {
      newErrors.specialtyId = 'Selecione uma especialidade';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    setSuccess('');
    if (validateForm()) {
      createMutation.mutate(form);
    }
  };

  const filteredMembers = users?.items.filter(member => 
    member.name.toLowerCase().includes(search.toLowerCase()) ||
    member.email.toLowerCase().includes(search.toLowerCase())
  ) || [];

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex justify-between items-center">
        <Link href="/settings" className="text-blue-600 hover:underline">
          ← Voltar para Configurações
        </Link>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <h1 className="text-2xl font-bold mb-6">Gestão de Equipe</h1>

        <div className="flex border-b mb-6">
          <button
            onClick={() => { setActiveTab('professionals'); setShowForm(false); }}
            className={`px-4 py-2 -mb-px border-b-2 ${activeTab === 'professionals' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
          >
            Profissionais
          </button>
          <button
            onClick={() => { setActiveTab('receptionists'); setShowForm(false); }}
            className={`px-4 py-2 -mb-px border-b-2 ${activeTab === 'receptionists' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
          >
            Recepcionistas
          </button>
        </div>

        <div className="flex justify-between items-center mb-4">
          <input
            type="text"
            placeholder="Buscar por nome ou email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-64 px-3 py-2 border rounded"
          />
          <button
            onClick={() => setShowForm(!showForm)}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            {showForm ? 'Cancelar' : `+ Novo ${activeTab === 'professionals' ? 'Profissional' : 'Recepcionista'}`}
          </button>
        </div>

        {showForm && (
          <form onSubmit={handleSubmit} className="mb-8 p-4 bg-gray-50 rounded-lg">
            <h2 className="text-lg font-semibold mb-4">
              Novo {activeTab === 'professionals' ? 'Profissional' : 'Recepcionista'}
            </h2>
            
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
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
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  className="w-full px-3 py-2 border rounded"
                  required
                />
                {errors.email && <p className="text-sm text-red-600 mt-1">{errors.email}</p>}
              </div>
              
              <div>
                <PasswordInput
                  label="Senha *"
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  error={errors.password}
                  className="w-full"
                  required
                  minLength={6}
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Telefone</label>
                <PhoneInput
                  value={form.phone}
                  onChange={(value) => setForm({ ...form, phone: value })}
                  className="w-full"
                />
              </div>

              {activeTab === 'professionals' && (
                <>
                  <div>
                    <label className="block text-sm font-medium mb-1">Especialidade *</label>
                    <select
                      value={form.specialtyId}
                      onChange={(e) => setForm({ ...form, specialtyId: e.target.value })}
                      className="w-full px-3 py-2 border rounded"
                      required
                    >
                      <option value="">Selecione</option>
                      {SPECIALTY_CATEGORIES.map(cat => (
                        <optgroup key={cat.value} label={cat.label}>
                          {specialties?.items.filter((s: Specialty) => s.category === cat.value).map((s: Specialty) => (
                            <option key={s.id} value={s.id}>{s.name}</option>
                          ))}
                        </optgroup>
                      ))}
                    </select>
                    {errors.specialtyId && <p className="text-sm text-red-600 mt-1">{errors.specialtyId}</p>}
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-1">Registro Profissional</label>
                    <input
                      type="text"
                      value={form.registerNumber}
                      onChange={(e) => setForm({ ...form, registerNumber: e.target.value })}
                      className="w-full px-3 py-2 border rounded"
                      placeholder="CRM/SP 123456"
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
                    >
                      <option value="">Selecione</option>
                      {serviceTypes?.items.map((st: { id: string; name: string; duration: number }) => (
                        <option key={st.id} value={st.id}>{st.name} ({st.duration}min)</option>
                      ))}
                    </select>
                  </div>
                </>
              )}

              {activeTab === 'receptionists' && (
                <div>
                  <label className="block text-sm font-medium mb-1">Função</label>
                  <select
                    value={form.function}
                    onChange={(e) => setForm({ ...form, function: e.target.value })}
                    className="w-full px-3 py-2 border rounded"
                  >
                    <option value="Recepção">Recepção</option>
                    <option value="Coordenação">Coordenação</option>
                    <option value="Administrativo Geral">Administrativo Geral</option>
                  </select>
                </div>
              )}
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

        {isLoading ? (
          <p>Carregando...</p>
        ) : filteredMembers.length === 0 ? (
          <p className="text-gray-500">Nenhum {activeTab === 'professionals' ? 'profissional' : 'recepcionista'} cadastrado.</p>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="text-left border-b">
                <th className="pb-2">Nome</th>
                <th className="pb-2">Email</th>
                <th className="pb-2">Telefone</th>
                <th className="pb-2">Status</th>
              </tr>
            </thead>
            <tbody>
              {filteredMembers.map((member) => (
                <tr key={member.id} className="border-b">
                  <td className="py-2">{member.name}</td>
                  <td className="py-2">{member.email}</td>
                  <td className="py-2">{member.phone || '-'}</td>
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