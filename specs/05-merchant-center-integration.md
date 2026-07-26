# 05 — Integración con Google Merchant Center

## Estado al 26/07/2026

| Etapa | Estado |
|---|---|
| Configuración manual en Google (cuenta, dominio, service account, credenciales) | ✅ COMPLETA |
| Página `/politica-devolucoes` publicada y registrada en Merchant Center | ✅ COMPLETA |
| Campo `tipo_produto` en modelo `Produto` (migración 0011) | ✅ COMPLETA |
| Implementación técnica: serialización, tarea Celery, MCP de desarrollo | 🔴 NO INICIADA — próximo paso |

> **⚠️ CRÍTICO — API a usar:** La implementación técnica debe usar la **Merchant API (v1)** (`merchants.googleapis.com/v1beta/...`). La **Content API for Shopping** está **DEPRECADA** y Google la apaga el **18 de agosto de 2026**. Ningún código nuevo debe usar la Content API. Toda la documentación anterior a esta fecha que mencione `content.googleapis.com` queda obsoleta.

---

## 1. Objetivo

Sincronizar automáticamente los productos activos de DescubraSul con Google Merchant Center para que aparezcan de forma orgánica y gratuita en:
- Google Shopping (pestaña de producto)
- Google AI Mode (recomendaciones generadas por IA)
- Google AI Overviews (citas en resúmenes de búsqueda)
- Google Maps / Business Profile (cuando el negocio ya tiene ficha vinculada)

El comercio no interactúa con Merchant Center en ningún momento — sigue usando el CRUD de producto existente en DescubraSul. La sincronización es un proceso interno, invisible para el usuario final.

**Nota sobre el modelo de negocio:** DescubraSul es una vitrina, no un marketplace. No hay checkout, carrito ni pago dentro de la plataforma — la venta se cierra fuera de DescubraSul, por WhatsApp o llamada telefónica entre el cliente y el negocio. Esto simplifica varios atributos del feed de Google (ver secciones 4 y 7): no aplican política de envío variable, tiempos de tránsito ni política de devoluciones en el sentido tradicional de un e-commerce.

## 2. Alcance

**Incluye:**
- Serialización de `Producto` + `Negocio` al formato del feed de Google
- Autenticación OAuth2 contra la Merchant API (Google)
- Tarea periódica de sincronización (Celery Beat)
- Manejo y registro de errores/rechazos por producto
- Actualización incremental (solo productos creados/modificados/eliminados desde la última sync)

**No incluye (fuera de alcance de este spec):**
- Creación manual de la cuenta de Merchant Center en Google (paso administrativo, se hace una sola vez fuera del código)
- Campañas pagas de Shopping Ads, Performance Max o AI Max
- Checkout o venta directa dentro de Google (Google Shopping Actions)

## 3. Modelo de cuenta: aggregator vs cuentas individuales

Dado que DescubraSul es multi-tenant (múltiples negocios bajo una sola plataforma), se recomienda el modelo **Merchant Center Advanced Account (aggregator)**:

- Una cuenta "padre" de DescubraSul
- Sub-cuentas por negocio (o, en una primera versión más simple, un único feed consolidado con el campo `link` apuntando a la página específica de cada producto/negocio)

Para la v1 de este spec, se recomienda **feed consolidado** (una sola sub-cuenta, todos los negocios en el mismo feed, diferenciados por `id` de producto). Migrar a sub-cuentas por negocio queda como mejora futura si el volumen lo justifica.

## 4. Mapeo de campos: `Producto`/`Negocio` → atributos del feed

| Atributo Google (requerido) | Origen en DescubraSul | Notas |
|---|---|---|
| `id` | `Producto.id` o slug único | Debe ser estable entre syncs |
| `title` | Generado automáticamente (ver sección 11) — NO es `Producto.nombre` tal cual | Máx. 150 caracteres. El comercio sigue viendo/editando su propio nombre de producto en su vitrina pública; el feed usa un título optimizado generado por separado |
| `description` | `Producto.descripcion` + línea fija de contacto | Máx. 5000 caracteres, sin HTML. Agregar al final: "Consulta disponibilidad y coordina tu pedido por WhatsApp" (o equivalente), para que el usuario entienda que el siguiente paso es contactar al negocio, no comprar en línea |
| `link` | `https://descubrasul.com/p/{negocio.slug}/{producto.slug}` | Debe apuntar a la página real del producto |
| `image_link` | `Producto.foto_principal.url` | Mínimo 100x100px, recomendado 800x800px |
| `additional_image_link` | `Producto.fotos_adicionales` | Hasta 10 imágenes |
| `availability` | Derivado de `Producto.stock` / `Producto.activo` | `in stock` / `out of stock` / `preorder` |
| `price` | `Producto.precio` + moneda `BRL` | Formato `"99.90 BRL"` |
| `condition` | Fijo: `new` | Todos los productos son nuevos |
| `brand` | `Negocio.nombre` | Si el producto no tiene marca propia, usar el nombre del comercio |
| `google_product_category` | Mapeo manual por categoría interna | Requiere tabla de mapeo (ver sección 6) |
| `mpn` o `gtin` | Opcional si no aplica | Muchos productos locales/artesanales no tienen GTIN — usar `identifier_exists: false` en ese caso |

