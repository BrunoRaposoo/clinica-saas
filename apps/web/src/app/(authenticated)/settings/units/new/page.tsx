'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useMutation } from '@tanstack/react-query';
import Link from 'next/link';
import { settingsApi } from '@/lib/api/settings';
import { PhoneInput, extractDigits as extractPhoneDigits } from '@/components/forms/phone-input';
import { CepInput, extractDigits as extractCepDigits } from '@/components/forms/cep-input';

interface AddressData {
  street: string;
  district: string;
  city: string;
  state: string;
}

export default function NewUnitPage() {
  const router = useRouter();
  const [form, setForm] = useState({
    name: '',
    phone: '',
    addressZipCode: '',
    addressStreet: '',
    addressNumber: '',
    addressComplement: '',
    addressDistrict: '',
    addressCity: '',
    addressState: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [success, setSuccess] = useState('');

  const createMutation = useMutation({
    mutationFn: (data: typeof form) => {
      const phoneRaw = form.phone ? extractPhoneDigits(form.phone) : undefined;
      const cepRaw = form.addressZipCode ? extractCepDigits(form.addressZipCode) : undefined;

      const addressParts = [
        data.addressStreet,
        data.addressNumber && `, ${data.addressNumber}`,
        data.addressComplement && ` - ${data.addressComplement}`,
        data.addressDistrict && ` (${data.addressDistrict})`,
        data.addressCity && ` - ${data.addressCity}`,
        data.addressState && `, ${data.addressState}`,
      ].filter(Boolean);

      const address = addressParts.join('');

      return settingsApi.createUnit({
        name: data.name,
        phone: phoneRaw,
        address: address || undefined,
      });
    },
    onSuccess: () => {
      setSuccess('Unidade criada com sucesso!');
      setTimeout(() => router.push('/settings/units'), 1500);
    },
    onError: (err: Error) => {
      setErrors({ form: err.message });
    },
  });

  const handleAddressFill = (data: AddressData) => {
    setForm((prev) => ({
      ...prev,
      addressStreet: data.street,
      addressDistrict: data.district,
      addressCity: data.city,
      addressState: data.state,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    setSuccess('');

    if (!form.name || form.name.trim().length < 2) {
      setErrors({ name: 'Nome da unidade é obrigatório (mínimo 2 caracteres)' });
      return;
    }

    createMutation.mutate(form);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <Link href="/settings/units" className="text-blue-600 hover:underline">
          ← Voltar para Unidades
        </Link>
      </div>

      <div className="bg-white rounded-lg shadow p-8">
        <h2 className="text-2xl font-bold mb-6">Nova Unidade</h2>

        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-2 gap-6 mb-6">
            <div>
              <label className="block text-sm font-medium mb-2">Nome da Unidade *</label>
              <input
                type="text"
                required
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="w-full px-4 py-2 border rounded"
                placeholder="Ex: Unidade Centro"
              />
              {errors.name && <p className="text-sm text-red-600 mt-1">{errors.name}</p>}
            </div>
            
            <div>
              <PhoneInput
                value={form.phone}
                onChange={(value) => setForm({ ...form, phone: value })}
                label="Telefone"
              />
            </div>
          </div>

          <h3 className="text-lg font-semibold mb-4">Endereço</h3>
          <div className="grid grid-cols-3 gap-4 mb-6">
            <div>
              <CepInput
                value={form.addressZipCode}
                onChange={(value) => setForm({ ...form, addressZipCode: value })}
                onAddressFill={handleAddressFill}
                label="CEP"
              />
              <p className="text-xs text-gray-500 mt-1">Digite para auto-preencher</p>
            </div>
            <div className="col-span-2">
              <label className="block text-sm font-medium mb-2">Rua</label>
              <input
                type="text"
                value={form.addressStreet}
                onChange={(e) => setForm({ ...form, addressStreet: e.target.value })}
                className="w-full px-4 py-2 border rounded"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4 mb-6">
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
                placeholder="Sala, Andar, etc"
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
          </div>

          <div className="grid grid-cols-3 gap-4 mb-6">
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
                maxLength={2}
                placeholder="SP"
              />
            </div>
          </div>

          {errors.form && (
            <div className="mb-4 p-4 bg-red-100 text-red-700 rounded">{errors.form}</div>
          )}
          {success && (
            <div className="mb-4 p-4 bg-green-100 text-green-700 rounded">{success}</div>
          )}

          <div className="flex gap-4">
            <button
              type="submit"
              disabled={createMutation.isPending}
              className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
            >
              {createMutation.isPending ? 'Salvando...' : 'Salvar'}
            </button>
            <Link href="/settings/units" className="px-6 py-2 border rounded">
              Cancelar
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}