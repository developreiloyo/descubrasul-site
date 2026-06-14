# Prompt mejorado — Mockup UI/UX DescubraSul

> Funciona en Gemini (Canvas), Claude, v0, Lovable o cualquier herramienta que genere código. Cópialo completo.

---

Crea un mockup interactivo de alta fidelidad en **un solo archivo HTML** usando **Tailwind CSS (CDN)** e iconos de **Lucide** (CDN). Todo el texto visible de la interfaz debe estar en **portugués de Brasil (pt-BR)**. El resultado debe verse como el sitio real de una startup tecnológica lista para presentar a inversionistas — no como un wireframe.

## Contexto del producto

**DescubraSul** (descubrasul.com) es una vitrina digital y marketplace local del Sul de Santa Catarina, Brasil. Conecta consumidores con empresas, restaurantes, servicios y eventos de la región. Debe transmitir: confianza, modernidad, descubrimiento local y crecimiento empresarial. Referencias visuales: Airbnb (cards y espaciado), Google Maps (descubrimiento local), iFood (sección gastronómica).

## Sistema de diseño (obligatorio, no improvisar)

- **Colores:** primario verde oscuro `#0F3D2E`; acento dorado/ámbar `#D4A437`; fondo `#FFFFFF` y `#F8F7F4` para secciones alternas; texto principal `#1A1A1A`; texto secundario `#6B7280`.
- **Tipografía:** Google Fonts — "Plus Jakarta Sans" para títulos (700/800), "Inter" para cuerpo (400/500). Títulos de sección: 32–40px desktop, 24px mobile.
- **Componentes:** border-radius 16px en cards, 9999px (pill) en botones y badges; sombras suaves (`shadow-sm` en reposo, `shadow-lg` en hover); transiciones de 200ms en hovers.
- **Espaciado:** generoso — secciones con `py-20` desktop / `py-12` mobile; contenedor máx. 1200px centrado.
- **Iconos:** exclusivamente Lucide, trazo 1.5–2px, color del tema. **Nunca emojis.**
- **Imágenes:** usar `https://placehold.co/` con colores del tema o gradientes CSS verde→verde oscuro con un patrón sutil. No depender de fotos externas que puedan fallar.

## Estructura de la página (en este orden exacto)

### 1. Navbar (sticky)
Logo "DescubraSul" (texto, "Descubra" en verde + "Sul" en dorado), links: Início, Categorias, DescubraSul Food, Para Empresas. Botones: "Entrar" (ghost) y "Cadastre seu negócio" (sólido dorado). En mobile: menú hamburguesa.

### 2. Hero
Fondo verde oscuro con gradiente sutil y patrón decorativo. 
- H1: **"Descubra o melhor do Sul de Santa Catarina"** (palabra "melhor" en dorado)
- Subtítulo: "Empresas, restaurantes, serviços e oportunidades em um único lugar."
- Barra de búsqueda blanca elevada (shadow-xl) con dos campos — "O que você procura?" y "Em qual cidade?" (select con: Criciúma, Içara, Araranguá, Tubarão, Forquilhinha, Morro da Fumaça) — y botón dorado "Buscar" con icono de lupa.
- Debajo, microcopy de confianza: "+500 negócios cadastrados · 6 cidades · 100% regional"

### 3. Categorias em destaque
Grid de 10 cards compactas (5 col. desktop, 2 col. mobile), cada una con icono Lucide en círculo verde claro + nombre:
Restaurantes e cafés (`utensils`), Lojas e comércio (`shopping-bag`), Serviços profissionais (`wrench`), Casa e construção (`home`), Beleza e estética (`sparkles`), Automotivo (`car`), Eventos (`party-popper`), Turismo e hospedagem (`map-pin`), Educação (`graduation-cap`), Saúde e bem-estar (`heart-pulse`).

