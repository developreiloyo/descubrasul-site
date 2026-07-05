## ADDED Requirements

### Requirement: UI de dias de funcionamento com toggles visuais
O `HorarioCard` (ou componente `DiasAtendimentoCard` dedicado) SHALL exibir 7 toggles/checkboxes para os dias da semana: Seg, Ter, Qua, Qui, Sex, Sáb, Dom. Os dias marcados SHALL ser armazenados como array de slugs no `Negocio.dias_funcionamento` JSONField (ex: `["seg", "ter", "qua", "qui", "sex"]`). Os slugs usados devem ser compatíveis com a função `isAberto()` em `lib/utils.ts`.

#### Scenario: Seleção de dias atualiza o array
- **WHEN** comerciante marca Seg, Qua e Sex
- **THEN** `dias_funcionamento = ["seg", "qua", "sex"]` é enviado no PATCH

#### Scenario: Dias marcados aparecem destacados no formulário
- **WHEN** `dias_funcionamento = ["seg", "ter", "qua", "qui", "sex"]` é carregado
- **THEN** Seg, Ter, Qua, Qui e Sex aparecem visualmente marcados (cor primária); Sáb e Dom aparecem desmarcados

#### Scenario: Desmarcar todos os dias salva array vazio
- **WHEN** comerciante desmarca todos os dias e salva
- **THEN** `dias_funcionamento = []` é aceito pelo serializer

---

### Requirement: Serializer valida que dias_funcionamento contém apenas slugs válidos
O `NegocioPainelSerializer` SHALL ter `validate_dias_funcionamento` que rejeita qualquer slug fora de `["seg", "ter", "qua", "qui", "sex", "sab", "dom"]`.

#### Scenario: Array com slug inválido é rejeitado
- **WHEN** `dias_funcionamento = ["seg", "monday"]` é enviado
- **THEN** retorna HTTP 400 com mensagem de validação indicando o slug inválido

#### Scenario: Array vazio é aceito
- **WHEN** `dias_funcionamento = []` é enviado
- **THEN** o serializer aceita e salva array vazio

---

### Requirement: Componente FormField suporta prop required com asterisco
O componente `FormField` em `frontend/src/components/merchant/FormField.tsx` (ou equivalente) SHALL aceitar prop `required?: boolean`. Quando `required=true`, o label SHALL exibir `<span className="text-red-500 ml-0.5">*</span>` após o texto do label.

#### Scenario: Campo required exibe asterisco vermelho
- **WHEN** `<FormField label="Nome do negócio" required htmlFor="nome">` é renderizado
- **THEN** o label exibe "Nome do negócio *" com o asterisco em vermelho

#### Scenario: Campo sem required não exibe asterisco
- **WHEN** `<FormField label="Website" htmlFor="website">` sem a prop `required`
- **THEN** o label exibe apenas "Website" sem asterisco
