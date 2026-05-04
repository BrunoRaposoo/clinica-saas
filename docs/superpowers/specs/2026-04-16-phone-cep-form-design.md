# Design: Formatação de Telefone e Busca de CEP

**Data:** 2026-04-16
**Projeto:** Formulário de Novo Paciente
**Status:** Aprovado

---

## 1. Telefone com react-input-mask

### Biblioteca
- **Pacote:** `react-input-mask`
- **Máscara:** `(99) 99999-9999` (celular brasileiro)

### Campos afetados
- `phone` (paciente principal)
- `contacts[].phone` (cada contato)

### Comportamento
- O input mostra a máscara visual enquanto o usuário digita
- Aceita 10 dígitos (fixo) ou 11 dígitos (celular)
- O valor salvo no estado é o valor formatado

---

## 2. Busca Automática de CEP (ViaCEP)

### Endpoint
- **API:** `https://viacep.com.br/ws/{cep}/json/`
- **Sem necessidade de API key**

### Fluxo de Busca
1. Usuário digita o CEP (8 dígitos)
2. Ao perder o foco (`onBlur`), disparamos a busca
3. Se encontrado → preenchemos automaticamente os campos:
   - `addressStreet` = `logradouro`
   - `addressDistrict` = `bairro`
   - `addressCity` = `localidade`
   - `addressState` = `uf`

### Estados de Feedback
- **Buscando:** "Buscando endereço..."
- **Sucesso:** "Endereço encontrado!"
- **Erro (não encontrado):** "CEP não encontrado. Preencha o endereço manualmente."
- **Erro de rede:** "Erro ao buscar CEP. Verifique sua conexão e preencha manualmente."

---

## 3. Tratamento de Erros

- Mensagens claras em português
- **Não bloqueia o cadastro** do paciente
- Permite edição manual após falha
- Feedback visual (loading state no input)

---

## 4. Estrutura de Componentes

```
/components/forms/
  ├── phone-input.tsx    # Componente isolado para telefone
  └── cep-input.tsx  # Componente isolado para CEP com busca
```

### Benefícios
- Componentes reutilizáveis em outros formulários
- Separação de responsabilidades
- Cada componente com seu próprio estado

---

## 5. Arquivo a Modificar

- `apps/web/src/app/(authenticated)/patients/new/page.tsx`