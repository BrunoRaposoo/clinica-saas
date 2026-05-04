# SPEC 005: Documentos e Anexos

## 1. Contexto do Problema

O sistema de gestão de clínicas precisa gerenciar documentos e arquivos vinculados a pacientes, agendamentos e processos administrativos. Com as fases anteriores implementadas (Auth, Pacientes, Agenda, Comunicações), há necessidade de:

- Anexar documentos a pacientes (RG, CPF, comprovante de residência, exames, etc.)
- Anexar documentos a agendamentos (receitas, laudos, atestados)
- Gerenciar documentos administrativos (contratos, notas fiscais, documentos fiscais)
- Auditoria completa de operações com documentos
- Controle de acesso seguro por organização

O módulo atual não contempla upload, armazenamento ou gerenciamento de documentos.

## 2. Objetivo do Módulo

Criar sistema de gestão de documentos com:
- Upload de arquivos com validação de tipo e tamanho
- Armazenamento compatível com S3
- Vinculação a pacientes e agendamentos
- Categorização e tipagem de documentos
- Controle de acesso por organização
- URLs seguras para download
- Auditoria completa (upload, download, exclusão)
- Base para futura assinatura eletrônica e OCR

## 3. Escopo da Feature

### Dentro do Escopo:
- [x] Upload de arquivos (imagens, PDF, documentos)
- [x] Listagem paginada com filtros
- [x] Visualização de detalhes do documento
- [x] Download seguro com URL temporal
- [x] Vinculação a paciente
- [x] Vinculação a agendamento
- [x] Categorias de documentos (identidade, exames, laudos, receitas, administrativos)
- [x] Controle de acesso por organization_id
- [x] Auditoria de upload, edição, exclusão e download
- [x] Contratos compartilhados backend/frontend
- [ ] Assinatura eletrônica (futuro)
- [ ] OCR automático (futuro)

### Fora do Escopo:
- [ ] OCR automático
- [ ] Assinatura eletrônica real
- [ ] Processamento de documentos com IA
- [ ] Prontuário clínico completo
- [ ] Versionamento complexo
- [ ] Fluxo de aprovação avançado

## 4. Personas e Papéis

### Papéis que podem gerenciar documentos:
| Role | Permissão |
|------|-----------|
| `super_admin` | Todas |
| `org_admin` | CRUD completo, download |
| `professional` | Upload, download próprios |
| `receptionist` | Upload, download |
| `support` | Apenas leitura |

## 5. Modelo de Dados

### Entidades do Prisma

```
Document
├── id (UUID, PK)
├── organizationId (UUID, FK)
├── patientId (UUID, FK, nullable)
├── appointmentId (UUID, FK, nullable)
├── category (enum: identity, exams, prescriptions, reports, administrative, other)
├── type (string)
├── name (string)
├── description (string, nullable)
├── fileName (string)
├── filePath (string)
├── fileSize (integer)
├── mimeType (string)
├── storageProvider (string: s3, local)
├── storageKey (string)
├── isPublic (boolean, default: false)
├── expiresAt (datetime, nullable)
├── uploadedBy (UUID, FK)
├── createdAt (datetime)
└── updatedAt (datetime)

DocumentAudit
├── id (UUID, PK)
├── documentId (UUID, FK)
├── action (enum: create, read, update, delete, download)
├── changes (json, nullable)
├── performedBy (UUID, FK)
├── performedAt (datetime)
```

### Relações
- Document 1:N DocumentAudit
- Organization 1:N Document
- Patient 1:N Document
- Appointment 1:N Document
- User uploadedBy

### Índices
- patientId (busca por paciente)
- appointmentId (busca por agendamento)
- organizationId + category (filtro composto)
- createdAt (ordenação)
- uploadedBy (busca por usuário)

## 6. Contratos de API

### Request/Response Types

```typescript
// List documents query
interface ListDocumentsQueryDto {
  page?: number;
  limit?: number;
  patientId?: string;
  appointmentId?: string;
  category?: string;
  type?: string;
  startDate?: string;
  endDate?: string;
  search?: string;
}

interface ListDocumentsResponse {
  items: Document[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// Document detail
interface Document {
  id: string;
  organizationId: string;
  patientId?: string;
  appointmentId?: string;
  category: string;
  type: string;
  name: string;
  description?: string;
  fileName: string;
  fileSize: number;
  mimeType: string;
  isPublic: boolean;
  expiresAt?: string;
  uploadedBy: { id: string; name: string };
  createdAt: string;
  updatedAt: string;
}

// Create document
interface CreateDocumentDto {
  patientId?: string;
  appointmentId?: string;
  category: string;
  type: string;
  name: string;
  description?: string;
  file: Binary; // Upload
}

// Update document
interface UpdateDocumentDto {
  category?: string;
  type?: string;
  name?: string;
  description?: string;
  isPublic?: boolean;
}
```

### Rotas API

| Método | Rota | Descrição | Auth |
|--------|------|-----------|------|
| GET | /documents | Listar documentos | Jwt |
| GET | /documents/:id | Detalhar documento | Jwt |
| GET | /documents/:id/download | Download seguro | Jwt |
| POST | /documents | Upload documento | Jwt |
| PATCH | /documents/:id | Atualizar metadados | Jwt |
| DELETE | /documents/:id | Excluir documento | Jwt |
| GET | /documents/patient/:patientId | Documentos do paciente | Jwt |
| GET | /documents/appointment/:appointmentId | Documentos do agendamento | Jwt |

## 7. Arquitetura de Storage

### Abstração de Provider

