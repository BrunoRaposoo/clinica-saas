# AGENTS.md - Módulo de Documentos

## Escopo

Este é o módulo de gerenciamento de documentos e anexos do sistema Clínica SaaS. Responsável por upload, armazenamento, organização e controle de acesso de arquivos.

## Objetivo

Gerenciar documentos vinculados a pacientes, agendamentos e processos administrativos com:
- Upload de arquivos com validação
- Armazenamento em S3 ou local
- Categorização e tipagem
- Controle de acesso por organização
- URLs seguras para download
- Auditoria completa

## Estrutura do Repositório

```
apps/api/src/modules/documents/
├── documents.module.ts       # Módulo principal
├── documents.service.ts     # Lógica de negócio
├── documents.controller.ts # Controlador REST
├── dto/
│   └── document.dto.ts     # DTOs de validação
└── storage/
    ├── storage.provider.interface.ts
    ├── s3-storage.provider.ts
    └── local-storage.provider.ts
```

## Responsabilidades

### O que fazer
- Upload de arquivos (imagens, PDF)
- Listagem com paginação e filtros
- Download com URL temporal
- Vinculação a paciente/agendamento
- Categorização de documentos
- Auditoria de operações
- Isolamento por organization_id

### O que não fazer
- Processamento de OCR (futuro)
- Assinatura eletrônica (futuro)
- Versionamento complexo
- Prontuário clínico

## Dependencies Permitidas

- @nestjs/common
- @nestjs/core
- @nestjs/config
- @nestjs/swagger
- @clinica-saas/contracts
- @prisma/client
- fs, path (storage local)
- aws-sdk (storage S3)

## Padrões de Código

### Módulos
- Service: lógica de negócio
- Controller: rotas REST
- DTOs: validação com class-validator
- Providers: abstração de storage

### Naming
- Arquivos: camelCase (documents.service.ts)
- Classes: PascalCase (DocumentsService)
- DTOs: PascalCase com sufixo Dto (CreateDocumentDto)

## Validações

### Upload
- Tamanho máximo: 10MB
- Tipos: image/jpeg, image/png, image/webp, application/pdf

### Acesso
- Isolamento por organization_id
- Owner pode excluir
- URL expira em 15 minutos

## Relacionamento

### Backend (apps/api)
- Expõe API REST em /api/v1/documents
- Integra com Prisma
- Autenticação JWT

### Frontend (apps/web)
- Consome API REST
- UI em /documents/*

### Storage
- Local: ./storage
- S3: AWS S3 ou compatível

## ROTAS API

| Método | Rota | Descrição |
|--------|------|-----------|
| GET | /documents | Listar |
| GET | /documents/:id | Detalhar |
| GET | /documents/:id/download | Download |
| POST | /documents | Upload |
| PATCH | /documents/:id | Atualizar |
| DELETE | /documents/:id | Excluir |
| GET | /documents/patient/:patientId | Por paciente |
| GET | /documents/appointment/:appointmentId | Por agendamento |

---

## Contato

Para dúvidas, consulte a spec em `docs/specs/005-documents.md`