## 1. Backend — Cidades e Validações de Serializer

- [x] 1.1 Criar `CIDADES_ATENDIDAS` em `backend/core/constants.py` como tupla de tuples `(slug, nome)` com as 7 cidades
- [x] 1.2 Criar `GET /api/cidades/` em `backend/core/views.py` e registrar em `backend/core/urls.py` — retorna lista de `{slug, nome}`
- [x] 1.3 Adicionar `validate_cidade` ao `NegocioPainelSerializer` em `backend/negocios/serializers.py` validando contra `CIDADES_ATENDIDAS`
- [x] 1.4 Adicionar `validate_cidade` ao `CadastroSerializer` em `backend/usuarios/serializers.py`
- [x] 1.5 Adicionar `validate_whatsapp` ao `NegocioPainelSerializer`: strip não-dígitos, validar 10–11 chars, salvar apenas dígitos
- [x] 1.6 Adicionar `validate_dias_funcionamento` ao `NegocioPainelSerializer`: verificar que todos os slugs estão em `["seg","ter","qua","qui","sex","sab","dom"]`

## 2. Backend — Migration Split Logradouro/Número

- [x] 2.1 Adicionar campos `logradouro` (CharField, max 200, blank=False, default='') e `numero` (CharField, max 20, blank=True) ao model `Localizacao` em `backend/negocios/models.py`
- [x] 2.2 Gerar migration `0007_localizacao_split_endereco` com `makemigrations`
- [x] 2.3 Editar a migration para adicionar `RunPython` que split `direccao` → `logradouro` + `numero` (split na vírgula; sem vírgula → `logradouro=direccao, numero=""`)
- [x] 2.4 Atualizar signal `preencher_direccao_fmt` para usar `logradouro` + `numero` na composição do `direccao_fmt`
- [x] 2.5 Atualizar signal para sincronizar `Negocio.bairro` a partir de `Localizacao.bairro` quando `Localizacao` é salva

## 3. Backend — Serializers de Endereço

- [x] 3.1 Substituir `direccao` por `logradouro` + `numero` no `LocalizacaoPainelSerializer` em `backend/negocios/serializers.py`
- [x] 3.2 Atualizar `NegocioPainelSerializer` para remover `bairro` do nível do `Negocio` do payload editável (manter como read-only)
- [x] 3.3 Escrever teste: PATCH com `logradouro` + `numero` corretos gera `direccao_fmt` esperado
- [x] 3.4 Escrever teste: PATCH com `cidade` inválida retorna 400
- [x] 3.5 Escrever teste: PATCH com `whatsapp` com menos de 10 dígitos retorna 400

## 4. Frontend — Biblioteca de Máscaras

- [x] 4.1 Criar `frontend/src/lib/masks.ts` com funções `maskPhone(value: string): string` (máscara `+55 (XX) XXXXX-XXXX`) e `maskCep(value: string): string` (máscara `XXXXX-XXX`)
- [x] 4.2 Garantir que `maskPhone` trata corretamente colar números já com prefixo `+55`

## 5. Frontend — Correção ViaCEP (CSP)

- [x] 5.1 Editar `frontend/src/middleware.ts` linha do `connect-src`: adicionar `https://viacep.com.br` à lista
- [x] 5.2 Aplicar `maskCep` no `onChange` do campo CEP em `EnderecoCard.tsx`
- [x] 5.3 Verificar que `buscarCep` dispara no `onBlur` do campo CEP além do botão (melhoria de UX) — ou manter apenas botão se conveniente

## 6. Frontend — EnderecoCard: Logradouro + Número + Selects

- [x] 6.1 Atualizar interface `Props` de `EnderecoCard.tsx` para receber `logradouro` e `numero` em vez de `direccao`
- [x] 6.2 Renderizar dois campos no grid: "Logradouro / Rua" (obrigatório) e "Número" (opcional, placeholder "S/N")
- [x] 6.3 Atualizar `buscarCep` para preencher `logradouro` em vez de `direccao` ao receber dados do ViaCEP
- [x] 6.4 Substituir `<input>` de cidade por `<select>` com `useEffect` buscando `GET /api/proxy/cidades/` ao montar
- [x] 6.5 Remover o campo `loc_bairro` duplicado se existir no formulário principal além de `EnderecoCard`

## 7. Frontend — InformacoesBasicasCard e Cadastro

- [x] 7.1 Substituir `<input>` de cidade em `InformacoesBasicasCard.tsx` por `<select>` dinâmico
- [x] 7.2 Melhorar `<select>` de categoria: exibir `{icone} {nome}`, filtrar `ativo=true`, ordenado por `ordem`
- [x] 7.3 Aplicar `maskPhone` no `onChange` do campo WhatsApp em `InformacoesBasicasCard.tsx` e em `/painel/cadastro/page.tsx`
- [x] 7.4 Substituir `<input>` de cidade no formulário `/painel/cadastro/page.tsx` por `<select>` dinâmico

## 8. Frontend — FormField e Asteriscos de Campos Obrigatórios

- [x] 8.1 Adicionar prop `required?: boolean` ao componente `FormField` em `frontend/src/components/merchant/FormField.tsx`
- [x] 8.2 Renderizar `<span className="text-red-500 ml-0.5">*</span>` no label quando `required=true`
- [x] 8.3 Adicionar `required` nos `FormField` de campos obrigatórios em `InformacoesBasicasCard.tsx` (nome, categoria, cidade, whatsapp)
- [x] 8.4 Adicionar `required` nos campos obrigatórios em `EnderecoCard.tsx` (logradouro, cep, cidade)
- [x] 8.5 Adicionar `required` nos campos obrigatórios em `/painel/cadastro/page.tsx` (nome, email, senha, nome negócio)
- [x] 8.6 Adicionar `required` nos campos obrigatórios no formulário de produto em `/painel/(panel)/produtos/page.tsx`

## 9. Frontend — Dias de Atendimento

- [x] 9.1 Criar componente de toggles de dias da semana no `HorarioCard.tsx` (ou novo `DiasAtendimentoCard.tsx`) com os 7 botões Seg–Dom
- [x] 9.2 Conectar ao state `dias_funcionamento` (array de slugs) — marcar/desmarcar atualiza o array
- [x] 9.3 Incluir `dias_funcionamento` no payload do PATCH de `meu-negocio`
- [x] 9.4 Verificar compatibilidade dos slugs com `isAberto()` em `frontend/src/lib/utils.ts`

## 10. Backend — Proxy BFF para cidades

- [x] 10.1 Adicionar `cidades` à lista `PUBLIC_PATHS` do proxy BFF em `frontend/src/app/api/proxy/[...path]/route.ts` para que a rota `/api/proxy/cidades/` funcione sem autenticação