**Atributos recomendados adicionales:**
- `shipping` — al no haber logística ni checkout dentro de la plataforma (venta cerrada por WhatsApp/llamada), se declara una única política estática y plana a nivel de cuenta (ej. "consultar con el negocio", costo $0 nominal), no una política variable por negocio. No requiere campo nuevo en `Negocio` ni configuración por comercio
- `google_product_category` — necesario para que Google clasifique bien el producto y lo muestre en búsquedas relevantes

## 5. Autenticación

- Usar OAuth2 con **service account** (no el flujo interactivo de usuario) para que la sincronización corra sin intervención humana
- Habilitar **Merchant API** en Google Cloud Console — **NO la Content API for Shopping**, que Google deprecó y apaga por completo el 18 de agosto de 2026
- Guardar credenciales como secret (mismo patrón que las demás integraciones — Resend, Cloudflare R2), nunca en el repo
- Scope necesario: verificar el scope vigente de la Merchant API al momento de implementar (la Content API usaba `https://www.googleapis.com/auth/content`; confirmar si la Merchant API mantiene el mismo scope o requiere uno nuevo, dado que es una API distinta con estructura modular)

**Diferencias técnicas relevantes de la Merchant API frente a la Content API (a tener en cuenta en Fase 3 de implementación):**
- Arquitectura modular: sub-APIs separadas (Accounts, Products/Inventories, Reports, Promotions) en vez de una API monolítica
- Los recursos se identifican por `name` (no solo `id`), y las operaciones sobre recursos hijos requieren un campo `parent`
- El precio ya no es un string combinado tipo `"99.90 BRL"` — ahora se especifica como `amountMicros` (entero) + `currencyCode` (string) por separado
- `customBatch` no está soportado — la Merchant API tiene un mecanismo distinto para operaciones en lote, a revisar en la documentación oficial al implementar
- Librería recomendada: usar el cliente oficial de Google para Merchant API (no el cliente legado de Content API), verificando disponibilidad para Python al momento de implementar

## 6. Mapeo de categorías (`google_product_category`)

DescubraSul ya tiene categorías internas (usadas en el merchant panel). Se necesita una tabla de mapeo:

```
Categoria interna DescubraSul → Google Product Category (taxonomía oficial)
```

Ejemplo:
- "Restaurantes / Comida" → `Food, Beverages & Tobacco > Food Items`
- "Moda / Ropa" → `Apparel & Accessories > Clothing`

La taxonomía completa de Google está en un archivo de texto público (`google_product_category` taxonomy) que se puede cachear localmente para hacer el mapeo por keyword o selección manual del dueño del comercio al crear la categoría.

**Política de devoluciones:** no aplica en el sentido tradicional — no hay transacción ni pago dentro de DescubraSul que reembolsar. Se declara a nivel de cuenta una política mínima/nula compatible con los requisitos de aprobación de Merchant Center, sin necesidad de definir plazos ni condiciones reales de devolución.

## 7. Sincronización (tarea Celery)

**Frecuencia:** diaria (alineado con el patrón ya usado en `MetricaDiaria`/Celery Beat nocturno)

**Lógica:**
1. Query de productos `activo=True` modificados desde la última sincronización exitosa
2. Serializar cada uno al formato JSON de la Merchant API (confirmar en Fase 3 el método/endpoint equivalente a la antigua `products.insert` — la Merchant API usa naming por `name`/`parent`, ver sección 5)
3. Enviar en batch (la API soporta `custombatch` para múltiples productos en una sola llamada)
4. Para productos que dejaron de estar activos o fueron eliminados: llamar `products.delete`
5. Registrar resultado por producto: éxito, advertencia (warning de Google, ej. imagen de baja calidad) o error (rechazo, ej. campo faltante)

**Modelo nuevo sugerido:** `SincronizacionMerchantCenter` (o extender el patrón de logging que ya usan para otras integraciones) con:
- `producto` (FK)
- `estado` (éxito / warning / error)
- `mensaje_google` (texto del error/warning devuelto por la API)
- `timestamp`

## 8. Manejo de errores

- Rechazos de Google no deben bloquear la sincronización del resto del batch
- Errores recurrentes (mismo producto fallando varios días seguidos) deberían generar una alerta visible en el panel del comerciante ("tu producto no se está mostrando en Google — falta: X") para que el negocio pueda corregirlo
- Errores comunes esperados: falta de `gtin`/`identifier_exists`, categoría no mapeada, imagen menor al mínimo requerido

## 9. Criterios de aceptación

