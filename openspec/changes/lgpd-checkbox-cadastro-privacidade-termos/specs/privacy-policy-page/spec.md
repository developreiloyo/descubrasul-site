## ADDED Requirements

### Requirement: Página /privacidade com conteúdo LGPD completo
A rota `/privacidade` SHALL ser uma página SSR (Server Component Next.js) com conteúdo completo da Política de Privacidade conforme art. 9º da LGPD, cobrindo obrigatoriamente: identificação do controlador, dados coletados, finalidade do tratamento, base legal, retenção, compartilhamento, direitos do titular, canal de contato do DPO.

#### Scenario: Acesso à página como visitante não autenticado
- **WHEN** qualquer usuário acessa `/privacidade`
- **THEN** a página é renderizada com status HTTP 200 e conteúdo legível sem necessidade de login

#### Scenario: Seções obrigatórias presentes na página
- **WHEN** a página `/privacidade` é renderizada
- **THEN** o HTML contém as seções: "Quem somos", "Dados que coletamos", "Como usamos seus dados", "Base legal", "Retenção de dados", "Compartilhamento", "Seus direitos", "Contato"

---

### Requirement: Metadata SEO da página de privacidade
A página `/privacidade` SHALL exportar `generateMetadata()` com `title` de até 60 caracteres, `description` de até 160 caracteres, e `robots: { index: false, follow: false }` (páginas legais não devem ser indexadas como conteúdo principal).

#### Scenario: Metadata gerada corretamente
- **WHEN** Next.js processa a rota `/privacidade`
- **THEN** o `<head>` contém `<meta name="robots" content="noindex,nofollow">` e título/descrição dentro dos limites

---

### Requirement: JSON-LD WebPage na página de privacidade
A página `/privacidade` SHALL incluir Schema.org `WebPage` via componente `JsonLd` com `name`, `description`, `url`, e `dateModified`.

#### Scenario: JSON-LD presente no HTML
- **WHEN** a página `/privacidade` é renderizada no servidor
- **THEN** o HTML contém `<script type="application/ld+json">` com `@type: "WebPage"` e os campos obrigatórios preenchidos
