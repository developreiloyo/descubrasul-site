## Why

O DescubraSul não tem como monetizar — o app `planos/` está vazio e comerciantes são criados diretamente no plano gratuito, sem nenhum fluxo de assinatura. Implementar as assinaturas recorrentes via Mercado Pago é o pré-requisito direto para o lançamento comercial: sem isso, não há receita.

## What Changes

- Implementar o app `planos/` com os models `Plano` (catálogo interno) e `Assinatura` (vínculo entre `Negocio` e um plano MP ativo)
- Criar planos de pré-autorização no Mercado Pago via API (usando IDs de plano MP externos armazenados no `Plano`)
- Endpoint de checkout: cria a assinatura no MP e retorna redirect URL para o comerciante concluir o pagamento
- Webhook `POST /api/planos/webhook/` para receber eventos MP (`authorized`, `cancelled`, `paused`, `pending`) e atualizar o status da `Assinatura` e o campo `plano` no `Negocio`
- Lógica de upgrade e downgrade entre planos (cancela assinatura atual no MP, cria nova)
- Limite de vagas do plano Fundador (50 assinaturas ativas máximo — verificado no checkout)
- Preços lidos de variáveis de ambiente `PRECO_BASICO`, `PRECO_PRO`, `PRECO_PRODUCAO`, `PRECO_FUNDADOR` — nunca hardcoded
- Frontend: página `/planos` com cards comparativos e CTA de assinatura; seção "Meu Plano" no painel com status, próxima cobrança e botões de upgrade/downgrade

## Capabilities

### New Capabilities

- `mp-subscription-core`: Models `Plano` e `Assinatura` no app `planos/`, cliente HTTP para a API Mercado Pago Subscriptions, management command para seed/sync dos planos no MP
- `mp-checkout-flow`: Endpoint de checkout — cria `Assinatura` pendente no banco, chama MP para criar a subscription e retorna `init_point` URL para redirect do comerciante
- `mp-webhook-handler`: Endpoint `POST /api/planos/webhook/` — valida assinatura HMAC do MP, processa eventos de subscription e atualiza status da `Assinatura` + campo `plano` no `Negocio`
- `plan-lifecycle`: Lógica de upgrade/downgrade, cancelamento, controle de quota do Fundador (máx 50 vagas), sincronização de status pendente → ativo → cancelado
- `subscription-painel`: Frontend — página `/planos` com comparativo de planos e CTAs; seção "Meu Plano" no painel com status atual, data da próxima cobrança, histórico e ações de upgrade/downgrade

### Modified Capabilities

_(nenhuma especificação existente sofre alteração de requisitos)_

## Impact

- **App Django afetado**: `planos/` (implementação completa a partir do zero) + `negocios/` (leitura do campo `plano` já existente no `Negocio`)
- **Migração de banco**: Sim — novos models `Plano` e `Assinatura` no app `planos/`
- **Nova dependência Python**: `mercadopago` SDK oficial (`pip install mercadopago`)
- **Novas variáveis de ambiente**: `MP_ACCESS_TOKEN`, `MP_WEBHOOK_SECRET`, `PRECO_BASICO`, `PRECO_PRO`, `PRECO_PRODUCAO`, `PRECO_FUNDADOR`, `FUNDADOR_MAX_SLOTS` (default 50)
- **Frontend afetado**: `src/app/planos/page.tsx` (refatorar de estático para dinâmico com preços do backend), `src/app/painel/` (nova seção "Meu Plano")
- **Sem impacto em SEO**: páginas de planos já existem; nenhuma página nova pública além da existente `/planos`
- **Sem breaking changes** nos endpoints existentes de `negocios/` — o campo `plano` no `Negocio` já existe e continua sendo lido da mesma forma
