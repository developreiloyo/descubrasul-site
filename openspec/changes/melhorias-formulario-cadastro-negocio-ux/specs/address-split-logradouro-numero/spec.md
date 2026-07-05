## ADDED Requirements

### Requirement: Localizacao tem campos logradouro e numero separados
O model `Localizacao` SHALL ter `logradouro` (CharField, max_length=200, blank=False) e `numero` (CharField, max_length=20, blank=True) em vez do campo único `direccao`. A migration SHALL usar `RunPython` para migrar dados existentes: se `direccao` contém vírgula, split em `logradouro` (antes da vírgula) e `numero` (depois da vírgula, trimado); caso contrário, `logradouro = direccao` e `numero = ""`.

#### Scenario: Migration preserva dados existentes com padrão "Rua X, 123"
- **WHEN** `Localizacao.direccao = "Rua das Flores, 123"` antes da migration
- **THEN** após a migration: `logradouro = "Rua das Flores"`, `numero = "123"`

#### Scenario: Migration preserva dados sem vírgula
- **WHEN** `Localizacao.direccao = "Avenida Brasil"` (sem número)
- **THEN** após a migration: `logradouro = "Avenida Brasil"`, `numero = ""`

---

### Requirement: Serializer de Localizacao aceita logradouro e numero
O `LocalizacaoSerializer` e o `LocalizacaoPainelSerializer` SHALL substituir o campo `direccao` pelos campos `logradouro` e `numero`. O `direccao_fmt` SHALL ser gerado pelo signal a partir de `logradouro`, `numero`, `bairro` e `cidade`.

#### Scenario: PATCH com logradouro e numero atualiza direccao_fmt
- **WHEN** `PATCH /api/negocios/painel/meu-negocio/` com `{"localizacao": {"logradouro": "Rua XV de Novembro", "numero": "500", "bairro": "Centro", "cidade": "Criciúma"}}`
- **THEN** `Localizacao.direccao_fmt = "Rua XV de Novembro, 500, Centro, Criciúma"`

#### Scenario: Numero vazio não gera vírgula dupla no direccao_fmt
- **WHEN** `numero = ""`
- **THEN** `direccao_fmt = "Rua XV de Novembro, Centro, Criciúma"` (sem `, ,`)

---

### Requirement: Formulário exibe dois campos separados Rua e Número
O `EnderecoCard` SHALL exibir dois inputs distintos: "Logradouro / Rua" (obrigatório) e "Número" (opcional, placeholder "S/N"). Os dois campos devem compor o grid de endereço junto com CEP, Bairro, Cidade e Estado.

#### Scenario: Campo logradouro pré-preenchido pelo ViaCEP
- **WHEN** ViaCEP retorna `logradouro: "Rua das Flores"` para o CEP buscado
- **THEN** o campo "Logradouro / Rua" é preenchido automaticamente e o campo "Número" permanece vazio para o comerciante preencher

#### Scenario: Número com "S/N" é aceito pelo serializer
- **WHEN** `numero = "S/N"` é enviado
- **THEN** o serializer aceita (CharField sem validação de dígitos)
