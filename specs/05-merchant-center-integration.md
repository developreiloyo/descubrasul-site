# 05 — Integración con Google Merchant Center

## Estado al 27/07/2026

| Etapa | Estado |
|---|---|
| Configuración manual en Google (cuenta, dominio, service account, credenciales) | ✅ COMPLETA |
| Página `/politica-devolucoes` publicada y registrada en Merchant Center | ✅ COMPLETA |
| Campo `tipo_produto` en modelo `Produto` (migración 0011) | ✅ COMPLETA |
| Registro del proyecto GCP en Merchant Center (`registerGcp`) | ✅ COMPLETA — `tools/gmc-mcp/register_developer.py` |
| `backend/merchant/` (models, services, tasks, category_map, migrations) | ✅ IMPLEMENTADA — pendiente migrar a endpoint correcto (ver §13) |
| Título optimizado spec 11.2 (`gerar_titulo_feed`) | ✅ IMPLEMENTADA y probada — `backend/merchant/services.py` |
| Primera sincronización real al GMC | ✅ EXITOSA — producto 94 (Boutique Liz Fashion, Tubarão) |
| MCP de desarrollo (`tools/gmc-mcp/server.py`) | ⚠️ PARCIAL — URL base corregida a `products/v1`, endpoint interno pendiente actualizar a `productInputs:insert` |

> **⚠️ CRÍTICO — API a usar:** La implementación técnica debe usar la **Merchant API Products v1** (`merchantapi.googleapis.com/products/v1/...`). La `v1beta` fue **DISCONTINUADA en febrero de 2025**. La **Content API for Shopping** está **DEPRECADA** y Google la apaga el **18 de agosto de 2026**. Ver sección §13 para la estructura real de la API.

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

**Frecuencia:** diaria a las 04:00h (Celery Beat — `merchant.tasks.sincronizar_feed_gmc`)

**Lógica:**
1. Query de productos `disponivel=True`, `negocio.status=ativo`, `negocio.plano in {pro, producao}`
2. Serializar cada uno al formato JSON de la Merchant API v1beta: `POST accounts/{merchant_id}/products`
3. **No hay `customBatch` en la Merchant API v1** — la Content API lo tenía pero fue eliminado. Estrategia: llamadas individuales ejecutadas en paralelo con `ThreadPoolExecutor(max_workers=10)`, pausa de 0.1s entre batches de 10 productos para respetar rate limits
4. Productos que pasaron a `disponivel=False` y tienen sync exitosa previa: `DELETE accounts/{merchant_id}/products/{product_name}`  
   Donde `product_name = online~pt~BR~{offer_id}`
5. Registrar resultado por producto en `merchant.SincronizacaoGMC` (OneToOne por produto — estado actual)

**Implementación:** `backend/merchant/` (app Django) — ✅ IMPLEMENTADA
- `models.py` → `SincronizacaoGMC` (OneToOneField a Produto, estado, gmc_offer_id, mensagem_google)
- `services.py` → `inserir_produto()`, `deletar_produto()`, `serializar_produto()`, `gerar_offer_id()`, `gerar_titulo_feed()` (spec 11.2)
- `tasks.py` → `sincronizar_feed_gmc` (shared_task, respeta `GMC_ENABLED` flag)
- `category_map.py` → mapeo categoria DescubraSul → Google Product Category ID
- Migration `0001_initial` aplicada

> ⚠️ **Pendiente:** `services.py` aún usa el endpoint antiguo `POST /products` — debe migrarse a `productInputs:insert` con `productAttributes` (ver §13 para la estructura real).

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

## 10. Decisiones tomadas (antes preguntas abiertas)

