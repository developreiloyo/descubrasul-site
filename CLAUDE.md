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
├── negocios/        # Negocio, Produto, FotoProduto, Localizacao, RedesSociais, VideoDestaque
├── usuarios/        # User customizado (email auth), roles
├── planos/          # Plano, Assinatura, integração Mercado Pago  ← PENDENTE
├── analytics/       # Clique (eventos crus), MetricaDiaria (agregados diários)
├── ia/              # Gerador de descrição, alt text, insights AARRR  ← PENDENTE
├── categorias/      # Categoria com slug, ícone, schema_tipo
└── core/            # Settings, middleware, validators, utils compartilhados
```

---

## O que já está implementado

### Backend

#### usuarios/
- `User` customizado com email como USERNAME_FIELD
- Roles: `comerciante` | `admin` | `superadmin`
- Propriedades: `is_comerciante`, `is_admin_or_above`, `plano` (atalho para negocio.plano)
- `UserManager` com `create_user` e `create_superuser`
- Migration: `0001_initial`

#### categorias/
- `Categoria`: slug auto-gerado, nome, icone, schema_tipo, ativo, ordem
- Migration: `0001_initial`

#### negocios/
- `Negocio`: todos os campos (nome, descricao, historia, logo, categoria, cidade, bairro, whatsapp, website, plano, status, verificado, slug auto, seo_title/description, og_image, alt_logo, palavras_chave, espaco_especial JSONField, horario, dias_funcionamento, media_nota)
- `Produto`: nome, foto, descricao, descricao_longa, categoria, preco, disponivel, ordem, confirmado_em, slug auto, alt_foto, fotos (ForeignKey)
- `FotoProduto`: máximo 3 por produto, validado no serializer
- `Localizacao`: endereco, lat/lng, direccao_fmt auto-gerada, cidade, estado, cep, bairro, area_servico
- `RedesSociais`: instagram, tiktok, facebook, youtube, x
- `VideoDestaque`: url_original, plataforma, oembed_html (cache)
- Signals: normalizar_cidade, gerar_slug_negocio, gerar_slug_produto, preencher_direccao_fmt
- Permissões: `IsDonoDoNegocio`, `IsPlanoPro`, `IsPlanoBasicoOuSuperior`, `PodicionarProduto`
- Validações: `validar_imagem` (magic bytes, 5MB max, jpg/png/webp)
- Migration: até `0006_unaccent_normalizar_cidade`

#### analytics/
- `Clique`: tipo (view, whatsapp, produto, share, instagram, tiktok, facebook, youtube, maps), origem (google, instagram, facebook, whatsapp, direto, outro), negocio, produto FK opcional
- `MetricaDiaria`: agregados pré-computados por negócio por data — views, whatsapp, shares, origens, redes sociais, taxa_conversao
- Tasks Celery: `agregar_metricas_diarias` (00:30h diário), `purgar_cliques_antigos` (03:00h domingos)
- Management command: `setup_celery_beat` — seed dos agendamentos no banco
- Migration: `0001_initial`

#### negocios/ — tasks
- Task Celery: `ocultar_produtos_vencidos` (02:00h diário) — oculta produtos sem confirmação há +30 dias

#### core/celery.py
- `app.conf.beat_schedule` configurado com as 3 tasks e horários

#### planos/ e ia/
- Apps criados mas **completamente vazios** — apenas arquivos stub gerados pelo Django

### Backend — Endpoints da API

```
# Auth (SimpleJWT)
POST   /api/auth/token/              # Login (retorna access + refresh)
POST   /api/auth/token/refresh/      # Renovar access token
POST   /api/auth/token/blacklist/    # Logout (invalida refresh token)

# Negócios — público
GET    /api/negocios/                # Lista (filtros: cidade, categoria, destaque, search)
GET    /api/negocios/{slug}/         # Detalhe
GET    /api/negocios/{slug}/produtos/ # Produtos do negócio (limitado por plano no público)
GET    /api/negocios/produtos/destaque/ # Um produto por negócio, priorizados por plano

