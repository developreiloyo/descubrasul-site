## 1. Backend — Setup e Dependências

- [ ] 1.1 Adicionar `mercadopago` ao `backend/requirements.txt`
- [ ] 1.2 Adicionar variáveis ao `.env`: `MP_ACCESS_TOKEN`, `MP_WEBHOOK_SECRET`, `MP_ENVIRONMENT`, `PRECO_BASICO`, `PRECO_PRO`, `PRECO_PRODUCAO`, `PRECO_FUNDADOR`, `FUNDADOR_MAX_SLOTS`
- [ ] 1.3 Adicionar leitura e validação dessas vars em `backend/core/settings/base.py` com `ImproperlyConfigured` se `MP_ACCESS_TOKEN` ausente em produção

## 2. Backend — Models e Migrations (app planos/)

- [ ] 2.1 Criar model `Plano` em `backend/planos/models.py` com campos: `slug`, `nome`, `preco_brl`, `frequencia`, `mp_plan_id`, `ativo`, `max_slots`
- [ ] 2.2 Criar model `Assinatura` em `backend/planos/models.py` com campos: `negocio` (OneToOneField), `plano` (FK), `mp_subscription_id`, `status`, `data_inicio`, `data_proximo_cobranca`, `created_at`, `updated_at`
- [ ] 2.3 Gerar migration `0001_initial` para o app `planos/` via `python manage.py makemigrations planos`
- [ ] 2.4 Registrar `Plano` e `Assinatura` no `backend/planos/admin.py` com campos de listagem úteis

## 3. Backend — Services (lógica MP isolada)

- [ ] 3.1 Criar `backend/planos/services.py` com função `create_mp_plan(plano)` que chama `POST /preapproval_plan` na API MP
- [ ] 3.2 Implementar `update_mp_plan(plano)` para sincronizar plano existente no MP
- [ ] 3.3 Implementar `create_mp_subscription(plano, negocio, back_url)` que chama `POST /preapproval` e retorna `init_point`
- [ ] 3.4 Implementar `cancel_mp_subscription(mp_subscription_id)` que chama `PUT /preapproval/{id}` com `status: cancelled`
- [ ] 3.5 Implementar `verify_webhook_signature(request_data, signature_header, secret)` com HMAC-SHA256

## 4. Backend — Management Command sync_mp_plans

- [ ] 4.1 Criar `backend/planos/management/commands/sync_mp_plans.py` que lê vars de ambiente e chama `create_mp_plan` ou `update_mp_plan` para cada plano
- [ ] 4.2 Garantir idempotência: se `Plano.mp_plan_id` já preenchido → chama update; se vazio → chama create e salva o ID retornado
- [ ] 4.3 Logar resultado de cada operação (criado/atualizado/erro) no stdout

## 5. Backend — Endpoints de Checkout e Lifecycle

- [ ] 5.1 Criar `backend/planos/serializers.py` com `CheckoutSerializer` (valida `plano_slug`), `AssinaturaSerializer` e `PlanoPublicoSerializer`
- [ ] 5.2 Criar `backend/planos/views.py` com `PlanoListView` (`GET /api/planos/`) — público, sem auth
- [ ] 5.3 Implementar `CheckoutView` (`POST /api/planos/checkout/`) — verifica quota Fundador, cria `Assinatura` pending, chama service, retorna `checkout_url`
- [ ] 5.4 Implementar `MinhaAssinaturaView` (`GET /api/planos/minha-assinatura/`) — retorna status da assinatura do usuário autenticado
- [ ] 5.5 Implementar `UpgradeView` (`POST /api/planos/upgrade/`) — cancela assinatura atual no MP + banco, inicia novo checkout
- [ ] 5.6 Implementar `CancelarView` (`POST /api/planos/cancelar/`) — cancela assinatura no MP, downgrade para gratuito
- [ ] 5.7 Criar `backend/planos/urls.py` e registrar em `backend/core/urls.py` com prefix `/api/planos/`
- [ ] 5.8 Configurar throttle nas views autenticadas (herda `user` 200/min) e throttle personalizado para `CheckoutView` se necessário

## 6. Backend — Webhook Handler

- [ ] 6.1 Implementar `WebhookView` (`POST /api/planos/webhook/`) — público, valida HMAC antes de qualquer processamento
- [ ] 6.2 Implementar handler para `status: authorized` — atualiza `Assinatura` + `Negocio.plano`
- [ ] 6.3 Implementar handler para `status: cancelled` — downgrade para gratuito
- [ ] 6.4 Implementar handler para `status: paused` — atualiza status sem downgrade
- [ ] 6.5 Garantir idempotência: checar `status == Assinatura.status` atual antes de processar
- [ ] 6.6 Implementar lógica de downgrade de produtos: quando `Negocio.plano` cai para gratuito/basico, ocultar produtos acima do limite do plano

## 7. Backend — Testes

- [ ] 7.1 Teste: `sync_mp_plans` idempotente (executar 2x não duplica no banco)
- [ ] 7.2 Teste: checkout com plano inválido retorna 400
- [ ] 7.3 Teste: checkout com Fundador esgotado retorna 409
- [ ] 7.4 Teste: webhook com assinatura inválida retorna 400 sem processar
- [ ] 7.5 Teste: webhook `authorized` atualiza `Assinatura.status` e `Negocio.plano`
- [ ] 7.6 Teste: webhook `cancelled` faz downgrade para gratuito
- [ ] 7.7 Teste: webhook idempotente (mesmo status enviado 2x não altera dados)
- [ ] 7.8 Teste de isolamento: comerciante A não vê/altera assinatura do comerciante B

## 8. Frontend — Página /planos

- [ ] 8.1 Refatorar `frontend/src/app/planos/page.tsx` para Server Component com fetch SSR de `GET /api/planos/`
- [ ] 8.2 Renderizar 4 cards de plano com preços, features e CTA dinâmico
- [ ] 8.3 Card Fundador: exibir vagas restantes ou badge "Esgotado" + botão desabilitado quando `disponivel: false`
- [ ] 8.4 CTA para visitante → `/painel/cadastro`; CTA para comerciante autenticado → chama checkout

## 9. Frontend — Painel "Meu Plano"

- [ ] 9.1 Criar componente `frontend/src/components/merchant/MeuPlanoCard.tsx` que consulta `GET /api/proxy/planos/minha-assinatura/`
- [ ] 9.2 Renderizar nome do plano, badge de status (Ativo/Pendente/Pausado), data da próxima cobrança
- [ ] 9.3 Exibir alerta amarelo para status `paused`
- [ ] 9.4 Adicionar botões contextuais: "Fazer upgrade" (gratuito/basico/pro) e "Gerenciar plano" (pro/producao)
- [ ] 9.5 Inserir `MeuPlanoCard` no dashboard `/painel/` (`frontend/src/app/painel/(panel)/page.tsx`)

## 10. Frontend — Fluxo de Upgrade e Cancelamento

- [ ] 10.1 Implementar chamada `POST /api/proxy/planos/upgrade/` com redirect para `checkout_url`
- [ ] 10.2 Implementar página de retorno `/painel/?payment=success` com mensagem de confirmação e polling do status
- [ ] 10.3 Implementar modal de confirmação de cancelamento com lista de consequências
- [ ] 10.4 Implementar chamada `POST /api/proxy/planos/cancelar/` e atualização otimista do card