### 4. Empresas em destaque
Título + subtítulo + grid de 4 cards (1 col. mobile). Cada card: imagen de portada 16:9, logo circular sobrepuesto, nombre, badge de categoría, ciudad con icono `map-pin`, valoración con estrella dorada (ej. 4.8 · 127 avaliações), botón "Ver negócio". Usa negocios ficticios realistas, p. ej.: "Cantina Nonna Rosa" (Criciúma, Restaurante italiano, 4.9), "AutoCenter Sul" (Içara, Automotivo, 4.7), "Studio Bella Vita" (Tubarão, Beleza, 4.8), "Construsul Materiais" (Araranguá, Construção, 4.6). Una de las cards lleva badge dorado "Patrocinado".

### 5. DescubraSul Food (sección especial)
Fondo `#F8F7F4`, encabezado con badge "DescubraSul Food" en dorado. Inspiración iFood pero integrada al tema verde/dorado:
- Carrusel horizontal de restaurantes destacados (cards con foto, tiempo estimado, valoración)
- Fila de "Pratos mais pedidos" (cards pequeñas con precio en R$, ej. "Parmegiana da casa — R$ 42,90")
- Banner de promoción gastronómica
- Card destacada de "Cardápio digital QR" mostrando un mockup de QR code

### 6. Promoções e ofertas
3 cards llamativas con borde/acento dorado: descuento porcentual grande ("-30%"), nombre del negocio, condición ("válido até domingo") y botón "Aproveitar".

### 7. Cidades em destaque
Grid de 6 cards (3 col. desktop, 2 mobile) con imagen de fondo (gradiente + nombre superpuesto), nombre de la ciudad y contador de negocios: Criciúma (180 negócios), Içara (95), Araranguá (72), Tubarão (88), Forquilhinha (34), Morro da Fumaça (28).

### 8. Para empresas — benefícios
Fondo verde oscuro, texto blanco. Título: "Faça seu negócio crescer com o DescubraSul". Grid de 8 ítems con icono `check-circle` dorado: Perfil profissional, WhatsApp integrado, SEO para Google, Cardápio QR, Publicidade local, Métricas e insights, Google Maps, Fotos e vídeos profissionais. CTA dorado: "Cadastre seu negócio grátis".

### 9. Painel do comerciante (preview del dashboard)
Mockup de dashboard dentro de un frame de navegador estilizado, mostrando: 4 KPI cards (Visitas: 2.847, Cliques no WhatsApp: 312, Produtos vistos: 1.205, Promoções ativas: 3), un gráfico de barras simple en CSS (visitas por día), y una mini tabla "Ranking de produtos". Texto al lado explicando el valor para el dueño del negocio.

### 10. Footer
Verde oscuro, 4 columnas: logo + descripción corta, links de navegación, links legales (Privacidade, Termos), contacto + iconos sociales. Línea final: "© 2026 DescubraSul · Sul de Santa Catarina, Brasil".

## Requisitos técnicos

- **Mobile-first real:** todo debe verse perfecto a 375px y a 1280px. Carruseles con scroll horizontal en mobile.
- Publicidad integrada de forma natural (badge "Patrocinado" discreto), nunca invasiva.
- Hovers y microinteracciones sutiles (elevación de cards, cambio de color en botones).
- Sin JavaScript complejo: solo lo mínimo para el menú mobile.

## Qué NO hacer

- No usar emojis como iconos.
- No usar lorem ipsum — todo el contenido debe ser realista y en pt-BR.
- No usar morado/azul genérico de plantilla; respetar la paleta verde/dorado.
- No saturar: priorizar espacio en blanco y jerarquía clara.
- No mezclar idiomas en la UI (todo pt-BR; nada de español ni inglés visible).

---

## Tips de uso

- **Gemini / Claude:** pega el prompt tal cual; si la herramienta corta la generación por longitud, pide "continúa exactamente donde quedaste".
- **v0 / Lovable:** cambia la primera línea por "Crea una landing page en React + Tailwind" y elimina la mención al archivo HTML único.
- **Iteración:** genera primero la versión completa y luego refina sección por sección ("mejora solo la sección DescubraSul Food, hazla más densa visualmente").
- Para la presentación a inversionistas: abre el HTML en el navegador del celular y proyecta también la vista desktop — eso demuestra el mobile-first mejor que cualquier slide.
