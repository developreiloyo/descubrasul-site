# 00 — Visión General: DescubraSul

## Qué es

DescubraSul (descubrasul.com) es una vitrine digital regional para pequenas e médias empresas (PMEs) do Sul de Santa Catarina, Brasil. No es un "diretório" — es la plataforma que da presencia digital profesional a negocios que hoy no la tienen, o la tienen incompleta.

**Framing comercial clave:** hablar de "vitrine digital", nunca de "diretório". El diretório es genérico y pasivo; la vitrine implica curaduría, presentación y venta activa del negocio.

## Para quién

- **Merchant / dono de negócio**: PME que quiere presencia online sin construir un sitio propio. Necesita: perfil público atractivo, catálogo de productos, redes sociales conectadas, métricas simples de quién lo está viendo.
- **Usuario final / consumidor**: persona buscando negocios locales por cidade/categoria. Necesita: búsqueda rápida, información confiable, contacto directo.
- **Operador (Reinaldo)**: necesita onboarding rápido de merchants, analíticas agregadas, y un modelo de monetización sostenible.

## Modelo de negocio

Tres planes anuales permanentes. El diferenciador clave es el onboarding manual del Google Business Profile del merchant — algo que la competencia automatizada no ofrece y que genera confianza inicial.

| Feature | Presença Sul (Grátis) | Conexão Sul (R$197/ano) | Destaque Sul (R$397/ano) |
|---|---|---|---|
| Produtos no perfil público | Até 10 | Ilimitado | Ilimitado |
| Imagens por produto | 1 (capa) | Até 3 | Até 3 |
| Destacar produtos no perfil | Não | Sim | Sim |
| Google Merchant Center (Shopping) | Não | Sim | Sim |
| Dashboard de métricas (AARRR) | Não | Sim | Sim |
| IA: gerador de texto e alt text | Não | Sim | Sim |
| Onboarding Google Business Profile | Guia PDF | Setup único | Setup + gestão mensal |
| Menú digital (alimentação) | Não | Sim | Sim |
| Google Ads | — | Add-on separado | Add-on separado |

**Google Ads como add-on:** se ofrece como servicio opcional y separado para los plans Pro y Produção — no está incluido en el precio anual base de ningún plan.

**Menú digital:** feature para negocios de alimentación que puede funcionar como gancho de adquisición, herramienta de retención o upsell. En evaluación para Fase 2 — no bloqueante para el lanzamiento.

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

## Criterio de lanzamiento mínimo viable (por ciudad/categoría)

Una ciudad o categoría no se muestra públicamente en el menú/búsqueda hasta
alcanzar un mínimo de negocios activos con catálogo completo. Objetivo:
evitar que el usuario final llegue a una vitrine vacía o con pocos
resultados, lo cual daña la percepción de la plataforma más que no mostrar
esa sección todavía.

- **Mínimo recomendado:** 6-10 negocios activos por categoría dentro de
  una ciudad antes de habilitarla en el menú público
- Los negocios pueden estar cargados y operativos en el sistema (el
  merchant ya tiene su panel funcionando) sin que la ciudad/categoría sea
  visible públicamente — el ocultamiento es solo de cara al usuario final,
  no restringe el onboarding del merchant
- Cuando una ciudad no llega al mínimo en ninguna categoría, se mantiene
  fuera del menú de navegación principal hasta alcanzarlo

## Fases de expansión geográfica

El lanzamiento inicial (7 cidades) prioriza el núcleo geográfico
más cercano a la operación actual, dejando las ciudades más alejadas para
una fase posterior una vez validado el modelo de curaduría y onboarding.

**Fase 1 — núcleo cercano (prioridad de lanzamiento):**
- Içara
- Criciúma
- Tubarão
- Cerro de Fumaça

**Fase posterior — ciudades más alejadas (no bloqueantes para el
lanzamiento inicial):**
- Florianópolis
- *(agregar el resto de las 7 cidades conforme se definan)*

**Criterio para mover una ciudad de "fase posterior" a activa:** cumplir
el mínimo de negocios por categoría definido arriba, y contar con
capacidad operativa real de onboarding manual (Google Business Profile)
para esa zona — el diferencial de DescubraSul depende de ese trabajo
manual, así que no conviene abrir una ciudad lejana sin poder sostenerlo.

## Principio de decisión para features nuevas

Antes de construir algo nuevo, preguntar: ¿esto ayuda a un merchant a mostrar mejor su negocio, o a un usuario a encontrarlo más rápido? Si la respuesta no es clara, no es prioridad para el MVP.

## Specs relacionados

- `01-seguridad.md` — LGPD, gestión de credenciales, adendo v3.3 (próximo a crear)
- `02-crud-productos.md` — ya implementado, documentar como referencia
- `03-oauth-google.md` — pendiente, no iniciado
- `04-password-reset.md` — pendiente pre-lanzamiento (ya implementado en merchant panel — verificar si esto sigue pendiente o si el pendiente real es otro flujo)

## Pendientes

### Integración con Odoo para administración interna

DescubraSul necesita conectarse con Odoo (versión Enterprise, ya licenciada) para gestionar la administración interna del negocio — no como parte del producto que ven los comercios/usuarios finales, sino como panel de control operativo.

**Alcance identificado:**
- Facturación de los planes anuales (Presença Sul / Conexão Sul / Destaque Sul) a los comercios
- Conciliación de pagos vía Mercado Pago
- Cálculo y pago de comisiones a vendedores por ventas realizadas
- Visibilidad de márgenes de ganancia (ingresos por plan vendido vs. costos operativos)
- Proyecciones financieras

**Estado: NO resuelto.** Los porcentajes y reglas de comisión para vendedores se están definiendo (referencia: semana del 26/07/2026) — no arrancar ninguna configuración de comisiones en Odoo hasta tener esas reglas cerradas. Este punto queda documentado como pendiente, no como tarea lista para implementar.

---
*Última actualización: 2026-07-26. Este documento es la fuente de verdad de alto nivel — cualquier spec más específico debe alinearse con los principios acá descritos, no contradecirlos.*
