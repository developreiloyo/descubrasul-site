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

### Frontend — Painel do comerciante

#### Route group `src/app/painel/(panel)/`
- `layout.tsx` — injeta `MerchantNavbar` + `MobileBottomNav`, bg `#f8f9ff`, max-w 1280px
- `meu-negocio/page.tsx` — grid 8+4 col; fetch GET + PATCH `/api/proxy/negocios/painel/meu-negocio/`
  - Payload PATCH: `{ ...campos, historia, localizacao: {cep, direccao, bairro, cidade, estado}, redes_sociais: {instagram_url, tiktok_url, facebook_url, youtube_url, x_url}, espaco_especial: null | {tipo, ...} }`
- `produtos/page.tsx` — CRUD de produtos com upload de foto (max 3/produto)
- `metricas/page.tsx` — Dashboard AARRR (bloqueado para não-Pro)

#### `MerchantNavbar`
- Logo: `<Image src="/logo.png">` — mesmo logo do Navbar público
- Links: `/painel/meu-negocio`, `/painel/produtos`, `/painel/metricas`

#### `QRCodeCard` (`components/ui/QRCodeCard.tsx`)
- Lib: `react-qr-code` (NÃO `qrcode.react`)
- Gera URL: `/negocios/{cidade}/{categoriaSlug}/{slug}`
- Download disponível em PNG e SVG

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
GET   /api/analytics/dashboard/     # Dashboard completo 30 dias (gratuito recebe preview bloqueado)

# Usuarios
POST  /api/usuarios/cadastro/               # Cadastro comerciante (User + Negocio em transação)
GET   /api/usuarios/me/                     # Dados do usuário autenticado
POST  /api/usuarios/password-reset/         # Solicitar reset de senha (rate limit 5/h por IP)
POST  /api/usuarios/password-reset/confirm/ # Confirmar reset com uid + token

# Stubs vazios
/api/planos/
/api/ia/
/api/categorias/
```

> `NegocioPainelSerializer` retorna `categoria` como objeto aninhado `{slug, nome, icone}` — necessário para o QR Code no painel.

### Frontend — Rotas implementadas

```
/                                           # Home: HeroSearch + NegociosDestaque
/negocios/{cidade}/{categoria}/{slug}       # Minisite do negócio (SSR + JSON-LD + SEO + mobile-first)
/cidades/{slug}                             # Página de cidade
/{categoria}                               # Listagem por categoria
/{categoria}/{cidade}                      # Categoria + cidade
/busca                                     # Busca geral
/marketplace                               # Marketplace
/food                                      # Página de food
/p/{slug}                                  # URL curta (redirect)
/planos                                    # Página de planos
/para-empresas                             # Landing para comerciantes
/painel/login                              # Login comerciante (fora do route group)
/painel/cadastro                           # Cadastro (fora do route group)
/painel/esqueci-senha                      # Recuperação de senha (fora do route group)
/painel/nova-senha                         # Redefinir senha (fora do route group)
/painel/                                   # Dashboard do comerciante ← route group (panel)
/painel/meu-negocio                        # Editar negócio + EspacoEspecial (Pro+) ← route group (panel)
/painel/produtos                           # Gerenciar produtos ← route group (panel)
/painel/metricas                           # Métricas AARRR (Pro+) ← route group (panel)
/privacidade                               # Política de Privacidade (LGPD)
/termos                                    # Termos de Uso

