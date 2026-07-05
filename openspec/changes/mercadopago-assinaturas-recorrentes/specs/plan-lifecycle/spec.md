## ADDED Requirements

### Requirement: Endpoint de upgrade cancela assinatura atual e inicia checkout do novo plano
`POST /api/planos/upgrade/` (autenticado, comerciante) SHALL receber `{"plano_slug": "<destino>"}`, cancelar a assinatura MP atual via API, atualizar `Assinatura.status = cancelled` localmente, e retornar `{"checkout_url": "..."}` para o novo plano — o mesmo fluxo do checkout inicial.

#### Scenario: Upgrade de Básico para Pro
- **WHEN** comerciante com assinatura `basico` autorizada faz `POST /api/planos/upgrade/` com `{"plano_slug": "pro"}`
- **THEN** a assinatura Básico é cancelada no MP, `Assinatura.status = cancelled`, e o endpoint retorna `checkout_url` do plano Pro

#### Scenario: Upgrade para o mesmo plano é rejeitado
- **WHEN** o `plano_slug` do body é igual ao plano atual do comerciante
- **THEN** o endpoint retorna HTTP 400 com mensagem "Você já está neste plano"

#### Scenario: Upgrade sem assinatura ativa redireciona para checkout normal
- **WHEN** comerciante sem `Assinatura` faz `POST /api/planos/upgrade/`
- **THEN** o endpoint retorna HTTP 400 indicando usar `/api/planos/checkout/`

---

### Requirement: Endpoint de cancelamento permite que o comerciante cancele sua assinatura
`POST /api/planos/cancelar/` (autenticado, comerciante) SHALL cancelar a assinatura MP via API e atualizar `Assinatura.status = cancelled` + `Negocio.plano = gratuito`.

#### Scenario: Cancelamento voluntário pelo comerciante
- **WHEN** comerciante autenticado faz `POST /api/planos/cancelar/`
- **THEN** a assinatura é cancelada no MP, `Assinatura.status = cancelled`, `Negocio.plano = gratuito`, retorna HTTP 200

#### Scenario: Cancelamento sem assinatura ativa retorna 400
- **WHEN** comerciante no plano gratuito faz `POST /api/planos/cancelar/`
- **THEN** retorna HTTP 400 com mensagem "Nenhuma assinatura ativa para cancelar"

---

### Requirement: Endpoint público retorna lista de planos disponíveis com vagas do Fundador
`GET /api/planos/` (público, sem autenticação) SHALL retornar a lista de planos ativos com `slug`, `nome`, `preco_brl`, `frequencia`, e para o Fundador inclui `vagas_restantes` calculado em tempo real.

#### Scenario: Listagem pública retorna planos com preços
- **WHEN** `GET /api/planos/` é chamado sem autenticação
- **THEN** retorna lista com os 4 planos pagos (basico, pro, producao, fundador) com `preco_brl` e `frequencia`

#### Scenario: Fundador com vagas esgotadas é marcado como indisponível
- **WHEN** existem 50 assinaturas Fundador ativas e `GET /api/planos/` é chamado
- **THEN** o plano Fundador retorna `vagas_restantes: 0` e `disponivel: false`

---

### Requirement: Downgrade de plano preserva dados mas reduz limites imediatamente
Quando `Negocio.plano` é atualizado para um plano inferior (via webhook de cancelamento ou upgrade), os limites de produtos e features são aplicados imediatamente — produtos acima do limite ficam ocultos automaticamente, não excluídos.

#### Scenario: Downgrade de Pro para gratuito oculta produtos acima do limite
- **WHEN** `Negocio.plano` muda de `pro` para `gratuito` e o negócio tem 15 produtos
- **THEN** os 10 produtos mais recentes ficam com `disponivel=True` e os demais ficam `disponivel=False` (lógica existente de `ocultar_produtos_vencidos` pode ser adaptada)