# Painel do comerciante (requer JWT)
GET/PUT/PATCH  /api/negocios/painel/meu-negocio/               # Editar próprio negócio
GET/POST       /api/negocios/painel/produtos/                  # CRUD produtos
GET/PUT/PATCH/DELETE /api/negocios/painel/produtos/{id}/
POST           /api/negocios/painel/produtos/{id}/confirmar_disponibilidade/
GET            /api/negocios/painel/produtos/status_plano/     # Info de limite do plano
POST           /api/negocios/painel/produtos/{id}/destacar/    # Move para posição 0
POST           /api/negocios/painel/produtos/{id}/fotos/       # Adicionar foto (max 3)
DELETE         /api/negocios/painel/produtos/{id}/fotos/{foto_id}/ # Remover foto

# Analytics
POST  /api/analytics/cliques/       # Registrar evento (rate limit 60/min por IP)
GET   /api/analytics/metricas/      # Métricas 30 dias (requer IsPlanoPro)

# Outros (stubs ativos mas vazios)
/api/usuarios/
/api/planos/
/api/ia/
/api/categorias/
```

### Frontend — Rotas implementadas

```
/                                           # Home: HeroSearch + NegociosDestaque
/negocios/{cidade}/{categoria}/{slug}       # Página do negócio (SSR + JSON-LD + SEO)
/cidades/{slug}                             # Página de cidade
/{categoria}                               # Listagem por categoria
/{categoria}/{cidade}                      # Categoria + cidade
/busca                                     # Busca geral
/marketplace                               # Marketplace
/food                                      # Página de food
/p/{slug}                                  # URL curta (redirect)
/planos                                    # Página de planos
/para-empresas                             # Landing para comerciantes
/painel/login                              # Login comerciante
/painel/cadastro                           # Cadastro
/painel/esqueci-senha                      # Recuperação de senha
/painel/nova-senha                         # Redefinir senha
/painel/                                   # Dashboard do comerciante
/painel/meu-negocio                        # Editar negócio + EspacoEspecial (Pro+)
/painel/produtos                           # Gerenciar produtos
/painel/metricas                           # Métricas AARRR (Pro+)

