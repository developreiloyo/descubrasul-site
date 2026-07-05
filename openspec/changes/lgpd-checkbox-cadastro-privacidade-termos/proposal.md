## Why

O DescubraSul coleta dados pessoais de comerciantes (nome, e-mail, WhatsApp, CNPJ futuro) no cadastro — sem o consentimento explícito exigido pela LGPD (Lei 13.709/2018), o site opera fora da conformidade legal, expondo a empresa a sanções da ANPD. O lançamento não pode ocorrer sem esse bloco de conformidade no fluxo de onboarding.

## What Changes

- Adicionar campo `lgpd_accepted_at` (DateTimeField nullable) no model `User` com migration correspondente
- Adicionar campo `lgpd_accepted_ip` (GenericIPAddressField nullable) para registro de IP do consentimento
- Serializer `CadastroSerializer` deve exigir `lgpd_accepted: true` como campo obrigatório na validação
- Endpoint `POST /api/usuarios/cadastro/` salva timestamp e IP do consentimento no banco
- Frontend `/painel/cadastro`: adicionar checkbox "Li e aceito a [Política de Privacidade] e os [Termos de Uso]" — bloqueante (não deixa submeter o form sem marcar)
- Página `/privacidade`: conteúdo completo conforme LGPD — controlador, dados coletados, finalidade, retenção, direitos do titular, DPO
- Página `/termos`: conteúdo completo — objeto do serviço, planos, obrigações, limitação de responsabilidade, foro

## Capabilities

### New Capabilities

- `lgpd-consent`: Consentimento LGPD no cadastro — checkbox obrigatório no frontend + persistência de timestamp/IP no backend (model `User`, serializer, endpoint)
- `privacy-policy-page`: Página `/privacidade` com conteúdo legal completo (LGPD-compliant, SSR, Schema JSON-LD `WebPage`)
- `terms-of-use-page`: Página `/termos` com conteúdo legal completo (objeto do serviço, planos, foro Criciúma/SC, SSR, Schema JSON-LD `WebPage`)

### Modified Capabilities

_(nenhuma especificação existente sofre alteração de requisitos)_

## Impact

- **App Django afetado**: `usuarios/` — model `User`, `CadastroSerializer`, `CadastroView`
- **Migração de banco**: Sim — novos campos `lgpd_accepted_at` e `lgpd_accepted_ip` em `usuarios_user`
- **Frontend afetado**: `src/app/painel/cadastro/page.tsx`, `src/app/privacidade/page.tsx`, `src/app/termos/page.tsx`
- **SEO**: Páginas `/privacidade` e `/termos` recebem `generateMetadata()` + JSON-LD `WebPage`
- **Sem impacto** em: Mercado Pago, analytics, categorias, negocios, planos
- **Sem breaking changes** em endpoints existentes (campo `lgpd_accepted` é validado apenas no cadastro)
