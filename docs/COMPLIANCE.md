# DescubraSul — Compliance ISO 27001:2022 e ISO 22301:2019

Referência de controles mapeados e análise de continuidade.
Os checklists operacionais e a regra de ouro ficam no [CLAUDE.md](../CLAUDE.md).

---

## ⚠️ Gaps de segurança ativos — não perder de vista

| Gap | Controle | Prioridade | Mitigação recomendada |
|-----|----------|-----------|----------------------|
| Logging estruturado ausente | ISO 27001 — 8.15 | 🟡 Média | Implementar `structlog` com saída JSON (userId, error, timestamp). Sem isso, incidentes não são rastreáveis por log. |
| Monitoramento de erros ausente | ISO 27001 — 8.16 | 🟡 Média | Instalar Sentry (frontend + backend). Hoje não há alerta automático de erro 500 em produção. |
| Backup PostgreSQL não automatizado | ISO 22301 — RPO | 🔴 Alta | Configurar backup diário via cron no VPS + teste de restore. Sem backup testado, RPO real é indefinido. |

> Estes itens estão no backlog de segurança mas sem data comprometida. Revisar antes de qualquer deploy em produção de feature crítica.

---

## ISO 27001:2022 — Mapeamento de controles ativos

| Controle ISO 27001 | O que o projeto faz | Onde está implementado |
|--------------------|---------------------|------------------------|
| 5.15 — Controle de acesso | Roles: visitante / comerciante / admin / superadmin | `usuarios/models.py`, `permissions.py` |
| 5.17 — Informações de autenticação | Argon2 primário + PBKDF2 fallback; JWT access 30min + refresh 7d com blacklist | `settings/base.py` PASSWORD_HASHERS, SIMPLE_JWT |
| 8.5 — Autenticação segura | MFA não implementado; JWT com rotação e blacklist | `core/settings/base.py` SIMPLE_JWT |
| 8.6 — Gestão de capacidade | `CONN_MAX_AGE=60`, N+1 eliminados, cache Redis em endpoints públicos | `settings/base.py`, `negocios/views.py` |
| 8.8 — Vulnerabilidades técnicas | Rate limiting por IP/usuário/endpoint; validação magic bytes em uploads | `core/throttles.py`, `negocios/validators.py` |
| 8.9 — Gestão de configuração | Variáveis via `.env`; `DEBUG=False` obrigatório em produção; `CONN_MAX_AGE`, `CELERY_RESULT_BACKEND` via env | `settings/base.py`, `.env` |
| 8.12 — Prevenção de vazamento de dados | Uploads renomeados com `uuid4()`; sem `id` sequencial em URLs públicas; CORS restrito | `models.py` gerar_caminho_seguro |
| 8.15 — Logging | **GAP ATIVO** — logging estruturado (`structlog`) pendente | Backlog: prioridade 🟡 Média |
| 8.16 — Monitoramento | **GAP ATIVO** — Sentry pendente; sem alertas automáticos de erro 500 | Backlog: prioridade 🟡 Média |
| 8.24 — Criptografia | HTTPS obrigatório via Traefik + Let's Encrypt; HSTS 1 ano; cookies Secure | `settings/prod.py`, `docker-compose.prod.yml` |
| 8.25 — Ciclo de vida de desenvolvimento seguro | Specs antes de implementar (OpenSpec); revisão via `code-reviewer` e `security` agents | `.claude/agents/` |
| 8.28 — Codificação segura | ORM sempre (proibido `raw()` com input); validação no serializer; sanitização XSS | Convenções obrigatórias CLAUDE.md |
| 8.29 — Testes de segurança | `qa-verifier` executa testes de isolamento entre usuários antes de aprovar qualquer endpoint | `.claude/agents/qa-verifier.md` |
| 8.32 — Gestão de mudanças | Commits atômicos por área; specs aprovadas antes de implementar; never `--no-verify` | Convenções de commits |

---

## ISO 22301:2019 — Objetivos de continuidade (RTO/RPO)

| Serviço | RTO (tempo máximo de recuperação) | RPO (perda máxima de dados aceitável) |
|---------|-----------------------------------|---------------------------------------|
| API pública (negocios, categorias) | 15 minutos | N/A — dados em PostgreSQL com WAL |
| Painel do comerciante | 30 minutos | 0 — todas as escritas são síncronas em PG |
| Celery tasks (métricas, geocodificação) | 2 horas | Tasks com `max_retries=3` — reexecutáveis |
| Redis (cache + rate limiting + broker) | 5 minutos (restart automático via Docker) | Cache: 0 (repopula sozinho). Broker: tasks na fila são perdidas se Redis cair sem AOF |
| PostgreSQL | 1 hora | Depende do último backup — configurar backup diário |

---

## Análise de Pontos Únicos de Falha (SPOF)

| Componente | SPOF? | Mitigação atual | Mitigação recomendada |
|------------|-------|-----------------|----------------------|
| Redis | **SIM** | `restart: unless-stopped` no Docker | AOF habilitado + `IGNORE_EXCEPTIONS: True` no cache |
| PostgreSQL | **SIM** | Volume Docker persistente | Backup diário automatizado via cron |
| VPS Hostinger | **SIM** | Nenhuma | Snapshot semanal do VPS |
| Traefik | **SIM** | `restart: unless-stopped` | Healthcheck no container |

---

## Padrão: Degradação com graça

Qualquer componente externo (Redis, API Maps, API Mercado Pago, API Anthropic) deve falhar
silenciosamente sem derrubar a API principal:

```python
from django.core.cache import cache

try:
    resultado = cache.get(chave)
except Exception:
    resultado = None  # cache miss silencioso — nunca propagar exceção de cache

# Para APIs externas — sempre com timeout e fallback
try:
    resposta = requests.get(url, timeout=5)
except requests.RequestException:
    return None  # fallback: operação continua sem o dado externo
```