# API Routes (Next.js proxy/BFF)
/api/auth/login
/api/auth/logout
/api/auth/me
/api/auth/password-reset
/api/auth/password-reset/confirm
/api/proxy/[...path]                       # Proxy transparente para o Django
```

> **Route group `painel/(panel)/`**: as páginas autenticadas do painel (dashboard, meu-negocio, produtos, metricas) ficam dentro do grupo `(panel)` que injeta `MerchantNavbar` + `MobileBottomNav` via `layout.tsx`. As páginas de auth (login, cadastro, esqueci-senha, nova-senha) ficam **fora** do grupo e não recebem esse layout.

### Frontend — Componentes principais

```
components/
├── layout/         Navbar, Footer
├── home/           HeroSearch, NegociosDestaque
├── negocios/       # Minisite público (/negocios/{cidade}/{categoria}/{slug})
│   ├── BusinessHero           # Hero full-width responsivo (h-80 mobile / 480px desktop)
│   │                          # Logo 80px mobile / 128px desktop, badge ABERTO/FECHADO animado
│   ├── StickyActionBar        # Barra sticky desktop: categoria | localização | avaliação + CTAs
│   ├── QuickActionsBar        # 4 ícones flutuantes mobile (-mt-6 abaixo do hero)
│   ├── BusinessMobileBottomNav # Nav fixo mobile: Início (verde pill) + Contato (WhatsApp)
│   ├── PaginaNegocioClient    # Container client: Sobre+tags, Historia, Produtos, AdSlot, EspacoEspecial
│   ├── ProdutosSection        # Grid 2×2 (max 4) — título dinâmico por categoria:
│   │                          #   restaurantes/alimentacao → "Cardápio em destaque"
│   │                          #   servicos/estetica/clinicas → "Serviços em destaque"
│   │                          #   academias → "Planos e serviços em destaque"
│   │                          #   (outros) → "Produtos em destaque"
│   ├── BusinessSidebar        # Cards sticky desktop: Horários, Contato, Endereço+Mapa, Trust
│   ├── SimilarBusinesses      # Seção full-width (#eff4ff): grid 2 mobile / 4 desktop
│   ├── HistoriaSection        # Card Nossa história (se preenchida)
│   ├── EspacoEspecial         # Pro+: texto/oferta/cupom/banner/video. Lock UI para não-Pro
│   └── TrackerView            # Registra evento "view" no analytics ao montar
├── merchant/       # Painel do comerciante — route group (panel)
│   ├── Navbar                 # MerchantNavbar: logo /logo.png + links (meu-negocio, produtos, metricas)
│   ├── MobileBottomNav        # Nav inferior mobile do painel
│   └── meu-negocio/
│       ├── InformacoesBasicasCard
│       ├── EnderecoCard
│       ├── HorarioCard
│       ├── RedesSociaisCard
│       ├── EspacoEspecialCard # Pro+ com lock UI para planos inferiores
│       ├── SeoCard
│       ├── StatusCard         # "Visualizar página pública" (botão azul #2b3fd4)
│       ├── LogoCapaCard       # Upload logo (128×128) + capa (16:9) com bg slate-100
│       ├── DicasCard
│       └── (QRCodeCard via @/components/ui/QRCodeCard)
├── seo/            JsonLd (Schema.org), GoogleAnalytics
├── ui/             button, carousel, AdSlot, CookieBanner, QRCodeCard (react-qr-code, PNG+SVG download)
└── blocks/         gallery4
```

### Frontend — Lib e tipos

- `lib/api.ts` — Axios com interceptor JWT (401 → redirect /painel/login)
- `lib/fetchers.ts` — Fetchers SSR: `getNegocio`, `getProdutosDoNegocio`, `getCategorias`, `getNegociosDestaque`, `getProdutosDestaque`, `getNegocios`
- `lib/utils.ts` — Utilitários gerais; inclui `isAberto(abertura, fechamento, dias[])` — verifica horário de funcionamento em timezone America/Sao_Paulo, normaliza dias pt-BR (remove acentos e ponto)
- `hooks/useTracking.ts` — `registrarClique(slug, tipo)` — registra eventos no endpoint de analytics
- `types/index.ts` — Interfaces TypeScript: `Negocio`, `Produto`, `FotoProduto`, `RedesSociais`, `Localizacao`, `Categoria`, `VideoDestaque`, `EspacoEspecial`, `MetricaDiaria`
  - `Negocio` inclui `palavras_chave?: string | null` (usado para chips na seção Sobre)

### Frontend — Design System (Lumina SaaS Console)

Tokens aplicados em `src/app/globals.css` via `@theme`. Sistema MD3-inspired com Inter exclusivo.

| Token / Valor     | Uso                                              |
|-------------------|--------------------------------------------------|
| `#f8f9ff`         | Background do canvas (`body`, páginas)           |
| `#ffffff`         | Cards (surface raised)                           |
| `#0b1c30`         | Texto principal (on-surface)                     |
| `#3f493f`         | Texto secundário (on-surface-variant)            |
| `#6f7a6e`         | Labels de metadados (outline)                    |
| `#becabc`         | Bordas de cards e dividers (outline-variant)     |
| `#00602a`         | Primary — links, texto de CTA                   |
| `#1a7a3c`         | Primary container — fundo de botões primários    |
| `#2b3fd4`         | Secondary — links inline, botão "Visualizar"     |
| `#eff4ff`         | Surface container low — seções alternadas, chips |
| `#e5eeff`         | Surface container — hover, placeholders          |
| `#25D366`         | WhatsApp (fixo — não faz parte da paleta MD3)    |

