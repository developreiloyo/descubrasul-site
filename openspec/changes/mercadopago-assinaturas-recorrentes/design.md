## Context

O app `planos/` existe no projeto mas está completamente vazio — apenas arquivos stub gerados pelo Django. O model `Negocio` já possui o campo `plano` (CharField com choices: gratuito/basico/pro/producao/fundador) e uma propriedade `plano` no `User` como atalho. Essa estrutura foi criada antecipando este sistema de assinaturas. A integração usa a API **Mercado Pago Subscriptions** (endpoint `/preapproval_plan` para planos e `/preapproval` para assinaturas), que é o produto de recorrência da MP para o Brasil.

## Goals / Non-Goals

**Goals:**
- Implementar `planos/` com models `Plano` (catálogo interno + ID externo MP) e `Assinatura` (vínculo entre Negocio e MP, com status e histórico)
- Management command para criar/sincronizar os planos no MP a partir das vars de ambiente
- Checkout flow: endpoint que cria assinatura no MP e retorna `init_point` para redirect
- Webhook handler com validação HMAC, idempotência e processamento de status
- Upgrade/downgrade: cancela assinatura MP atual e cria nova no plano destino
- Controle de quota do Fundador (50 vagas — `FUNDADOR_MAX_SLOTS` via env)
- Frontend: `/planos` dinâmico com preços do backend; seção "Meu Plano" no painel

**Non-Goals:**
- Compra avulsa (pagamento único) — é um sistema separado (`promocoes/` app futuro)
- Notificações por e-mail de cobrança — fase 2
- Painel de admin para gerenciar assinaturas manualmente — fase 2
- Recuperação automática de falhas de cobrança (dunning) — fase 2
- Split payment ou marketplace MP — fora do escopo

## Decisions

### Decisão 1: Usar Mercado Pago Preapproval (Subscriptions) e não Payments recorrentes

**Escolhido**: API `/preapproval_plan` + `/preapproval` — produto nativo de recorrência do MP.

**Alternativa rejeitada**: Pagamento único com re-cobrança manual via cron.

**Rationale**: A API Subscriptions gerencia o ciclo de cobrança automaticamente, notifica via webhook e isola a responsabilidade de retry do side do MP. Menos código crítico para manter.

---

### Decisão 2: Dois models — Plano (catálogo) + Assinatura (instância ativa)

**Escolhido**: `Plano` armazena o catálogo interno (nome, preço_brl, frequência, features) + `mp_plan_id` (ID do plano criado no MP). `Assinatura` é a instância por negócio: FK para `Plano`, FK para `Negocio`, `mp_subscription_id`, status, timestamps.

**Alternativa rejeitada**: Apenas `Assinatura` sem `Plano` separado.

**Rationale**: `Plano` desacopla o catálogo da instância — facilita mudar preços no futuro sem mexer em `Assinatura` ativa. O `mp_plan_id` é necessário para criar assinaturas no MP (a API exige o ID do plano).

---

### Decisão 3: Preços lidos de variáveis de ambiente no management command

**Escolhido**: O management command `sync_mp_plans` lê `PRECO_BASICO`, `PRECO_PRO`, `PRECO_PRODUCAO`, `PRECO_FUNDADOR` e cria/atualiza os planos no MP e no banco. O código nunca usa valores numéricos hardcoded.

**Rationale**: Permite ajustar preços sem redeploy de código. O seed é idempotente — se o plano já existe no MP (mesmo `mp_plan_id` salvo no `Plano`), apenas atualiza.

---

### Decisão 4: Upgrade/downgrade via cancel + re-create, não via update de assinatura MP

**Escolhido**: Para trocar de plano, cancela a assinatura MP atual e cria nova assinatura no novo plano.

**Alternativa rejeitada**: Usar endpoint de update da assinatura MP para trocar o plano.

**Rationale**: A API MP Subscriptions não suporta troca de plano em assinatura existente de forma confiável. Cancel + re-create é o padrão documentado pela MP para mudança de plano, com pró-rata gerenciado externamente.

