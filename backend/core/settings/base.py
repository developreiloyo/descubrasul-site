"""
Settings base — compartilhado entre dev e prod.
Nunca importar diretamente. Usar dev.py ou prod.py.
"""
from pathlib import Path
import environ

BASE_DIR = Path(__file__).resolve().parent.parent.parent

env = environ.Env()
environ.Env.read_env(BASE_DIR / ".env")

SECRET_KEY = env("SECRET_KEY")
ALLOWED_HOSTS = env.list("ALLOWED_HOSTS", default=["localhost", "127.0.0.1"])

# ─── Apps ─────────────────────────────────────────────────────────────
DJANGO_APPS = [
    "django.contrib.admin",
    "django.contrib.auth",
    "django.contrib.contenttypes",
    "django.contrib.sessions",
    "django.contrib.messages",
    "django.contrib.staticfiles",
    "django.contrib.postgres",
]

THIRD_PARTY_APPS = [
    "rest_framework",
    "rest_framework_simplejwt",
    "rest_framework_simplejwt.token_blacklist",
    "corsheaders",
    "django_filters",
    "django_celery_beat",
    "django_celery_results",
    "django_extensions",
]

LOCAL_APPS = [
    "core",
    "negocios",
    "usuarios",
    "planos",
    "analytics",
    "ia",
    "categorias",
    "ofertas",
    "merchant",
]

INSTALLED_APPS = DJANGO_APPS + THIRD_PARTY_APPS + LOCAL_APPS

# ─── Middleware ───────────────────────────────────────────────────────
MIDDLEWARE = [
    "django.middleware.security.SecurityMiddleware",
    "whitenoise.middleware.WhiteNoiseMiddleware",
    "corsheaders.middleware.CorsMiddleware",
    "django.contrib.sessions.middleware.SessionMiddleware",
    "django.middleware.common.CommonMiddleware",
    "django.middleware.csrf.CsrfViewMiddleware",
    "django.contrib.auth.middleware.AuthenticationMiddleware",
    "django.contrib.messages.middleware.MessageMiddleware",
    "django.middleware.clickjacking.XFrameOptionsMiddleware",
]

ROOT_URLCONF = "core.urls"
WSGI_APPLICATION = "core.wsgi.application"

# ─── Templates ────────────────────────────────────────────────────────
TEMPLATES = [
    {
        "BACKEND": "django.template.backends.django.DjangoTemplates",
        "DIRS": [],
        "APP_DIRS": True,
        "OPTIONS": {
            "context_processors": [
                "django.template.context_processors.debug",
                "django.template.context_processors.request",
                "django.contrib.auth.context_processors.auth",
                "django.contrib.messages.context_processors.messages",
            ],
        },
    },
]

# ─── Database ─────────────────────────────────────────────────────────
DATABASES = {
    "default": env.db("DATABASE_URL")
}
DATABASES["default"]["OPTIONS"] = {"connect_timeout": 10}
DATABASES["default"]["CONN_MAX_AGE"] = 60

# ─── Cache / Redis ────────────────────────────────────────────────────
# django-redis com IGNORE_EXCEPTIONS: se Redis cair, cache miss silencioso
# em vez de erro 500 — ISO 22301 (degradação com graça)
CACHES = {
    "default": {
        "BACKEND": "django_redis.cache.RedisCache",
        "LOCATION": env("REDIS_URL"),
        "OPTIONS": {
            "CLIENT_CLASS": "django_redis.client.DefaultClient",
            "IGNORE_EXCEPTIONS": True,
        },
    }
}

# ─── Auth ─────────────────────────────────────────────────────────────
AUTH_USER_MODEL = "usuarios.User"

# Argon2 é mais resistente a ataques de força bruta que PBKDF2.
# PBKDF2 permanece como fallback para senhas criadas antes da migração.
# Requer: pip install argon2-cffi
PASSWORD_HASHERS = [
    "django.contrib.auth.hashers.Argon2PasswordHasher",
    "django.contrib.auth.hashers.PBKDF2PasswordHasher",
]

AUTH_PASSWORD_VALIDATORS = [
    {"NAME": "django.contrib.auth.password_validation.UserAttributeSimilarityValidator"},
    {"NAME": "django.contrib.auth.password_validation.MinimumLengthValidator", "OPTIONS": {"min_length": 8}},
    {"NAME": "django.contrib.auth.password_validation.CommonPasswordValidator"},
    {"NAME": "django.contrib.auth.password_validation.NumericPasswordValidator"},
]

# Password-reset tokens expire after 1 hour (Django default is 3 days / 259200 s).
# Short expiry reduces the window of opportunity if a reset e-mail is intercepted.
PASSWORD_RESET_TIMEOUT = 3600

