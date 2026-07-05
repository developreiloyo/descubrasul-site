## Context

O model `Negocio` já possui os campos `status` e `verificado`, mas o `status` carece de choices formalizados e não há campos para registrar motivos de rejeição ou suspensão. O model `User` já tem `is_admin_or_above` como propriedade e os roles `admin`/`superadmin` existem nos choices, porém nenhum endpoint DRF os verifica atualmente. O Django admin padrão (`/admin/`) existe mas é exclusivo para `superadmin` e não oferece a experiência de moderação rápida que o operador do dia-a-dia precisa. O frontend não tem nenhuma rota `/backoffice/`.

## Goals / Non-Goals

**Goals:**
- Formalizar choices do campo `status` no `Negocio`: `pending | active | rejected | suspended`
- Adicionar `rejection_reason` e `suspension_reason` (CharField nullable) ao `Negocio` com migration
- Criar permission class `IsAdminOrAbove` em `core/permissions.py` (reutilizando `user.is_admin_or_above`)
- Endpoints DRF em `/api/negocios/admin/` para listagem, aprovação, rejeição, toggle e moderação de conteúdo
- Route group `/backoffice/(admin)/` no Next.js com guard de role `admin|superadmin` no middleware
- Dashboard KPIs: total negócios, pendentes, suspensos, por plano
- Log de auditoria: cada ação admin gera um registro em `AdminActionLog`

**Non-Goals:**
- Gerenciamento de usuários (criar/remover accounts de admin) — feito via Django admin ou superadmin
- Relatórios financeiros ou de assinaturas — pertence ao módulo `planos/`
- Notificação por e-mail ao comerciante na aprovação/rejeição — fase 2 (depende de SMTP)
- Exportação CSV de negócios — fase 2
- Moderação de comentários ou avaliações — não existe no MVP

## Decisions

### Decisão 1: Endpoints DRF customizados, não Django Admin customizado

**Escolhido**: Novos ViewSets DRF em `/api/negocios/admin/` com serializers dedicados para o painel admin.

**Alternativa rejeitada**: Customizar o Django Admin (`ModelAdmin` com `list_display`, `actions`).

**Rationale**: O frontend Next.js já consume uma API REST. Criar endpoints DRF mantém consistência arquitetural, permite autenticação JWT (sem sessão Django), e o frontend pode evoluir independentemente do Django Admin. Além disso, o Django Admin é difícil de estilizar com o design system Lumina.

---

### Decisão 2: `AdminActionLog` para auditoria de todas as ações

**Escolhido**: Model `AdminActionLog` (app `negocios/` ou `core/`) com campos: `admin_user` (FK User), `action` (choices: approved/rejected/suspended/activated/content_edited/product_hidden), `negocio` (FK), `details` (JSONField), `created_at`.

**Rationale**: O painel admin tem acesso para alterar dados de qualquer comerciante — sem log, é impossível auditar quem mudou o quê. Crítico para responsabilização interna e eventual conformidade regulatória.

---

### Decisão 3: Status choices formalizados como constantes no model

**Escolhido**: `Negocio.STATUS_CHOICES = [('pending', ...), ('active', ...), ('rejected', ...), ('suspended', ...)]`. Negócios novos criados com `status='pending'` por padrão (migration com `default='pending'` se o campo ainda não tem default).

**Rationale**: Atualmente o campo `status` existe mas os choices não estão formalizados na codebase (segundo CLAUDE.md). Formalizar garante que o filtro admin e a listagem pública filtrem por `status='active'` de forma consistente.

---

### Decisão 4: Listagem pública já filtrada por status ativo

**Escolhido**: Adicionar `filter(status='active')` nos querysets públicos de `NegocioViewSet` que ainda não filtram por status.

**Alternativa rejeitada**: Deixar o filtro só no admin e confiar no campo `verificado`.

**Rationale**: Negócios com `status='pending'` ou `status='rejected'` não devem aparecer publicamente. Isso é uma consequência natural da aprovação — não um breaking change, apenas um filtro a mais.

---

### Decisão 5: Route group `/backoffice/` separado de `/painel/`

**Escolhido**: `src/app/backoffice/(admin)/layout.tsx` com Navbar admin separado, sem herdar layout do painel do comerciante.

**Rationale**: Admin e comerciante têm UX completamente diferentes — misturar os layouts causaria confusão visual e requereria condicionais desnecessárias. O middleware Next.js já distingue rotas por prefixo para o guard de auth — adicionar `/backoffice/` é trivial.

---

### Decisão 6: Moderação de conteúdo via PATCH parcial, não formulário completo

**Escolhido**: `PATCH /api/negocios/admin/{id}/` aceita apenas os campos de conteúdo moderáveis (`descricao`, `historia`, `espaco_especial`) — não permite alterar dados operacionais como `plano` ou `status` via este endpoint.

**Rationale**: Separar as permissões de ação (aprovar/suspender) das permissões de conteúdo (moderar texto) reduz superfície de ataque acidental. Um admin de moderação não deve poder promover um negócio para plano Pro diretamente.

## Risks / Trade-offs

- **[Risco] `status='pending'` em negócios existentes** → Migration com `default='pending'` para novos, mas todos os registros existentes devem receber `status='active'` via `RunPython` na migration (são contas de desenvolvimento/teste já validadas).
- **[Risco] Admin suspende negócio com assinatura paga ativa** → O toggle de suspensão não cancela a assinatura MP — é responsabilidade operacional do admin cancelar manualmente no MP também. Documentar claramente na UI.
- **[Trade-off] `AdminActionLog` aumenta writes no banco** → Volume baixo (operação manual, não automatizada). Sem impacto de performance relevante no MVP.
- **[Risco] Comerciante acessa `/backoffice/` com token JWT válido** → O guard no middleware Next.js verifica o role do cookie JWT antes de servir qualquer página do grupo. O backend verifica `IsAdminOrAbove` em todo endpoint — dupla proteção.

## Migration Plan

1. Gerar migration para adicionar `rejection_reason` e `suspension_reason` ao `Negocio`
2. Gerar migration para formalizar choices do `status` e atualizar `default='pending'`
3. `RunPython` na migration para definir `status='active'` nos registros existentes sem status
4. Gerar migration para o model `AdminActionLog`
5. Deploy backend (migrations automáticas no start)
6. Deploy frontend (novo route group `/backoffice/`)
7. Rollback: todos os campos são nullable/additive — `RemoveField` sem perda de dados críticos

## Open Questions

- **Notificação ao comerciante**: ao aprovar/rejeitar, enviar e-mail automático ou deixar para o admin comunicar manualmente por enquanto?
- **Quem tem role `admin`**: apenas o dono do negócio (superadmin)? Ou haverá funcionários com role `admin`? Isso afeta como criar usuários admin.
- **Aprovação automática**: negócios novos ficam em `pending` e precisam de aprovação manual, ou a aprovação manual é opcional (negócio fica `active` por padrão até alguém reclamar)?
