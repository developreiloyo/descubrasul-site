# 04 — Password Reset (implementado y verificado)

## Estado

**Implementado.** Corrección respecto a versiones anteriores de este documento: se confirmó que `PasswordResetRequestView` y `PasswordResetConfirmView` existen en `backend/usuarios/views.py`. El flujo fue verificado con 49 tests de aceptación (`backend/usuarios/tests/test_password_reset.py`), todos en verde tras corregir 3 fallos reales detectados por `qa-verifier`.

## Historial de esta spec (para que no se repita la confusión)

Este documento pasó por tres estados distintos en poco tiempo, vale la pena dejarlo registrado:
1. Documentación original: lo daba por implementado (impreciso).
2. Corrección posterior: se confirmó explícitamente que NO estaba implementado — el sitio en producción era un PMV sin este flujo.
3. Verificación con `qa-verifier`: se descubrió que en algún punto SÍ se implementó (probablemente en una sesión no registrada en esta documentación), y se corrigieron 3 bugs reales encontrados en la implementación existente.

**Lección para el proceso:** el código real es la fuente de verdad, no la memoria de conversaciones pasadas. Cuando haya dudas sobre el estado de una feature, correr `qa-verifier` contra el spec correspondiente antes de asumir el estado documentado.

## Alcance funcional (implementado)

1. Merchant hace clic en "Olvidé mi contraseña" en la pantalla de login.
2. Ingresa su email → `PasswordResetRequestView`.
3. Sistema envía un email con link de reset vía Resend SMTP.
4. El link contiene un token de un solo uso, con expiración.
5. Merchant define nueva contraseña vía `PasswordResetConfirmView`, se invalida el token, se le redirige a login.

## Bugs encontrados y corregidos (2026-07-12)

| Severidad | Problema | Corrección aplicada |
|---|---|---|
| Alta | Tokens anteriores no se invalidaban al solicitar un reset nuevo — un link filtrado seguía siendo válido indefinidamente | Se agregó campo `token_version` al modelo `User`, usado en una subclase de `PasswordResetTokenGenerator` |
| Media | Usuario inactivo podía resetear su contraseña | `PasswordResetConfirmView` ahora verifica `user.is_active` antes de `set_password()` |
| Baja | Rate limit devolvía 403 en vez de 429 (semánticamente incorrecto, no afectaba funcionalidad) | Se removió el decorator manual de ratelimit, se usa `throttle_classes = [PasswordResetThrottle]` de DRF |

## Configuración relevante

- `PASSWORD_RESET_TIMEOUT` ajustado a `3600` (1 hora) en `settings/base.py` — el default de Django es 3 días, no cumplía el criterio de aceptación original de este spec.
- `argon2-cffi` está en `requirements.txt`; confirmar que la imagen del contenedor backend lo tiene instalado (`docker compose build backend` si no).

## Requisitos de seguridad — estado

- [x] Token de un solo uso, no reutilizable después de consumido.
- [x] Expiración de 1 hora.
- [x] No revela si el email existe o no en el sistema (verificar que este comportamiento se mantenga si se toca el endpoint de nuevo).
- [x] Rate limiting en el endpoint de solicitud de reset.
- [x] Invalidación de tokens previos al generar uno nuevo (corregido en esta sesión).

## Relación con otros specs

- `01-seguridad.md` — ya actualizado, tabla de bloqueantes refleja este estado como "Implementado".

---
*Última actualización: 2026-07-12. Si se vuelve a tocar este flujo, correr `qa-verifier` de nuevo contra este spec antes de asumir que sigue funcionando igual.*
