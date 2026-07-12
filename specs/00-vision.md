# 00 — Visión General: DescubraSul

## Qué es

DescubraSul (descubrasul.com) es una vitrine digital regional para pequenas e médias empresas (PMEs) do Sul de Santa Catarina, Brasil. No es un "diretório" — es la plataforma que da presencia digital profesional a negocios que hoy no la tienen, o la tienen incompleta.

**Framing comercial clave:** hablar de "vitrine digital", nunca de "diretório". El diretório es genérico y pasivo; la vitrine implica curaduría, presentación y venta activa del negocio.

## Para quién

- **Merchant / dono de negócio**: PME que quiere presencia online sin construir un sitio propio. Necesita: perfil público atractivo, catálogo de productos, redes sociales conectadas, métricas simples de quién lo está viendo.
- **Usuario final / consumidor**: persona buscando negocios locales por cidade/categoria. Necesita: búsqueda rápida, información confiable, contacto directo.
- **Operador (Reinaldo)**: necesita onboarding rápido de merchants, analíticas agregadas, y un modelo de monetización sostenible.

## Modelo de negocio

- Cuatro planes anuales + plan de lanzamiento **"Fundador"**: 50 cupos, 7 cidades, R$599/año.
- Diferenciador clave: onboarding manual del Google Business Profile del merchant — algo que la competencia automatizada no ofrece y que genera confianza inicial.
- Fase 2 en evaluación: menú digital para negocios de alimentación — puede funcionar como gancho de adquisición, herramienta de retención, o upsell del plan Pro. Decisión pendiente, no bloqueante para el lanzamiento.

## Qué NO es (por ahora)

- No es una plataforma con IA generativa desde el día uno. MVP lanza **sin IA**; se activa en el mes 3 después de medir comportamiento real de merchants.
- Cuando se active, las features de IA (generador de texto, alt text, insights de ventas) son exclusivas del plan Pro, usando Claude Haiku por costo.
- No compite en volumen con directorios genéricos (Google Maps, Páginas Amarillas) — compite en calidad de presentación y curaduría regional.

## Stack técnico (referencia rápida — detalle en specs de infraestructura)

- **Backend**: Django 5 + DRF + Celery + Postgres 16 + pgvector + Redis 7
- **Frontend**: Next.js 16 + TypeScript + Tailwind 4
- **Media**: Cloudflare R2
- **Infra**: Hostinger Ubuntu VPS, Docker Compose + Traefik (sin EasyPanel), CI/CD vía GitHub Actions
- **Repo**: `github.com/developreiloyo/descubrasul-site`
- **Búsqueda semántica**: pgvector + multilingual MiniLM, costo cero
- **Pagos**: Mercado Pago, suscripciones recurrentes

## Estado actual (referencia — actualizar conforme avance)

- Producción activa en el VPS. Ocho bugs de producción resueltos y desplegados.
- Rediseño visual completado en `feat/redesign-visual-v1` (Playfair Display, CategoryCard/CityCard/PromoCard, scroll reveal).
- **Pendiente crítico**: reconciliar `main` con `stable/etapa1-producao` — ramas divergidas.
- Panel de merchant funcional: alta atómica de User+Negocio, auto-login, formulario "Meu Negócio" con autocomplete ViaCEP, CRUD de productos con validación python-magic, ordenamiento/destacar productos, reset de password vía email (Resend SMTP).
- Analíticas: modelos Clique y MetricaDiaria, endpoint de tracking con rate limiting, agregación nocturna vía Celery Beat.
- Páginas públicas: `/cidades/{slug}` con schema ItemList, sitemap dinámico, URL corta `/p/{slug}`, perfil público con carrusel de productos.

## Principio de decisión para features nuevas

Antes de construir algo nuevo, preguntar: ¿esto ayuda a un merchant a mostrar mejor su negocio, o a un usuario a encontrarlo más rápido? Si la respuesta no es clara, no es prioridad para el MVP.

## Specs relacionados

- `01-seguridad.md` — LGPD, gestión de credenciales, adendo v3.3 (próximo a crear)
- `02-crud-productos.md` — ya implementado, documentar como referencia
- `03-oauth-google.md` — pendiente, no iniciado
- `04-password-reset.md` — pendiente pre-lanzamiento (ya implementado en merchant panel — verificar si esto sigue pendiente o si el pendiente real es otro flujo)

---
*Última actualización: 2026-07-12. Este documento es la fuente de verdad de alto nivel — cualquier spec más específico debe alinearse con los principios acá descritos, no contradecirlos.*