- **Visibilidad para el comerciante:** el estado de sync queda como tarea interna por ahora. Pendiente evaluar en Fase 4 si agregar un indicador en el panel Pro ("Este producto está en Google Shopping ✓").
- **Planos habilitados:** exclusivo para `pro` y `producao`. El plan `gratuito` no tiene acceso a GMC — es un beneficio diferenciador de los planes pagos.
- **GTIN:** siempre `identifierExists: false` para todos los productos de DescubraSul. Los comercios locales (comida preparada, servicios, artesanías) no tienen GTIN, y Google acepta esta declaración explícita sin penalizar.

## 11. Optimización del feed (basado en mejores prácticas de SEO de producto)

**Por qué importa:** un título de producto bien estructurado aumenta lo que Google llama "potencial de clics" — cuando el título coincide mejor con lo que la gente realmente busca, Google le da más visibilidad al producto y, si en el futuro se activan campañas pagas (ver spec `06-google-ads-integracion.md`), reduce directamente el costo por clic.

**Diferencia clave con un e-commerce tradicional:** las guías estándar de optimización de feed asumen que el dueño de la tienda edita títulos manualmente o los pasa por un lote de IA sobre un Excel. En DescubraSul eso no aplica — el comercio nunca toca el feed. La optimización tiene que ser **automática**, generada por el backend a partir de datos que el comercio ya carga en su formulario normal.

### 11.1 Nuevo campo en `Producto`: `tipo_producto`

Equivalente al `product_type` de Google — una clasificación más granular que la categoría general, pensada para dar contexto de búsqueda.

- Ejemplo: categoría general = "Restaurantes / Comida" → `tipo_producto` = "Pizza", "Hambúrguer", "Prato executivo", etc.
- Puede implementarse como un campo de texto libre con sugerencias (autocomplete) basadas en lo que otros negocios de la misma categoría ya cargaron, para mantener consistencia sin forzar un dropdown rígido

### 11.2 Título del feed: generación automática, no editable por el comercio ✅ IMPLEMENTADO

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

**✅ Implementado 2026-07-27** — `backend/merchant/services.py::gerar_titulo_feed()`.
Lógica: `{tipo_produto} {nome_qualificador} — {cidade}`, con deduplicación de prefijo y filtro de códigos internos (regex). Probado con producto 94: título generado `"Conjunto Alfaiataria Bege — Tubarão"`, confirmado en respuesta HTTP 200 del GMC.

### 11.3 Descripción: mismo criterio que el título

`description` ya contempla (sección 4) la línea automática de contacto por WhatsApp. Se recomienda además incluir `tipo_producto` y cualquier atributo cargado (si en el futuro se agregan campos como color/tamaño para rubros que lo necesiten, ej. moda o artesanía) para dar más contexto a Google sin depender de que el comercio redacte una descripción extensa.

### 11.4 Limpieza del feed

Al serializar `Producto` → JSON de la Merchant API (sección 7), incluir únicamente los atributos que Google reconoce (tabla de la sección 4). No trasladar campos internos de Django (timestamps de auditoría, flags internos, IDs de otras tablas) al payload — mantiene el feed limpio y evita rechazos por atributos no reconocidos.

### 11.5 Fuera de alcance para v1

- Multilenguaje/multi-país en el feed (DescubraSul opera solo en portugués/BRL por ahora — no aplica la necesidad de herramientas tipo DataFeedWatch mencionadas en guías de feeds internacionales)
- Feed complementario vía Google Sheets — esa técnica está pensada para tiendas que exportan/reimportan manualmente; como DescubraSul sincroniza automáticamente desde Django, no hace falta ese paso intermedio. Si en el futuro se quisiera iterar rápido sobre títulos sin tocar código (por ejemplo, para probar variantes de redacción), evaluar como herramienta interna de testing, no como parte del flujo de producción
- Testing A/B de fórmulas de título — posible mejora futura una vez que haya volumen suficiente de datos de clics para comparar variantes

---

## 12. MCP server de desenvolvimento (tools/gmc-mcp)

**Propósito:** herramienta de desarrollo local exclusivamente. Expone la Merchant API como herramientas MCP reutilizables por Claude Code y subagentes, para probar serialización y autenticación sin necesidad de deploy al VPS.

