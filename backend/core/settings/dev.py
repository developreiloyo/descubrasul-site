from .base import *

DEBUG = True

# Dev: aceitar qualquer host local
ALLOWED_HOSTS = ["localhost", "127.0.0.1", "0.0.0.0", "backend"]

# CORS aberto apenas em desenvolvimento
CORS_ALLOW_ALL_ORIGINS = True

# Emails no terminal em dev
EMAIL_BACKEND = "django.core.mail.backends.console.EmailBackend"
