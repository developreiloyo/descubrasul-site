"""
Views JWT com rate limiting estrito para endpoints de autenticação.
Sobrescreve as views padrão do SimpleJWT adicionando throttle classes específicas.
"""
from rest_framework_simplejwt.views import (
    TokenObtainPairView,
    TokenRefreshView,
    TokenBlacklistView,
)
from core.throttles import AuthRateThrottle


class ThrottledTokenObtainPairView(TokenObtainPairView):
    """Login: 5 tentativas por 15 minutos por IP."""
    throttle_classes = [AuthRateThrottle]


class ThrottledTokenRefreshView(TokenRefreshView):
    """Refresh: 5 renovações por 15 minutos por IP."""
    throttle_classes = [AuthRateThrottle]


class ThrottledTokenBlacklistView(TokenBlacklistView):
    """Logout: sem throttle crítico, mas mantém consistência."""
    throttle_classes = []