> **No interviene en producción.** En producción, el sync corre via `merchant.tasks.sincronizar_feed_gmc` (Celery Beat 04:00h). El MCP es solo un banco de pruebas.

**Ubicación:** `tools/gmc-mcp/server.py`  
**Transporte:** stdio (mismo patrón que Engram)  
**Runtime:** `uv run tools/gmc-mcp/server.py` (PEP 723 — dependencias inline en el script)  
**Registro:** `~/.claude/settings.json` bajo `mcpServers`

### Credenciales (nunca en el repo)

El servidor lee de `~/.config/descubrasul/.env.gmc`:

```bash
GMC_MERCHANT_ID=5830442942
GMC_SERVICE_ACCOUNT_JSON={"type":"service_account",...}   # JSON completo, o base64
GMC_DATABASE_URL=postgresql://descubrasul_user:password@localhost:5432/descubrasul
GMC_SITE_URL=https://descubrasul.com
```

Para acceso DB local: el `docker-compose.override.yml` expone el puerto 5432 — ver instrucciones en `tools/gmc-mcp/server.py`.

### Herramientas disponibles

| Tool | Firma | Sub-API Merchant | Descripción |
|---|---|---|---|
| `sync_product` | `(product_id: int) → str` | Products v1 — `POST accounts/{id}/productInputs:insert` ⚠️ pendiente actualizar | Serializa un Produto del DB local y lo envía al GMC |
| `delete_product` | `(product_id: int) → str` | Products v1 — `DELETE accounts/{id}/productInputs/{name}` ⚠️ pendiente | Elimina un producto del feed |
| `check_sync_status` | `(product_id: int) → str` | Products v1 — `GET accounts/{id}/products/{name}` | Consulta el estado actual en GMC (issues, disponibilidad, aprobación) |
| `batch_sync` | `(modified_since: str \| None) → str` | Products v1 — llamadas individuales paralelas ⚠️ pendiente actualizar | Sincroniza todos los productos Pro/Produção activos |

### Por qué no customBatch

La Content API tenía un endpoint `products/custombatch` que agrupaba múltiples operaciones en un solo HTTP request. La Merchant API v1 **eliminó este endpoint** — no tiene equivalente directo.

Estrategia de reemplazo: `ThreadPoolExecutor(max_workers=10)` — llamadas individuales en paralelo, con pausa de 0.1s entre lotes de 10 para respetar los rate limits de la API. Esto es funcionalmente equivalente para el volumen actual de DescubraSul (centenares de productos, no millones).

### Registro en Claude Code

```json
// ~/.claude/settings.json — agregar bajo la clave "mcpServers"
{
  "mcpServers": {
    "gmc": {
      "command": "uv",
      "args": ["run", "/home/reinaldo/Documentos/Desarrollos/Descubrasul/repo/tools/gmc-mcp/server.py"]
    }
  }
}
```

### Ciclo de vida

Este MCP se descontinúa cuando el sistema de sync en producción esté validado y la visibilidad de estado de GMC esté integrada en el panel del comerciante. Hasta entonces, es el mecanismo principal para verificar que un payload es aceptado por Google antes de que la tarea Celery lo envíe automáticamente.

---

## 13. Estructura real de la API descubierta (2026-07-27)

> Esta sección documenta los hallazgos de la sesión de integración real contra la API. Reemplaza cualquier suposición anterior basada en documentación desactualizada.

### 13.1 Versión correcta

La **Merchant API Products v1** (`merchantapi.googleapis.com/products/v1`) es la versión vigente.
- `v1beta` fue discontinuada en **febrero de 2025** — cualquier llamada devuelve HTTP 409.
- `merchant/v1beta` (path `merchant/`) nunca existió para Products — devuelve HTTP 404.
- La sub-API correcta es `products/v1` (no `merchant/v1`).

### 13.2 Modelo de dos recursos (Input vs Processed)

