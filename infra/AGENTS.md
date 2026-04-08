# AGENTS.md - Infraestrutura

## Escopo

Este arquivo define as regras para configurações de infraestrutura.

## Estrutura

```
infra/
├── docker-compose.yml     # serviços auxiliares (PostgreSQL, Redis)
├── Dockerfile             # Dockerfiles das apps (futuro)
└── AGENTS.md              # Este arquivo
```

## Regras

### Docker Compose
- PostgreSQL para banco de dados
- Redis para cache/sessões (futuro)
- Configurações de desenvolvimento local
- Variáveis de ambiente documentadas

### Environment
- .env.example para variáveis necessárias
- Não commitar .env com secrets
- Documentar todas as variáveis

## Relacionamento

- apps/api conecta no PostgreSQL definido aqui
- apps/web não precisa de serviços locais (só frontend)