# ─── DRF ──────────────────────────────────────────────────────────────
REST_FRAMEWORK = {
    "DEFAULT_AUTHENTICATION_CLASSES": (
        "rest_framework_simplejwt.authentication.JWTAuthentication",
    ),
    "DEFAULT_PERMISSION_CLASSES": (
        "rest_framework.permissions.IsAuthenticated",
    ),
    "DEFAULT_FILTER_BACKENDS": (
        "django_filters.rest_framework.DjangoFilterBackend",
        "rest_framework.filters.SearchFilter",
        "rest_framework.filters.OrderingFilter",
    ),
    "DEFAULT_PAGINATION_CLASS": "rest_framework.pagination.PageNumberPagination",
    "PAGE_SIZE": 20,
    "DEFAULT_RENDERER_CLASSES": (
        "rest_framework.renderers.JSONRenderer",
    ),
    # Rate limiting global via Redis (usa o cache backend já configurado)
    "DEFAULT_THROTTLE_CLASSES": [
        "rest_framework.throttling.AnonRateThrottle",
        "rest_framework.throttling.UserRateThrottle",
    ],
    "DEFAULT_THROTTLE_RATES": {
        "anon": "60/min",           # visitantes anônimos
        "user": "200/min",          # usuários autenticados
        "auth": "5/15min",          # login / token refresh
        "password_reset": "5/hour", # reset de senha
        "analytics": "60/min",      # registro de cliques
        "ia": "10/day",             # geração de texto com IA (por usuário)
    },
}

# ─── JWT ──────────────────────────────────────────────────────────────
from datetime import timedelta

SIMPLE_JWT = {
    "ACCESS_TOKEN_LIFETIME": timedelta(minutes=30),
    "REFRESH_TOKEN_LIFETIME": timedelta(days=7),
    "ROTATE_REFRESH_TOKENS": True,
    "BLACKLIST_AFTER_ROTATION": True,
    "AUTH_HEADER_TYPES": ("Bearer",),
}

# ─── Celery ───────────────────────────────────────────────────────────
CELERY_BROKER_URL = env("REDIS_URL")
CELERY_RESULT_BACKEND = env("REDIS_URL")
CELERY_RESULT_EXPIRES = 86400   # 24h — evita crescimento infinito do backend Redis
CELERY_ACCEPT_CONTENT = ["json"]
CELERY_TASK_SERIALIZER = "json"
CELERY_RESULT_SERIALIZER = "json"
CELERY_TIMEZONE = "America/Sao_Paulo"
CELERY_BEAT_SCHEDULER = "django_celery_beat.schedulers:DatabaseScheduler"

# ─── Internacionalização ──────────────────────────────────────────────
LANGUAGE_CODE = "pt-br"
TIME_ZONE = "America/Sao_Paulo"
USE_I18N = True
USE_TZ = True

# ─── Static / Media ───────────────────────────────────────────────────
STATIC_URL = "/static/"
STATIC_ROOT = BASE_DIR / "staticfiles"
MEDIA_URL = "/media/"
MEDIA_ROOT = BASE_DIR / "mediafiles"

DEFAULT_AUTO_FIELD = "django.db.models.BigAutoField"

# ─── Segurança base ───────────────────────────────────────────────────
X_FRAME_OPTIONS = "DENY"
SECURE_CONTENT_TYPE_NOSNIFF = True

# ─── APIs externas ────────────────────────────────────────────────────
ANTHROPIC_API_KEY = env("ANTHROPIC_API_KEY", default="")
MP_ACCESS_TOKEN = env("MP_ACCESS_TOKEN", default="")
MP_WEBHOOK_SECRET = env("MP_WEBHOOK_SECRET", default="")
GOOGLE_MAPS_API_KEY = env("GOOGLE_MAPS_API_KEY", default="")

# ─── Google Merchant Center ────────────────────────────────────────────
# GMC_ENABLED=True ativa a sync diária; manter False até credenciais configuradas no VPS
GMC_ENABLED            = env.bool("GMC_ENABLED", default=False)
GMC_MERCHANT_ID        = env("GMC_MERCHANT_ID", default="5830442942")
# JSON completo da service account — guardar como variável de ambiente, nunca em arquivo
GMC_SERVICE_ACCOUNT_JSON = env("GMC_SERVICE_ACCOUNT_JSON", default="")
# URL pública do site — usada para gerar links absolutos de imagem e produto no feed
GMC_SITE_URL           = env("GMC_SITE_URL", default="https://descubrasul.com")

# ─── Email ────────────────────────────────────────────────────────────
DEFAULT_FROM_EMAIL = "DescubraSul <noreply@descubrasul.com>"
FRONTEND_URL = env("FRONTEND_URL", default="http://localhost:3000")
EMAIL_BACKEND = env(
    "EMAIL_BACKEND",
    default="django.core.mail.backends.console.EmailBackend"
)
# Resend usa SMTP — configurado em prod via variaveis de ambiente
EMAIL_HOST     = env("EMAIL_HOST", default="")
EMAIL_PORT     = env.int("EMAIL_PORT", default=587)
EMAIL_USE_TLS  = env.bool("EMAIL_USE_TLS", default=True)
EMAIL_HOST_USER = env("EMAIL_HOST_USER", default="")
EMAIL_HOST_PASSWORD = env("EMAIL_HOST_PASSWORD", default="")