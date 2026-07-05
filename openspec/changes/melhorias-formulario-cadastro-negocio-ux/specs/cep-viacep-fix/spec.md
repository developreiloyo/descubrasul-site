## ADDED Requirements

### Requirement: viacep.com.br adicionado ao CSP connect-src
O arquivo `frontend/src/middleware.ts` SHALL incluir `https://viacep.com.br` na diretiva `connect-src` do header `Content-Security-Policy`. Sem essa configuração, o browser bloqueia silenciosamente o fetch para ViaCEP em produção.

#### Scenario: Fetch ViaCEP não é bloqueado pelo CSP em produção
- **WHEN** o componente `EnderecoCard` faz `fetch("https://viacep.com.br/ws/{cep}/json/")` no browser
- **THEN** a requisição é permitida pelo CSP e retorna dados de endereço

#### Scenario: CSP não permite domínios não autorizados após a correção
- **WHEN** o CSP é verificado
- **THEN** apenas os domínios explicitamente listados são permitidos em `connect-src` (sem uso de `*`)

---

### Requirement: Máscara XXXXX-XXX aplicada no campo CEP
O campo CEP no `EnderecoCard` SHALL aplicar máscara `XXXXX-XXX` em tempo real no `onChange` via função `maskCep(value: string): string` em `frontend/src/lib/masks.ts`.

#### Scenario: Digitação aplica máscara no CEP
- **WHEN** usuário digita `88801000` no campo CEP
- **THEN** o input exibe `88801-000`

#### Scenario: buscarCep funciona com CEP mascarado
- **WHEN** o campo contém `88801-000` e o usuário clica em "Buscar"
- **THEN** `buscarCep` extrai apenas dígitos (`88801000`) antes de chamar a API ViaCEP (já implementado com `cep.replace(/\D/g, '')`)

---

### Requirement: Fetch ViaCEP sempre ocorre no cliente, nunca no servidor
O componente `EnderecoCard` SHALL manter `'use client'` e o `fetch` para ViaCEP SHALL ser disparado apenas por interação do usuário (botão onClick ou `onBlur` do campo CEP) — nunca em `getServerSideProps` ou em Server Components.

#### Scenario: Componente é client-side
- **WHEN** `EnderecoCard` é renderizado
- **THEN** a diretiva `'use client'` está presente no topo do arquivo e nenhum import ou chamada a `fetch` ocorre no escopo de módulo (apenas dentro de funções de event handler)
