# 01 — Seguridad y Compliance: DescubraSul

## Estado del proyecto (contexto para este spec)

DescubraSul está desplegado en producción (www.descubrasul.com) como **PMV/MVP** — el objetivo de este despliegue es validar apariencia y usabilidad con usuarios reales, no es todavía la versión feature-complete. Varios ítems de este spec son pendientes reales, no detalles menores: deben resolverse antes de considerar el proyecto listo para lanzamiento comercial (plan "Fundador").

## 1. Pendiente crítico — Token de GitHub expuesto

**Prioridad: alta. Bloqueante para lanzamiento.**

- Existe un Personal Access Token (`ghp_yLMV...`) expuesto, posiblemente embebido en la URL del remote de git o visible en el historial de commits.
- **Acción requerida:**
  1. Revocar el PAT en GitHub Settings → Developer settings → Personal access tokens.
  2. Reconfigurar el remote sin credencial embebida:
     ```bash
     git remote set-url origin https://github.com/developreiloyo/descubrasul-site.git
     ```
  3. Generar un nuevo PAT con scopes mínimos (solo lo que el CI/CD realmente necesita, no acceso total).
  4. Si el token quedó en el historial de commits (no solo en la URL del remote actual), evaluar si amerita limpiar el historial (`git filter-repo` o similar) — esto es más invasivo, decidir según el riesgo real.
- **Estado:** identificado, no resuelto. Registrado en memoria Engram (`mem_search "token"`).

## 2. LGPD (Lei Geral de Proteção de Dados)

**Prioridad: alta. Bloqueante para lanzamiento comercial — no solo para el PMV de testing.**

Checklist de lo que debe existir antes de recolectar datos de merchants/usuarios en producción real:

- [ ] Checkbox de consentimiento explícito en el formulario de cadastro, con link a `/privacidade`.
- [ ] Página `/privacidade` publicada (política de privacidad).
- [ ] Página `/termos` publicada (términos de uso).
- [ ] Cookie banner para GA4 (consentimiento antes de trackear).
- [ ] Email de contacto dedicado: `privacidade@descubrasul.com` (o dominio equivalente).
- [x] Endpoint de eliminación de cuenta/datos — **ya implementado**.

**Nota:** el PMV actual puede estar operando sin todo esto completo porque es una fase de prueba de apariencia/usabilidad con tráfico limitado — pero esto no debe extenderse. Definir una fecha límite antes de abrir registro público amplio.

## 3. Autenticación y gestión de cuentas

| Feature | Estado |
|---|---|
| Alta atómica de User + Negocio | Implementado |
| Auto-login post-registro | Implementado |
| **Password reset por email** | **Implementado** — 49 tests en verde (2026-07-12). Ver `specs/04-password-reset.md`. |
| OAuth con Google (cadastro y login) | Pendiente, no iniciado, scope aún no definido |

## 4. CRUD de Produtos — completado, referencia de seguridad aplicada

Ya implementado con las siguientes protecciones, documentadas acá como referencia para no repetir el mismo trabajo de diagnóstico si se toca este código:

- Validación de archivos con `python-magic` (verifica el tipo real del archivo, no solo la extensión).
- Límites de plan aplicados a cantidad de productos/imágenes.
- Fix de multipart a través de proxy (Traefik) — lección aprendida documentada en el repo.
- Orden correcto de URLs de Django para evitar conflictos de rutas.
- Fix de booleanos en multipart con DRF (los booleanos llegan como string en multipart, no como bool nativo).

## 5. Infraestructura y despliegue

- Deploy vía Docker Compose + Traefik directo (Hostinger Ubuntu VPS). **Sin EasyPanel** — fue abandonado por fallas en cascada.
- CI/CD vía GitHub Actions.
- Variables sensibles: nunca en `.env` versionado, siempre en `.env.prod` fuera del control de versiones (ver `CLAUDE.md` para el detalle de archivos de configuración).
- `docker-compose.easypanel.yml` eliminado del repo (2026-07-12) — ya no se usa.

## 6. Fuera de alcance de este spec (documentar aparte si aplica)

- Cifrado en reposo de la base de datos — no evaluado todavía, agregar si se decide abordar.
- Plan de continuidad/backup probado — no documentado formalmente todavía. Si se quiere aplicar rigor tipo ISO 22301 más adelante, este es el punto de partida natural.

---

## 7. Gaps de seguridad activos — pre-lanzamiento comercial

Identificados en auditoría ISO 27001/22301 (2026-07-27). No son aspiracionales — son brechas reales en el estado actual de producción.

### 7.1 Logging estructurado ausente (ISO 27001 — control 8.15)

**Prioridad: 🟡 Media — resolver antes de lanzamiento comercial.**

Estado actual: Django tiene logging básico, pero sin estructura JSON (sin userId, sin timestamp normalizado, sin nivel de error estandarizado). Esto hace que los incidentes en producción no sean rastreables por log.

Acción: implementar `structlog` en el backend con salida JSON. Campos mínimos: `user_id`, `endpoint`, `status_code`, `error`, `timestamp`.

### 7.2 Monitoreo de errores sin alertas automáticas (ISO 27001 — control 8.16)

**Prioridad: 🟡 Media — gap operativo importante.**

Estado actual: no hay sistema de alertas para errores 500 en producción. Si hay una excepción no capturada, solo se detecta si un comerciante avisa o si alguien revisa logs manualmente.

Acción: integrar Sentry (frontend + backend). La versión gratuita cubre el volumen actual. Sin esto, el tiempo de detección de errores en producción es indefinido.

### 7.3 Backup diario de PostgreSQL no automatizado (ISO 22301 — SPOF confirmado)

**Prioridad: 🔴 Alta — riesgo real de pérdida de datos.**

Estado actual: PostgreSQL está marcado como SPOF con mitigación solo parcial (volumen Docker persistente). No hay backup diario automatizado ni restore probado. El RPO real es indefinido — si el VPS falla, la pérdida de datos depende del último backup manual.

Acción: configurar cron en el VPS que ejecute `pg_dump` diario y lo copie a almacenamiento externo (Cloudflare R2 o similar). Probar el restore al menos una vez antes del lanzamiento comercial.

---
*Última actualización: 2026-07-27. Los ítems de la sección 7 son gaps activos confirmados — no lanzar plan "Fundador" sin resolverlos.*
