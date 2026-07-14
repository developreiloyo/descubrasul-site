# DescubraSul — Arquitectura del Sistema

*Última actualización: 2026-07-12. Fuente de verdad: `CLAUDE.md` + `specs/`. Si hay discrepancia, el código gana.*

---

## Resumen ejecutivo

**DescubraSul** (descubrasul.com) es una vitrine digital regional para PMEs del Sur de Santa Catarina, Brasil (Criciúma, Içara, Tubarão y región). El producto da presencia digital profesional a negocios que hoy no la tienen o la tienen incompleta.

**Framing comercial:** hablar siempre de "vitrine", nunca de "diretório". El directorio es genérico y pasivo; la vitrine implica curaduría, presentación y venta activa del negocio.

**Usuarios:**
- **Merchant / dono de negócio** — PME que quiere presencia online sin construir un sitio propio.
- **Consumidor / usuario final** — persona buscando negocios locales por cidade/categoria.
- **Operador (Reinaldo)** — onboarding de merchants, analíticas agregadas, modelo de monetización.

**Modelo de negocio:** cuatro planes + plan "Fundador" (50 cupos, R$599/año). Diferenciador: onboarding manual de Google Business Profile — algo que la competencia automatizada no ofrece.

**Principio filtro de features:** ¿esto ayuda al merchant a mostrar mejor su negocio, o al usuario a encontrarlo más rápido? Si la respuesta no es clara, no es prioridad para el MVP.

---

## Estado actual (2026-07-12)

| Área | Estado |
|------|--------|
| Producción | ✅ Activo en www.descubrasul.com (PMV para validar apariencia/usabilidad) |
| Backend Django | ✅ Funcional — negocios, usuarios, analytics, categorias, CRUD de produtos |
| Panel del merchant | ✅ Alta atómica User+Negocio, auto-login, formulario completo, CRUD produtos |
| Password reset | ✅ Implementado y verificado (49 tests en verde, 3 bugs corregidos 2026-07-12) |
| Analíticas | ✅ Clique + MetricaDiaria, tracking, agregación nocturna Celery Beat |
| Páginas públicas | ✅ Minisite, cidades, categorías, busca, sitemap dinámico, URL corta /p/{slug} |
| Rediseño visual | ✅ Completado en `feat/redesign-visual-v1` (Playfair Display, CategoryCard, CityCard, PromoCard, scroll reveal) |
| IA (Claude Haiku) | ⏳ Pendiente — activar en mes 3+ solo para plan Pro |
| Assinaturas MP | ⏳ Pendiente — Mercado Pago Subscriptions |
| OAuth Google | ⏳ Pendiente — spec existe, scope sin definir |
| Token GitHub expuesto | 🔴 Bloqueante — revocar PAT `ghp_yLMV...` antes del lanzamiento |
| LGPD compliance | 🔴 Bloqueante — checkbox consentimiento, /privacidade, /termos, cookie banner |
| Ramas divergidas | 🔴 Pendiente — reconciliar `main` con `stable/etapa1-producao` |

---

## Stack técnico

