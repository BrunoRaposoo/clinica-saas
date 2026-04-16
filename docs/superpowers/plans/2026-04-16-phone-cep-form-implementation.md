# Implementation Plan: Telefone e CEP no Formulário de Novo Paciente

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Adicionar formatação de telefone brasileiro e busca automática de CEP no formulário de novo paciente.

**Architecture:** Dois componentes reutilizáveis (PhoneInput, CepInput) que encapsulam a lógica de máscara e busca ViaCEP.

**Tech Stack:** react-input-mask, ViaCEP API (https://viacep.com.br)

---

## Task 1: Criar Componente PhoneInput

**Files:**
- Create: `apps/web/src/components/forms/phone-input.tsx`

- [ ] **Step 1: Criar diretório e componente**

```typescript
'use client';

import InputMask from 'react-input-mask';
import { Input } from '@clinica-saas/ui';
import { cn } from '@/lib/utils';

interface PhoneInputProps {
  value: string;
  onChange: (value: string) => void;
  label?: string;
  placeholder?: string;
  error?: string;
  className?: string;
}

export function PhoneInput({
  value,
  onChange,
  label = 'Telefone',
  placeholder = '(00) 00000-0000',
  error,
  className,
}: PhoneInputProps) {
  return (
    <div className={cn('space-y-1', className)}>
      {label && <label className="block text-sm font-medium">{label}</label>}
      <InputMask
        mask="(99) 99999-9999"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full px-4 py-2 border rounded"
      >
        {(inputProps) => (
          <input
            {...inputProps}
            type="tel"
            className="w-full px-4 py-2 border rounded"
          />
        )}
      </InputMask>
      {error && <p className="text-sm text-red-600">{error}</p>}
    </div>
  );
}
```

- [ ] **Step 2: Verificar se compila**

Run: `yarn workspace @clinica-saas/web typecheck`

---

## Task 2: Criar Componente CepInput com ViaCEP

**Files:**
- Create: `apps/web/src/components/forms/cep-input.tsx`

- [ ] **Step 1: Criar componente com busca ViaCEP**

```typescript
'use client';

import { useState } from 'react';
import { Input } from '@clinica-saas/ui';
import { cn } from '@/lib/utils';

interface CepInputProps {
  value: string;
  onChange: (value: string) => void;
  onAddressFill?: (data: {
    street: string;
    district: string;
    city: string;
    state: string;
  }) => void;
  label?: string;
  className?: string;
}

interface ViaCepResponse {
  logradouro?: string;
  bairro?: string;
 -localidade?: string;
  uf?: string;
  erro?: boolean;
}

export function CepInput({
  value,
  onChange,
  onAddressFill,
  label = 'CEP',
  className,
}: CepInputProps) {
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');

  const handleBlur = async () => {
    const cep = value.replace(/\D/g, '');
    if (cep.length !== 8) return;

    setStatus('loading');
    setMessage('Buscando endereço...');

    try {
      const res = await fetch(`https://viacep.com.br/ws/${cep}/json/`);
      const data: ViaCepResponse = await res.json();

      if (data.erro) {
        setStatus('error');
        setMessage('CEP não encontrado. Preencha o endereço manualmente.');
        return;
      }

      setStatus('success');
      setMessage('Endereço encontrado!');

      onAddressFill?.({
        street: data.logradouro || '',
        district: data.bairro || '',
        city: data.localidade || '',
        state: data.uf || '',
      });

      setTimeout(() => setStatus('idle'), 3000);
    } catch {
      setStatus('error');
      setMessage('Erro ao buscar CEP. Verifique sua conexão e preencha manualmente.');
    }
  };

  return (
    <div className={cn('space-y-1', className)}>
      {label && <label className="block text-sm font-medium">{label}</label>}
      <Input
        type="text"
        value={value}
        onChange={(e) => {
          onChange(e.target.value);
          setStatus('idle');
          setMessage('');
        }}
        onBlur={handleBlur}
        placeholder="00000-000"
        className="w-full px-4 py-2 border rounded"
      />
      {message && (
        <p
          className={cn('text-sm', {
            'text-blue-600': status === 'loading',
            'text-green-600': status === 'success',
            'text-red-600': status === 'error',
          })}
        >
          {message}
        </p>
      )}
    </div>
  );
}
```

- [ ] **Step 2: Verificar se compila**

Run: `yarn workspace @clinica-saas/web typecheck`

---

## Task 3: Atualizar Formulário de Novo Paciente

**Files:**
- Modify: `apps/web/src/app/(authenticated)/patients/new/page.tsx`

- [ ] **Step 1: Importar componentes**

Adicionar no topo do arquivo:
```typescript
import { PhoneInput } from '@/components/forms/phone-input';
import { CepInput } from '@/components/forms/cep-input';
```

- [ ] **Step 2: Substituir input de telefone**

Local: linha 118-126
```typescript
// ANTES:
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

// DEPOIS:
<PhoneInput
  value={form.phone}
  onChange={(value) => setForm({ ...form, phone: value })}
  label="Telefone"
  placeholder="(00) 00000-0000"
/>
```

- [ ] **Step 3: Substituir input de CEP**

Local: linha 217-225
```typescript
// ANTES:
<div>
  <label className="block text-sm font-medium mb-2">CEP</label>
  <input
    type="text"
    value={form.addressZipCode}
    onChange={(e) => setForm({ ...form, addressZipCode: e.target.value })}
    className="w-full px-4 py-2 border rounded"
  />
</div>

// DEPOIS:
<CepInput
  value={form.addressZipCode}
  onChange={(value) => setForm({ ...form, addressZipCode: value })}
  onAddressFill={({ street, district, city, state }) => {
    setForm((prev) => ({
      ...prev,
      addressStreet: street,
      addressDistrict: district,
      addressCity: city,
      addressState: state,
    }));
  }}
  label="CEP"
/>
```

- [ ] **Step 4: Substituir inputs de telefone nos contatos**

Local: linha 271-278 em cada contato
```typescript
// ANTES:
<div>
  <label className="block text-xs text-gray-500 mb-1">Telefone</label>
  <input
    type="text"
    value={contact.phone}
    onChange={(e) => updateContact(index, 'phone', e.target.value)}
    className="w-full px-3 py-2 border rounded"
  />
</div>

// DEPOIS:
<PhoneInput
  value={contact.phone}
  onChange={(value) => updateContact(index, 'phone', value)}
  placeholder="(00) 00000-0000"
  className="col-span-2"
/>
```

- [ ] **Step 5: Verificar se compila**

Run: `yarn workspace @clinica-saas/web typecheck`

- [ ] **Step 6: Testar no navegador**

Run: `yarn workspace @clinica-saas/web dev` e acessa http://localhost:3000/patients/new

---

## Task 4: Commit

- [ ] **Step 1: Commitar mudanças**

```bash
git add apps/web/src/components/forms/ docs/superpowers/specs/ docs/superpowers/plans/
git commit -m "feat(patients): add phone mask and CEP auto-fill"
```