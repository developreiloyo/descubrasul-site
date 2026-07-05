## Why

O DescubraSul não tem nenhuma interface de gestão operacional — novos negócios cadastrados ficam visíveis no site sem qualquer curadoria, e o campo `verificado` do model `Negocio` nunca é atualizado porque não há ferramenta para fazê-lo. Sem o painel admin, o lançamento comercial opera no escuro: impossível aprovar, suspender ou moderar qualquer conteúdo sem acessar diretamente o banco via Django admin shell.

## What Changes

- Novos endpoints DRF restritos ao role `admin`/`superadmin` para listagem, aprovação, moderação e toggle de negócios
- Route group `/backoffice/` no frontend Next.js com layout dedicado e guard de role `admin|superadmin`
- Listagem de negócios com filtros por `plano`, `status`, `verificado`, `cidade` e busca full-text por nome/email
- Ação de aprovação: transição de `status` para `ativo` + `verificado = True`
- Ação de rejeição: transição para `status = rejeitado` com campo `motivo_rejeicao` (enviado ao comerciante)
- Ação de ativação/desativação manual: toggle de `status` entre `ativo` e `suspenso`
- Moderação de conteúdo: editar `descricao`, `historia` e `espaco_especial` de qualquer negócio; ocultar produtos individualmente
- Listagem de comerciantes por plano com contadores (total por plano, total verificados, total pendentes)

## Capabilities

### New Capabilities

- `admin-business-listing`: Endpoint e UI para listar todos os negócios com filtros compostos (plano, status, verificado, cidade) e busca por nome/e-mail do comerciante; paginação com cursor
- `admin-business-approval`: Endpoints e ações de aprovação (status→ativo + verificado=True), rejeição (status→rejeitado + motivo) e verificação manual de um negócio específico
- `admin-content-moderation`: Endpoints e UI para editar campos de conteúdo (`descricao`, `historia`, `espaco_especial`) de qualquer negócio e ocultar/reativar produtos individualmente
- `admin-business-toggle`: Endpoint e ação de toggle `ativo`↔`suspenso` com campo `motivo_suspensao` opcional; negócio suspenso some da listagem pública
- `admin-panel-ui`: Route group `/backoffice/` no Next.js com layout separado (Navbar admin), guard de role, dashboard com KPIs (total negócios, pendentes aprovação, suspensos, por plano)

### Modified Capabilities

_(nenhuma especificação existente sofre alteração de requisitos)_

## Impact

- **Apps Django afetados**: `negocios/` (novos endpoints admin + campos `status`, `verificado`, `motivo_rejeicao`, `motivo_suspensao` no `Negocio`) e `usuarios/` (nenhuma mudança de model, apenas verificação de role em permissions)
- **Migração de banco**: Possivelmente sim — adicionar `motivo_rejeicao` e `motivo_suspensao` (CharField nullable) ao model `Negocio` se ainda não existirem
- **Frontend afetado**: novo route group `src/app/backoffice/(admin)/` com layout, dashboard e páginas de gestão
- **Segurança crítica**: todos os endpoints do backoffice DEVEM verificar `IsAdminOrAbove` — comerciantes com JWT válido NÃO devem ter acesso
- **SEO**: nenhum impacto — `/backoffice/` é rota autenticada e privada; negócios com `status != ativo` já devem ser excluídos da listagem pública
- **Sem breaking changes** nos endpoints existentes de `negocios/` — apenas adição de novos endpoints com prefixo `/api/negocios/admin/`
