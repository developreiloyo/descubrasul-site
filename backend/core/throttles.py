from rest_framework.throttling import ScopedRateThrottle, AnonRateThrottle


class AuthRateThrottle(ScopedRateThrottle):
    """5 tentativas de login ou refresh por 15 minutos (por IP)."""
    scope = "auth"


class PasswordResetThrottle(AnonRateThrottle):
    """5 solicitações de reset de senha por hora (por IP)."""
    scope = "password_reset"


class AnalyticsThrottle(ScopedRateThrottle):
    """60 eventos de analytics por minuto (por IP)."""
    scope = "analytics"


class IaThrottle(ScopedRateThrottle):
    """10 gerações de texto por IA por dia (por usuário autenticado)."""
    scope = "ia"
