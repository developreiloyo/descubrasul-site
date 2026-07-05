## Context

Os formulários do painel são compostos por componentes em `frontend/src/components/merchant/meu-negocio/`: `EnderecoCard`, `InformacoesBasicasCard`, `HorarioCard`, e a página `/painel/cadastro/page.tsx`. No backend, o model `Negocio` tem `bairro` e `cidade` como CharFields próprios, e o model `Localizacao` também tem `bairro`, `cidade`, `cep`, e um único campo `direccao` (CharField) para o endereço completo. O `NegocioPainelSerializer` expõe ambos os bairros. O CEP já tem fetch ViaCEP implementado via botão em `EnderecoCard`, porém o `connect-src` do CSP em `middleware.ts` lista apenas `'self' https://api.descubrasul.com https://www.google-analytics.com` — `viacep.com.br` está bloqueado, causando falha silenciosa em produção.

## Goals / Non-Goals

**Goals:**
- Endpoint dedicado `GET /api/cidades/` em `core/views.py` (sem nova app) retornando lista fixa das cidades atendidas
- Validação de `cidade` no serializer via choices — rejeitando valores fora da lista
- Máscaras de input implementadas com funções JS puras (sem Cleave.js, IMask ou similar)
- Correção do CSP adicionando `https://viacep.com.br` ao `connect-src`
- Migration que split `Localizacao.direccao` em `logradouro` (max 200) e `numero` (max 20, blank=True), com `RunPython` para mover dados existentes
- UI de `dias_funcionamento` com toggles simples HTML/CSS (sem lib de calendário)
- Indicadores `*` de campo obrigatório via `FormField` existente — adicionar prop `required` e renderizar asterisco no componente

**Non-Goals:**
- Validação de CNPJ ou CPF (fora do escopo)
- Geocodificação automática por CEP (já existe task Celery para isso)
- Adicionar novas cidades além das 7 listadas (decisão de produto)
- Lib de formulários (React Hook Form, Formik) — o padrão atual de `useState` é mantido

## Decisions

### Decisão 1: Cidades como constante no backend, não tabela de banco

**Escolhido**: `CIDADES_ATENDIDAS` como tupla de choices em `core/constants.py`, exposta via `GET /api/cidades/` em `core/views.py`. Sem model `Cidade`.

**Alternativa rejeitada**: Nova app `cidades/` com model e migration.

**Rationale**: A lista é pequena (7 cidades), muda raramente e não tem outros atributos além do nome. Uma tabela seria overengineering. Quando novas cidades forem adicionadas, basta editar a constante e redeployar.

---

### Decisão 2: Máscara de WhatsApp/CEP em funções utilitárias puras

**Escolhido**: Funções `maskPhone(value: string): string` e `maskCep(value: string): string` em `frontend/src/lib/masks.ts`, chamadas no `onChange` dos inputs.

**Alternativa rejeitada**: Biblioteca `react-input-mask` ou similar.

**Rationale**: Reduz dependências externas. As duas máscaras são simples o suficiente para regex + string manipulation. Mantém o bundle menor.

---

### Decisão 3: Split de `direccao` em `logradouro` + `numero` via migration com RunPython

**Escolhido**: `RunPython` que tenta separar o conteúdo de `direccao` existente: se contém vírgula, split em `logradouro` e `numero`; caso contrário, move tudo para `logradouro` e deixa `numero` vazio.

**Alternativa rejeitada**: Apagar `direccao` e pedir que comerciantes repreencham.

**Rationale**: Dados existentes devem ser preservados. A heurística de vírgula captura o padrão mais comum ("Rua das Flores, 123"). Campos mal-splitados podem ser corrigidos pelo comerciante no formulário.

---

### Decisão 4: Bairro do formulário — manter apenas `Localizacao.bairro`

**Escolhido**: Remover o campo `Negocio.bairro` do payload do formulário de edição (mas NÃO do model — é usado em queries/índices). O `NegocioPainelSerializer` continua expondo `bairro` no nível do `Negocio` para leitura apenas; a edição do bairro ocorre via `localizacao.bairro`.

**Alternativa rejeitada**: Remover `Negocio.bairro` do model completamente.

**Rationale**: `Negocio.bairro` é usado em índices (`0006_unaccent_normalizar_cidade`) e provavelmente em queries de busca. Removê-lo do model requer migration de remoção de índice + campo. A solução de curto prazo é apenas ocultar do formulário e sincronizar via signal (já existe `preencher_direccao_fmt` — adicionar sync de `bairro` lá).

---

### Decisão 5: CSP fix — adicionar viacep.com.br ao connect-src

**Escolhido**: Editar linha 16 de `frontend/src/middleware.ts`:
- De: `connect-src 'self' https://api.descubrasul.com https://www.google-analytics.com`
- Para: `connect-src 'self' https://api.descubrasul.com https://www.google-analytics.com https://viacep.com.br`

**Rationale**: Causa raiz confirmada — o browser bloqueia o fetch para `viacep.com.br` por violação de CSP. O fetch já é client-side (componente com `'use client'` e função assíncrona no botão). Nenhuma outra mudança arquitetural necessária.

---

### Decisão 6: Dias de funcionamento como array de strings no JSONField

**Escolhido**: `dias_funcionamento` continua como `JSONField(default=list)`. O valor armazenado é um array de slugs: `["seg", "ter", "qua", "qui", "sex", "sab", "dom"]`. UI com 7 toggles simples no `HorarioCard`.

**Rationale**: O field já existe. Os slugs são compatíveis com `isAberto()` em `lib/utils.ts` que já normaliza dias em pt-BR. Sem migration necessária para o campo.

## Risks / Trade-offs

- **[Risco] `numero` como CharField nullable na migration** → Comerciantes existentes terão `numero` vazio após split. O formulário deve aceitar `numero` como campo opcional (blank=True). Campo exibido mas não obrigatório.
- **[Risco] CEP com máscara no `onChange` conflita com ViaCEP** → A máscara aplica `XXXXX-XXX`. O `buscarCep` já faz `cep.replace(/\D/g, '')` antes da chamada — compatível.
- **[Trade-off] Cidades hardcoded na constante** → Se uma nova cidade for adicionada, requer redeploy. Aceitável para o MVP; pode evoluir para tabela futuramente.
- **[Risco] Validação de cidade no serializer quebra dados existentes** → `NegocioPublicoSerializer` não deve validar cidade (apenas leitura). A validação fica apenas no `NegocioPainelSerializer` (PATCH/PUT) e `CadastroSerializer`. Negócios existentes com cidade fora da lista ficam salvos mas não podem ser alterados sem corrigir a cidade.

## Migration Plan

1. Gerar migration `0007_localizacao_split_endereco` em `negocios/` adicionando `logradouro` + `numero`, `RunPython` para split de dados, tornando `direccao` deprecated (manter por 1 sprint, depois remover)
2. Atualizar serializers para usar `logradouro` + `numero` em vez de `direccao`
3. Atualizar sinal `preencher_direccao_fmt` para usar `logradouro` + `numero`
4. Deploy backend → frontend
5. Rollback: campos nullable — reversão da migration não perde dados (`logradouro` e `numero` são novos)

## Open Questions

- **`Negocio.bairro` vs `Localizacao.bairro`**: o signal de sync deve propagar `Localizacao.bairro` → `Negocio.bairro` automaticamente? Ou `Negocio.bairro` pode ficar defasado e ser removido numa sprint futura?
- **Número obrigatório**: deve ser campo obrigatório ou opcional? (ex: "Fazenda Sem Número")
