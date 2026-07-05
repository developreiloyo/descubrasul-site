## ADDED Requirements

### Requirement: Model Plano representa o catálogo de assinaturas
O model `Plano` (app `planos/`) SHALL ter os campos: `slug` (CharField, unique, choices: basico/pro/producao/fundador), `nome` (CharField), `preco_brl` (DecimalField), `frequencia` (CharField, choices: mensal/anual), `mp_plan_id` (CharField, nullable — ID do plano criado no Mercado Pago), `ativo` (BooleanField, default True), `max_slots` (IntegerField, nullable — apenas para Fundador).

#### Scenario: Catálogo de planos seedado corretamente
- **WHEN** o management command `sync_mp_plans` é executado com as vars de ambiente configuradas
- **THEN** existem 4 registros no model `Plano` (basico, pro, producao, fundador), cada um com `mp_plan_id` preenchido

#### Scenario: Preço lido de variável de ambiente
- **WHEN** `sync_mp_plans` é executado com `PRECO_PRO=197.00`
- **THEN** o `Plano` com slug `pro` tem `preco_brl = Decimal("197.00")`

---

### Requirement: Model Assinatura registra cada assinatura ativa
O model `Assinatura` (app `planos/`) SHALL ter: `negocio` (OneToOneField para `Negocio`, related_name='assinatura'), `plano` (ForeignKey para `Plano`), `mp_subscription_id` (CharField, unique, nullable), `status` (CharField, choices: pending/authorized/paused/cancelled), `data_inicio` (DateTimeField, nullable), `data_proximo_cobranca` (DateTimeField, nullable), `created_at` e `updated_at` (auto).

#### Scenario: Um negócio tem no máximo uma assinatura ativa
- **WHEN** um `Negocio` já tem uma `Assinatura` com status `authorized`
- **THEN** o banco rejeita a criação de uma segunda `Assinatura` para o mesmo `Negocio` (OneToOneField constraint)

#### Scenario: Assinatura registra ID externo do Mercado Pago
- **WHEN** o MP confirma criação da assinatura via webhook com `id: "2c938084726fca480172750000000000"`
- **THEN** `Assinatura.mp_subscription_id` recebe esse valor

---

### Requirement: Management command sync_mp_plans é idempotente
O management command `sync_mp_plans` SHALL criar os planos no MP se não existirem (campo `mp_plan_id` vazio no `Plano`) ou atualizar se já existirem, lendo todos os preços das variáveis de ambiente. O comando SHALL logar o resultado de cada operação.

#### Scenario: Primeira execução cria planos no MP
- **WHEN** `sync_mp_plans` é executado com `mp_plan_id` vazio em todos os `Plano`
- **THEN** 4 planos são criados no MP e os `mp_plan_id` são salvos no banco

#### Scenario: Execução repetida não duplica planos
- **WHEN** `sync_mp_plans` é executado novamente com `mp_plan_id` já preenchido
- **THEN** o comando chama o endpoint de UPDATE do MP para cada plano e não cria novos registros no banco

---

### Requirement: Cliente MP encapsula todas as chamadas à API externa
Todas as chamadas à API do Mercado Pago SHALL ser feitas via funções em `planos/services.py`, nunca diretamente em views ou models. O `MP_ACCESS_TOKEN` SHALL ser lido de `settings.MP_ACCESS_TOKEN` (oriundo de `os.environ`).

#### Scenario: Token ausente levanta ImproperlyConfigured
- **WHEN** `MP_ACCESS_TOKEN` não está definido no `.env` e o servidor inicia
- **THEN** Django levanta `ImproperlyConfigured` durante startup com mensagem explicativa