La API separa claramente lo que se envía de lo que Google procesa:

| Recurso | Endpoint | Para qué |
|---|---|---|
| `productInputs` | `POST …/productInputs:insert` | **Crear/actualizar** un producto (lo que DescubraSul envía) |
| `productInputs` | `DELETE …/productInputs/{name}` | **Eliminar** un producto del feed |
| `products` | `GET …/products` | **Listar** productos procesados por Google |
| `products` | `GET …/products/{name}` | **Estado** de un producto: aprobado/rechazado/issues |

### 13.3 Estructura real del payload (productInputs:insert)

```
POST https://merchantapi.googleapis.com/products/v1/accounts/{merchant_id}/productInputs:insert
?dataSource=accounts/{merchant_id}/dataSources/{datasource_id}
```

**DataSource de producción:** `accounts/5830442942/dataSources/10692143138` (display: "PRODUCTS SOURCE 1")

```json
{
  "feedLabel": "BR",
  "contentLanguage": "pt",
  "offerId": "descubrasul-{slug}-{id}",
  "productAttributes": {
    "title": "{título generado spec 11.2}",
    "description": "{descripcion} + línea WhatsApp",
    "link": "https://descubrasul.com/p/{negocio_slug}/{produto_slug}",
    "availability": "in_stock | out_of_stock",
    "condition": "new",
    "brand": "{negocio.nome}",
    "identifierExists": false,
    "imageLink": "{url_absoluta_foto}",
    "additionalImageLinks": ["..."],
    "price": {
      "amountMicros": "349900000",
      "currencyCode": "BRL"
    },
    "googleProductCategory": "1604"
  }
}
```

**Diferencias clave vs. Content API / v1beta:**
- `channel` ya NO va en el payload — lo determina el data source
- Todos los atributos van dentro de `productAttributes` (no en el topo del objeto)
- `dataSource` es query param obligatorio con el ID numérico real (no "primary")
- El nombre del productInput es `pt~BR~{offerId}`, no `online~pt~BR~{offerId}`

### 13.4 Estado del producto de prueba en Merchant Center (2026-07-27)

**Producto:** ID 94, "Conjunto Alfaiataria Bege", Boutique Liz Fashion, Tubarão  
**offerId:** `descubrasul-conjunto-alfaiataria-bege-31-94`  
**Estado:** `disapprovedCountries: ["BR"]`

| Tipo | Código | Descripción | Acción |
|---|---|---|---|
| DISAPPROVED | `pending_initial_policy_review_free_listings` | Revisión inicial pendente (hasta 3 días hábiles) | Esperar — automático |
| DISAPPROVED | `item_missing_required_attribute` — `image link` | Producto sin imagen | Bloqueante hasta que el comerciante suba foto |
| DEMOTED | `missing_item_attribute_for_product_type` — `age_group` | Moda requiere grupo de edad | Agregar `"adult"` como default para categoría 1604 |
| DEMOTED | `missing_item_attribute_for_product_type` — `color` | Moda requiere color | Pendiente campo en modelo o derivar de nome |
| DEMOTED | `missing_item_attribute_for_product_type` — `gender` | Moda requiere género | Agregar `"unisex"` como default para categoría 1604 |
| DEMOTED | `missing_item_attribute_for_product_type` — `size` | Moda requiere talle | Pendiente — requiere campo nuevo en modelo |

### 13.5 Prerrequisitos de configuración (ya completados)

- `registerGcp`: script `tools/gmc-mcp/register_developer.py` — vincula GCP project `562478645521` a la cuenta MC `5830442942`. Se ejecuta **una sola vez**. El registro es permanente.
- APIs habilitadas en proyecto `descubrasul` (562478645521): Content API for Shopping + Merchant API
- Service account: `merchant-center-sync@descubrasul.iam.gserviceaccount.com` — rol **Estándar** en Merchant Center (fue elevado a Administrador solo durante el `registerGcp`, luego rebajado)