- [ ] Cuenta de Merchant Center creada y verificada para `descubrasul.com`
- [ ] Merchant API (no Content API, deprecada) habilitada y credenciales de service account configuradas
- [ ] Servicio de serialización `Producto` → feed implementado y testeado
- [ ] Tarea Celery Beat corriendo diariamente sin intervención manual
- [ ] Tabla de mapeo de categorías completa para las categorías internas existentes
- [ ] Logging de errores por producto visible para debugging
- [ ] Al menos 3 negocios piloto con productos apareciendo verificablemente en Google Shopping

## 10. Preguntas abiertas

- ¿El comerciante debe poder ver el estado de sincronización de sus productos en su panel (Pro dashboard), o esto queda como tarea interna de DescubraSul?
- ¿Se ofrece como feature exclusiva de los planes Pro/Produção, o está disponible desde el plan Básico?
- ¿Se necesita GTIN real para productos de comercio local (ej. comida preparada, servicios) o se declara `identifier_exists: false` de forma permanente para esas categorías?

## 11. Optimización del feed (basado en mejores prácticas de SEO de producto)

**Por qué importa:** un título de producto bien estructurado aumenta lo que Google llama "potencial de clics" — cuando el título coincide mejor con lo que la gente realmente busca, Google le da más visibilidad al producto y, si en el futuro se activan campañas pagas (ver spec `06-google-ads-integracion.md`), reduce directamente el costo por clic.

**Diferencia clave con un e-commerce tradicional:** las guías estándar de optimización de feed asumen que el dueño de la tienda edita títulos manualmente o los pasa por un lote de IA sobre un Excel. En DescubraSul eso no aplica — el comercio nunca toca el feed. La optimización tiene que ser **automática**, generada por el backend a partir de datos que el comercio ya carga en su formulario normal.

### 11.1 Nuevo campo en `Producto`: `tipo_producto`

Equivalente al `product_type` de Google — una clasificación más granular que la categoría general, pensada para dar contexto de búsqueda.

- Ejemplo: categoría general = "Restaurantes / Comida" → `tipo_producto` = "Pizza", "Hambúrguer", "Prato executivo", etc.
- Puede implementarse como un campo de texto libre con sugerencias (autocomplete) basadas en lo que otros negocios de la misma categoría ya cargaron, para mantener consistencia sin forzar un dropdown rígido

### 11.2 Título del feed: generación automática, no editable por el comercio

El comercio sigue escribiendo el nombre que quiera para su vitrina pública (`Producto.nombre` — puede ser informal, de marca, "Combo Família", etc.). El feed hacia Google usa un **título distinto**, construido automáticamente combinando:

```
{tipo_producto} + {atributo descriptivo si existe} + {ciudad del negocio}
```

Ejemplo:
- `Producto.nombre` (lo que ve el público en DescubraSul): "Combo Família"
- `tipo_producto`: "Pizza"
- Atributo descriptivo (si se cargó): "4 sabores"
- Ciudad del negocio: "Criciúma"
- **Título generado para el feed:** "Pizza família 4 sabores — Criciúma"

Esto aprovecha la ventaja real de DescubraSul frente a un feed genérico: la intención de búsqueda local ("pizza [ciudad]", "corte de cabelo [ciudad]") es exactamente el tipo de término específico que mejora el potencial de clics, según coinciden las guías de optimización.

**Reglas para el generador automático:**
- Nunca incluir códigos internos, IDs, o referencias tipo "v25", "ref-123" (si el comercio los pone en `Producto.nombre`, el generador los filtra, no los copia al feed)
- Priorizar `tipo_producto` sobre `Producto.nombre` como base del título — el nombre libre del comercio queda solo como fuente secundaria si `tipo_producto` está vacío
- Longitud máxima 150 caracteres (límite de Google)

### 11.3 Descripción: mismo criterio que el título

`description` ya contempla (sección 4) la línea automática de contacto por WhatsApp. Se recomienda además incluir `tipo_producto` y cualquier atributo cargado (si en el futuro se agregan campos como color/tamaño para rubros que lo necesiten, ej. moda o artesanía) para dar más contexto a Google sin depender de que el comercio redacte una descripción extensa.

### 11.4 Limpieza del feed

Al serializar `Producto` → JSON de la Merchant API (sección 7), incluir únicamente los atributos que Google reconoce (tabla de la sección 4). No trasladar campos internos de Django (timestamps de auditoría, flags internos, IDs de otras tablas) al payload — mantiene el feed limpio y evita rechazos por atributos no reconocidos.

### 11.5 Fuera de alcance para v1

- Multilenguaje/multi-país en el feed (DescubraSul opera solo en portugués/BRL por ahora — no aplica la necesidad de herramientas tipo DataFeedWatch mencionadas en guías de feeds internacionales)
- Feed complementario vía Google Sheets — esa técnica está pensada para tiendas que exportan/reimportan manualmente; como DescubraSul sincroniza automáticamente desde Django, no hace falta ese paso intermedio. Si en el futuro se quisiera iterar rápido sobre títulos sin tocar código (por ejemplo, para probar variantes de redacción), evaluar como herramienta interna de testing, no como parte del flujo de producción
- Testing A/B de fórmulas de título — posible mejora futura una vez que haya volumen suficiente de datos de clics para comparar variantes