**Shadow card**: `0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)`

**⚠️ Caveat Tailwind v4**: tokens `@theme` nem sempre geram classes utilitárias. Usar sempre hex direto para elementos críticos: `bg-[#1a7a3c]`, `border-[#2b3fd4]`, `text-[#0b1c30]`. Classes Tailwind padrão (`bg-slate-100`, `border-slate-300`) como fallback seguro.

**Container**: `max-w-[1280px] mx-auto` | Gutter: `px-4 md:px-8` | Espaçamento: ritmo 8px

---

## O que NÃO está implementado ainda

| Feature                            | App responsável | Observação                                         |
|------------------------------------|-----------------|---------------------------------------------------|
| Assinaturas + cobrança recorrente  | `planos/`       | Mercado Pago Subscriptions — previsto 2026-06-22  |
| Promoções especiais + pagamento MP | `promocoes/` (novo) | Compra única via MP Preference               |
| Geração de texto com IA            | `ia/`           | Claude Haiku 4.5 — só plano Pro+                  |
| CTAs upgrade de plano              | `planos/`       | Botões em /planos e /painel/ apontam para /cadastro em vez de fluxo de upgrade |
| pgvector busca semântica           | `core/`         | MiniLM-L12-v2 pendente de setup                  |
| Geocodificação automática Maps     | `negocios/`     | Campo lat/lng existe, geocoding não implementado  |
| Razão social + CNPJ legais         | —               | `[PENDENTE]` em /privacidade e /termos — aguarda confirmação do dono |
| SMTP produção                      | `.env`          | `EMAIL_BACKEND=console` em dev; vars SMTP comentadas para prod |

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

## Padrões de segurança obrigatórios

### Arquitetura por camadas (Django)
| Camada | Onde | Regra |
|--------|------|-------|
| Controller | `ViewSet` / `APIView` | Só HTTP: parse de request, delegar para serializer/service, retornar Response |
| Service | `app/services.py` | Lógica de negócio pura; não importar `request` |
| Repository | ORM Django (`.objects.*`) | Acesso a banco; sempre filtrar por dono do recurso |
| Middleware | `core/middleware.py` | Auth, logging, headers de segurança |
| Utils | `core/utils.py`, `app/utils.py` | Funções auxiliares sem efeito colateral |

> Lógica de negócio NUNCA fica em `views.py`. Se a função faz mais que validar/serializar/responder, mover para `services.py`.

### Autenticação e senhas
- JWT: access 30min + refresh 7d com rotação e blacklist (SimpleJWT) ✓
- Hasher: **Argon2** (primário) + PBKDF2 como fallback para senhas antigas ✓
- HTTPS obrigatório em prod + HSTS 1 ano ✓
- Cookies de sessão e CSRF marcados `Secure` em prod ✓

