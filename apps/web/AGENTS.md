# AGENTS.md - Frontend (Next.js)

## Objetivo

Interface web para o sistema de gestão de clínicas.

## Responsabilidades

- Renderizar páginas e componentes de UI
- Gerenciar estado de autenticação
- Consumir API REST do backend
- Proteção de rotas (autenticação/autorização)
- Tratamento de erros e estados de carregamento

## Estrutura de Pastas

```
apps/web/src/
├── app/                     # Next.js App Router
│   ├── (authenticated)/     # Rotas protegidas
│   │   ├── layout.tsx      # Layout com sidebar/header
│   │   └── dashboard/
│   ├── (public)/           # Rotas públicas
│   │   └── login/
│   ├── layout.tsx          # Root layout
│   └── page.tsx            # Home (redirect)
├── components/              # Componentes React
│   ├── auth/               # Componentes de autenticação
│   ├── layout/             # Componentes de layout
│   ├── role-guard.tsx     # Componente de controle de acesso
│   └── ui/                 # Componentes base (@clinica-saas/ui)
├── lib/                    # Utilitários
│   ├── api.ts              # Cliente HTTP
│   ├── auth.ts             # Lógica de auth
│   └── utils.ts            # Utilitários
├── hooks/                  # Custom hooks
│   └── use-role.ts        # Hook de controle de acesso por role
├── providers/              # React Context providers
│   └── session-provider.tsx
└── types/                  # Types específicos do frontend
```

## Regras de Código

### Páginas
- Usar App Router (Next.js 14+)
- Group routes com parênteses: `(public)`, `(authenticated)`
- Layouts aninhados para estrutura de navegação
- Server Components por padrão, Client Components onde necessário

### Autenticação
- SessionProvider para gerenciar estado de auth
- Tokens em memória (access) + httpOnly cookie (refresh)
- Middleware para proteção de rotas
- Redirect para `/login` se não autenticado
- **Controle de acesso via useRole() hook** - Obrigatório em todas as páginas

### Componentes
- UI base em `@clinica-saas/ui`
- Componentes de negócio em `components/`
- Naming: PascalCase (Button.tsx, LoginForm.tsx)
- Props com tipagem TypeScript

### Estilo
- Tailwind CSS para styling
- shadcn/ui para componentes base
- Variáveis CSS para temas (se necessário)
- Responsive design (mobile-first)

## Dependencies Permitidas

- next, react, react-dom
- @clinica-saas/contracts
- @clinica-saas/shared
- @clinica-saas/ui
- @tanstack/react-query (se necessário para data fetching)
- jose (JWT decode client-side)

## Fora de Escopo

- API endpoints (apps/api)
- Banco de dados
- Filas/jobs

## Relacionamento

- Consome API em `http://localhost:3001/api/v1`
- Usa tipos de `@clinica-saas/contracts`
- Components visuais de `@clinica-saas/ui`