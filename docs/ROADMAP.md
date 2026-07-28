# DescubraSul — Roadmap Tecnológico

Ferramentas e integrações identificadas para fases futuras.

> **Status (julho 2026):** OpenSpec (skills `opsx:*`) e Engram (tools `mem_*`) já estão ativos e em uso.

---

## Framer Motion — Prioridade: ALTA

**O que é:** Biblioteca de animações para React/Next.js.

**Casos de uso:**
- HeroSearch: headline com fade-in + translateY
- NegociosDestaque: cards com stagger ao scrollar (`whileInView`)
- Navbar: fundo muda de transparente para branco ao scrollar
- Botões: hover com `whileHover={{ scale: 1.02 }}`
- Minisite `/p/{slug}`: galeria com crossfade entre fotos

**Quando integrar:** Sprint de polish visual — antes do lançamento.

**Instalação:** `npm install framer-motion` (rodar em `frontend/`)

---

## GSAP + ScrollTrigger — Prioridade: MÉDIA

Animações avançadas com scroll-triggered e timelines complexas. Usar somente se Framer Motion
não cobrir casos avançados da landing `/para-empresas`.

---

## Google Business Profile API — Prioridade: ALTA (serviço manual por agora)

**Situação atual:** Não há API pública para criar perfis automaticamente. O onboarding GBP é
feito manualmente como serviço de valor agregado nos planos.

**Fluxo manual atual:**
1. Comerciante contrata plano Básico ou superior
2. DescubraSul cria/reivindica o perfil GBP do negócio
3. Website do GBP = página do negócio em `descubrasul.com/{slug}`
4. Backlink do domínio Google → descubrasul.com (SEO fortíssimo)

**Campos a adicionar no modelo `Negocio` (quando formalizar):**
- `google_business_url`: URLField (link do perfil GBP criado)
- `gbp_status`: CharField choices `pendente|configurado|verificado`
- Badge "Verificado no Google" na página pública

**Quando automatizar via API:** Fase 3+ — requer aprovação do app pelo Google (processo burocrático).

**Estratégia de monetização GBP por plano:**
- Gratuito: guia PDF de como configurar sozinho
- Básico: DescubraSul configura o GBP (setup único)
- Pro: setup + otimização + fotos + posts mensais
- Produção: gestão completa contínua

---

## Agent Teams Lite — Prioridade: BAIXA

Orquestração de múltiplos agentes especializados em paralelo.

**Casos de uso no DescubraSul:**
- Agente de geração de descrições via Claude Haiku (app `ia/`)
- Agente de validação SEO (`core/validators_seo.py`)
- Agente de agregação de métricas (`analytics/tasks.py`)
- Agente de moderação de conteúdo do comerciante

**Quando integrar:** Fase 3 (mês 3+) — junto com a ativação do app `ia/` e Claude Haiku para planos Pro.

---

*Criado em junho de 2026. Revisar prioridades a cada sprint.*
