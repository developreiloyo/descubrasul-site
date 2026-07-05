## Why

Os formulários de cadastro e edição de negócio do painel têm 8 problemas de UX e validação que degradam a qualidade dos dados cadastrados e geram atrito desnecessário para o comerciante: campos de texto livre onde deveriam ser selects, máscara de celular ausente, campos duplicados, integração ViaCEP quebrada em produção por bloqueio CSP, e ausência de indicadores visuais de campos obrigatórios. Esses problemas precisam ser resolvidos antes do lançamento comercial para garantir a integridade dos dados.

## What Changes

1. **CIDADE** — Substituir campo de texto livre por select com lista fixa de 7 cidades (Criciúma, Içara, Araranguá, Tubarão, Forquilhinha, Morro da Fumaça, Balneário Rincão). Novo endpoint `GET /api/cidades/` retorna a lista; validação no serializer `NegocioPainelSerializer` e `CadastroSerializer`.
2. **CATEGORIAS** — Select do painel exibe ícone emoji + nome, ordenado por `ordem`, sem categorias inativas. Já consumido via `GET /api/categorias/`.
3. **WHATSAPP/TELEFONE** — Máscara `+55 (XX) XXXXX-XXXX` no frontend sem lib externa; validação no `NegocioPainelSerializer`: mínimo 10, máximo 11 dígitos sem formatação.
4. **CAMPOS OBRIGATÓRIOS** — Asterisco `*` vermelho em todos os `<label>` de campos `required` nos formulários: cadastro, meu-negocio, produto.
5. **BAIRRO DUPLICADO** — Remover `bairro` do `Negocio` do formulário de edição; manter apenas `Localizacao.bairro`. Ambos os campos existem no model — o formulário expõe os dois; corrigir para mostrar apenas um.
6. **CEP/ViaCEP** — Causa raiz identificada: `viacep.com.br` está fora do `connect-src` do CSP em `frontend/src/middleware.ts`. Correção: adicionar `https://viacep.com.br` ao `connect-src`. Garantir que o fetch é sempre Client-side (já é — `buscarCep` está em `EnderecoCard` com `'use client'`). Aplicar máscara `XXXXX-XXX` no campo CEP.
7. **RUA E NÚMERO** — Separar `Localizacao.direccao` (CharField único) em `logradouro` (CharField, max 200) e `numero` (CharField, max 20). Migration com `RunPython` para migrar dados existentes. Atualizar serializer e formulário.
8. **DIAS DE ATENDIMENTO** — `Negocio.dias_funcionamento` já existe como `JSONField(default=list)`. Criar UI com 7 checkboxes/toggles (Seg–Dom) no `HorarioCard` ou card dedicado no painel.

## Capabilities

### New Capabilities

- `cidade-select-endpoint`: Endpoint `GET /api/cidades/` retorna lista de cidades atendidas; validação no serializer backend — sem hardcode no frontend
- `whatsapp-mask-validation`: Máscara de celular brasileiro no frontend (sem lib) + validação de dígitos no serializer
- `cep-viacep-fix`: Correção do CSP + máscara de CEP — ViaCEP funciona em produção
- `address-split-logradouro-numero`: Separação de `direccao` em `logradouro` + `numero` com migration
- `dias-funcionamento-ui`: UI de checkboxes para `dias_funcionamento` JSONField existente

### Modified Capabilities

_(nenhuma especificação existente sofre alteração de requisitos)_

## Impact

- **Apps Django afetados**: `negocios/` (serializer, migration de `Localizacao`), `core/` ou nova app `cidades/` para o endpoint de cidades
- **Migração de banco**: Sim — split de `Localizacao.direccao` em `logradouro` + `numero`
- **Frontend afetado**: `EnderecoCard.tsx`, `InformacoesBasicasCard.tsx`, `HorarioCard.tsx`, `/painel/cadastro/page.tsx`, `/painel/(panel)/meu-negocio/page.tsx`
- **Middleware afetado**: `frontend/src/middleware.ts` — adicionar `viacep.com.br` ao CSP `connect-src`
- **SEO**: Nenhum impacto — são formulários privados do painel
- **Sem breaking changes** nos endpoints públicos de `negocios/`
