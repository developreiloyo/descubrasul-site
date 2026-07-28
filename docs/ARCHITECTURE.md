# DescubraSul — Detalhes de Implementação

Referência de models, fields, signals, migrations, tasks, componentes frontend e design system.
Para regras, convenções e checklists obrigatórios: ver [CLAUDE.md](../CLAUDE.md).
Para diagrama de arquitetura e estado atual de produção: ver [ARQUITECTURA.md](ARQUITECTURA.md).

---

## Backend — Detalhes por app

### usuarios/
- `User` customizado com email como USERNAME_FIELD
- Roles: `comerciante` | `admin` | `superadmin`
- Propriedades: `is_comerciante`, `is_admin_or_above`, `plano` (atalho para `negocio.plano`)
- `UserManager` com `create_user` e `create_superuser`
- Migration: `0001_initial`

### categorias/
- `Categoria`: slug auto-gerado, nome, icone, schema_tipo, ativo, ordem
- Migrations: `0001_initial`, `0002_seed_categorias` (idempotente via `get_or_create`)
- 10 categorias base seedadas: Restaurantes, Moda, Estetica, Academias, Pet Shop, Clinicas, Educacao, Lojas Gerais, Servicos, Alimentacao
- `CategoriaListView` — `GET /api/categorias/` retorna apenas ativas ordenadas por `ordem`

### negocios/
- `Negocio`: nome, descricao, historia, logo, categoria, cidade, bairro, whatsapp, website, plano, status, verificado, slug auto, seo_title/description, og_image, alt_logo, palavras_chave, espaco_especial JSONField, horario, dias_funcionamento, media_nota
- `Produto`: nome, foto, descricao, descricao_longa, categoria, preco, disponivel, ordem, confirmado_em, slug auto, alt_foto, fotos (ForeignKey)
- `FotoProduto`: máximo 3 por produto, validado no serializer
- `Localizacao`: endereco, lat/lng, direccao_fmt auto-gerada, cidade, estado, cep, bairro, area_servico
- `RedesSociais`: instagram, tiktok, facebook, youtube, x
- `VideoDestaque`: url_original, plataforma, oembed_html (cache)
- Signals: `normalizar_cidade_negocio`, `gerar_slug_negocio`, `gerar_slug_produto`, `preencher_direccao_fmt`, `disparar_geocodificacao` (post_save de Localizacao — dispara task async se lat/lng ausentes)
- Permissões: `IsDonoDoNegocio`, `IsPlanoPro`, `IsPlanoBasicoOuSuperior`, `PodicionarProduto`
- Validações: `validar_imagem` (magic bytes, 5MB max, jpg/png/webp)
- Migration: até `0006_unaccent_normalizar_cidade`

### negocios/ — tasks e services
- Task Celery `ocultar_produtos_vencidos` (02:00h diário) — oculta produtos sem confirmação há +30 dias
- Task Celery `geocodificar_localizacao(localizacao_id)` — chama Google Maps API, preenche lat/lng, max_retries=3, countdown=60s
- `negocios/services.py` → `geocodificar_endereco(endereco)` — HTTP call ao Google Maps Geocoding API; retorna `(Decimal lat, Decimal lng)` ou `None`

### analytics/
- `Clique`: tipo (view, whatsapp, produto, share, instagram, tiktok, facebook, youtube, maps), origem (google, instagram, facebook, whatsapp, direto, outro), negocio, produto FK opcional
- `MetricaDiaria`: agregados pré-computados por negócio por data — views, whatsapp, shares, origens, redes sociais, taxa_conversao
- Tasks Celery: `agregar_metricas_diarias` (00:30h diário), `purgar_cliques_antigos` (03:00h domingos)
- Management command: `setup_celery_beat` — seed dos agendamentos no banco
- Migration: `0001_initial`

### core/
- `celery.py` — `app.conf.beat_schedule` configurado com as 3 tasks periódicas e horários
- `health.py`:
  - `GET /health/` → liveness probe (processo Django respondendo, sem checar deps)
  - `GET /health/ready/` → readiness probe (verifica DB com `SELECT 1`, retorna 503 se falhar)
  - Ambas com `@never_cache` — Dockerfile.prod aponta healthcheck para `/health/`

### planos/
- `CATALOGO_PLANOS` dict — configs: basico (R$79/mês), pro (R$197/mês), producao (R$397/mês), fundador (R$599/ano)
- `Assinatura` model — OneToOne com Negocio, status choices (pendente/ativa/pausada/cancelada/encerrada), mp_subscription_id, proximo_vencimento
- `services.py` → `criar_subscricao_mp(negocio, plano_slug, back_url)` — cria preapproval MP; `validar_assinatura_webhook(sig, req_id, data_id)` — valida HMAC
- Views: `listar_planos` (público), `minha_assinatura`, `assinar_plano/{slug}` → retorna `init_point`, `webhook_mp` — atualiza status
- Migration: `0001_initial`
- **Pendente frontend**: não existe UI de checkout no painel — botões apontam para `/para-empresas#planos-detalhes`

