## ADDED Requirements

### Requirement: Endpoint de listagem admin com filtros compostos
`GET /api/negocios/admin/` (requer `IsAdminOrAbove`) SHALL retornar todos os negócios paginados com suporte aos filtros: `status` (pending/active/rejected/suspended), `plano` (gratuito/basico/pro/producao/fundador), `verificado` (true/false), `cidade`, e `search` (busca por nome do negócio ou e-mail do comerciante). A resposta SHALL incluir `total_count` além dos resultados paginados.

#### Scenario: Listagem sem filtros retorna todos os negócios
- **WHEN** `GET /api/negocios/admin/` é chamado por admin sem parâmetros
- **THEN** retorna todos os negócios paginados com `total_count` e campos: `id`, `nome`, `status`, `verificado`, `plano`, `cidade`, `created_at`, e-mail do comerciante

#### Scenario: Filtro por status pending
- **WHEN** `GET /api/negocios/admin/?status=pending`
- **THEN** retorna apenas negócios com `status=pending`

#### Scenario: Filtro composto por plano e status
- **WHEN** `GET /api/negocios/admin/?plano=pro&status=active`
- **THEN** retorna apenas negócios Pro ativos

#### Scenario: Busca por e-mail do comerciante
- **WHEN** `GET /api/negocios/admin/?search=joao@email.com`
- **THEN** retorna negócios cujo `negocio.usuario.email` contém o termo buscado

#### Scenario: Acesso negado para comerciante
- **WHEN** um usuário com role `comerciante` acessa `GET /api/negocios/admin/`
- **THEN** retorna HTTP 403

---

### Requirement: Endpoint de KPIs para o dashboard admin
`GET /api/negocios/admin/kpis/` (requer `IsAdminOrAbove`) SHALL retornar contadores agregados: `total`, `pending`, `active`, `rejected`, `suspended`, `verificados`, e `por_plano` (dict com count por slug de plano).

#### Scenario: KPIs refletem estado atual do banco
- **WHEN** existem 10 negócios (3 pending, 5 active, 1 rejected, 1 suspended) e `GET /api/negocios/admin/kpis/` é chamado
- **THEN** retorna `{"total": 10, "pending": 3, "active": 5, "rejected": 1, "suspended": 1, "por_plano": {...}}`
