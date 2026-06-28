from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from core.auth_views import (
    ThrottledTokenObtainPairView,
    ThrottledTokenRefreshView,
    ThrottledTokenBlacklistView,
)
from core.health import liveness, readiness

urlpatterns = [
    path("admin/", admin.site.urls),

    # ─── Health checks (Docker healthcheck, monitoring externo) ───
    path("health/", liveness, name="health_liveness"),
    path("health/ready/", readiness, name="health_readiness"),

    # ─── Auth (throttled: 5 req / 15min por IP) ───────────────────
    path("api/auth/token/", ThrottledTokenObtainPairView.as_view(), name="token_obtain_pair"),
    path("api/auth/token/refresh/", ThrottledTokenRefreshView.as_view(), name="token_refresh"),
    path("api/auth/token/blacklist/", ThrottledTokenBlacklistView.as_view(), name="token_blacklist"),

    # ─── Apps ─────────────────────────────────────────────────────
    path("api/negocios/", include("negocios.urls")),
    path("api/usuarios/", include("usuarios.urls")),
    path("api/planos/", include("planos.urls")),
    path("api/analytics/", include("analytics.urls")),
    path("api/ia/", include("ia.urls")),
    path("api/categorias/", include("categorias.urls")),
]

# Servir media em desenvolvimento
if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