### ofertas/
- `Oferta` model — negocio, titulo, descricao, preco_original, preco_oferta, imagem, status (pendente/ativa/expirada/cancelada), validade, mp_preference_id
- `ativar()` → cria MP Preference de compra única; `dias_restantes` property
- Views: `listar_ativas` (público), `minhas_ofertas`, `criar_oferta`, `webhook_mp_oferta`
- Task Celery: `expirar_ofertas` — expira ofertas vencidas (agendado via Celery Beat)
- Frontend: `painel/ofertas/page.tsx` — lista + criar oferta com checkout MP
- Migration: `0001_initial`

### ia/
- App criado mas **vazio** — apenas arquivos stub. Ativar na Fase 3 (mês 3+), somente plano Pro+.

---

## Frontend — Painel do comerciante

### Route group `src/app/painel/(panel)/`
- `layout.tsx` — injeta `MerchantNavbar` + `MobileBottomNav`, bg `#f8f9ff`, max-w 1280px
- `meu-negocio/page.tsx` — grid 8+4 col; fetch GET + PATCH `/api/proxy/negocios/painel/meu-negocio/`
  - Payload PATCH: `{ ...campos, historia, localizacao: {cep, direccao, bairro, cidade, estado}, redes_sociais: {instagram_url, tiktok_url, facebook_url, youtube_url, x_url}, espaco_especial: null | {tipo, ...} }`
- `produtos/page.tsx` — CRUD de produtos com upload de foto (max 3/produto)
- `metricas/page.tsx` — Dashboard AARRR (bloqueado para não-Pro)

### MerchantNavbar
- Logo: `<Image src="/logo.png">` — mesmo logo do Navbar público
- Links: `/painel/meu-negocio`, `/painel/produtos`, `/painel/metricas`

### QRCodeCard (`components/ui/QRCodeCard.tsx`)
- Lib: `react-qr-code` (NÃO `qrcode.react`)
- Gera URL: `/negocios/{cidade}/{categoriaSlug}/{slug}`
- Download disponível em PNG e SVG

> `NegocioPainelSerializer` retorna `categoria` como objeto aninhado `{slug, nome, icone}` — necessário para o QR Code no painel.

---

## Frontend — Componentes principais

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

---

## Frontend — Lib e tipos

- `lib/api.ts` — Axios com interceptor JWT (401 → redirect `/painel/login`)
- `lib/fetchers.ts` — Fetchers SSR: `getNegocio`, `getProdutosDoNegocio`, `getCategorias`, `getNegociosDestaque`, `getProdutosDestaque`, `getNegocios`
- `lib/utils.ts` — Utilitários gerais; inclui `isAberto(abertura, fechamento, dias[])` — verifica horário de funcionamento em timezone America/Sao_Paulo, normaliza dias pt-BR (remove acentos e ponto)
- `hooks/useTracking.ts` — `registrarClique(slug, tipo)` — registra eventos no endpoint de analytics
- `types/index.ts` — Interfaces TypeScript: `Negocio`, `Produto`, `FotoProduto`, `RedesSociais`, `Localizacao`, `Categoria`, `VideoDestaque`, `EspacoEspecial`, `MetricaDiaria`
  - `Negocio` inclui `palavras_chave?: string | null` (usado para chips na seção Sobre)

---

## Frontend — Design System (Lumina SaaS Console)

Tokens aplicados em `src/app/globals.css` via `@theme`. Sistema MD3-inspired com Inter exclusivo.

| Token / Valor | Uso |
|---------------|-----|
| `#f8f9ff` | Background do canvas (`body`, páginas) |
| `#ffffff` | Cards (surface raised) |
| `#0b1c30` | Texto principal (on-surface) |
| `#3f493f` | Texto secundário (on-surface-variant) |
| `#6f7a6e` | Labels de metadados (outline) |
| `#becabc` | Bordas de cards e dividers (outline-variant) |
| `#00602a` | Primary — links, texto de CTA |
| `#1a7a3c` | Primary container — fundo de botões primários |
| `#2b3fd4` | Secondary — links inline, botão "Visualizar" |
| `#eff4ff` | Surface container low — seções alternadas, chips |
| `#e5eeff` | Surface container — hover, placeholders |
| `#25D366` | WhatsApp (fixo — fora da paleta MD3) |

**Shadow card**: `0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)`

**⚠️ Caveat Tailwind v4**: tokens `@theme` nem sempre geram classes utilitárias. Usar sempre hex direto: `bg-[#1a7a3c]`, `border-[#2b3fd4]`, `text-[#0b1c30]`. Classes padrão (`bg-slate-100`, `border-slate-300`) como fallback seguro.

**Container**: `max-w-[1280px] mx-auto` | Gutter: `px-4 md:px-8` | Espaçamento: ritmo 8px
