# Cadastro de Profissionais via Interface Web - Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Criar página web `/settings/professionals` para cadastro de profissionais, criando usuário e profissional em um único passo.

**Architecture:** Página Next.js com listagem + modal inline formulário. Usa API existente `POST /users` e `POST /settings/professionals`.

**Tech Stack:** Next.js 14, React, TanStack Query, API REST

---

## Task 1: Criar diretório professionals no frontend

**Files:**
- Create: `apps/web/src/app/(authenticated)/settings/professionals/`

- [ ] **Step 1: Criar diretório**

```bash
mkdir -p apps/web/src/app/\(authenticated\)/settings/professionals
```

---

## Task 2: Criar página de profissionais

**Files:**
- Create: `apps/web/src/app/(authenticated)/settings/professionals/page.tsx`

- [ ] **Step 1: Criar componente de listagem e formulário**

```typescript
'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import Link from 'next/link';
import { settingsApi, type Professional, type ServiceType } from '@/lib/api/settings';
import { usersApi } from '@/lib/api/users';
import { extractPhoneDigits, PhoneInput } from '@/components/forms/phone-input';

interface ProfessionalForm {
  name: string;
  email: string;
  password: string;
  specialty: string;
  registerNumber: string;
  color: string;
  appointmentTypeId: string;
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
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const { data: professionals, isLoading } = useQuery({
    queryKey: ['professionals'],
    queryFn: () => settingsApi.listProfessionals(),
  });

  const { data: serviceTypes } = useQuery({
    queryKey: ['serviceTypes'],
    queryFn: () => settingsApi.listServiceTypes(),
  });

  const createMutation = useMutation({
    mutationFn: async (data: ProfessionalForm) => {
      // 1. Criar usuário
      const user = await usersApi.createUser({
        email: data.email,
        password: data.password,
        name: data.name,
        roleId: '00000000-0000-0000-0000-000000000003', // professional role
      });

      // 2. Criar profissional
      const professional = await settingsApi.createProfessional({
        userId: user.id,
        specialty: data.specialty || undefined,
        registerNumber: data.registerNumber || undefined,
        color: data.color,
        appointmentTypeId: data.appointmentTypeId || undefined,
      });

      return professional;
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
      queryClient.invalidateQueries({ queryKey: ['professionals'] });
    },
    onError: (err: Error) => {
      setError(err.message);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!form.name || form.name.length < 2) {
      setError('Nome deve ter pelo menos 2 caracteres');
      return;
    }
    if (!form.email || !form.email.includes('@')) {
      setError('Email inválido');
      return;
    }
    if (!form.password || form.password.length < 6) {
      setError('Senha deve ter pelo menos 6 caracteres');
      return;
    }

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
          <form onSubmit={handleSubmit} className="mb-8 p-4 bg-gray-50 rounded">
            <h2 className="text-lg font-semibold mb-4">Novo Profissional</h2>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Nome *</label>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="w-full px-3 py-2 border rounded"
                  required
                />
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
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Senha *</label>
                <input
                  type="password"
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  className="w-full px-3 py-2 border rounded"
                  required
                  minLength={6}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Specialty</label>
                <input
                  type="text"
                  value={form.specialty}
                  onChange={(e) => setForm({ ...form, specialty: e.target.value })}
                  className="w-full px-3 py-2 border rounded"
                  placeholder="Ex: Cardiologia"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Registro</label>
                <input
                  type="text"
                  value={form.registerNumber}
                  onChange={(e) => setForm({ ...form, registerNumber: e.target.value })}
                  className="w-full px-3 py-2 border rounded"
                  placeholder="Ex: CRM/SP 123456"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Cor</label>
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
                  {serviceTypes?.items.map((st) => (
                    <option key={st.id} value={st.id}>
                      {st.name} ({st.duration}min)
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {error && <p className="text-red-600 mt-2">{error}</p>}
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
        ) : professionals?.items.length === 0 ? (
          <p className="text-gray-500">Nenhum profissional cadastrado.</p>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="text-left border-b">
                <th className="pb-2">Nome</th>
                <th className="pb-2">Email</th>
                <th className="pb-2">Specialty</th>
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
```

- [ ] **Step 2: Verificar importações**

Verificar se todos os imports estão disponíveis:
- `settingsApi` de `@/lib/api/settings`
- `usersApi` de `@/lib/api/users`
- `Professional` de `@/lib/api/settings`

Se não existir, criar a função em `apps/web/src/lib/api/users.ts`.

---

## Task 3: Verificar/criar API de usuários no frontend

**Files:**
- Check: `apps/web/src/lib/api/users.ts`
- Modify/Criar: conforme necessário

- [ ] **Step 1: Verificar se users.ts existe**

```bash
ls apps/web/src/lib/api/users.ts
```

Se não existir, criar:

```typescript
import { authenticatedFetch } from './client';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1';

export interface User {
  id: string;
  email: string;
  name: string;
  roleId: string;
  roleName: string;
  organizationId: string;
  isActive: boolean;
}

export const usersApi = {
  async createUser(data: {
    email: string;
    password: string;
    name: string;
    roleId: string;
  }): Promise<User> {
    const response = await authenticatedFetch(`${API_URL}/users`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Erro ao criar usuário');
    }
    
    return response.json();
  },

  async listUsers(params?: { page?: number; limit?: number }): Promise<{ items: User[]; pagination: any }> {
    const searchParams = new URLSearchParams();
    if (params?.page) searchParams.set('page', String(params.page));
    if (params?.limit) searchParams.set('limit', String(params.limit));
    
    const response = await authenticatedFetch(`${API_URL}/users?${searchParams}`);
    
    if (!response.ok) {
      throw new Error('Erro ao listar usuários');
    }
    
    return response.json();
  },
};
```

- [ ] **Step 2: Verificar TypeScript**

```bash
yarn workspace @clinica-saas/web typecheck
```

---

## Task 4: Testar funcionalidade

**Files:**
- Nenhum arquivo novo

- [ ] **Step 1: Iniciar frontend**

```bash
cd apps/web && yarn dev
```

- [ ] **Step 2: Acessar página**

Acessar: http://localhost:3000/settings/professionals

- [ ] **Step 3: Criar profissional de teste**

Preencher formulário com dados fictícios e verificar:
- [ ] Usuário criado no banco
- [ ] Profissional criado no banco
- [ ] Aparece na lista após criação

---

## Task 5: Commit

- [ ] **Step 1: Commitar mudanças**

```bash
git add apps/web/src/app/\(authenticated\)/settings/professionals/ apps/web/src/lib/api/users.ts docs/superpowers/specs/
git commit -m "feat(settings): add professional registration page"
```