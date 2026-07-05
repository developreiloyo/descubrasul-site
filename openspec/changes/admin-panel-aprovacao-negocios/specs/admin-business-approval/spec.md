## ADDED Requirements

### Requirement: Campos de status formalizados no model Negocio
O model `Negocio` SHALL ter `status` com choices explícitos: `pending` (aguardando aprovação), `active` (aprovado e visível), `rejected` (rejeitado), `suspended` (suspenso por admin). Novos negócios SHALL ser criados com `status='pending'` por padrão. Os campos `rejection_reason` (CharField, max 500, nullable) e `suspension_reason` (CharField, max 500, nullable) SHALL ser adicionados ao model.

#### Scenario: Negócio criado fica com status pending
- **WHEN** um comerciante completa o cadastro via `POST /api/usuarios/cadastro/`
- **THEN** o `Negocio` criado tem `status='pending'` e não aparece na listagem pública

#### Scenario: Negócio active aparece na listagem pública
- **WHEN** `Negocio.status = 'active'`
- **THEN** o negócio aparece em `GET /api/negocios/` e nas páginas públicas do site

---

### Requirement: Endpoint de aprovação transiciona status para active
`POST /api/negocios/admin/{id}/aprovar/` (requer `IsAdminOrAbove`) SHALL atualizar `status='active'` e `verificado=True` no negócio, criar um `AdminActionLog` com `action='approved'`, e retornar o negócio atualizado.

#### Scenario: Aprovação de negócio pending
- **WHEN** admin faz `POST /api/negocios/admin/{id}/aprovar/` para negócio com `status='pending'`
- **THEN** `status='active'`, `verificado=True`, `AdminActionLog` criado, retorna HTTP 200

#### Scenario: Aprovação de negócio já active retorna 400
- **WHEN** admin tenta aprovar um negócio que já está `status='active'`
- **THEN** retorna HTTP 400 com mensagem "Negócio já está ativo"

---

### Requirement: Endpoint de rejeição transiciona status para rejected com motivo
`POST /api/negocios/admin/{id}/rejeitar/` (requer `IsAdminOrAbove`) SHALL receber `{"motivo": "..."}` (obrigatório, max 500 chars), atualizar `status='rejected'` e `rejection_reason`, criar `AdminActionLog` com `action='rejected'` e `details={'reason': motivo}`.

#### Scenario: Rejeição com motivo válido
- **WHEN** admin faz `POST /api/negocios/admin/{id}/rejeitar/` com `{"motivo": "Imagens inadequadas"}`
- **THEN** `status='rejected'`, `rejection_reason='Imagens inadequadas'`, log criado, retorna HTTP 200

#### Scenario: Rejeição sem motivo retorna 400
- **WHEN** o body não contém o campo `motivo` ou `motivo` é string vazia
- **THEN** retorna HTTP 400 com mensagem de validação

---

### Requirement: Registro de auditoria em todas as ações admin
O model `AdminActionLog` (app `negocios/`) SHALL ter: `admin_user` (FK User), `negocio` (FK Negocio), `action` (CharField choices), `details` (JSONField, default `{}`), `created_at` (auto). Cada ação admin (aprovação, rejeição, suspensão, ativação, moderação de conteúdo, ocultação de produto) SHALL criar um registro.

#### Scenario: Log criado na aprovação
- **WHEN** admin aprova um negócio
- **THEN** existe um `AdminActionLog` com `admin_user=request.user`, `negocio=negocio`, `action='approved'`

#### Scenario: Admin não pode ver logs de outros admins
- **WHEN** `GET /api/negocios/admin/logs/` é chamado
- **THEN** retorna apenas logs do `request.user` — a menos que o role seja `superadmin`, que vê todos
