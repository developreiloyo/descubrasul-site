## ADDED Requirements

### Requirement: Campos de consentimento no model User
O model `User` (app `usuarios/`) SHALL ter os campos `lgpd_accepted_at` (DateTimeField, nullable) e `lgpd_accepted_ip` (GenericIPAddressField, nullable) para registrar o momento e IP do consentimento LGPD.

#### Scenario: Migration cria os campos sem quebrar usuários existentes
- **WHEN** a migration `0002_user_lgpd_fields` é executada em banco com usuários existentes
- **THEN** os campos são adicionados com `null=True`, sem erro, e os registros existentes ficam com `NULL` nos dois campos

---

### Requirement: Campo lgpd_accepted obrigatório no cadastro
O `CadastroSerializer` SHALL incluir o campo write-only `lgpd_accepted` (BooleanField) que MUST ser `True` para que o cadastro seja aceito.

#### Scenario: Cadastro sem marcar o checkbox
- **WHEN** POST `/api/usuarios/cadastro/` é feito com `lgpd_accepted: false` ou campo ausente
- **THEN** o endpoint retorna HTTP 400 com mensagem de erro no campo `lgpd_accepted`

#### Scenario: Cadastro com checkbox marcado
- **WHEN** POST `/api/usuarios/cadastro/` é feito com `lgpd_accepted: true` e dados válidos
- **THEN** o usuário é criado, `lgpd_accepted_at` recebe o timestamp UTC atual, `lgpd_accepted_ip` recebe o IP real do cliente

---

### Requirement: Registro do IP real do consentimento
O `CadastroView` SHALL capturar o IP real do cliente usando `HTTP_X_FORWARDED_FOR` (primeiro IP da lista) como prioridade, com fallback para `REMOTE_ADDR`, e passá-lo ao service de cadastro.

#### Scenario: Requisição via proxy Traefik em produção
- **WHEN** a requisição chega com header `X-Forwarded-For: 177.x.x.x, 10.0.0.1`
- **THEN** `lgpd_accepted_ip` recebe `177.x.x.x` (IP real do cliente, não do proxy)

#### Scenario: Requisição direta sem proxy em desenvolvimento
- **WHEN** a requisição chega sem header `X-Forwarded-For`
- **THEN** `lgpd_accepted_ip` recebe o valor de `REMOTE_ADDR`

---

### Requirement: Checkbox obrigatório no formulário de cadastro
O formulário em `/painel/cadastro` SHALL exibir um checkbox com texto "Li e aceito a [Política de Privacidade] e os [Termos de Uso]" onde os links abrem `/privacidade` e `/termos` respectivamente. O botão de submissão SHALL estar desabilitado enquanto o checkbox não for marcado.

#### Scenario: Tentativa de envio sem marcar checkbox
- **WHEN** o usuário tenta submeter o formulário sem marcar o checkbox
- **THEN** o botão permanece desabilitado (atributo `disabled`) e o formulário não é enviado

#### Scenario: Checkbox marcado habilita submissão
- **WHEN** o usuário marca o checkbox de consentimento
- **THEN** o botão de cadastro é habilitado e `lgpd_accepted: true` é incluído no payload do POST

#### Scenario: Links do checkbox navegam para as páginas corretas
- **WHEN** o usuário clica em "Política de Privacidade" no texto do checkbox
- **THEN** a navegação leva para `/privacidade`

#### Scenario: Link Termos de Uso navega corretamente
- **WHEN** o usuário clica em "Termos de Uso" no texto do checkbox
- **THEN** a navegação leva para `/termos`
