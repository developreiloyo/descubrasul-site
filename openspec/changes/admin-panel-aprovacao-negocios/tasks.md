## 1. Backend — Model e Migrations

- [ ] 1.1 Formalizar choices de `status` no model `Negocio` (`pending`, `active`, `rejected`, `suspended`) em `backend/negocios/models.py`
- [ ] 1.2 Adicionar campos `rejection_reason` e `suspension_reason` (CharField, max 500, null=True, blank=True) ao model `Negocio`
- [ ] 1.3 Criar model `AdminActionLog` em `backend/negocios/models.py` com campos `admin_user`, `negocio`, `action` (choices), `details` (JSONField), `created_at`
- [ ] 1.4 Gerar migration `0007_negocio_admin_fields` com `RunPython` para atualizar registros existentes para `status='active'`
- [ ] 1.5 Registrar `AdminActionLog` no `backend/negocios/admin.py` com `list_display` útil

## 2. Backend — Permissions e Segurança

- [ ] 2.1 Criar permission class `IsAdminOrAbove` em `backend/core/permissions.py` verificando `request.user.is_admin_or_above`
- [ ] 2.2 Adicionar filtro `status='active'` aos querysets públicos em `NegocioViewSet.get_queryset()` para list e retrieve
- [ ] 2.3 Escrever teste: comerciante NÃO acessa `GET /api/negocios/admin/` (deve retornar 403)
- [ ] 2.4 Escrever teste: negócio `pending` não aparece em `GET /api/negocios/` nem em `GET /api/negocios/{slug}/`

## 3. Backend — Serializers Admin

- [ ] 3.1 Criar `AdminNegocioListSerializer` em `backend/negocios/serializers.py` com campos para listagem (id, nome, status, verificado, plano, cidade, e-mail comerciante, created_at)
- [ ] 3.2 Criar `AdminNegocioDetailSerializer` com todos os campos + `rejection_reason` + `suspension_reason`
- [ ] 3.3 Criar `AdminContentModerationSerializer` com apenas `descricao`, `historia`, `espaco_especial` (todos com validação SEO via `validar_texto_seo_completo()`)
- [ ] 3.4 Criar `AdminActionSerializer` para endpoints de ação (aprovar/rejeitar/suspender) com campo `motivo` opcional/obrigatório por ação

## 4. Backend — Views e Endpoints Admin

- [ ] 4.1 Criar `AdminNegocioViewSet` em `backend/negocios/views.py` com `list`, `retrieve` e filtros (`django-filter` ou filtros manuais)
- [ ] 4.2 Implementar action `aprovar` (`POST /api/negocios/admin/{id}/aprovar/`) com log automático
- [ ] 4.3 Implementar action `rejeitar` (`POST /api/negocios/admin/{id}/rejeitar/`) com `motivo` obrigatório e log
- [ ] 4.4 Implementar action `suspender` (`POST /api/negocios/admin/{id}/suspender/`) com `motivo` opcional e log
- [ ] 4.5 Implementar action `reativar` (`POST /api/negocios/admin/{id}/reativar/`) com log
- [ ] 4.6 Implementar action `moderar_conteudo` (`PATCH /api/negocios/admin/{id}/moderar-conteudo/`) com diff de campos no log
- [ ] 4.7 Criar `AdminProdutoViewSet` com actions `ocultar` e `reativar` (`POST /api/negocios/admin/produtos/{id}/ocultar/`)
- [ ] 4.8 Implementar `GET /api/negocios/admin/kpis/` retornando contadores agregados
- [ ] 4.9 Implementar `GET /api/negocios/admin/logs/` com filtro por `request.user` para `admin`, todos para `superadmin`
- [ ] 4.10 Registrar rotas admin em `backend/negocios/urls.py` sob prefixo `admin/`

## 5. Backend — Testes

- [ ] 5.1 Teste: `POST /api/negocios/admin/{id}/aprovar/` muda `status='active'` e `verificado=True` e cria `AdminActionLog`
- [ ] 5.2 Teste: `POST /api/negocios/admin/{id}/rejeitar/` sem motivo retorna 400
- [ ] 5.3 Teste: `POST /api/negocios/admin/{id}/suspender/` exclui negócio da listagem pública
- [ ] 5.4 Teste: moderação de conteúdo passa por validação SEO
- [ ] 5.5 Teste de isolamento: admin A não vê logs de admin B (a menos que superadmin)

## 6. Frontend — Setup do Route Group /backoffice/

- [ ] 6.1 Criar route group `frontend/src/app/backoffice/(admin)/layout.tsx` com `AdminNavbar` e guard de role
- [ ] 6.2 Atualizar `frontend/src/middleware.ts` para redirecionar `/backoffice/*` para `/painel/login` se role não for `admin|superadmin`
- [ ] 6.3 Criar componente `frontend/src/components/admin/AdminNavbar.tsx` com logo e links (Dashboard, Negócios, Logs)

## 7. Frontend — Dashboard /backoffice/

- [ ] 7.1 Criar `frontend/src/app/backoffice/(admin)/page.tsx` com fetch SSR de `GET /api/proxy/negocios/admin/kpis/`
- [ ] 7.2 Renderizar 6 cards KPI: Total, Pendentes (badge alerta se > 0), Ativos, Rejeitados, Suspensos, Verificados
- [ ] 7.3 Renderizar breakdown por plano como tabela ou lista de contadores

## 8. Frontend — Listagem de Negócios /backoffice/negocios/

- [ ] 8.1 Criar `frontend/src/app/backoffice/(admin)/negocios/page.tsx` com TanStack Query para `GET /api/proxy/negocios/admin/`
- [ ] 8.2 Implementar filtros de status e plano (selects) e campo de busca com debounce
- [ ] 8.3 Renderizar tabela com colunas: Nome, Cidade, Plano, Status (badge colorido), Verificado, Data, Ações
- [ ] 8.4 Implementar ações inline: Aprovar (modal de confirmação), Rejeitar (modal com textarea de motivo obrigatório), Suspender (modal com textarea opcional), Reativar
- [ ] 8.5 Ao confirmar ação, chamar endpoint correspondente e invalidar query para atualizar tabela sem reload

## 9. Frontend — Detalhe e Moderação /backoffice/negocios/[id]/

- [ ] 9.1 Criar `frontend/src/app/backoffice/(admin)/negocios/[id]/page.tsx` com fetch do negócio completo
- [ ] 9.2 Implementar edição inline de `descricao`, `historia` e `espaco_especial` com textarea + botão Salvar
- [ ] 9.3 Chamar `PATCH /api/proxy/negocios/admin/{id}/moderar-conteudo/` ao salvar e exibir toast de confirmação
- [ ] 9.4 Listar produtos do negócio com badge "Oculto" e botões Ocultar/Reativar por produto