# API Routes (Next.js proxy/BFF)
/api/auth/login
/api/auth/logout
/api/auth/me
/api/auth/password-reset
/api/auth/password-reset/confirm
/api/proxy/[...path]                       # Proxy transparente para o Django
```

### Frontend — Componentes principais

```
components/
├── layout/         Navbar, Footer
├── home/           HeroSearch, NegociosDestaque
├── negocios/       BusinessHero, BusinessSidebar, BusinessActions, PaginaNegocioClient
│                   EspacoEspecial (Pro+), HistoriaSection, OfrecemosSection
│                   ProdutosSection, ServicosSection, UbicacaoSection
│                   PhotoGallery, ProductoDestaque, SimilarBusinesses
│                   BotaoWhatsApp, TrackerView (analytics)
├── seo/            JsonLd (Schema.org), GoogleAnalytics
├── ui/             button, carousel, AdSlot
└── blocks/         gallery4
```

### Frontend — Lib e tipos

- `lib/api.ts` — Axios com interceptor JWT (401 → redirect /painel/login)
- `lib/fetchers.ts` — Fetchers SSR: `getNegocio`, `getProdutosDoNegocio`, `getCategorias`, `getNegociosDestaque`, `getProdutosDestaque`, `getNegocios`
- `lib/utils.ts` — Utilitários gerais
- `hooks/useTracking.ts` — Hook para registrar cliques nos endpoints de analytics
- `types/index.ts` — Interfaces TypeScript: `Negocio`, `Produto`, `FotoProduto`, `RedesSociais`, `Localizacao`, `Categoria`, `VideoDestaque`, `EspacoEspecial`, `MetricaDiaria`

---

## O que NÃO está implementado ainda

| Feature                            | App responsável | Observação                                         |
|------------------------------------|-----------------|---------------------------------------------------|
| Assinaturas + cobrança recorrente  | `planos/`       | Mercado Pago Subscriptions                        |
| Promoções especiais + pagamento MP | `negocios/` ou novo app `promocoes/` | Compra única via MP Preference      |
| Geração de texto com IA            | `ia/`           | Claude Haiku 4.5 — só plano Pro+                  |
| Reset de senha por e-mail          | `usuarios/`     | Backend sem envio de e-mail implementado          |
| Celery task agregar_metricas_diarias | `analytics/`  | Task mencionada no model mas não criada           |
| pgvector busca semântica           | `core/`         | MiniLM-L12-v2 pendente de setup                  |
| Geocodificação automática Maps     | `negocios/`     | Campo lat/lng existe, geocoding não implementado  |

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
- Uploads: nunca usar nome original — sempre renomear com `uuid4()`
- Imagens: validar com `magic bytes` (python-magic), não apenas extensão

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

| Plano      | Preço         | Limite de produtos (público) | Limite (painel) | Features IA/Pro     |
|------------|---------------|------------------------------|-----------------|---------------------|
| Gratuito   | R$ 0          | 10                           | 5               | Não                 |
| Básico     | R$ 79/mês     | 10                           | 20              | Não                 |
| Pro        | R$ 197/mês    | Ilimitado                    | Ilimitado       | Sim                 |
| Produção   | R$ 397/mês    | Ilimitado                    | Ilimitado       | Sim + fotos/vídeos  |
| Fundador   | R$ 599/ano    | Ilimitado                    | Ilimitado       | Sim (primeiros 50)  |

> Nota: `LIMITES_PRODUTOS_PUBLICO` no `views.py` limita a exibição pública a 10 para gratuito e básico.
> `LIMITES_PRODUTOS` no `models.py` é o limite de cadastro no painel: gratuito=5, basico=20, pro/producao/fundador=None.

---

## Espaço Especial (Pro+)

Campo `espaco_especial` (JSONField) no modelo `Negocio`, exibido na página pública pelo componente `EspacoEspecial.tsx`.
Tipos válidos: `"texto"` | `"oferta"` | `"cupom"` | `"banner"` | `"video"`
Configurável pelo comerciante no painel `/painel/meu-negocio` (apenas planos Pro, Produção, Fundador).
**Importante:** é apenas vitrine — não tem fluxo de compra. Para compra, usar o sistema de Promoções Especiais (a implementar).

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
- Limite público de produtos (gratuito/básico): 10 — não expõe todos os produtos no HTML

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

---

## ⚠️ PIEDRA ANGULAR — Proteção SEO do domínio

O SEO é o ativo principal do DescubraSul. Uma penalização do Google
afeta o domínio INTEIRO, não apenas uma página. Regras invioláveis:

1. **Nunca** permitir keyword stuffing: toda descrição passa por
   `core.validators_seo.validar_texto_seo_completo()` antes de salvar.
2. **Nunca** imprimir `palavras_chave` como texto visível na página —
   apenas em meta tags e busca interna.
3. **Nunca** criar páginas sem conteúdo real (doorway pages). Toda
   página pública deve ser o destino final útil para o visitante.
4. **Nunca** permitir descrições duplicadas entre negócios diferentes.
5. Todo novo campo de texto editável pelo comerciante DEVE ter
   validação SEO no serializer correspondente.
6. Schema JSON-LD obrigatório em toda página pública nova.
7. `seo_title` máx 60 chars, `seo_description` máx 160 chars — sempre.

Qualquer feature nova que envolva conteúdo editável pelo comerciante
deve ser revisada contra estas regras ANTES de ir para produção.
