# SPEC 010: Segurança, Compliance e Hardening

## 1. Contexto do Problema

O sistema de gestão de clínicas precisa de reforços de segurança, compliance e hardening para preparação para uso em produção. Com os 8 módulos anteriores implementados (Auth, Pacientes, Agenda, Comunicações, Documentos, Tarefas, Financeiro, Dashboard), há necessidade de:

- Proteger contra abuso e ataques (rate limiting)
- Rastrear eventos sensíveis (auditoria)
- Logs estruturados para debugging
- Health checks para container orchestration
- Métricas básicas de operação
- tratamento padronizado de erros
- Scripts de backup para recuperação

## 2. Objetivo do Módulo

Criar sistema de segurança completo com:
- Rate limiting com Redis
- Logs estruturados JSON
- Health checks completos
- Métricas em memória
- Exception filters
- Scripts de backup

## 3. Escopo da Feature

### Dentro do Escopo:
- [x] Rate limiting com Redis
- [x] Logs estruturados JSON com correlation ID
- [x] Health endpoints (/health, /health/ready, /health/live)
- [x] Verificação de DB no health
- [x] Verificação de Redis no health (se disponível)
- [x] Métricas em memória (requests, latency, errors)
- [x] CORS configurável
- [x] Exception filters
- [x] Logging interceptor
- [x] Scripts de backup

### Fora do Escopo:
- [ ] SIEM avançado
- [ ] SOC automation
- [ ] Criptografia de campo
- [ ] Integração com provedores corporativos (SAML, OIDC)
- [ ] Dashboard de segurança corporativo
- [ ] Gestão de incidentes completa

## 4. Personas e Papéis

| Role | Permissão |
|------|-----------|
| `super_admin` | Todas |
| `org_admin` | Ver health, métricas |
| `professional` | Ver health |
| `receptionist` | Ver health |
| `support` | Ver health, métricas |

## 5. Modelo de Dados

### Entidades Existentes (usar)

Usar tabelas de auditoria existentes:
- PatientAudit
- AppointmentAudit
- CommunicationAudit
- DocumentAudit
- TaskAudit
- ChargeAudit

### Novos endpoints - Health

```
GET /health           → { status: 'ok', timestamp, version }
GET /health/ready    → { status: 'ready', checks: { db: 'up', redis: 'up' } }
GET /health/live     → { status: 'alive' }
GET /metrics        → { requests: N, latency: Nms, errors: N }
```

## 6. Contratos de API

### Types

```typescript
export interface HealthResponse {
  status: 'ok' | 'error';
  timestamp: string;
  version: string;
}

export interface ReadinessCheck {
  db: 'up' | 'down';
  redis: 'up' | 'down' | 'unavailable';
}

export interface Metrics {
  totalRequests: number;
  averageLatencyMs: number;
  errorCount: number;
  uptimeSeconds: number;
}
```

### Rotas API

| Método | Rota | Descrição |
|--------|------|-----------|
| GET | /health | Health básico |
| GET | /health/ready | Readiness |
| GET | /health/live | Liveness |
| GET | /metrics | Métricas |

## 7. Rate Limiting

### Estratégia
- Usar Redis para rate limiting distribuído
-Fallback in-memory se Redis indisponível

### Limites Sugeridos
- Auth login: 5 tentativas / 15 min
- API geral: 100 requests / min
- Criação de dados: 30 requests / min

### Headers de Resposta
```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1234567890
```

## 8. Logs Estruturados

### Formato

```json
{
  "level": "info",
  "message": "Request processed",
  "timestamp": "2026-04-12T10:00:00.000Z",
  "correlationId": "uuid-v4",
  "request": {
    "method": "GET",
    "path": "/api/v1/patients",
    "ip": "192.168.1.1"
  },
  "response": {
    "statusCode": 200,
    "latencyMs": 45
  }
}
```

### Níveis
- error: Erros não tratados
- warn: Tentativas de login falhas, rate limit
- info: Requests, operações importantes
- debug: Detalhes de desenvolvimento

## 9. Health Checks

### /health
Retorna status geral do sistema.

### /health/ready
Verifica:
- Banco de dados (Prisma $connect)
- Redis (se disponível)

### /health/live
Verifica se o processo está ativo.

## 10. Métricas em Memória

### Coletadas
- Total de requests
- Latência média (ms)
- Contagem de erros
- Uptime

## 11. CORS

### Configuração
Via variável de ambiente:
- CORS_ORIGINS=httpl://localhost:3000,httpl://localhost:3001

## 12. Exception Filters

### Padrão de Erro

```typescript
{
  "statusCode": 400,
  "message": "Mensagem de erro",
  "error": "Bad Request",
  "timestamp": "2026-04-12T10:00:00.000Z"
}
```

## 13. Scripts de Backup

### Backup do Banco
```bash
# Backup PostgreSQL
pg_dump -h localhost -U user -d clinica_saas > backup_$(date +%Y%m%d_%H%M%S).sql
```

### Restore
```bash
# Restore PostgreSQL
psql -h localhost -U user -d clinica_saas < backup_YYYYMMDD_HHMMSS.sql
```

### Backup de Arquivos
```bash
# Backup uploads
tar -czf uploads_$(date +%Y%m%d).tar.gz apps/api/uploads/
```

## 14. Estrutura de Pastas

```
apps/api/src/
├── common/
│   ├── guards/
│   │   └── rate-limit.guard.ts
│   ├── interceptors/
│   │   ├── logging.interceptor.ts
│   │   └── metrics.interceptor.ts
│   ├── filters/
│   │   └── http-exception.filter.ts
│   └── health/
│       ├── health.module.ts
│       └── health.controller.ts
└── main.ts (atualizar)
```

## 15. Critérios de Aceite

- [x] Rate limiting com Redis funciona
- [x] Health endpoints respondem
- [x] Logs estruturados gerados
- [x] CORS configurável
- [x] Exception filters funcionam
- [x] Métricas acessíveis
- [x] Scripts de backup documentados
- [x] Build compila

---

**Versão**: 1.0.0
**Data**: 2026-04-12
**Status**: Especificação