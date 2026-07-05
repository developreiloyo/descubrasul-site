## ADDED Requirements

### Requirement: Route group /backoffice/ com guard de role admin
O route group `src/app/backoffice/(admin)/` SHALL ter `layout.tsx` com `AdminNavbar` (logo + links: Dashboard, Negócios, Logs) e guard de role no middleware Next.js — qualquer usuário com role diferente de `admin` ou `superadmin` que acessar `/backoffice/*` SHALL ser redirecionado para `/painel/login`.

#### Scenario: Comerciante tenta acessar /backoffice/
- **WHEN** usuário autenticado com role `comerciante` acessa `/backoffice/`
- **THEN** é redirecionado para `/painel/login`

#### Scenario: Admin acessa /backoffice/ com sucesso
- **WHEN** usuário com role `admin` ou `superadmin` acessa `/backoffice/`
- **THEN** a página renderiza com `AdminNavbar` e o conteúdo do dashboard

---

### Requirement: Dashboard /backoffice/ exibe KPIs em cards
A página `/backoffice/` SHALL fazer fetch de `GET /api/proxy/negocios/admin/kpis/` e exibir cards com: total de negócios, pendentes de aprovação (com badge de alerta se > 0), suspensos, verificados, e breakdown por plano.

#### Scenario: Dashboard com negócios pendentes exibe alerta
- **WHEN** `kpis.pending > 0`
- **THEN** o card "Pendentes" exibe badge vermelho com o número e texto de alerta

#### Scenario: Dashboard atualiza sem recarregar a página
- **WHEN** admin aprova um negócio e retorna ao dashboard
- **THEN** os KPIs são atualizados (TanStack Query revalida após mutação)

---

### Requirement: Página /backoffice/negocios lista todos com filtros e ações inline
A página `/backoffice/negocios/` SHALL exibir tabela com colunas: Nome, Cidade, Plano, Status (badge colorido), Verificado, Data cadastro, e coluna de ações. As ações inline SHALL incluir: Aprovar (apenas para `pending`), Rejeitar (apenas para `pending`), Suspender (apenas para `active`), Reativar (apenas para `suspended`), Ver página pública. Os filtros de status, plano e campo de busca SHALL atualizar a tabela sem recarregar a página.

#### Scenario: Tabela filtra por status pending
- **WHEN** admin seleciona filtro "Pendentes" no select de status
- **THEN** a tabela exibe apenas negócios pending e o botão "Aprovar" fica disponível em cada linha

#### Scenario: Ação de aprovação atualiza a linha sem reload da página
- **WHEN** admin clica em "Aprovar" em uma linha da tabela
- **THEN** um modal de confirmação aparece; ao confirmar, a linha atualiza o badge para "Ativo" e o botão "Aprovar" some

#### Scenario: Ação de rejeição abre modal com campo de motivo obrigatório
- **WHEN** admin clica em "Rejeitar"
- **THEN** um modal abre com textarea para motivo (obrigatório); botão "Confirmar rejeição" fica desabilitado se motivo vazio

---

### Requirement: Página de detalhe /backoffice/negocios/[id] permite moderação de conteúdo
A página SHALL exibir todos os campos do negócio em modo de leitura, com seções editáveis para `descricao`, `historia` e `espaco_especial`. Cada seção editável SHALL ter botão "Editar" que ativa um textarea inline, e botão "Salvar" que chama `PATCH /api/proxy/negocios/admin/{id}/moderar-conteudo/`. A lista de produtos do negócio SHALL ter botão de ocultar/reativar por produto.

#### Scenario: Admin edita descrição com conteúdo moderado
- **WHEN** admin clica em "Editar" na seção de descrição, altera o texto e clica "Salvar"
- **THEN** `PATCH` é enviado, campo atualiza, toast de sucesso exibe

#### Scenario: Produto oculto mostra badge "Oculto pelo admin"
- **WHEN** `Produto.disponivel=False` e o produto foi ocultado via endpoint admin
- **THEN** o produto aparece na lista da página admin com badge vermelho "Oculto"
