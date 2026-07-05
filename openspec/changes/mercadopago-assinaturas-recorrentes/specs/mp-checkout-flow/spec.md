## ADDED Requirements

### Requirement: Endpoint de checkout cria assinatura pendente e retorna redirect URL
`POST /api/planos/checkout/` (autenticado, comerciante) SHALL receber `{"plano_slug": "pro"}`, criar uma `Assinatura` com `status=pending` no banco, chamar a API MP para criar a subscription e retornar `{"checkout_url": "<init_point>"}`.

#### Scenario: Checkout válido para plano Pro
- **WHEN** comerciante autenticado faz `POST /api/planos/checkout/` com `{"plano_slug": "pro"}`
- **THEN** o endpoint retorna HTTP 200 com `{"checkout_url": "https://www.mercadopago.com.br/subscriptions/checkout?preapproval_plan_id=..."}` e cria `Assinatura` com `status=pending`

#### Scenario: Checkout com plano inválido retorna 400
- **WHEN** o body contém `{"plano_slug": "invalido"}`
- **THEN** o endpoint retorna HTTP 400 com mensagem de erro

#### Scenario: Checkout do plano gratuito é rejeitado
- **WHEN** o body contém `{"plano_slug": "gratuito"}`
- **THEN** o endpoint retorna HTTP 400 — plano gratuito não requer checkout

#### Scenario: Comerciante com assinatura authorized não pode fazer novo checkout sem cancelar
- **WHEN** o comerciante já tem uma `Assinatura` com `status=authorized` em qualquer plano
- **THEN** o endpoint retorna HTTP 409 com mensagem indicando para usar o endpoint de upgrade

---

### Requirement: Quota do Fundador é verificada antes do checkout
Antes de criar a assinatura MP para o plano Fundador, o sistema SHALL contar `Assinatura` com `plano__slug=fundador` e `status=authorized`. Se `count >= FUNDADOR_MAX_SLOTS`, o checkout SHALL ser rejeitado.

#### Scenario: Vagas do Fundador esgotadas
- **WHEN** existem 50 assinaturas Fundador ativas e um comerciante tenta `POST /api/planos/checkout/` com `plano_slug=fundador`
- **THEN** o endpoint retorna HTTP 409 com mensagem "Vagas do Plano Fundador esgotadas"

#### Scenario: Vagas disponíveis permitem checkout
- **WHEN** existem 49 assinaturas Fundador ativas
- **THEN** o checkout prossegue normalmente e cria a 50ª assinatura

---

### Requirement: Endpoint de status do checkout permite polling pelo frontend
`GET /api/planos/minha-assinatura/` (autenticado) SHALL retornar o status atual da `Assinatura` do comerciante autenticado: `plano_slug`, `status`, `data_proximo_cobranca`, ou `{"status": "gratuito"}` se não houver `Assinatura`.

#### Scenario: Comerciante com assinatura ativa
- **WHEN** `GET /api/planos/minha-assinatura/` é chamado por comerciante com `Assinatura` autorizada
- **THEN** retorna `{"plano_slug": "pro", "status": "authorized", "data_proximo_cobranca": "2026-08-05T00:00:00Z"}`

#### Scenario: Comerciante sem assinatura
- **WHEN** `GET /api/planos/minha-assinatura/` é chamado por comerciante no plano gratuito
- **THEN** retorna `{"status": "gratuito", "plano_slug": "gratuito"}`