---

### Decisão 5: Webhook com idempotência via `mp_subscription_id` + `status`

**Escolhido**: Ao receber webhook, verificar se o par `(mp_subscription_id, status)` já foi processado antes de executar qualquer ação. Armazenar o `status` atual no `Assinatura`.

**Rationale**: O MP pode reenviar o mesmo webhook múltiplas vezes. Sem idempotência, o `Negocio.plano` pode ser atualizado incorretamente. Um campo `last_webhook_status` + verificação de `status == current_status` antes de processar resolve.

---

### Decisão 6: Validação do webhook via HMAC-SHA256 com `MP_WEBHOOK_SECRET`

**Escolhido**: Verificar o header `x-signature` enviado pelo MP usando o secret configurado no dashboard MP + `MP_WEBHOOK_SECRET` no `.env`.

**Rationale**: Sem validação de assinatura, qualquer request POST ao `/api/planos/webhook/` poderia acionar upgrades fraudulentos de plano. É a medida de segurança mais crítica desta feature.

---

### Decisão 7: Quota do Fundador via Redis lock + DB count

**Escolhido**: No checkout do plano Fundador, antes de criar a assinatura no MP, fazer `SELECT COUNT(*) WHERE plano='fundador' AND status='authorized'` com `SELECT ... FOR UPDATE` para evitar race condition. Retornar HTTP 409 se `>= FUNDADOR_MAX_SLOTS`.

**Rationale**: Redis lock adiciona complexidade; o volume esperado de checkouts simultâneos é muito baixo para o lançamento. O `FOR UPDATE` no Postgres é suficiente e mais simples.

## Risks / Trade-offs

- **[Risco] Webhook chega antes do redirect do usuário** → O status da `Assinatura` é atualizado pelo webhook; o frontend do painel consulta o status via `GET /api/planos/minha-assinatura/` — não depende de ordem de chegada.
- **[Risco] MP muda a API Subscriptions** → Toda lógica de chamada à API fica em `planos/services.py` — mudanças isoladas sem afetar views ou models.
- **[Risco] Fundador esgotado durante checkout** → Retorna HTTP 409 com mensagem PT-BR para o frontend exibir. Frontend desabilita o botão via `GET /api/planos/` que inclui `available_slots` no Fundador.
- **[Trade-off] Cancel + re-create no upgrade** → O comerciante perde os dias restantes do ciclo atual. Isso deve ser documentado claramente na UI de upgrade — "sua cobrança será reiniciada no novo ciclo".
- **[Risco] `MP_ACCESS_TOKEN` em sandbox vs produção** → Usar `MP_ENVIRONMENT=sandbox|production` para diferenciar. Logs explícitos ao iniciar o servidor indicam qual ambiente está ativo.

## Migration Plan

1. Gerar migrations iniciais do app `planos/` com `Plano` e `Assinatura`
2. Adicionar `mercadopago` ao `requirements.txt`
3. Adicionar variáveis ao `.env` (sandbox) e ao `.env.prod` (produção)
4. Rodar `python manage.py sync_mp_plans` para criar planos no MP sandbox
5. Configurar URL do webhook no dashboard MP → `https://descubrasul.com/api/planos/webhook/`
6. Deploy backend → frontend
7. Rollback: os models `Plano` e `Assinatura` são novos — `RemoveField`/drop table sem impacto em dados existentes. `Negocio.plano` continua como estava (gratuito por padrão).

## Open Questions

- **Pró-rata no upgrade**: cobrar o comerciante pela diferença de dias ou absorver o custo até o próximo ciclo?
- **Grace period**: quantos dias após falha de cobrança o acesso Premium permanece ativo antes de downgrade automático para gratuito?
- **E-mail de confirmação**: implementar junto nesta sprint ou deixar para fase 2? (requer SMTP configurado)
- **Plano Fundador — renovação anual**: no segundo ano o preço segue o mesmo `PRECO_FUNDADOR`? Ou converte para Pro (R$197/mês)?
