## 1. Backend — Model e Migration

- [ ] 1.1 Adicionar campos `lgpd_accepted_at` (DateTimeField, null=True) e `lgpd_accepted_ip` (GenericIPAddressField, null=True) ao model `User` em `backend/usuarios/models.py`
- [ ] 1.2 Gerar migration `0002_user_lgpd_fields` via `python manage.py makemigrations usuarios`
- [ ] 1.3 Verificar que a migration é reversível (campos nullable não requerem `default`)

## 2. Backend — Serializer e Service

- [ ] 2.1 Adicionar campo write-only `lgpd_accepted` (BooleanField, required=True) ao `CadastroSerializer` em `backend/usuarios/serializers.py`
- [ ] 2.2 Implementar `validate_lgpd_accepted` no serializer que rejeita `False` com mensagem de erro em PT-BR
- [ ] 2.3 Atualizar `registrar_cadastro()` em `backend/usuarios/services.py` para receber e salvar `lgpd_accepted_at=timezone.now()` e `lgpd_accepted_ip`
- [ ] 2.4 Atualizar `CadastroView` em `backend/usuarios/views.py` para extrair IP de `HTTP_X_FORWARDED_FOR` ou `REMOTE_ADDR` e passar ao service

## 3. Backend — Testes

- [ ] 3.1 Escrever teste: POST `/api/usuarios/cadastro/` sem `lgpd_accepted` retorna HTTP 400
- [ ] 3.2 Escrever teste: POST `/api/usuarios/cadastro/` com `lgpd_accepted: false` retorna HTTP 400
- [ ] 3.3 Escrever teste: cadastro válido com `lgpd_accepted: true` persiste `lgpd_accepted_at` e `lgpd_accepted_ip` no banco

## 4. Frontend — Formulário de Cadastro

- [ ] 4.1 Adicionar state `lgpdAccepted` (boolean, default `false`) ao formulário em `frontend/src/app/painel/cadastro/page.tsx`
- [ ] 4.2 Renderizar checkbox com label "Li e aceito a [Política de Privacidade] e os [Termos de Uso]" — links para `/privacidade` e `/termos` em `<Link>` separados
- [ ] 4.3 Desabilitar o botão "Criar conta" enquanto `lgpdAccepted === false`
- [ ] 4.4 Incluir `lgpd_accepted: true` no payload do POST ao submeter o formulário

## 5. Frontend — Página /privacidade

- [ ] 5.1 Criar/atualizar `frontend/src/app/privacidade/page.tsx` com Server Component SSR
- [ ] 5.2 Escrever conteúdo completo da Política de Privacidade em PT-BR (seções: Quem Somos, Dados Coletados, Como Usamos, Base Legal, Retenção, Compartilhamento, Seus Direitos, Contato) — usar `[AGUARDANDO CONFIRMAÇÃO]` para CNPJ e razão social
- [ ] 5.3 Exportar `generateMetadata()` com title ≤60 chars, description ≤160 chars, `robots: { index: false, follow: false }`
- [ ] 5.4 Incluir JSON-LD `WebPage` via componente `JsonLd` com `name`, `description`, `url`, `dateModified`

## 6. Frontend — Página /termos

- [ ] 6.1 Criar/atualizar `frontend/src/app/termos/page.tsx` com Server Component SSR
- [ ] 6.2 Escrever conteúdo completo dos Termos de Uso em PT-BR (seções: Objeto, Cadastro, Planos e Pagamentos, Obrigações do Comerciante, Propriedade Intelectual, Limitação de Responsabilidade, Rescisão, Foro Criciúma/SC) — usar `[AGUARDANDO CONFIRMAÇÃO]` para CNPJ e razão social
- [ ] 6.3 Exportar `generateMetadata()` com title ≤60 chars, description ≤160 chars, `robots: { index: false, follow: false }`
- [ ] 6.4 Incluir JSON-LD `WebPage` via componente `JsonLd` com `name`, `description`, `url`, `dateModified`
