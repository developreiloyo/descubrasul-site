from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from rest_framework_simplejwt.views import (
    TokenObtainPairView,
    TokenRefreshView,
    TokenBlacklistView,
)

urlpatterns = [
    path("admin/", admin.site.urls),

    # ─── Auth ─────────────────────────────────────────────────────
    path("api/auth/token/", TokenObtainPairView.as_view(), name="token_obtain_pair"),
    path("api/auth/token/refresh/", TokenRefreshView.as_view(), name="token_refresh"),
    path("api/auth/token/blacklist/", TokenBlacklistView.as_view(), name="token_blacklist"),

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
