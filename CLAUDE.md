# DescubraSul — CLAUDE.md

Vitrina digital regional para o Sul de Santa Catarina (Criciúma, Içara, Tubarão e região).
Foco exclusivo: Vitrina de negócios locais. A Etapa 2 (jogos) foi cancelada por questões de legislação.

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
| Deploy        | Docker Compose + Traefik (Hostinger VPS Ubuntu 24.04) |

---

## Estrutura de Apps Django

```
backend/
├── negocios/        # Negocio, Produto, FotoProduto, Localizacao, RedesSociais, VideoDestaque
├── usuarios/        # User customizado (email auth), roles
├── planos/          # Assinatura, CATALOGO_PLANOS, integração Mercado Pago (backend completo)
├── ofertas/         # Oferta, webhook MP, task expiração (backend completo)
├── analytics/       # Clique (eventos crus), MetricaDiaria (agregados diários)
├── ia/              # Gerador de descrição, alt text, insights AARRR  ← PENDENTE
├── categorias/      # Categoria com slug, ícone, schema_tipo
└── core/            # Settings, middleware, validators, utils compartilhados
```

---

## O que já está implementado

> Detalhes de models, fields, signals, migrations, tasks, componentes e design system completo:
> ver [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md).
> Diagrama de arquitetura e estado de produção: ver [docs/ARQUITECTURA.md](docs/ARQUITECTURA.md).

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

# Health checks (Docker + monitoramento)
GET    /health/                         # Liveness — processo Django vivo
GET    /health/ready/                   # Readiness — DB OK (retorna 503 se falhar)

# Categorias — público
GET    /api/categorias/                 # Lista categorias ativas ordenadas por `ordem`

# Planos (assinaturas Mercado Pago)
GET    /api/planos/                          # Lista planos públicos com preços
GET    /api/planos/minha-assinatura/         # Status da assinatura do merchant (JWT)
POST   /api/planos/assinar/{slug}/           # Inicia assinatura MP → retorna init_point (JWT)
POST   /api/planos/webhook/                  # Webhook MP — atualiza status da assinatura

# Ofertas da Semana
GET    /api/ofertas/                         # Lista ofertas ativas (público)
GET    /api/ofertas/minhas/                  # Minhas ofertas (JWT)
POST   /api/ofertas/criar/                   # Criar oferta → inicia pagamento MP (JWT)
POST   /api/ofertas/webhook/                 # Webhook MP para ofertas

# Stub vazio
/api/ia/
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
/marketplace                               # Vitrina (rota /marketplace, label "Vitrina" no footer/nav)
/food                                      # Página de food
/p/{slug}                                  # URL curta (redirect)
/para-empresas                             # Landing para comerciantes + 3 planos detalhados
/painel/login                              # Login comerciante (fora do route group)
/painel/cadastro                           # Cadastro (fora do route group)
/painel/esqueci-senha                      # Recuperação de senha (fora do route group)
/painel/nova-senha                         # Redefinir senha (fora do route group)
/painel/                                   # Dashboard do comerciante ← route group (panel)
/painel/meu-negocio                        # Editar negócio + EspacoEspecial (Pro+) ← route group (panel)
/painel/produtos                           # Gerenciar produtos ← route group (panel)
/painel/metricas                           # Métricas AARRR (Pro+) ← route group (panel)
/painel/ofertas                            # Ofertas da Semana ← route group (panel)
/privacidade                               # Política de Privacidade (LGPD)
/termos                                    # Termos de Uso

