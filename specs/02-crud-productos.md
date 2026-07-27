# 02 — CRUD de Produtos (implementado, spec de referencia)

## Estado

**Completado y en producción.** Este documento no describe trabajo pendiente — es referencia técnica para que futuras sesiones de agente entiendan las decisiones ya tomadas antes de tocar este código, y no repitan diagnóstico ya resuelto.

## Alcance funcional

- Alta, edición, eliminación y listado de productos por negocio (merchant).
- Cada producto puede tener una o más fotos asociadas (modelo `FotoProduto`).
- Ordenamiento manual de productos dentro del panel del merchant.
- Marcado de producto como "destacado" (`destacar`) para priorizar su visibilidad en el perfil público.
- Límites de cantidad de productos/imágenes aplicados según el plan del merchant.

## Decisiones técnicas y lecciones aprendidas

Estas son las partes que costaron tiempo de diagnóstico — documentadas para no volver a perder tiempo si el código se toca de nuevo.

### 1. Validación de archivos con `python-magic`

No se confía en la extensión del archivo (`.jpg`, `.png`) ni en el `Content-Type` que manda el cliente — ambos son falsificables. Se usa `python-magic` para inspeccionar los primeros bytes del archivo y confirmar el tipo real (magic numbers). Esto es lo que impide que alguien suba un archivo ejecutable renombrado como imagen.

### 2. Límites de plan

La cantidad de productos y fotos permitidas depende del plan del merchant (Fundador vs. planes superiores). La validación de límite ocurre en el momento de creación/subida, no solo en el frontend — el frontend puede ocultar el botón de "agregar", pero el backend es la barrera real.

### 3. Fix de multipart a través del proxy (Traefik)

Hubo un bug donde las subidas multipart (fotos de producto) fallaban específicamente al pasar por Traefik en producción, aunque funcionaban en local. Causa raíz: configuración de proxy que no preservaba correctamente el body multipart. Si se toca la configuración de Traefik o se migra de proxy, este es un punto de regresión a revisar primero.

### 4. Orden de URLs de Django

Django resuelve URLs en el orden en que están declaradas — una ruta más genérica declarada antes que una más específica puede "capturar" requests que deberían ir a la específica. Esto causó bugs de rutas silenciosos (no error 404, sino la vista equivocada respondiendo). Lección: rutas específicas de producto (`/productos/<id>/destacar/`, etc.) deben declararse antes que rutas genéricas (`/productos/<slug>/`).

### 5. Booleanos en multipart con DRF

En un `multipart/form-data`, todos los valores llegan como string — un campo booleano como `destacar` llega como `"true"` o `"false"` (string), no como `True`/`False` nativo de Python. DRF no lo castea automáticamente en todos los casos. Esto causó que el campo `destacar` se guardara siempre como `True` (porque cualquier string no vacío es truthy en Python) hasta que se corrigió el serializer para castear explícitamente.

## Modelos involucrados

- `Produto` — datos base del producto (nombre, descripción, precio, negocio asociado, orden, destacar).
- `FotoProduto` — relación uno-a-muchos con `Produto`, cada foto con su propio archivo validado.

## Campos del modelo `Produto` (estado actual)

| Campo | Tipo | Notas |
|---|---|---|
| `nome` | CharField(200) | Nombre libre que el comercio elige para su vitrina pública |
| `descricao` | TextField | Descripción corta |
| `descricao_longa` | TextField | Descripción extendida |
| `categoria` | CharField(100) | Clasificación interna del producto |
| `preco` | DecimalField(null) | Precio en BRL, opcional |
| `disponivel` | BooleanField | `True` = visible en vitrina. Oculto automáticamente a los 30 días sin confirmación |
| `alt_foto` | CharField(125) | Alt text de la foto principal (accesibilidad + SEO) |
| `ordem` | PositiveIntegerField | Posición manual en el panel del comerciante |
| `slug` | SlugField | Auto-generado, estable, usado en URLs |
| `confirmado_em` | DateTimeField(null) | Última confirmación de disponibilidad — base del timer de 30 días |
| `tipo_produto` | CharField(120, null, blank) | **Campo nuevo (agregado post-MVP inicial, migración 0011).** Equivalente al `product_type` de Google Merchant Center — clasificación granular dentro de la categoría del negocio. Ejemplos: "Pizza", "Corte de cabelo", "Prato executivo". Usado por el backend para generar automáticamente el título del feed de Google (ver `specs/05-merchant-center-integration.md` sección 11.1). Los productos existentes lo tienen en `NULL` y siguen funcionando sin cambios. |

## Qué NO cubre este spec

- El flujo de búsqueda semántica de productos (pgvector + MiniLM) — pendiente de documentar aparte si aplica.
- La UI del carrusel de productos en el perfil público — es frontend, este spec es backend/API.
- La lógica de generación del título de feed a partir de `tipo_produto` — documentada en `specs/05-merchant-center-integration.md` sección 11.2.

---
*Última actualización: 2026-07-26. Si se modifica este módulo, actualizar este documento y volver a guardarlo en Engram para que la memoria no quede desactualizada respecto al código real.*