| Capa | Tecnología |
|------|-----------|
| Frontend | Next.js 16 (App Router) + TypeScript + Tailwind CSS 4 |
| State management | Zustand + TanStack Query |
| Backend | Django 5 + Django REST Framework |
| Tareas asíncronas | Celery + Django Celery Beat |
| Base de datos | PostgreSQL 16 + pgvector (embeddings, búsqueda semántica) |
| Cache / Cola | Redis 7 |
| Autenticación | SimpleJWT (access 30min + refresh 7d, rotación + blacklist) |
| Hashing de contraseñas | Argon2 (primario) + PBKDF2 (fallback) |
| Media / Imágenes | Cloudflare R2 (S3-compatible) |
| Email transaccional | Resend SMTP |
| Pagos | Mercado Pago (suscripciones recurrentes) |
| Proxy reverso | Traefik v3 (SSL automático Let's Encrypt, sin panel intermediario) |
| Orquestación | Docker Compose puro |
| CI/CD | GitHub Actions → GHCR (GitHub Container Registry) |
| Infra | Hostinger VPS Ubuntu 24.04 |
| IA textos (futuro) | Claude Haiku 4.5 — solo plan Pro, mes 3+ |
| Búsqueda semántica | pgvector + multilingual MiniLM-L12-v2 (pendiente de setup) |

---

## Diagrama de arquitectura

```mermaid
graph TB
    subgraph Internet
        USER[👤 Usuario / Consumidor]
        MERCHANT[🏪 Merchant]
        GH[GitHub Actions CI/CD]
    end

    subgraph VPS["🖥️ Hostinger VPS — Ubuntu 24.04"]
        TRAEFIK["🔀 Traefik v3\n:80 → redirect HTTPS\n:443 → SSL Let's Encrypt\nrouteo por labels Docker"]

        subgraph Docker Compose
            NEXT["⚡ Next.js 16\nApp Router + TypeScript\nTailwind CSS 4\nport 3000"]
            DJANGO["🐍 Django 5 + DRF\nGunicorn 3 workers\nport 8000"]
            CELERY_W["⚙️ Celery Worker\nconcurrency 2"]
            CELERY_B["🕐 Celery Beat\nDatabaseScheduler"]
            PG["🐘 PostgreSQL 16\n+ pgvector\nport 5432 (interno)"]
            REDIS["⚡ Redis 7\nport 6379 (interno)"]
        end
    end

    subgraph External["☁️ Servicios externos"]
        R2["☁️ Cloudflare R2\nMedia / Imágenes"]
        RESEND["📧 Resend SMTP\nEmail transaccional"]
        MP["💳 Mercado Pago\nSuscripciones recurrentes"]
        GMAPS["🗺️ Google Maps API\nGeocodificación"]
        GHCR["📦 GHCR\nContainer Registry"]
        CLAUDE_AI["🤖 Claude Haiku 4.5\nIA textos — Plan Pro\n(pendiente mes 3+)"]
    end

    USER -->|HTTPS| TRAEFIK
    MERCHANT -->|HTTPS| TRAEFIK
    GH -->|docker pull / deploy| GHCR
    GHCR -->|imagen :latest| TRAEFIK

    TRAEFIK -->|Host descubrasul.com| NEXT
    TRAEFIK -->|Host descubrasul.com + /api| DJANGO

    NEXT -->|BFF Proxy /api/proxy/\nJWT automático desde cookies httpOnly| DJANGO
    NEXT -->|SSR fetchers| DJANGO

    DJANGO -->|ORM| PG
    DJANGO -->|cache, rate limit, blacklist JWT| REDIS
    DJANGO -->|enqueue tasks| REDIS
    DJANGO -->|upload imágenes| R2
    DJANGO -->|password reset, notificaciones| RESEND
    DJANGO -->|webhooks pagos| MP
    DJANGO -->|geocodificación| GMAPS
    DJANGO -->|generación de texto Pro| CLAUDE_AI

    CELERY_W -->|consume queue| REDIS
    CELERY_W -->|geocodificar_localizacao\nocultar_produtos_vencidos| PG
    CELERY_B -->|schedule: 00:30h, 02:00h, 03:00h dom| REDIS

    style TRAEFIK fill:#e8f4f8,stroke:#2196F3
    style NEXT fill:#e8f8e8,stroke:#4CAF50
    style DJANGO fill:#fff8e1,stroke:#FF9800
    style PG fill:#e8e8f8,stroke:#3F51B5
    style REDIS fill:#fce4ec,stroke:#E91E63
    style CELERY_W fill:#fff3e0,stroke:#FF9800
    style CELERY_B fill:#fff3e0,stroke:#FF9800
    style R2 fill:#f3e5f5,stroke:#9C27B0
    style CLAUDE_AI fill:#e0f2f1,stroke:#009688,stroke-dasharray: 5 5
```

---

## Flujo de request — página pública

```mermaid
sequenceDiagram
    participant U as Usuario
    participant T as Traefik
    participant N as Next.js (SSR)
    participant D as Django DRF
    participant P as PostgreSQL

    U->>T: GET /negocios/criciuma/restaurantes/pizza-bela
    T->>N: route (Host: descubrasul.com, no /api)
    N->>D: GET /api/negocios/{slug}/ (SSR fetch)
    D->>P: SELECT negocio + produtos + localizacao
    P-->>D: datos
    D-->>N: JSON (Negocio, Produtos, RedesSociais...)
    N-->>U: HTML con JSON-LD + meta SEO (SSR)
    U->>T: POST /api/analytics/cliques/ (tracking view)
    T->>D: route (/api prefix)
    D->>P: INSERT Clique
```

---

## Flujo de request — panel del merchant (autenticado)

```mermaid
sequenceDiagram
    participant M as Merchant browser
    participant N as Next.js (BFF)
    participant D as Django DRF

    M->>N: POST /api/auth/login (email + password)
    N->>D: POST /api/auth/token/
    D-->>N: {access, refresh}
    N-->>M: Set-Cookie httpOnly (access + refresh)

    M->>N: PATCH /api/proxy/negocios/painel/meu-negocio/
    N->>N: Lee cookie, inyecta Authorization: Bearer
    N->>D: PATCH /api/negocios/painel/meu-negocio/
    D->>D: IsAuthenticated + IsDonoDoNegocio
    D-->>N: 200 OK
    N-->>M: 200 OK
```

---

## Apps Django — responsabilidades

```mermaid
graph LR
    subgraph backend/
        CORE[core/\nsettings, celery,\nthrottles, validators_seo,\nhealth checks]
        USUARIOS[usuarios/\nUser custom email auth\nroles, password reset\ntokens.py]
        NEGOCIOS[negocios/\nNegocio, Produto, FotoProduto\nLocalizacao, RedesSociais\nVideoDestaque, signals, tasks]
        CATEGORIAS[categorias/\nCategoria con slug\nseed 10 categorias]
        ANALYTICS[analytics/\nClique, MetricaDiaria\ntasks agregación nocturna]
        PLANOS[planos/\nstub vacío\npendiente MP Subscriptions]
        IA[ia/\nstub vacío\npendiente Claude Haiku mes 3+]
    end

    CORE --> USUARIOS
    CORE --> NEGOCIOS
    CORE --> ANALYTICS
    USUARIOS --> NEGOCIOS
    NEGOCIOS --> ANALYTICS
    PLANOS -.->|futuro| NEGOCIOS
    IA -.->|futuro| NEGOCIOS
```

---

## Estructura de rutas frontend

```mermaid
graph TD
    ROOT["/"] --> HOME[page.tsx\nHeroSearch + NegociosDestaque]
    ROOT --> NEGOCIO["/negocios/{cidade}/{categoria}/{slug}\nMinisite SSR + JSON-LD"]
    ROOT --> CIUDAD["/cidades/{slug}\nPágina de ciudad"]
    ROOT --> CAT["/{categoria}\n/{categoria}/{ciudad}"]
    ROOT --> BUSCA["/busca"]
    ROOT --> SHORT["/p/{slug}\nURL corta redirect"]
    ROOT --> PLANOS["/planos"]
    ROOT --> EMPRESAS["/para-empresas"]

    ROOT --> PAINEL["/painel/"]
    PAINEL --> AUTH_PAGES[login / cadastro\nesqueci-senha / nova-senha\n⚠️ fuera del route group]
    PAINEL --> PANEL_GROUP["(panel)/ — layout con\nMerchantNavbar + MobileBottomNav"]
    PANEL_GROUP --> DASHBOARD["/painel/ — Dashboard"]
    PANEL_GROUP --> MEU_NEG["/painel/meu-negocio\nEditar negócio"]
    PANEL_GROUP --> PRODUTOS["/painel/produtos\nCRUD produtos"]
    PANEL_GROUP --> METRICAS["/painel/metricas\nAAARR — solo Pro"]

    ROOT --> API_ROUTES["/api/\nRoute Handlers BFF"]
    API_ROUTES --> AUTH_API["/api/auth/\nlogin, logout, me\npassword-reset"]
    API_ROUTES --> PROXY["/api/proxy/[...path]\nProxy → Django con JWT"]
```

---

## Tareas Celery programadas

| Tarea | Horario | Descripción |
|-------|---------|-------------|
| `agregar_metricas_diarias` | 00:30h diario | Agrega `Clique` → `MetricaDiaria` |
| `ocultar_produtos_vencidos` | 02:00h diario | Oculta produtos sin confirmación >30 días |
| `purgar_cliques_antigos` | 03:00h domingos | Purga eventos crudos antiguos |
| `geocodificar_localizacao` | On-demand (post_save) | Llama Google Maps API para lat/lng |

---

## Seguridad — capas de protección

| Capa | Mecanismo |
|------|-----------|
| Transporte | HTTPS obligatorio + HSTS 1 año (Traefik + Let's Encrypt) |
| Autenticación | SimpleJWT — access 30min, refresh 7d con rotación y blacklist |
| Hashing | Argon2 (primario) + PBKDF2 (fallback) |
| Autorización | `IsDonoDoNegocio` en todos los endpoints del merchant panel |
| Aislamiento de datos | `get_queryset()` filtra siempre por `negocio__usuario = request.user` |
| Rate limiting | Redis-backed throttles por scope: anon 60/min, user 200/min, auth 5/15min |
| Uploads | Validación por magic bytes (python-magic), no por extensión |
| CSP | Nonce-based por request en Next.js middleware (`strict-dynamic`) |
| CORS | Solo `descubrasul.com` y subdominios en producción |
| Cookies | `httpOnly`, `Secure`, `SameSite` en producción |

---

## Pendientes bloqueantes para lanzamiento comercial

| Prioridad | Ítem | Responsable |
|-----------|------|-------------|
| 🔴 Alta | Revocar PAT `ghp_yLMV...` + reconfigurar remote git sin credencial embebida | Reinaldo (acción manual) |
| 🔴 Alta | Reconciliar ramas `main` ↔ `stable/etapa1-producao` | Dev |
| 🔴 Alta | LGPD: checkbox consentimiento en /cadastro, /privacidade, /termos publicadas, cookie banner GA4, email privacidade@ | Dev + Reinaldo |
| 🟡 Media | `argon2-cffi` — rebuild del container backend (`docker compose build backend`) | DevOps |
| 🟡 Media | OAuth Google — definir scope antes de implementar (ver `specs/03-oauth-google.md`) | Reinaldo (decisión) |

---

## Archivos de configuración clave

| Archivo | Propósito |
|---------|-----------|
| `docker-compose.yml` | Stack de desarrollo local |
| `docker-compose.prod.yml` | Producción — Traefik labels, Gunicorn, servicios |
| `backend/core/settings/base.py` | Settings base Django (PASSWORD_RESET_TIMEOUT=3600, etc.) |
| `backend/core/settings/prod.py` | Overrides producción (HSTS, SECURE_PROXY_SSL_HEADER, etc.) |
| `frontend/src/middleware.ts` | CSP nonce-based + auth guard rutas del panel |
| `frontend/next.config.ts` | Config Next.js (source maps desactivados en prod) |
| `.env.prod` | Variables sensibles — **nunca versionar** |

---

*Specs de referencia: `specs/00-vision.md` (visión), `specs/01-seguridad.md` (compliance), `specs/02-crud-productos.md` (CRUD ref), `specs/03-oauth-google.md` (OAuth pendiente), `specs/04-password-reset.md` (password reset implementado).*
