## ADDED Requirements

### Requirement: Máscara de celular brasileiro aplicada no input de WhatsApp
O campo de WhatsApp nos formulários de cadastro e edição SHALL aplicar máscara `+55 (XX) XXXXX-XXXX` em tempo real no `onChange`, usando função utilitária `maskPhone(value: string): string` em `frontend/src/lib/masks.ts`. Apenas dígitos são aceitos no input.

#### Scenario: Digitação aplica máscara progressivamente
- **WHEN** usuário digita `48999991234` no campo WhatsApp
- **THEN** o input exibe `+55 (48) 99999-1234`

#### Scenario: Colar número já formatado mantém máscara
- **WHEN** usuário cola `+55 (48) 99999-1234`
- **THEN** o input mantém a formatação sem duplicar o prefixo `+55`

#### Scenario: Caracteres não-dígitos são ignorados
- **WHEN** usuário tenta digitar letras no campo WhatsApp
- **THEN** o input não aceita os caracteres e permanece apenas com dígitos e formatação

---

### Requirement: Serializer valida dígitos do WhatsApp
O `NegocioPainelSerializer` e `CadastroSerializer` SHALL ter `validate_whatsapp` que extrai apenas dígitos do valor recebido e valida: mínimo 10 dígitos (com DDD), máximo 11 dígitos (celular com 9). O valor salvo no banco SHALL ser apenas dígitos (sem formatação).

#### Scenario: Número válido de celular com 11 dígitos
- **WHEN** `whatsapp = "+55 (48) 99999-1234"` é enviado
- **THEN** o serializer extrai `"48999991234"` (11 dígitos) e salva sem formatação

#### Scenario: Número com menos de 10 dígitos é rejeitado
- **WHEN** `whatsapp = "4899"` é enviado
- **THEN** retorna HTTP 400 com mensagem de validação

#### Scenario: Número com mais de 11 dígitos é rejeitado
- **WHEN** `whatsapp = "554899999123456"` é enviado
- **THEN** retorna HTTP 400 com mensagem de validação

---

### Requirement: Bairro duplicado removido do formulário de edição
O formulário `/painel/(panel)/meu-negocio/` SHALL exibir apenas um campo de bairro, vinculado a `localizacao.bairro`. O campo `Negocio.bairro` SHALL ser removido do payload editável do formulário (não do model). O signal `preencher_direccao_fmt` SHALL ser estendido para sincronizar `Negocio.bairro` a partir de `Localizacao.bairro` ao salvar uma `Localizacao`.

#### Scenario: Formulário exibe apenas um campo bairro
- **WHEN** o formulário de edição do negócio é renderizado
- **THEN** existe apenas um campo "Bairro" visível, correspondente a `localizacao.bairro`

#### Scenario: Salvar endereço sincroniza bairro no Negocio
- **WHEN** o comerciante salva `localizacao.bairro = "Centro"` via PATCH
- **THEN** `Negocio.bairro` também é atualizado para `"Centro"` pelo signal
