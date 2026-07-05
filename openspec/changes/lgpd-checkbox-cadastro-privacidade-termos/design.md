## Context

O DescubraSul já possui as rotas `/privacidade` e `/termos` no frontend, mas sem conteúdo legal completo. O formulário de cadastro em `/painel/cadastro` não coleta consentimento explícito. O model `User` (app `usuarios/`) usa e-mail como campo de autenticação e já possui roles, mas não armazena dados de consentimento LGPD. A conformidade com a LGPD (Lei 13.709/2018) exige: base legal documentada, consentimento livre/informado/inequívoco, e comprovação do consentimento (art. 7º, I e art. 8º).

## Goals / Non-Goals

**Goals:**
- Adicionar `lgpd_accepted_at` e `lgpd_accepted_ip` ao model `User` com migration segura (nullable)
- Validar `lgpd_accepted: true` obrigatoriamente no `CadastroSerializer` antes de criar o usuário
- Registrar IP do consentimento no `CadastroView` (disponível em `request.META`)
- Checkbox obrigatório no form de cadastro frontend com links para `/privacidade` e `/termos`
- Páginas `/privacidade` e `/termos` com conteúdo legal completo, SSR, `generateMetadata()` e JSON-LD `WebPage`

**Non-Goals:**
- Coleta retroativa de consentimento de usuários já cadastrados
- Fluxo de revogação de consentimento / direito ao esquecimento (feature futura separada)
- Painel de privacidade para o titular dos dados (fase futura)
- Tradução das páginas para outro idioma

## Decisions

### Decisão 1: Armazenar consentimento no backend, não só validar no frontend

**Escolhido**: Persistir `lgpd_accepted_at` (timestamp UTC) e `lgpd_accepted_ip` no model `User`.

**Alternativa rejeitada**: Apenas checkbox client-side sem persitência.

**Rationale**: A LGPD exige que o controlador demonstre que o consentimento foi obtido (art. 8º, §2º). Sem registro server-side, a empresa não tem prova em caso de autuação pela ANPD.

---

### Decisão 2: Campos nullable para não quebrar usuários existentes

**Escolhido**: `lgpd_accepted_at = DateTimeField(null=True, blank=True)` e `lgpd_accepted_ip = GenericIPAddressField(null=True, blank=True)`.

**Alternativa rejeitada**: Campo com `default=timezone.now` (mascara ausência real de consentimento em usuários antigos).

**Rationale**: É honesto tecnicamente — usuários migrados não deram consentimento formal. O admin pode identificar e tratar separadamente no futuro.

---

### Decisão 3: Validação no `CadastroSerializer`, não no `CadastroView`

**Escolhido**: `lgpd_accepted` é um write-only field no serializer com `validate_lgpd_accepted` que rejeita `False`.

**Rationale**: Segue a arquitetura por camadas obrigatória — validação de input fica no serializer, não na view. Reutilizável se houver outro endpoint de cadastro no futuro.

---

### Decisão 4: IP capturado na view, não no serializer

**Escolhido**: `CadastroView` extrai `request.META.get('HTTP_X_FORWARDED_FOR') or request.META.get('REMOTE_ADDR')` e passa para o `service.registrar_cadastro()`.

**Rationale**: `request` não deve ser acessado em serializers (camada errada). A view delega para o service que recebe o IP como parâmetro explícito.

---

### Decisão 5: Conteúdo das páginas legais como texto estático no código

**Escolhido**: Conteúdo das páginas `/privacidade` e `/termos` escrito diretamente nos componentes Next.js (JSX com markdown-like prose).

**Alternativa rejeitada**: CMS ou banco de dados para gerenciar o conteúdo legal.

**Rationale**: O conteúdo legal muda raramente e precisa de controle de versão (git). Um CMS introduziria complexidade desnecessária para MVP. Quando o CNPJ/razão social for confirmado, basta editar os arquivos.

## Risks / Trade-offs

- **[Risco] CNPJ e razão social ainda `[PENDENTE]`** → Mitigação: usar placeholder visível `[AGUARDANDO CONFIRMAÇÃO]` nos campos obrigatórios das páginas legais. O site pode ir ao ar com placeholder — o que não pode é ir sem as páginas existindo.
- **[Risco] Usuários pre-existentes com `lgpd_accepted_at = null`** → Mitigação: documentado como intencional (nullable). Não bloqueia uso da plataforma por serem dados de desenvolvimento/teste.
- **[Trade-off] IP pode ser do proxy Traefik** → Usar `HTTP_X_FORWARDED_FOR` primeiro (já configurado `SECURE_PROXY_SSL_HEADER` no prod.py), com fallback para `REMOTE_ADDR`. Registra o IP real do cliente.
- **[Risco] Conteúdo legal não revisado por advogado** → Mitigação: texto elaborado com base em LGPD, mas o dono deve validar com jurídico antes do lançamento público.

## Migration Plan

1. Gerar migration `0002_user_lgpd_fields` no app `usuarios/`
2. Campos nullable — migration pode rodar sem downtime (sem `NOT NULL`)
3. Deploy backend (migration automática no start do container)
4. Deploy frontend (checkbox + páginas)
5. Rollback: remover os campos com migration reversa (`RemoveField`) — sem perda de dados críticos pois os campos são novos

## Open Questions

- **CNPJ / Razão social**: qual é o nome jurídico da empresa para as páginas legais? Usar `[AGUARDANDO CONFIRMAÇÃO]` até receber.
- **DPO (Data Protection Officer)**: quem é o responsável pelo tratamento de dados? E-mail de contato para privacidade?
- **Versioning das páginas legais**: a LGPD requer notificar titulares em caso de mudança material. Implementar versionamento agora ou deixar para fase futura?
