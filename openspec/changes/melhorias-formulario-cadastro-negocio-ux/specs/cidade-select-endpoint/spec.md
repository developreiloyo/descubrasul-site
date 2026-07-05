## ADDED Requirements

### Requirement: Endpoint público retorna lista de cidades atendidas
`GET /api/cidades/` (público, sem autenticação) SHALL retornar a lista fixa de cidades atendidas pelo DescubraSul como array de objetos `[{"slug": "criciuma", "nome": "Criciúma"}, ...]`. As cidades são: Criciúma, Içara, Araranguá, Tubarão, Forquilhinha, Morro da Fumaça, Balneário Rincão. A lista SHALL ser lida de `core/constants.py` — sem tabela de banco.

#### Scenario: Listagem de cidades retorna 7 itens
- **WHEN** `GET /api/cidades/` é chamado sem autenticação
- **THEN** retorna HTTP 200 com array de 7 objetos, cada um com `slug` e `nome`

#### Scenario: Cidade com caractere especial tem slug sem acento
- **WHEN** a lista é retornada
- **THEN** o slug de "Içara" é `icara` e o slug de "Araranguá" é `ararangua`

---

### Requirement: Serializer valida que cidade pertence à lista permitida
O `NegocioPainelSerializer` e o `CadastroSerializer` SHALL ter `validate_cidade` que rejeita qualquer valor não presente em `CIDADES_ATENDIDAS`. A validação ocorre apenas para escrita (PATCH/POST) — leitura não valida.

#### Scenario: Cidade válida é aceita
- **WHEN** `PATCH /api/negocios/painel/meu-negocio/` com `{"cidade": "Criciúma"}`
- **THEN** o update é aceito (HTTP 200)

#### Scenario: Cidade inválida é rejeitada
- **WHEN** `PATCH` com `{"cidade": "São Paulo"}`
- **THEN** retorna HTTP 400 com mensagem "Cidade não atendida pelo DescubraSul"

---

### Requirement: Select de cidade no painel busca opções do backend
Os formulários de cadastro e edição de negócio SHALL substituir o `<input type="text">` de cidade por `<select>` cujas opções são carregadas de `GET /api/cidades/` (via fetch no mount do componente, não hardcoded no JSX).

#### Scenario: Select carrega opções dinamicamente
- **WHEN** o componente `InformacoesBasicasCard` é montado
- **THEN** o `<select>` de cidade exibe as 7 opções vindas da API

#### Scenario: Valor atual do negócio aparece pré-selecionado
- **WHEN** o formulário de edição é carregado com `cidade = "Içara"`
- **THEN** "Içara" está selecionado no `<select>`

---

### Requirement: Select de categoria exibe ícone + nome e respeita ordem e status
O `<select>` de categoria nos formulários SHALL exibir cada opção como `{icone} {nome}` (ex: "🍽️ Restaurantes"), ordenado por `categoria.ordem`, e SHALL omitir categorias com `ativo=false`.

#### Scenario: Categorias inativas não aparecem no select
- **WHEN** existe uma categoria com `ativo=false` e o formulário é carregado
- **THEN** essa categoria não aparece entre as opções do `<select>`

#### Scenario: Ícone prefixado no texto da opção
- **WHEN** categoria tem `icone = "🍽️"` e `nome = "Restaurantes"`
- **THEN** a opção renderizada é `🍽️ Restaurantes`

#### Scenario: Campos obrigatórios têm asterisco vermelho
- **WHEN** qualquer formulário do painel (cadastro, meu-negocio, produto) é renderizado
- **THEN** campos marcados como `required` exibem `*` vermelho ao lado do label
