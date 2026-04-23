'use client';

import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { settingsApi } from '@/lib/api/settings';
import { PhoneInput, extractDigits as extractPhoneDigits } from '@/components/forms/phone-input';
import { CepInput, extractDigits as extractCepDigits } from '@/components/forms/cep-input';

function validateEmail(email: string): { valid: boolean; message: string } {
  if (!email) return { valid: false, message: '' };
  
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  
  if (!emailRegex.test(email)) {
    return { valid: false, message: 'Email inválido. Use o formato: nome@exemplo.com' };
  }
  
  return { valid: true, message: '' };
}

interface AddressData {
  street: string;
  district: string;
  city: string;
  state: string;
}

export default function SettingsGeneralPage() {
  const queryClient = useQueryClient();
  const router = useRouter();
  const [isEditing, setIsEditing] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [success, setSuccess] = useState('');

  const { data: settings, isLoading } = useQuery({
    queryKey: ['settings'],
    queryFn: () => settingsApi.getSettings(),
  });

  const [formData, setFormData] = useState({
    businessName: '',
    tradeName: '',
    email: '',
    phone: '',
    addressStreet: '',
    addressNumber: '',
    addressComplement: '',
    addressDistrict: '',
    addressCity: '',
    addressState: '',
    addressZipCode: '',
    timezone: 'America/Sao_Paulo',
    locale: 'pt-BR',
    currency: 'BRL',
  });

  useEffect(() => {
    if (settings) {
      setFormData({
        businessName: settings.businessName || '',
        tradeName: settings.tradeName || '',
        email: settings.email || '',
        phone: settings.phone || '',
        addressStreet: settings.address || '',
        addressNumber: '',
        addressComplement: '',
        addressDistrict: '',
        addressCity: settings.city || '',
        addressState: settings.state || '',
        addressZipCode: settings.zipCode || '',
        timezone: settings.timezone || 'America/Sao_Paulo',
        locale: settings.locale || 'pt-BR',
        currency: settings.currency || 'BRL',
      });
    }
  }, [settings]);

  const updateMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      const phoneRaw = formData.phone ? extractPhoneDigits(formData.phone) : undefined;
      const cepRaw = formData.addressZipCode ? extractCepDigits(formData.addressZipCode) : undefined;

      const payload = {
        businessName: data.businessName,
        tradeName: data.tradeName,
        email: data.email,
        phone: phoneRaw || undefined,
        address: data.addressStreet,
        city: data.addressCity,
        state: data.addressState,
        zipCode: cepRaw || undefined,
        timezone: data.timezone,
        locale: data.locale,
        currency: data.currency,
      };
      
      return settingsApi.updateSettings(payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['settings'] });
      setIsEditing(false);
      setErrors({});
      setSuccess('Configurações salvas com sucesso!');
      setTimeout(() => setSuccess(''), 3000);
    },
    onError: (err: Error) => {
      setErrors({ form: err.message });
    },
  });

  const handleEmailChange = (email: string) => {
    setFormData({ ...formData, email });
    
    if (email) {
      const validation = validateEmail(email);
      if (!validation.valid) {
        setErrors({ ...errors, email: validation.message });
      } else {
        setErrors({ ...errors, email: '' });
      }
    } else {
      setErrors({ ...errors, email: '' });
    }
  };

  const handleAddressFill = (data: AddressData) => {
    setFormData((prev) => ({
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

    if (!formData.businessName || formData.businessName.trim().length < 2) {
      setErrors({ businessName: 'Nome da clínica é obrigatório' });
      return;
    }

    const emailValidation = validateEmail(formData.email);
    if (!formData.email || !emailValidation.valid) {
      setErrors({ email: emailValidation.message || 'Email é obrigatório' });
      return;
    }

    updateMutation.mutate(formData);
  };

  if (isLoading) {
    return <div className="p-8 text-center text-gray-500">Carregando...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <Link href="/settings" className="text-blue-600 hover:underline">
          ← Voltar para Configurações
        </Link>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        {isEditing ? (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Nome da Clínica *</label>
              <input
                type="text"
                value={formData.businessName}
                onChange={(e) => setFormData({ ...formData, businessName: e.target.value })}
                className="w-full px-4 py-2 border rounded"
                required
              />
              {errors.businessName && <p className="text-sm text-red-600 mt-1">{errors.businessName}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Nome Fantasia</label>
              <input
                type="text"
                value={formData.tradeName}
                onChange={(e) => setFormData({ ...formData, tradeName: e.target.value })}
                className="w-full px-4 py-2 border rounded"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Email *</label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => handleEmailChange(e.target.value)}
                onBlur={() => {
                  const validation = validateEmail(formData.email);
                  if (!validation.valid) {
                    setErrors({ ...errors, email: validation.message });
                  }
                }}
                className="w-full px-4 py-2 border rounded"
                placeholder="contato@clinica.com.br"
                required
              />
              {errors.email && <p className="text-sm text-red-600 mt-1">{errors.email}</p>}
            </div>

            <div>
              <PhoneInput
                value={formData.phone}
                onChange={(value) => setFormData({ ...formData, phone: value })}
                label="Telefone"
              />
            </div>

            <h3 className="text-lg font-semibold mt-6 mb-4">Endereço</h3>
            
            <div className="grid grid-cols-3 gap-4">
              <div>
                <CepInput
                  value={formData.addressZipCode}
                  onChange={(value) => setFormData({ ...formData, addressZipCode: value })}
                  onAddressFill={handleAddressFill}
                  label="CEP"
                />
                <p className="text-xs text-gray-500 mt-1">Digite para auto-preencher</p>
              </div>
              
              <div className="col-span-2">
                <label className="block text-sm font-medium mb-1">Rua</label>
                <input
                  type="text"
                  value={formData.addressStreet}
                  onChange={(e) => setFormData({ ...formData, addressStreet: e.target.value })}
                  className="w-full px-4 py-2 border rounded"
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Número</label>
                <input
                  type="text"
                  value={formData.addressNumber}
                  onChange={(e) => setFormData({ ...formData, addressNumber: e.target.value })}
                  className="w-full px-4 py-2 border rounded"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Complemento</label>
                <input
                  type="text"
                  value={formData.addressComplement}
                  onChange={(e) => setFormData({ ...formData, addressComplement: e.target.value })}
                  className="w-full px-4 py-2 border rounded"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Bairro</label>
                <input
                  type="text"
                  value={formData.addressDistrict}
                  onChange={(e) => setFormData({ ...formData, addressDistrict: e.target.value })}
                  className="w-full px-4 py-2 border rounded"
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Cidade</label>
                <input
                  type="text"
                  value={formData.addressCity}
                  onChange={(e) => setFormData({ ...formData, addressCity: e.target.value })}
                  className="w-full px-4 py-2 border rounded"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Estado</label>
                <input
                  type="text"
                  value={formData.addressState}
                  onChange={(e) => setFormData({ ...formData, addressState: e.target.value })}
                  className="w-full px-4 py-2 border rounded"
                  maxLength={2}
                  placeholder="SP"
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Timezone</label>
                <select
                  value={formData.timezone}
                  onChange={(e) => setFormData({ ...formData, timezone: e.target.value })}
                  className="w-full px-4 py-2 border rounded"
                >
                  <option value="America/Sao_Paulo">America/São Paulo</option>
                  <option value="America/Manaus">America/Manaus</option>
                  <option value="America/Recife">America/Recife</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Idioma</label>
                <select
                  value={formData.locale}
                  onChange={(e) => setFormData({ ...formData, locale: e.target.value })}
                  className="w-full px-4 py-2 border rounded"
                >
                  <option value="pt-BR">Português (Brasil)</option>
                  <option value="en-US">English (US)</option>
                  <option value="es">Español</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Moeda</label>
                <select
                  value={formData.currency}
                  onChange={(e) => setFormData({ ...formData, currency: e.target.value })}
                  className="w-full px-4 py-2 border rounded"
                >
                  <option value="BRL">BRL - Real</option>
                  <option value="USD">USD - Dólar</option>
                  <option value="EUR">EUR - Euro</option>
                </select>
              </div>
            </div>

            {errors.form && (
              <div className="p-4 bg-red-100 text-red-700 rounded">{errors.form}</div>
            )}
            {success && (
              <div className="p-4 bg-green-100 text-green-700 rounded">{success}</div>
            )}

            <div className="flex gap-2">
              <button
                type="submit"
                disabled={updateMutation.isPending}
                className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
              >
                {updateMutation.isPending ? 'Salvando...' : 'Salvar'}
              </button>
              <button
                type="button"
                onClick={() => {
                  setIsEditing(false);
                  setErrors({});
                }}
                className="border px-4 py-2 rounded hover:bg-gray-50"
              >
                Cancelar
              </button>
            </div>
          </form>
        ) : (
          <div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-500">Nome da Clínica</p>
                <p className="font-medium">{settings?.businessName || '-'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Nome Fantasia</p>
                <p className="font-medium">{settings?.tradeName || '-'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Email</p>
                <p className="font-medium">{settings?.email || '-'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Telefone</p>
                <p className="font-medium">{settings?.phone || '-'}</p>
              </div>
              <div className="col-span-2">
                <p className="text-sm text-gray-500">Endereço</p>
                <p className="font-medium">
                  {settings?.address && (
                    `${settings.address}, ${settings.city} - ${settings.state} ${settings.zipCode}`
                  )}
                  {!settings?.address && '-'}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Timezone</p>
                <p className="font-medium">{settings?.timezone || '-'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Idioma</p>
                <p className="font-medium">{settings?.locale || '-'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Moeda</p>
                <p className="font-medium">{settings?.currency || '-'}</p>
              </div>
            </div>

            <button
              onClick={() => setIsEditing(true)}
              className="mt-4 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
            >
              Editar
            </button>
          </div>
        )}
      </div>
    </div>
  );
}