```typescript
interface StorageProvider {
  upload(file: Buffer, key: string, options: StorageOptions): Promise<StoredFile>;
  getSignedUrl(key: string, expiresIn: number): Promise<string>;
  delete(key: string): Promise<void>;
  exists(key: string): Promise<boolean>;
}

interface StoredFile {
  key: string;
  url: string;
  size: number;
  contentType: string;
}
```

### Providers Implementados
- **S3StorageProvider**: AWS S3 / compatível (MinIO, DigitalOcean Spaces)
- **LocalStorageProvider**: Desenvolvimento local

### Estrutura de chaves S3
```
{organizationId}/documents/{year}/{month}/{uuid}.{ext}
```

## 8. Validações e Regras de Negócio

### Upload
- Tamanho máximo: 10MB por arquivo
- Tipos permitidos: image/jpeg, image/png, image/webp, application/pdf
- Nome do arquivo: sanitizar caracteres especiais
- Gerar UUID único para evitar collision

### Acesso
- Isolamento por organization_id em todas as operações
- Apenas owner pode excluir
- Download requer autenticação JWT
- URL de download expira em 15 minutos

### Auditoria
- Registrar: create, read, update, delete, download
- Armazenar IP do client
- Timestamp com timezone

## 9. Fluxos Principais

### Fluxo 1: Upload de documento
```
1. Usuário autentica (JWT)
2. Seleciona arquivo via formulário
3. Escolhe tipo (paciente/agendamento)
4. Preenche metadados
5. Backend valida arquivo
6. Upload para storage (S3/local)
7. Salva metadados no banco
8. Cria auditoria
9. Retorna documento criado
```

### Fluxo 2: Download de documento
```
1. Usuário autentica (JWT)
2. Solicita download
3. Backend verifica acesso
4. Gera URL signed (15min)
5. Redireciona para URL
6. Auditoria registrada
```

### Fluxo 3: Listagem com filtros
```
1. Usuário autentica (JWT)
2. Aplica filtros (paciente, tipo, data)
3. Backend retorna paginado
4. Frontend exibe em tabela
```

## 10. Frontend - Telas

### Pages

| Rota | Descrição |
|------|----------|
| /documents | Listagem com filtros |
| /documents/upload | Formulário de upload |
| /documents/[id] | Detalhes do documento |
| /patients/[id]/documents | Documentos do paciente |
| /appointments/[id]/documents | Documentos do agendamento |

### Componentes
- `<DocumentUpload />` - Componente de upload com drag & drop
- `<DocumentList />` - Tabela com filtros
- `<DocumentCard />` - Card para visualização rápida
- `<DocumentFilters />` - Filtros de busca

## 11. Estrutura de Pastas

### Backend
```
apps/api/src/modules/
├── documents/
│   ├── documents.module.ts
│   ├── documents.service.ts
│   ├── documents.controller.ts
│   ├── dto/
│   │   ├── create-document.dto.ts
│   │   ├── update-document.dto.ts
│   │   └── list-documents.dto.ts
│   └── storage/
│       ├── storage.provider.interface.ts
│       ├── s3-storage.provider.ts
│       └── local-storage.provider.ts
```

### Frontend
```
apps/web/src/
├── lib/api/
│   └── documents.ts
├── app/(authenticated)/documents/
│   ├── page.tsx (list)
│   ├── upload/
│   │   └── page.tsx
│   └── [id]/
│       └── page.tsx
```

## 12. Critérios de Aceite

### Funcional
- [ ] Upload de arquivo funciona com feedback de progresso
- [ ] Arquivos são armazenados em S3 ou local
- [ ] Listagem retorna paginada com filtros funcionando
- [ ] Download gera URL temporária válida
- [ ] Exclusão remove arquivo e registra auditoria
- [ ] Documentos vinculados corretamente a paciente
- [ ] Documentos vinculados corretamente a agendamento

### Não Funcional
- [ ] Tempo de resposta < 200ms para listagem
- [ ] Upload suporta até 10MB
- [ ] Isolamento por organização funciona
- [ ] Auditoria registra todas operações
- [ ] Build compila sem erros

### Segurança
- [ ] URLs de download expiram
- [ ] Isolation por organization_id
- [ ] Tipos de arquivo validados
- [ ] Auditoria completa

## 13. Plano de Implementação

### Etapa 1: Database e Models (1d)
- Adicionar entidades ao Prisma schema
- Executar prisma db push
- Gerar tipos em contracts

### Etapa 2: Storage Providers (1d)
- Criar interface StorageProvider
- Implementar S3StorageProvider
- Implementar LocalStorageProvider
- Criar factory

### Etapa 3: Backend Documents (2d)
- Criar DocumentsModule
- Implementar CRUD completo
- Implementar upload/download
- Adicionar auditoria

### Etapa 4: Frontend (2d)
- Criar API client
- Criar página de listagem
- Criar página de upload
- Criar detalhes

### Etapa 5: Integração (1d)
- Testar fluxo completo
- Corrigir issues
- Build e validação

## 14. Arquivos a Criar/Alterar

### Novos
- `docs/specs/005-documents.md` (spec)
- `apps/api/src/modules/documents/` (módulo completo)
- `apps/api/src/modules/documents/storage/` (storage providers)
- `apps/web/src/app/(authenticated)/documents/` (páginas)
- `apps/web/src/lib/api/documents.ts` (API client)
- `packages/contracts/src/types/document.ts` (tipos)
- `apps/api/src/modules/documents/AGENTS.md` (documentação)

### Alterar
- `apps/api/prisma/schema.prisma` (entidades)
- `apps/api/src/app.module.ts` (import modules)
- `packages/contracts/src/types/index.ts` (exports)
- `apps/web/src/lib/api/index.ts` (exports)

---

**Versão**: 1.0.1
**Data**: 2026-04-08
**Status**: Implementado