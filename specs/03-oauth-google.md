# 03 — OAuth con Google (pendiente, no iniciado)

## Estado

**No iniciado.** Este spec existe para dejar claro el alcance ANTES de escribir código — evita que un agente empiece a implementar con supuestos no confirmados.

## Por qué

- Reduce fricción de registro: un merchant no quiere crear otra contraseña más.
- Complementa (no reemplaza) el login por email/password ya existente.
- Es una feature de conversión, no de seguridad crítica — no bloquea el lanzamiento comercial de la misma forma que el password reset o el token expuesto.

## Decisiones pendientes de confirmar (llenar antes de implementar)

Estas preguntas deben responderse y documentarse acá antes de que un agente escriba código — de lo contrario va a asumir algo y puede no ser lo que quieres.

- [ ] **¿Aplica a cadastro de merchant, login de usuario final, o ambos?** (la memoria dice "cadastro e login" en general, pero conviene confirmar si es solo para merchants o también para consumidores finales, si es que estos últimos tienen cuenta).
- [ ] **¿Qué pasa si el email de Google ya existe como cuenta email/password?** — ¿se vinculan automáticamente, o se bloquea con mensaje de "ya existe una cuenta con este email, inicia sesión con contraseña"?
- [ ] **¿Se sigue pidiendo el formulario "Meu Negócio" completo después del OAuth?** — el alta atómica de User+Negocio ya existe para el flujo tradicional; confirmar si OAuth solo reemplaza la creación de credenciales o si also afecta ese formulario.
- [ ] **¿Next.js maneja el flujo (NextAuth u otra librería) o se delega completamente al backend Django?** — dado el stack (Django + DRF backend, Next.js frontend), definir dónde vive la lógica de intercambio de tokens.
- [ ] **Scopes de Google solicitados** — mínimo necesario es probablemente solo email + perfil básico. No pedir acceso a Google Business Profile en este flujo (eso ya se maneja manualmente en el onboarding, según el spec de visión).

## Criterios de aceptación (una vez que las decisiones de arriba estén tomadas)

- Un merchant nuevo puede registrarse con un clic usando su cuenta de Google, sin llenar email/password manualmente.
- Un merchant existente (creado por email/password) puede opcionalmente vincular Google a su cuenta ya existente — no crea una cuenta duplicada.
- El flujo respeta LGPD: el consentimiento de `/privacidade` sigue siendo explícito, no se asume implícito por usar OAuth.
- Falla de forma clara y visible si Google no está disponible o el usuario cancela el flujo — no debe dejar al usuario en un estado intermedio confuso.

## Fuera de alcance de este spec

- Login social con otros proveedores (Facebook, Apple) — no está pedido, no diseñar para eso todavía.
- Sincronización con Google Business Profile — eso es un proceso manual de onboarding, no parte de este flujo de autenticación.

---
*Última actualización: 2026-07-12. No implementar hasta resolver los checkboxes de "Decisiones pendientes". Si empiezas a trabajar esto, actualiza este documento con las respuestas antes de escribir código.*
