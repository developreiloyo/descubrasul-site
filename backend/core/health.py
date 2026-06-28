"""
Endpoints de health check para monitoreo y orquestación.

- /health/         → liveness probe: el proceso está vivo y responde
- /health/ready/   → readiness probe: deps críticas (DB, Redis) están OK

El healthcheck del Dockerfile.prod apunta a /health/ (liveness).
"""
from django.db import connection
from django.http import JsonResponse
from django.views.decorators.cache import never_cache
from django.views.decorators.http import require_GET


@never_cache
@require_GET
def liveness(request):
    """Responde 200 si el proceso Django responde. No verifica deps."""
    return JsonResponse({"status": "ok"}, status=200)


@never_cache
@require_GET
def readiness(request):
    """Verifica DB. Devuelve 503 si algo falla, 200 si todo OK."""
    checks = {"database": "ok"}

    try:
        with connection.cursor() as cursor:
            cursor.execute("SELECT 1")
            cursor.fetchone()
    except Exception as e:
        checks["database"] = f"error: {type(e).__name__}"
        return JsonResponse(
            {"status": "error", "checks": checks},
            status=503,
        )

    return JsonResponse({"status": "ok", "checks": checks}, status=200)
