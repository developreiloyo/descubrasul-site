## ADDED Requirements

### Requirement: Endpoint de webhook valida assinatura HMAC antes de processar
`POST /api/planos/webhook/` SHALL ser público (sem autenticação JWT) e verificar a assinatura do MP via HMAC-SHA256 usando o header `x-signature` e o `MP_WEBHOOK_SECRET`. Requests com assinatura inválida ou ausente SHALL retornar HTTP 400 imediatamente, sem processar o payload.

#### Scenario: Webhook com assinatura válida é aceito
- **WHEN** o MP envia `POST /api/planos/webhook/` com header `x-signature` correto
- **THEN** o endpoint retorna HTTP 200 e processa o evento

#### Scenario: Webhook com assinatura inválida é rejeitado
- **WHEN** um request chega com `x-signature` incorreto ou ausente
- **THEN** o endpoint retorna HTTP 400 sem executar nenhuma lógica de negócio

---

### Requirement: Webhook de subscription authorized ativa o plano do Negocio
Ao receber evento de subscription com `status: authorized`, o sistema SHALL: atualizar `Assinatura.status = authorized`, preencher `data_inicio` e `data_proximo_cobranca`, e atualizar `Negocio.plano` com o slug correspondente ao plano da assinatura.

#### Scenario: Primeiro pagamento autorizado ativa o plano
- **WHEN** webhook com `status: authorized` chega para `mp_subscription_id` com status anterior `pending`
- **THEN** `Assinatura.status = authorized`, `Negocio.plano = "pro"` (ou o plano correspondente), `data_inicio` preenchido

#### Scenario: Renovação mensal mantém plano ativo
- **WHEN** webhook com `status: authorized` chega para assinatura já `authorized`
- **THEN** apenas `data_proximo_cobranca` é atualizado — `Negocio.plano` permanece o mesmo

---

### Requirement: Webhook de subscription cancelled faz downgrade para gratuito
Ao receber evento com `status: cancelled`, o sistema SHALL atualizar `Assinatura.status = cancelled` e `Negocio.plano = "gratuito"`.

#### Scenario: Cancelamento derruba o plano para gratuito
- **WHEN** webhook com `status: cancelled` chega para assinatura `authorized`
- **THEN** `Assinatura.status = cancelled` e `Negocio.plano = "gratuito"`

---

### Requirement: Webhook é idempotente — mesmo evento processado duas vezes não causa efeito duplo
O handler SHALL verificar se o par `(mp_subscription_id, status)` já foi processado. Se o `status` recebido for igual ao `Assinatura.status` atual, o handler SHALL retornar HTTP 200 sem executar atualizações.

#### Scenario: Reenvio do mesmo webhook não altera dados
- **WHEN** o MP reenvia o mesmo evento `authorized` para uma assinatura já `authorized`
- **THEN** `Negocio.plano` não é alterado e o handler retorna HTTP 200

---

### Requirement: Webhook de subscription paused suspende acesso sem cancelar
Ao receber `status: paused` (falha de cobrança), o sistema SHALL atualizar `Assinatura.status = paused`. O `Negocio.plano` permanece no valor atual — o downgrade para gratuito ocorre apenas com `cancelled`.

#### Scenario: Falha de cobrança pausa sem downgrade imediato
- **WHEN** webhook com `status: paused` chega
- **THEN** `Assinatura.status = paused` e `Negocio.plano` permanece inalterado