# API Routes (Next.js proxy/BFF)
/api/auth/login
/api/auth/logout
/api/auth/me
/api/auth/password-reset
/api/auth/password-reset/confirm
/api/proxy/[...path]                       # Proxy BFF para o Django (com JWT automático)
```

> **Proxy BFF (`/api/proxy/[...path]/route.ts`)**: injeta `Authorization: Bearer` automaticamente a partir dos cookies httpOnly. `PUBLIC_PATHS` (sem auth): `categorias`, `planos`, `usuarios/cadastro`. Token expirado → tenta refresh silencioso antes de retornar 401.

> **Route group `painel/(panel)/`**: as páginas autenticadas do painel ficam dentro do grupo `(panel)` que injeta `MerchantNavbar` + `MobileBottomNav` via `layout.tsx`. As páginas de auth (login, cadastro, esqueci-senha, nova-senha) ficam **fora** do grupo e não recebem esse layout.

### Design System — regras ativas

**⚠️ Caveat Tailwind v4**: tokens `@theme` nem sempre geram classes utilitárias. Usar sempre hex direto para elementos críticos: `bg-[#1a7a3c]`, `border-[#2b3fd4]`, `text-[#0b1c30]`. Classes Tailwind padrão (`bg-slate-100`, `border-slate-300`) como fallback seguro.

**Container**: `max-w-[1280px] mx-auto` | Gutter: `px-4 md:px-8` | Espaçamento: ritmo 8px

> Paleta completa de cores e tokens: `src/app/globals.css` ou [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md#frontend--design-system-lumina-saas-console).

---

## O que NÃO está implementado ainda

| Feature                                  | App responsável | Observação                                                                 |
|------------------------------------------|-----------------|----------------------------------------------------------------------------|
| Checkout de upgrade de plano (frontend)  | `planos/`       | Backend MP pronto (`POST /api/planos/assinar/{slug}`). Falta UI no painel — botões apontam para `/para-empresas#planos-detalhes` |
| SMTP produção                            | `.env`          | Resend configurado no VPS mas propagação DNS pendente. Sem isso, password reset não entrega emails |
| Razão social + CNPJ legais               | —               | Texto "CNPJ em processo de registro" em `/privacidade` e `/termos` — aguarda confirmação do dono |
| Geração de texto com IA                  | `ia/`           | Claude Haiku 4.5 — ativar somente Fase 3 (mês 3+), só plano Pro+          |
| pgvector busca semântica                 | `core/`         | MiniLM-L12-v2 pendente de setup                                            |
| OAuth Google                             | `usuarios/`     | Spec existe (`specs/03-oauth-google.md`), não iniciado — não bloquea lançamento |

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

### Configurações ativas

- **Auth**: Argon2 (primário) + PBKDF2 fallback; JWT access 30min + refresh 7d com rotação e blacklist. Ver `settings/base.py`.
- **Headers (prod)**: HSTS 1 ano, `SESSION_COOKIE_SECURE`, `CSRF_COOKIE_SECURE`. CSP nonce-based em `src/middleware.ts` — requer `export const dynamic = "force-dynamic"` em `layout.tsx`.
- **CORS**: `CORS_ALLOW_ALL_ORIGINS = False` em prod; apenas `descubrasul.com` e subdomínios.

### Rate limiting — escopos

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

- Backend: DRF Serializers com `validate_*` explícitos em todo campo editável.
- Campos SEO passam por `core.validators_seo.validar_texto_seo_completo()` antes de salvar.
- Frontend: Zod pendente nos formulários do painel (backlog 🟡 Média).

### Checklist antes de criar qualquer endpoint novo
- [ ] Separação de camadas respetada (sem lógica de negócio na view)
- [ ] Throttle class configurada se necessário
- [ ] Queryset filtra por `request.user` quando dados são privados
- [ ] `IsDonoDoNegocio` aplicado em `has_object_permission`
- [ ] Validação de input no serializer (`validate_*`)
- [ ] Teste de isolamento entre usuários criado
- [ ] Schema JSON-LD se for página pública nova

---

## Compliance ISO 27001:2022 e ISO 22301:2019 — Framework Obrigatório

> **Regra de ouro:** Estas normas NÃO são uma revisão posterior. São um filtro aplicado ANTES
> de escrever código ou propor mudanças de infraestrutura. Todo agente deve consultar esta seção
> ao iniciar qualquer tarefa.
>
> **Gaps ativos:** logging estruturado (8.15), Sentry/monitoramento (8.16) e backup diário de
> PostgreSQL pendentes — ver detalhes em `specs/01-seguridad.md` §7.
>
> Mapeamento completo de controles, tabelas RTO/RPO, análise SPOF e padrão de degradação com graça:
> ver **[docs/COMPLIANCE.md](docs/COMPLIANCE.md)**.

### Checklist ISO 27001 — obrigatório antes de qualquer mudança de backend ou infra

- [ ] **8.9** O dado configurado está em `.env`? Nenhum segredo hardcoded?
- [ ] **8.6** A mudança introduz pressão de memória ou CPU desproporcionais ao VPS 8GB/2vCPU?
- [ ] **8.12** Algum campo novo expõe PII ou dado sensível em resposta pública?
- [ ] **8.28** Todo input do usuário passa por `validate_*` no serializer antes de tocar o banco?
- [ ] **8.29** Existe teste que verifique que usuário A não acessa dados do usuário B via este endpoint?
- [ ] **8.16** A operação gera log rastreável (quem fez, quando, o quê)? Se não, é aceitável sem log?
- [ ] **5.15** As permissões estão explícitas e mínimas (least privilege)?

### Checklist ISO 22301 — obrigatório antes de qualquer mudança de infraestrutura

- [ ] A mudança introduz ou agrava um SPOF existente?
- [ ] Se o componente novo falhar, o sistema degrada com gracia (graceful degradation) ou cai completamente?
- [ ] Redis tem AOF habilitado (`--appendonly yes`)? Verificar antes do deploy.
- [ ] O último backup de PostgreSQL foi testado (restore funcionou)?
- [ ] O `CELERY_RESULT_EXPIRES` está configurado para evitar crescimento infinito do backend de resultados?
- [ ] O `restart: unless-stopped` está em todos os serviços críticos do `docker-compose.prod.yml`?
- [ ] Após a mudança, os health checks `/health/` e `/health/ready/` continuam respondendo 200?

### Fluxo de aprovação para mudanças críticas

```
Proposta de mudança
       │
       ▼
ISO 27001 checklist acima ──── falhou? ──► Corrigir antes de prosseguir
       │ passou
       ▼
ISO 22301 checklist acima ──── SPOF novo? ──► Documentar mitigação
       │ passou
       ▼
qa-verifier executa testes de isolamento + edge cases
       │ passou
       ▼
security agent revisa se há superfícies de ataque novas
       │ passou
       ▼
Commit + deploy
```

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

> **Nomes padronizados** — backend (`Negocio.Plano`) e frontend usam os mesmos nomes comerciais em todo o painel.
> Slugs de banco ativos: `gratuito / pro / producao`. Slugs `basico` e `fundador` foram removidos do modelo.

| Slug backend | Nome comercial  | Preço          | Limite produtos (público) | Limite (painel) | IA/Pro |
|--------------|-----------------|----------------|---------------------------|-----------------|--------|
| `gratuito`   | Presença Sul    | R$ 0           | 10                        | 5               | Não    |
| `pro`        | Conexão Sul     | R$ 197/ano     | Ilimitado                 | Ilimitado       | Sim    |
| `producao`   | Destaque Sul    | R$ 397/ano     | Ilimitado                 | Ilimitado       | Sim    |

> `LIMITES_PRODUTOS_PUBLICO` no `views.py` limita a exibição pública a 10 para `gratuito`.
> `LIMITES_PRODUTOS` no `models.py` é o limite de cadastro no painel: gratuito=5, pro/producao=None.
> Plano `gratuito` (Presença Sul) exibe `BannerDescubraSul` institucional no lugar do campo capa — upload de capa disponível apenas em Conexão Sul e Destaque Sul.

---

## Espaço Especial (Pro+)

Campo `espaco_especial` (JSONField) no modelo `Negocio`, exibido na página pública pelo componente `EspacoEspecial.tsx`.
Tipos válidos: `"texto"` | `"oferta"` | `"cupom"` | `"banner"` | `"video"`
Configurável pelo comerciante no painel `/painel/meu-negocio` (apenas Conexão Sul e Destaque Sul).
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
- Limite público de produtos (gratuito/Presença Sul): 10 — não expõe todos os produtos no HTML

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

- `docker-compose.yml` — stack de desenvolvimento local
- `docker-compose.override.yml` — overrides locais (não commitar)
- `docker-compose.prod.yml` — stack de produção com Traefik: imagem `${IMAGE_TAG:-latest}`, sem `networks` externas, envs via `.env.prod`, sem `ports` expostos (Traefik roteia por nome interno)
- `.env` — todas as variáveis (nunca commitar)
- `backend/core/settings/` — base, dev, prod
- `frontend/next.config.ts` — config do Next.js
- `frontend/src/middleware.ts` — CSP nonce-based + auth guard das rotas do painel

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

---

## Ferramentas ativas e roadmap

**Já ativos:** OpenSpec (skills `opsx:*`) e Engram (tools `mem_*`).

Ferramentas pendentes (Framer Motion, GSAP, Google Business Profile API, Agent Teams Lite):
ver [docs/ROADMAP.md](docs/ROADMAP.md).

---

## Memory Protocol

Tienes acceso a memoria persistente de Engram vía MCP tools (mem_save, mem_search, mem_context, mem_session_summary, etc.).

- Guarda proactivamente con mem_save después de trabajo significativo: bugs resueltos, decisiones de arquitectura, cambios de infraestructura, pendientes identificados. No esperes a que se te pida.
- Después de cualquier compactación o reinicio de contexto, llama a mem_context primero para recuperar el estado de la sesión antes de continuar.
- Al iniciar una sesión nueva, busca en memoria contexto relevante al pedido del usuario antes de asumir que no existe historial.
