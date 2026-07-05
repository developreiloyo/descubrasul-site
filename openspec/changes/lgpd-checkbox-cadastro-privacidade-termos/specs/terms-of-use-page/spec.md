## ADDED Requirements

### Requirement: Página /termos com conteúdo legal completo
A rota `/termos` SHALL ser uma página SSR (Server Component Next.js) com conteúdo completo dos Termos de Uso cobrindo obrigatoriamente: objeto do serviço, cadastro e responsabilidades do comerciante, planos e pagamentos, propriedade intelectual, limitação de responsabilidade, rescisão, lei aplicável e foro (Criciúma/SC).

#### Scenario: Acesso à página como visitante não autenticado
- **WHEN** qualquer usuário acessa `/termos`
- **THEN** a página é renderizada com status HTTP 200 e conteúdo legível sem necessidade de login

#### Scenario: Seções obrigatórias presentes na página
- **WHEN** a página `/termos` é renderizada
- **THEN** o HTML contém as seções: "Objeto", "Cadastro", "Planos e Pagamentos", "Obrigações do Comerciante", "Propriedade Intelectual", "Limitação de Responsabilidade", "Rescisão", "Foro"

#### Scenario: Foro competente indicado corretamente
- **WHEN** a página `/termos` é renderizada
- **THEN** a seção "Foro" menciona a comarca de Criciúma, Estado de Santa Catarina

---

### Requirement: Metadata SEO da página de termos
A página `/termos` SHALL exportar `generateMetadata()` com `title` de até 60 caracteres, `description` de até 160 caracteres, e `robots: { index: false, follow: false }`.

#### Scenario: Metadata gerada corretamente
- **WHEN** Next.js processa a rota `/termos`
- **THEN** o `<head>` contém `<meta name="robots" content="noindex,nofollow">` e título/descrição dentro dos limites

---

### Requirement: JSON-LD WebPage na página de termos
A página `/termos` SHALL incluir Schema.org `WebPage` via componente `JsonLd` com `name`, `description`, `url`, e `dateModified`.

#### Scenario: JSON-LD presente no HTML
- **WHEN** a página `/termos` é renderizada no servidor
- **THEN** o HTML contém `<script type="application/ld+json">` com `@type: "WebPage"` e os campos obrigatórios preenchidos
