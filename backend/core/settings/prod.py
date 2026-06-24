from .base import *

DEBUG = False

ALLOWED_HOSTS = env.list("ALLOWED_HOSTS")

# ─── Traefik / EasyPanel (OBRIGATÓRIO) ────────────────────────────────
# Sem isso Django retorna 400 Bad Request atrás do proxy reverso
USE_X_FORWARDED_HOST = True
SECURE_PROXY_SSL_HEADER = ("HTTP_X_FORWARDED_PROTO", "https")

# ─── HTTPS / HSTS ─────────────────────────────────────────────────────
SECURE_SSL_REDIRECT = True
SECURE_HSTS_SECONDS = 31536000
SECURE_HSTS_INCLUDE_SUBDOMAINS = True
SECURE_HSTS_PRELOAD = True
SESSION_COOKIE_SECURE = True
CSRF_COOKIE_SECURE = True

# ─── CORS restrito ────────────────────────────────────────────────────
# Frontend (descubrasul.com / www) → Backend (api.descubrasul.com): cross-origin
# Requer ambos os origens do frontend listados aqui.
CORS_ALLOW_ALL_ORIGINS = False
CORS_ALLOWED_ORIGINS = [
    "https://descubrasul.com",
    "https://www.descubrasul.com",
]
CORS_ALLOW_CREDENTIALS = True  # necessário para enviar cookies JWT httpOnly

# ─── CSRF trusted origins ─────────────────────────────────────────────
# Django 4+ exige declarar explicitamente as origens HTTPS confiáveis
# atrás de proxy reverso. Inclui:
# - apex e www: o admin Django serve nesses domínios quando acessado direto
# - api.descubrasul.com: o backend mesmo (POSTs do admin Django)
CSRF_TRUSTED_ORIGINS = [
    "https://descubrasul.com",
    "https://www.descubrasul.com",
    "https://api.descubrasul.com",
]

# ─── Storages (Django 5 syntax) ───────────────────────────────────────
# default     → R2 (media uploads de produtos, fotos de negócios)
# staticfiles → WhiteNoise com manifest hash + compressão gzip/brotli
#               (admin Django, sem necessidade de CDN para static)
STORAGES = {
    "default": {
        "BACKEND": "storages.backends.s3boto3.S3Boto3Storage",
        "OPTIONS": {
            "access_key": env("R2_ACCESS_KEY_ID"),
            "secret_key": env("R2_SECRET_ACCESS_KEY"),
            "bucket_name": env("R2_BUCKET_NAME"),
            "endpoint_url": env("R2_ENDPOINT_URL"),  # https://<account_id>.r2.cloudflarestorage.com
            "custom_domain": env("R2_PUBLIC_DOMAIN", default=None) or None,  # ex: img.descubrasul.com
            "region_name": "auto",      # R2 usa 'auto'
            "default_acl": None,        # R2 não usa ACLs como S3
            "file_overwrite": False,
            "querystring_auth": False,  # URLs públicas limpas, sem assinatura
        },
    },
    "staticfiles": {
        "BACKEND": "whitenoise.storage.CompressedManifestStaticFilesStorage",
    },
}

# ─── Logging ──────────────────────────────────────────────────────────
# Tudo para stdout em formato estruturado.
# Docker/EasyPanel/journalctl leem stdout — não escrever em arquivos.
LOGGING = {
    "version": 1,
    "disable_existing_loggers": False,
    "formatters": {
        "verbose": {
            "format": "[{asctime}] {levelname} {name} — {message}",
            "style": "{",
            "datefmt": "%Y-%m-%d %H:%M:%S",
        },
    },
    "handlers": {
        "console": {
            "class": "logging.StreamHandler",
            "formatter": "verbose",
        },
    },
    "root": {
        "handlers": ["console"],
        "level": "INFO",
    },
    "loggers": {
        # django.request loga 4xx/5xx; manter em WARNING evita ruído de 200/302
        "django.request": {
            "handlers": ["console"],
            "level": "WARNING",
            "propagate": False,
        },
        # Celery worker/beat — INFO mostra task started/succeeded sem flood
        "celery": {
            "handlers": ["console"],
            "level": "INFO",
            "propagate": False,
        },
        # boto3/botocore são MUITO verbosos em DEBUG; manter em WARNING
        "boto3": {"handlers": ["console"], "level": "WARNING", "propagate": False},
        "botocore": {"handlers": ["console"], "level": "WARNING", "propagate": False},
        "s3transfer": {"handlers": ["console"], "level": "WARNING", "propagate": False},
    },
}
