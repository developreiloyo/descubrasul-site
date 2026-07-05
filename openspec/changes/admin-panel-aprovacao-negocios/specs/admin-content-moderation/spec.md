## ADDED Requirements

### Requirement: Endpoint de moderação de conteúdo permite editar campos de texto do negócio
`PATCH /api/negocios/admin/{id}/moderar-conteudo/` (requer `IsAdminOrAbove`) SHALL aceitar os campos: `descricao`, `historia`, `espaco_especial` (JSONField). Campos não enviados não são alterados. A operação SHALL criar `AdminActionLog` com `action='content_edited'` e `details` contendo os campos alterados e seus valores anteriores.

#### Scenario: Admin corrige descrição com keyword stuffing
- **WHEN** admin faz `PATCH /api/negocios/admin/{id}/moderar-conteudo/` com `{"descricao": "Texto corrigido"}`
- **THEN** `Negocio.descricao` é atualizado, log criado com `details={"descricao": {"de": "<antigo>", "para": "Texto corrigido"}}`, retorna HTTP 200

#### Scenario: Campos de conteúdo moderados passam pela validação SEO
- **WHEN** admin tenta salvar uma `descricao` que viola `validar_texto_seo_completo()`
- **THEN** retorna HTTP 400 com mensagem de validação SEO

#### Scenario: Admin não pode alterar campos operacionais via moderação
- **WHEN** `PATCH /api/negocios/admin/{id}/moderar-conteudo/` inclui o campo `plano`
- **THEN** o campo `plano` é ignorado silenciosamente (serializer read_only) — apenas `descricao`, `historia`, `espaco_especial` são aceitos

---

### Requirement: Endpoint de ocultação/reativação de produto individual
`POST /api/negocios/admin/produtos/{produto_id}/ocultar/` e `POST /api/negocios/admin/produtos/{produto_id}/reativar/` (requerem `IsAdminOrAbove`) SHALL alterar `Produto.disponivel` para `False`/`True` respectivamente e criar `AdminActionLog` com `action='product_hidden'` ou `action='product_reactivated'`.

#### Scenario: Admin oculta produto com conteúdo inadequado
- **WHEN** admin faz `POST /api/negocios/admin/produtos/{id}/ocultar/`
- **THEN** `Produto.disponivel=False`, produto some da listagem pública, log criado, retorna HTTP 200

#### Scenario: Admin reativa produto previamente oculto
- **WHEN** admin faz `POST /api/negocios/admin/produtos/{id}/reativar/`
- **THEN** `Produto.disponivel=True`, produto volta à listagem pública, log criado, retorna HTTP 200

#### Scenario: Tentativa de ocultar produto de outro negócio sem permissão admin falha
- **WHEN** um comerciante tenta acessar `POST /api/negocios/admin/produtos/{id}/ocultar/`
- **THEN** retorna HTTP 403
