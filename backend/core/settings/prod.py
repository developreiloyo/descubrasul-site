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
CORS_ALLOW_ALL_ORIGINS = False
CORS_ALLOWED_ORIGINS = [
    "https://descubrasul.com",
    "https://www.descubrasul.com",
    "https://jogos.descubrasul.com",
]

# ─── Storage Cloudflare R2 (S3-compatible) ────────────────────────────
# R2: egress gratuito — ideal para servir imagens da vitrina
DEFAULT_FILE_STORAGE = "storages.backends.s3boto3.S3Boto3Storage"
AWS_ACCESS_KEY_ID = env("R2_ACCESS_KEY_ID")
AWS_SECRET_ACCESS_KEY = env("R2_SECRET_ACCESS_KEY")
AWS_STORAGE_BUCKET_NAME = env("R2_BUCKET_NAME")
AWS_S3_ENDPOINT_URL = env("R2_ENDPOINT_URL")  # https://<account_id>.r2.cloudflarestorage.com
AWS_S3_CUSTOM_DOMAIN = env("R2_PUBLIC_DOMAIN", default="")  # ex: img.descubrasul.com
AWS_S3_FILE_OVERWRITE = False
AWS_DEFAULT_ACL = None       # R2 nao usa ACLs como S3
AWS_S3_REGION_NAME = "auto"  # R2 usa 'auto'
AWS_QUERYSTRING_AUTH = False # URLs publicas limpas, sem assinatura
