## ADDED Requirements

### Requirement: Página /planos exibe planos com preços dinâmicos do backend
A página `/planos` SHALL fazer SSR de `GET /api/planos/` para exibir os planos com preços reais (não hardcoded), cards comparativos de features, e CTAs que redirecionam para o checkout via `/painel/` (comerciante autenticado) ou `/painel/cadastro` (visitante). O plano Fundador SHALL exibir vagas restantes ou "Esgotado" se `disponivel: false`.

#### Scenario: Visitante visualiza planos com preços
- **WHEN** visitante acessa `/planos`
- **THEN** a página renderiza 4 cards com preços lidos da API, sem login necessário

#### Scenario: Fundador esgotado desabilita o CTA
- **WHEN** `vagas_restantes: 0` na resposta da API
- **THEN** o card Fundador exibe "Vagas esgotadas" e o botão está desabilitado

---

### Requirement: Seção "Meu Plano" no painel exibe status da assinatura atual
A rota `/painel/` (dashboard do comerciante) SHALL incluir um card "Meu Plano" com: nome do plano atual, status (Ativo / Pendente / Pausado / Cancelado), data da próxima cobrança (se ativa), e botões de ação contextuais.

#### Scenario: Painel de comerciante Pro ativo
- **WHEN** comerciante com `Assinatura` `authorized` no plano Pro acessa `/painel/`
- **THEN** o card exibe "Plano Pro — Ativo", data da próxima cobrança e botão "Fazer upgrade" para Produção

#### Scenario: Painel de comerciante gratuito
- **WHEN** comerciante sem assinatura acessa `/painel/`
- **THEN** o card exibe "Plano Gratuito" e botão "Fazer upgrade" que leva a `/planos`

#### Scenario: Painel exibe aviso para assinatura pausada
- **WHEN** `Assinatura.status = paused`
- **THEN** o card exibe alerta amarelo "Cobrança pendente — verifique seu método de pagamento no Mercado Pago"

---

### Requirement: Fluxo de upgrade/downgrade no painel redireciona para checkout MP
O botão de upgrade/downgrade no painel SHALL chamar `POST /api/planos/upgrade/` e redirecionar o comerciante para o `checkout_url` retornado. Após retorno do MP (URL de success/failure configurada), o painel exibe o novo status.

#### Scenario: Redirecionamento para pagamento no MP
- **WHEN** comerciante clica em "Fazer upgrade para Pro" no painel
- **THEN** o frontend chama `POST /api/planos/upgrade/` e redireciona para `checkout_url` no domínio mercadopago.com.br

#### Scenario: Retorno após pagamento bem-sucedido
- **WHEN** comerciante retorna do MP para `/painel/?payment=success`
- **THEN** o painel exibe mensagem de sucesso e o card "Meu Plano" mostra status atualizado (pode ser `pending` até webhook chegar)

---

### Requirement: Botão de cancelamento no painel solicita confirmação antes de cancelar
O painel SHALL exibir botão "Cancelar assinatura" que abre modal de confirmação com consequências claras (downgrade para gratuito, perda de features) antes de chamar `POST /api/planos/cancelar/`.

#### Scenario: Confirmação de cancelamento obrigatória
- **WHEN** comerciante clica em "Cancelar assinatura"
- **THEN** um modal de confirmação é exibido com texto das consequências e dois botões: "Manter plano" e "Confirmar cancelamento"

#### Scenario: Cancelamento confirmado atualiza o card imediatamente
- **WHEN** comerciante confirma cancelamento e a API retorna HTTP 200
- **THEN** o card "Meu Plano" atualiza para "Plano Gratuito" sem recarregar a página
