# 06 — Google Ads para DescubraSul y comercios asociados (FUTURO — no implementar aún)

> **Estado: idea documentada, no aprobada para desarrollo.**
> Este spec existe para no perder el razonamiento hecho el 26/07/2026, no como
> encargo de trabajo para Claude Code. Se retoma cuando DescubraSul tenga
> tracción suficiente (varios negocios activos, feed de Merchant Center
> funcionando y estable) como para justificar el paso a medios pagos.

## 1. Contexto

El spec `05-merchant-center-integration.md` cubre exclusivamente listados
**orgánicos y gratuitos** (Shopping, AI Mode, AI Overviews). Este documento
cubre la pregunta separada de qué pasa si DescubraSul o alguno de sus
comercios asociados quiere **pagar** por visibilidad en Google Ads.

## 2. Dos escenarios distintos

1. **DescubraSul promocionándose a sí misma** — campaña de marca apuntando
   a `descubrasul.com` o a una landing de captación de negocios. No requiere
   nada especial del feed de productos.
2. **Un comercio asociado paga para destacar sus propios productos** — esto
   sí interactúa con el feed consolidado de Merchant Center y requiere
   segmentación (ver sección 3).

## 3. Cómo aislar el gasto de un comercio dentro de un feed consolidado

El feed de Merchant Center (definido en el spec 05) es consolidado — todos
los negocios en un solo catálogo. Para que una campaña paga beneficie solo
a un comercio específico:

- Agregar al feed un atributo `custom_label_0 = {negocio_id o slug}` por
  producto (Google permite hasta 5 custom labels)
- Crear una campaña de Shopping en Google Ads filtrada por
  `custom_label_0 = "negocio-x"`, de forma que el presupuesto de esa
  campaña solo compita por los productos de ese negocio

## 4. Modelos de cuenta evaluados

| Modelo | Descripción | Quién paga a Google | Riesgo/ventaja |
|---|---|---|---|
| A. Cuenta única de Ads de DescubraSul | Todo bajo la tarjeta de DescubraSul; se factura al comercio por fuera | DescubraSul → Google; comercio → DescubraSul | Expone la tarjeta de DescubraSul al gasto de terceros |
| B. Cuentas de Ads independientes por comercio | Cada comercio crea y paga su propia cuenta | Comercio → Google directo | DescubraSul pierde visibilidad/control centralizado |
| **C. Google Ads Manager Account (MCC) con sub-cuentas** — **preferido** | DescubraSul administra desde una cuenta MCC; cada comercio tiene su sub-cuenta con su propia tarjeta vinculada | Comercio → Google directo (vía su sub-cuenta) | Control centralizado sin exponer la tarjeta de DescubraSul; mismo patrón "aggregator" ya usado en Merchant Center |

**Decisión preliminar:** modelo C (MCC), por consistencia con la
arquitectura ya elegida para Merchant Center y porque aísla el riesgo
financiero por comercio.

## 5. Control de gasto (relacionado a la preocupación de Reinaldo sobre topes)

- Google Ads permite fijar **presupuesto diario máximo por campaña** —
  esto sí es un tope real que Google respeta (a diferencia de Cloud, donde
  Budgets & Alerts solo notifica, no bloquea)
- Cada sub-cuenta del MCC puede tener su propio límite, evitando que el
  gasto de un comercio afecte a otro
- Aun así, se recomienda que cada comercio vincule una tarjeta con tope
  configurable del lado del banco (igual que la recomendación ya dada
  para Google Cloud), como capa adicional de seguridad

## 6. Fuera de alcance de este documento (para cuando se retome)

- Tipo de campaña a usar (Shopping estándar, Performance Max, AI Max) —
  requiere evaluar según madurez y volumen de cada comercio
- Modelo de facturación de DescubraSul hacia el comercio si se ofrece
  como servicio gestionado (¿comisión? ¿fee fijo?)
- Proceso de onboarding para que un comercio active su sub-cuenta MCC

## 7. Prerequisito antes de retomar esto

No tiene sentido avanzar con Google Ads hasta que:
- El spec 05 (Merchant Center orgánico) esté implementado y estable en
  producción
- Haya al menos algunos comercios con productos ya visibles de forma
  orgánica, para tener una base real sobre la cual medir si vale la pena
  invertir en pago