### Rate limiting — escopos configurados em `DEFAULT_THROTTLE_RATES`
| Escopo | Limite | Aplicado em |
|--------|--------|-------------|
| `anon` | 60/min | Todos endpoints públicos (visitantes) |
| `user` | 200/min | Todos endpoints autenticados |
| `auth` | 5/15min | Login, token refresh (`ThrottledTokenObtainPairView`) |
| `password_reset` | 5/hour | Reset de senha |
| `analytics` | 60/min | Registro de cliques |
| `ia` | 10/day | Geração de texto com IA |

Implementação via `core/throttles.py` + `DEFAULT_THROTTLE_CLASSES` no DRF settings. Usa Redis como backend.

### Isolamento de dados (RLS no nível da aplicação)
O projeto usa Django ORM — PostgreSQL RLS com `auth.uid()` (padrão Supabase) não se aplica.
O equivalente é obrigatório via:
1. `IsDonoDoNegocio` em todo endpoint que manipula dados do comerciante
2. Cada queryset do painel DEVE filtrar por `negocio__usuario = request.user`
3. **Obrigatório**: testes que verifiquem que usuário A não acessa dados do usuário B

```python
# Padrão obrigatório em todo ViewSet do painel:
def get_queryset(self):
    return Modelo.objects.filter(negocio__usuario=self.request.user)
```

### Validação de inputs
- Backend: DRF Serializers com `validate_*` explícitos em todo campo editável
- Frontend: TODO — implementar Zod nos formulários do painel
- Sanitização XSS: Django templates auto-escapam; DRF serializers sanitizam strings
- Campos SEO passam por `core.validators_seo.validar_texto_seo_completo()` antes de salvar

### Headers de segurança (configurados)
- **Backend** (`prod.py`): `X-Frame-Options: DENY`, `SECURE_CONTENT_TYPE_NOSNIFF`, HSTS
- **Frontend** (`next.config.ts`): CSP, `X-Frame-Options: DENY`, `X-Content-Type-Options`, `Referrer-Policy`, `Permissions-Policy`
- `productionBrowserSourceMaps: false` — source maps desabilitados em produção

### CORS
- Dev: configurado explicitamente para `localhost:3000`
- Prod: `CORS_ALLOW_ALL_ORIGINS = False`, apenas `descubrasul.com` e subdomínios

### O que ainda falta implementar (backlog de segurança)
| Item | Prioridade | Observação |
|------|-----------|------------|
| Testes de isolamento entre usuários | 🔴 Alta | Cada endpoint do painel precisa de teste `user_A != user_B` |
| Zod no frontend (forms do painel) | 🟡 Média | Validação client-side nos forms de meu-negocio e produtos |
| OpenAPI/Swagger (`drf-spectacular`) | 🟡 Média | Documentação automática dos endpoints |
| Logging estruturado JSON (`structlog`) | 🟡 Média | Logs com userId, error, timestamp em JSON |
| Sentry (frontend + backend) | 🟡 Média | Alertas de erro em produção |
| API versionada `/api/v1/` | 🟠 Decisão | Mudança de alto impacto — requer alteração no frontend também |
| Cursor-based pagination | 🟢 Baixa | Atualmente usa OFFSET — migrar para cursor |
| Prometheus + Grafana | 🟢 Baixa | Métricas de infraestrutura |

### Checklist antes de criar qualquer endpoint novo
- [ ] Separação de camadas respetada (sem lógica de negócio na view)
- [ ] Throttle class configurada se necessário
- [ ] Queryset filtra por `request.user` quando dados são privados
- [ ] `IsDonoDoNegocio` aplicado em `has_object_permission`
- [ ] Validação de input no serializer (`validate_*`)
- [ ] Teste de isolamento entre usuários criado
- [ ] Schema JSON-LD se for página pública nova

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
