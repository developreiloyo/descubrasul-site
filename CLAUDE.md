# DescubraSul — CLAUDE.md

Vitrina digital regional para o Sul de Santa Catarina (Criciúma, Içara, Tubarão e região).
Duas etapas: Etapa 1 = vitrina de negócios locais. Etapa 2 = plataforma de jogos de previsão esportiva (desenvolvimento separado, do zero).

---

## Stack

| Camada        | Tecnologia                                      |
|---------------|-------------------------------------------------|
| Backend       | Django 5 + DRF                                  |
| Tarefas       | Celery + Redis                                  |
| Banco         | PostgreSQL + pgvector                           |
| Frontend      | Next.js 16 (App Router) + TypeScript            |
| Estilo        | Tailwind CSS                                    |
| State         | Zustand + TanStack Query                        |
| Auth          | SimpleJWT (rotação de tokens)                   |
| Pagamentos    | Mercado Pago (recorrência + webhook)            |
| IA textos     | API Claude Haiku 4.5 (somente Plano Pro)        |
| IA busca      | pgvector + MiniLM-L12-v2 (grátis, no VPS)      |
| Imagens       | S3-compatible                                   |
| Deploy        | Docker Compose + EasyPanel v2.30.1 (Hostinger VPS Ubuntu 24.04) |

---

## Estrutura de Apps Django

```
backend/
├── negocios/        # Negocio, Produto, Localizacao, RedesSociais, VideoDestaque
├── usuarios/        # User, perfil do comerciante, roles
├── planos/          # Plano, Assinatura, integração Mercado Pago
├── analytics/       # Clique, MetricaDiaria, InsightGerado
├── ia/              # Gerador de descrição, alt text, insights AARRR
├── categorias/      # Categoria, SubCategoria
└── core/            # Settings, middleware, validators, utils compartilhados
```

---

## Convenções obrigatórias

- Scripts de banco: SEMPRE via `management/commands/` — nunca `/scripts/`
- Variáveis de ambiente: SEMPRE `.env` — nunca hardcoded no código
- Idioma do código: **inglês** (variáveis, funções, modelos, comentários)
- Idioma do conteúdo para o usuário: **português do Brasil**
- Slugs: sempre gerados automaticamente a partir do nome + cidade
- Nunca usar `raw()` queries com input do usuário — sempre ORM Django
- `DEBUG=False` em produção — obrigatório, sem exceção
- Permissões: checar role + plano em cada endpoint protegido

---

## Roles do sistema

| Role         | O que pode fazer                                  |
|--------------|---------------------------------------------------|
| visitante    | Leitura pública apenas                            |
| comerciante  | CRUD dos próprios dados apenas                    |
| admin        | Aprovação, curadoria, relatórios                  |
| superadmin   | Acesso total + configurações de sistema           |

---

## Planos de assinatura

| Plano      | Preço         | Limite de produtos | Features IA/Pro     |
|------------|---------------|--------------------|---------------------|
| Básico     | R$ 79/mês     | Até 10             | Não                 |
| Pro        | R$ 197/mês    | Ilimitado          | Sim                 |
| Produção   | R$ 397/mês    | Ilimitado          | Sim + fotos/vídeos  |
| Fundador   | R$ 599/ano    | Ilimitado          | Sim (primeiros 50)  |

---

## URLs semânticas (padrão obrigatório)

```
/negocios/{cidade}/{categoria}/{slug-negocio}
/cidades/{slug-cidade}
/{categoria}/{slug-cidade}
```

---

## Regras de negócio críticas

- Produto oculto automaticamente após **30 dias** sem confirmação de disponibilidade
- IA ativada somente na **Fase 3 (mês 3+)** — MVP lança sem IA
- Campos SEO gerados automaticamente como fallback se o comerciante não preencher
- Rate limiting de IA por comerciante (Redis): 10 descrições/dia, 50/mês

---

## Comandos frequentes

```bash
# Backend
docker compose up -d
docker compose logs -f backend
python manage.py migrate
python manage.py createsuperuser
python manage.py shell_plus

# Celery
celery -A core worker -l info
celery -A core beat -l info

# Frontend
npm run dev
npm run build
npm run lint
```

---

## Arquivos de configuração relevantes

- `docker-compose.yml` — orquestração de serviços
- `.env` — todas as variáveis (nunca commitar)
- `backend/core/settings/` — base, dev, prod
- `frontend/next.config.ts` — config do Next.js

---

## O que NÃO fazer

- Nunca expor PostgreSQL (5432) ou Redis (6379) externamente no firewall
- Nunca commitar `.env` no git
- Nunca usar `CORS_ALLOW_ALL_ORIGINS = True` em produção
- Nunca deixar o comerciante controlar o prompt da IA — o backend constrói tudo
- Nunca usar nome original do arquivo de upload — sempre renomear com `uuid4()`
