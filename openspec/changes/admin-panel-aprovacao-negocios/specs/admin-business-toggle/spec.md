## ADDED Requirements

### Requirement: Endpoint de suspensão desativa negócio com motivo opcional
`POST /api/negocios/admin/{id}/suspender/` (requer `IsAdminOrAbove`) SHALL aceitar `{"motivo": "..."}` (opcional, max 500 chars), atualizar `status='suspended'` e `suspension_reason`, criar `AdminActionLog` com `action='suspended'`. Negócio suspenso SHALL ser excluído da listagem pública imediatamente.

#### Scenario: Suspensão com motivo
- **WHEN** admin faz `POST /api/negocios/admin/{id}/suspender/` com `{"motivo": "Violação dos termos"}`
- **THEN** `status='suspended'`, `suspension_reason='Violação dos termos'`, negócio some da listagem pública, log criado

#### Scenario: Suspensão sem motivo é aceita
- **WHEN** admin faz `POST /api/negocios/admin/{id}/suspender/` sem body
- **THEN** `status='suspended'`, `suspension_reason=None`, log criado com `details={}`

#### Scenario: Negócio já suspenso não pode ser suspenso novamente
- **WHEN** admin tenta suspender um negócio com `status='suspended'`
- **THEN** retorna HTTP 400 com mensagem "Negócio já está suspenso"

---

### Requirement: Endpoint de reativação restaura negócio suspenso para ativo
`POST /api/negocios/admin/{id}/reativar/` (requer `IsAdminOrAbove`) SHALL atualizar `status='active'`, limpar `suspension_reason`, criar `AdminActionLog` com `action='reactivated'`. Aplicável apenas a negócios com `status='suspended'`.

#### Scenario: Reativação de negócio suspenso
- **WHEN** admin faz `POST /api/negocios/admin/{id}/reativar/` para negócio suspenso
- **THEN** `status='active'`, `suspension_reason=None`, negócio volta à listagem pública, log criado, retorna HTTP 200

#### Scenario: Reativação de negócio pending retorna 400
- **WHEN** admin tenta reativar um negócio com `status='pending'`
- **THEN** retorna HTTP 400 com mensagem "Use o endpoint de aprovação para negócios pendentes"

---

### Requirement: Negócios não-active são excluídos da listagem pública
O queryset de `NegocioViewSet` (endpoints públicos) SHALL incluir `.filter(status='active')` em todos os métodos que retornam listas ou objetos acessíveis por visitantes não autenticados.

#### Scenario: Negócio pending não aparece na listagem pública
- **WHEN** `GET /api/negocios/` é chamado por visitante
- **THEN** negócios com `status='pending'`, `'rejected'` ou `'suspended'` não estão na resposta

#### Scenario: URL direta de negócio suspenso retorna 404
- **WHEN** visitante acessa `GET /api/negocios/{slug}/` para um negócio com `status='suspended'`
- **THEN** retorna HTTP 404 (o negócio não existe para o público)
